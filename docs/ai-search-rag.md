# AI 검색 (RAG) — C안: 벡터 DB 없이 JSON 벡터 + 서버리스 함수

자연어 질문("카톡으로 받은 상품권 예스24에서 돼?")에 카탈로그 178곳을 근거로 답한다.
벡터 DB는 없다. 카탈로그 벡터를 JSON 파일로 뽑아두고 서버리스 함수 안에서
코사인 유사도로 검색한다. 178개 규모라 이걸로 충분하다.

## 흐름

```
사용자 질문
  → POST /api/ask { question }
  → 질문 임베딩 (OpenAI text-embedding-3-small)
  → data/catalog-vectors.json에서 코사인 유사도 top-5 검색
  → 검색된 청크만 프롬프트에 넣어 LLM(gpt-4o-mini)이 답
  → { answer, sources: [{ id, name, cat, type, sourceUrl, score }], matched }
```

키가 없으면 `503 AI_SEARCH_UNAVAILABLE`을 돌려준다. 프론트는 그 경우
기존 키워드 미리보기(카탈로그 키워드 검색)를 그대로 쓴다.
벡터 파일이 비어 있으면 `503 VECTORS_NOT_READY`.
검색 결과가 최소 유사도(`AI_MIN_SCORE`, 기본 0.25)에 못 미치면 LLM을 부르지 않고
"찾지 못했어요"로 답한다.

## 파일

| 파일 | 역할 |
| --- | --- |
| `api/ask.js` | Vercel 서버리스 함수. POST만 받는다. |
| `api/_lib/chunks.js` | 항목 1개 → 청크 텍스트 1개. 별칭 3개 최소한으로 포함. |
| `api/_lib/embed.js` | 임베딩 API 클라이언트 (OpenAI 기본). |
| `api/_lib/retrieval.js` | 코사인 유사도 + top-k + 벡터 파일 로드. |
| `api/_lib/llm.js` | 답변 생성 API 클라이언트 (OpenAI 기본). |
| `scripts/index-catalog.mjs` | 인덱서. 카탈로그 → 벡터 JSON 생성. |
| `data/catalog-vectors.json` | 생성물. 커밋한다 (비밀 아님). 빈 껍데기로 시작. |
| `vercel.json` | `data/catalog-vectors.json`을 함수에 포함시킨다. |
| `.env.example` | 필요한 환경변수 목록. |

## 인덱싱 (네가 직접 돌리는 부분)

```bash
# 1. .env.local에 키 넣기 (레포 루트, .gitignore에 있어 커밋 안 됨)
OPENAI_API_KEY=sk-...

# 2. 청크만 확인 (API 호출 없음)
npm run index -- --dry-run

# 3. 임베딩 실행 — data/catalog-vectors.json이 채워진다
npm run index
```

카탈로그가 바뀌면(항목 추가·사용법 수정) 인덱서를 다시 돌려야 한다.
별칭을 늘리려면 `api/_lib/chunks.js`의 `ALIASES`에 추가하고 다시 돌린다.

## 배포 (Vercel)

Vercel 대시보드 → 프로젝트 Settings → Environment Variables에 넣는다.

- `OPENAI_API_KEY` (필수)
- `OPENAI_EMBED_MODEL` (기본 `text-embedding-3-small`)
- `OPENAI_CHAT_MODEL` (기본 `gpt-4o-mini`)
- `AI_TOP_K` (기본 5), `AI_MIN_SCORE` (기본 0.25), `AI_RATE_LIMIT_PER_MIN` (기본 20)

`/api/*.js`는 Vercel이 자동으로 서버리스 함수로 인식한다.
`vercel.json`의 `includeFiles`가 벡터 JSON을 함수에 넣어준다.

## 프론트 연결 (다음 단계)

지금 AI 답변 패널은 키워드 미리보기 상태다 (`src/main.jsx`의 `aiAnswer`).
연결할 때는 `onSearch`에서 질문 + 매칭 결과를 `/api/ask`에 POST하고,
돌아온 `answer`와 `sources`를 패널에 보여주면 된다.
`503 AI_SEARCH_UNAVAILABLE`이면 지금 미리보기를 그대로 쓰면 된다.

## Kanana-2-embedding으로 바꾸려면

1. `api/_lib/embed.js`의 `embedTexts`를 Kanana를 부르는 방식으로 바꾼다.
   (Kanana는 가중치 공개 모델이라 직접 돌릴 곳이 필요하다. HF Inference
   Endpoints 같은 GPU 호스팅, 또는 작은 서버.)
2. `data/catalog-vectors.json`의 `dim`을 Kanana 차원으로 바꾼다.
   (1.3B는 1280, 3B는 2560. MRL로 512까지 줄일 수 있다.)
3. `npm run index`를 다시 돌린다.

**반드시 문서와 질문을 같은 모델로 임베딩해야 한다.** 벡터 공간이 달라지면
코사인 유사도가 무의미해진다. 모델을 바꾸면 인덱서를 다시 돌리는 게 필수다.

## 비용·한계

- 임베딩 178개는 짧은 텍스트라 한 번에 수백 원 수준. 질문 1개당 임베딩 비용은 거의 0.
  돈은 LLM 호출(`gpt-4o-mini`, 출력 최대 400토큰)에서 나간다.
- 속도 제한은 서버리스 인스턴스마다 따로 도는 대략적인 장치다. 정확한 제한이
  필요하면 Upstash Ratelimit 같은 외부 스토어를 쓴다.
- 178개라 벡터 DB가 필요 없지만, 카탈로그가 수천 개로 커지면
  `api/_lib/retrieval.js`의 `topK`를 벡터 DB 조회로 바꾸면 된다.
