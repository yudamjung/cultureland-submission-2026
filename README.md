# 컬쳐랜드 사용처 안내

컬쳐랜드 상품권을 **어디서, 어떻게** 쓰는지 찾아 주는 모바일 웹앱입니다.
사용처 175곳의 사용 방법을 정리해 두고, 사용자가 가진 상품권 형태(모바일 금액권 12자리, 16자리 상품권, 충전된 컬쳐캐쉬)에 맞춰 남은 단계만 알려 줍니다.

## 주요 기능

- **사용처 검색·둘러보기**: 이름으로 검색하거나 온라인·오프라인 업종별로 둘러봅니다. 홈에는 인기 사용처가 탭별로 나옵니다.
- **사용 순서 안내**: 가진 수단에 따라 교환 → 충전 → 사용처 단계 중 남은 단계만 보여 줍니다. 사용처마다 바로사용, 포인트·머니 전환, 쿠폰, 오프라인 바코드 중 맞는 방식을 안내합니다.
- **쿠폰(금액권) 구매 화면**: 권종, 수수료, 수량 한도를 사용처별로 보여 줍니다.
- **AI 질문**: "카톡으로 받은 상품권 예스24에서 돼?" 같은 자연어 질문에 카탈로그를 근거로 답합니다(RAG).
- **비슷한 사용처 추천**: 사용 완료 화면에서 임베딩 유사도로 3곳을 추천합니다. 요청마다 OpenAI를 부르지 않습니다.

## 기술 스택

- 프론트엔드: React 19, React Router 7, Vite 7
- 백엔드: Vercel 서버리스 함수(`api/*.js`)
- AI: OpenAI `text-embedding-3-small`(임베딩), `gpt-4.1-mini`(답변 생성)
- 벡터 검색: 벡터 DB 없이 `data/catalog-vectors.json`을 함수에 넣고 코사인 유사도로 검색

## 시작하기

```bash
npm install
cp .env.example .env.local   # OPENAI_API_KEY 등을 채웁니다
npm run dev                  # http://localhost:5173
```

`npm run dev`는 Vite 플러그인으로 `/api/ask`, `/api/recommend`를 로컬 dev 서버에 붙여서, 배포 환경과 같은 방식으로 AI 기능을 돌려 볼 수 있습니다.
`OPENAI_API_KEY`가 없어도 앱은 동작합니다. 이 경우 AI 질문은 `503 AI_SEARCH_UNAVAILABLE`을 돌려주고, 화면은 키워드 검색 결과를 보여 줍니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (`0.0.0.0`으로 열려 같은 네트워크의 휴대폰에서도 접속 가능) |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm test` | 단위 테스트 (`node --test`) |
| `npm run index` | 카탈로그를 임베딩해 `data/catalog-vectors.json` 생성 |
| `npm run index -- --dry-run` | API 호출 없이 청크만 만들어 통계 출력 |

## 환경변수

`.env.example`을 참고하세요. 로컬에서는 `.env.local`, 배포에서는 Vercel 프로젝트의 Environment Variables에 넣습니다.

| 이름 | 기본값 | 설명 |
| --- | --- | --- |
| `OPENAI_API_KEY` | (없음) | AI 질문·인덱싱에 필요 |
| `OPENAI_EMBED_MODEL` | `text-embedding-3-small` | 바꾸면 `npm run index`를 다시 돌려야 합니다 |
| `OPENAI_CHAT_MODEL` | `gpt-4.1-mini` | 답변 생성 모델 |
| `AI_TOP_K` | `5` | 검색할 사용처 개수 |
| `AI_MIN_SCORE` | `0.25` | 이 유사도보다 낮으면 "찾지 못했어요"로 답합니다 |
| `AI_RATE_LIMIT_PER_MIN` | `20` | IP당 분당 요청 제한 (인스턴스별 대략적인 제한) |

환경변수를 바꾼 뒤에는 Vercel에서 다시 배포해야 반영됩니다.

## 폴더 구조

```
api/
  ask.js              POST /api/ask — 자연어 질문 RAG 답변
  recommend.js        POST /api/recommend — 비슷한 사용처 3곳 추천
  _lib/               임베딩·검색·LLM 클라이언트, 청크 생성, 이름·업종 매칭, 남은 단계 계산
data/
  catalog-vectors.json  인덱서 생성물 (커밋함, 비밀 아님)
docs/                 사용처 조사 자료, 쿠폰 상품 정리, RAG 설계, AI 답변 QA 기록
scripts/
  index-catalog.mjs   카탈로그 인덱서
src/
  catalog.js          사용처 카탈로그 (원본 데이터)
  children.js         부모 브랜드의 세부 권종 (이마트·신세계, 롯데, SKT)
  coupons.js          쿠폰 구매 상품 (권종·수수료·한도)
  popular.js          홈 인기 사용처
  data.js             카탈로그 가공, 가진 수단별 사용 순서
  pages/              화면 (검색, 둘러보기, 결과, 사용 순서, 쿠폰, 완료 등)
  components/         공통 컴포넌트 (헤더, AI 채팅, 보유 수단 시트 등)
  lib/                경로, 결제 방식, 안내 문구 유틸
test/                 API 쪽 단위 테스트 (src/*.test.js는 프론트 데이터 테스트)
```

## AI 질문 동작 방식

```
질문 → POST /api/ask
  → 질문 임베딩
  → 질문에 나온 사용처 이름·업종은 먼저 고정(하이브리드 검색), 나머지는 코사인 유사도 top-k
  → 1순위 사용처와 질문 속 보유 수단으로 남은 단계를 코드에서 계산
  → 검색된 사용처 자료 + 남은 단계를 프롬프트에 넣어 LLM이 답변
  → { answer, sources, matched }
```

자세한 설계와 임베딩 모델 교체 방법은 [`docs/ai-search-rag.md`](docs/ai-search-rag.md)에 있습니다.
모델 선택 근거는 [`docs/ai-qa-2026-11-12.md`](docs/ai-qa-2026-11-12.md)를 참고하세요.

## 데이터 수정

사용처를 추가하거나 사용법을 고치면(`src/catalog.js`, `src/children.js`), AI 검색에 반영되도록 인덱서를 다시 돌리고 결과를 커밋합니다.

```bash
npm run index
git add data/catalog-vectors.json
```

검색 별칭(예: 약칭, 영문명)은 `api/_lib/chunks.js`의 `ALIASES`에 추가한 뒤 다시 인덱싱합니다.

## 배포

Vercel에 연결하면 `api/*.js`가 서버리스 함수로 배포됩니다. `vercel.json`은 벡터 파일을 함수 번들에 포함하고, `/api/`와 `/assets/`를 뺀 모든 경로를 `index.html`로 보내 SPA 라우팅을 처리합니다.
