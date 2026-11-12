// POST /api/ask — 자연어 질문에 컬쳐랜드 사용처를 답하는 RAG 엔드포인트.
// 흐름: 질문 임베딩 → data/catalog-vectors.json에서 코사인 유사도 top-k 검색
// → 검색된 청크만 프롬프트에 넣어 LLM이 답 → 답변 + 근거 사용처 반환.
// 키가 없으면 503(AI_SEARCH_UNAVAILABLE)을 돌려준다. 프론트는 그 경우
// 기존 키워드 미리보기(카탈로그 키워드 검색)를 그대로 쓴다.
// 벡터 파일이 비어 있으면 503(VECTORS_NOT_READY). 인덱서: npm run index.
import { embedTexts, DEFAULT_EMBED_MODEL } from './_lib/embed.js';
import { topK, loadVectors } from './_lib/retrieval.js';
import { chatComplete, DEFAULT_CHAT_MODEL } from './_lib/llm.js';
import { buildStepHint } from './_lib/holding.js';
import { findCategoryPlaceIds, findNamedPlaceIds } from './_lib/names.js';
import { cosineSimilarity } from './_lib/retrieval.js';

// 사용처별 자료(RAG)와 별개로, 모든 답변에 필요한 "가진 수단 → 사용처까지 가는 순서"는
// 화면의 사용 순서(src/lib/guide.js, src/data.js의 holdings/baseSteps)와 같은 내용으로 여기에 고정해 둔다.
const SYSTEM_PROMPT = `너는 컬쳐랜드 상품권 사용처 안내 도우미야. 한국어 해요체로 친절하게 답해.

[상품권 종류와 사용 순서]
- 카카오톡 선물하기 등으로 받은 컬쳐랜드 상품권은 '컬쳐랜드 모바일 금액권'(12자리 번호)이야. 이대로는 사용처에서 바로 못 써.
  1) 교환: 선물함에서 '등록하기'를 누르면 12자리 번호가 복사돼. 컬쳐랜드에 로그인한 뒤 '교환소'에 붙여넣고 교환하면 16자리 컬쳐랜드상품권이 생겨.
  2) 충전: 16자리 상품권을 컬쳐캐쉬로 충전해. 안심금고에 보관된 금액은 먼저 찾아야 해.
  3) 사용처 단계: 아래 '방식'에 맞게 써.
- 16자리 '컬쳐랜드 상품권 바코드'가 있으면 교환만 끝난 상태야. 아직 컬쳐캐쉬가 아니라서 온라인에서 쓰려면 먼저 컬쳐캐쉬로 충전해야 해(충전 → 사용처 단계). 오프라인 매장에서는 이 바코드를 바로 보여 줘도 돼.
- 컬쳐캐쉬가 이미 충전돼 있으면 사용처 단계만 하면 돼.
- 방식별 사용처 단계: 바로사용은 사용처 결제창에서 컬쳐랜드(컬쳐캐쉬)를 선택, 포인트·머니 전환은 컬쳐캐쉬를 그 포인트로 전환, 쿠폰은 컬쳐랜드에서 그 사용처 쿠폰을 산 뒤 사용처에 등록, 오프라인 매장은 매장에서 바코드 제시.
- [남은 단계]가 없으면 번호 목록 없이 질문에만 답해. 사용처 자료에 없는 일반 상식(상품권 종류 차이 등)은 지어내지 말고 고객센터를 안내해.
- [남은 단계]가 주어지면 번호 목록은 반드시 그 단계를 그 순서 그대로, 빠짐없이 풀어서 써. 단계를 줄이거나 합치지 마. [자료]의 사용법과 [남은 단계]가 다르면 [남은 단계]가 맞는 거야.
- 가진 수단이 '가정'이면 질문에 없던 '카톡으로 받은' 같은 말을 지어내지 말고 '모바일 금액권(12자리)이라면'처럼 조건으로 말해. 그리고 마지막에 이미 교환·충전한 단계는 건너뛰어도 된다고 알려 줘.
- 온라인 사용처에서는 컬쳐캐쉬로만 결제돼. 그래서 컬쳐캐쉬가 아직 없으면 충전 단계를 절대 빼지 마.
- 자료에 '오프라인 바코드 결제로도 가능'이 있으면 매장에서는 16자리 상품권 바코드를 바로 보여 줘도 된다고 함께 알려 줘. 단, [남은 단계]에 '편의점 바코드'가 있으면 편의점이니 상품권 바코드를 보여 주라고 하지 마.

[답변 규칙]
- 아래 [자료]에 있는 사용처 내용만으로 답해. 자료에 없는 사용법·수수료·한도는 지어내지 말고 모른다고 해.
- 환불·분실·오류처럼 사용처 자료로 답할 수 없는 질문은 모른다고 하고 컬쳐랜드 고객센터(1577-2111)에 문의하라고 안내해.
- 질문이 '영화관 알려줘'처럼 여러 사용처를 묻는 거면 [자료]에 있는 해당 사용처를 모두 이름으로 알려 주고, 순서 안내는 [남은 단계] 기준으로 한 번만 적어.
- 질문에서 물은 사용처가 [자료]에 없으면 그 사용처의 사용 단계를 지어내지 말고, 컬쳐랜드 사용처 목록에서 확인되지 않는다고만 말해. 모른다고 해 놓고 단계를 안내하지 마.
- '확인 상태'가 listed나 partial인 항목은 세부 조건이 미확인일 수 있다고 덧붙여.
- '쿠폰' 줄은 컬쳐랜드에서 그 사용처 상품권을 살 때의 권종·수수료·한도·유효기간이야. 상품권 금액이나 수수료를 물으면 그 줄로 답해. 금액은 액면가 그대로(예: '5만원권') 말하고 수수료는 '수수료 1% 별도'처럼 비율로만 말해. 수수료 금액이나 수수료를 더한 결제 금액은 계산해서 말하지 마.
- 형식: 첫 문장에 쓸 수 있는지 없는지와 이유를 말해. 교환·충전이 필요해도 결국 쓸 수 있으면 '네'로 시작해. 사용처에서 아예 못 쓰거나, 묻는 권종이 없거나, 품절일 때만 '아쉽지만'으로 시작해. [참고]가 있으면 그 내용이 맞는 사실이니 그대로 첫 문장에 반영해. 그다음 지금부터 할 일을 '1. 2. 3.' 번호 목록으로 한 줄씩 적어. 수수료·한도 같은 주의할 점이 있으면 마지막에 한두 문장으로 덧붙여.
- 전체 길이는 5~9줄 정도로, 마크다운 굵게(**)나 제목(#)은 쓰지 마.
- 말투는 반드시 '~해요', '~하세요' 같은 존댓말 해요체로 써. '~야', '~해' 같은 반말로 끝나는 문장은 하나도 없어야 해.

[답변 예시] (질문: 카톡으로 받은 컬쳐랜드 1만원권, 예스24에서 쓸 수 있어요?)
네, 예스24에서 쓸 수 있어요. 다만 카톡으로 받은 모바일 금액권은 바로 결제되지 않아서 컬쳐캐쉬로 바꾸는 과정이 필요해요.
1. 선물함에서 '등록하기'를 눌러 12자리 번호를 복사한 뒤, 컬쳐랜드 '교환소'에서 교환해 16자리 상품권으로 받으세요.
2. 받은 16자리 상품권을 컬쳐캐쉬로 충전하세요.
3. 예스24 결제창에서 컬쳐랜드(컬쳐캐쉬)를 선택해 결제하면 돼요.
이미 컬쳐캐쉬로 충전해 두셨다면 3번만 하시면 돼요.`;

const NOT_FOUND_ANSWER =
  '컬쳐랜드 사용처 목록에서 질문과 맞는 곳을 찾지 못했어요. 사용처 이름으로 직접 검색하거나 온라인·오프라인 사용처 목록에서 둘러보세요.';

const MAX_QUESTION_LENGTH = 500;

// 서버리스 인스턴스마다 따로 도는 대략적인 속도 제한이다. 남용 방지용 최소 장치로,
// 정확한 제한이 필요하면 Upstash Ratelimit 같은 외부 스토어를 쓰면 된다.
const rateLimitHits = new Map();
function isRateLimited(ip, limitPerMin) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const hits = (rateLimitHits.get(ip) || []).filter((t) => t > windowStart);
  hits.push(now);
  rateLimitHits.set(ip, hits);
  return hits.length > limitPerMin;
}

function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const body = readBody(req);
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!question || question.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({ error: 'INVALID_QUESTION' });
  }

  const limitPerMin = Number(process.env.AI_RATE_LIMIT_PER_MIN || 20);
  if (isRateLimited(getClientIp(req), limitPerMin)) {
    return res.status(429).json({ error: 'RATE_LIMITED' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI_SEARCH_UNAVAILABLE', message: 'AI 검색 키가 설정되지 않았어요.' });
  }

  const { entries } = loadVectors();
  if (entries.length === 0) {
    return res.status(503).json({ error: 'VECTORS_NOT_READY', message: 'AI 사용처 데이터가 아직 준비되지 않았어요.' });
  }

  const k = Number(process.env.AI_TOP_K || 5);
  const minScore = Number(process.env.AI_MIN_SCORE || 0.25);

  try {
    const [queryVector] = await embedTexts([question], {
      apiKey,
      model: process.env.OPENAI_EMBED_MODEL || DEFAULT_EMBED_MODEL,
    });
    // 질문에 이름이 나온 사용처는 임베딩 순위와 상관없이 맨 앞에 넣는다(하이브리드 검색).
    // 임베딩만 쓰면 '카톡·상품권' 같은 흔한 단어에 끌려 이름이 나온 사용처가 상위권 밖으로 밀린다.
    const namedIds = findNamedPlaceIds(question);
    // 업종 단어(영화관·편의점)로 물었으면 그 업종 사용처도 이름이 나온 사용처 다음에 넣는다.
    const categoryIds = findCategoryPlaceIds(question).filter((id) => !namedIds.includes(id));
    const namedEntries = namedIds
      .map((id) => entries.find((entry) => entry.id === id))
      .filter(Boolean)
      .map((entry) => ({ ...entry, score: cosineSimilarity(queryVector, entry.vector) }));
    const categoryEntries = categoryIds
      .map((id) => entries.find((entry) => entry.id === id))
      .filter(Boolean)
      .map((entry) => ({ ...entry, score: cosineSimilarity(queryVector, entry.vector) }));
    const pinned = [...namedEntries, ...categoryEntries];
    const rest = topK(queryVector, entries.filter((entry) => !pinned.some((p) => p.id === entry.id)), k);
    const matches = [...pinned, ...rest].slice(0, Math.max(k, pinned.length));
    if (!pinned.length && (matches.length === 0 || matches[0].score < minScore)) {
      return res.status(200).json({ answer: NOT_FOUND_ANSWER, sources: [], matched: false });
    }

    // 1순위 사용처 기준으로 가진 수단에 따른 남은 단계를 코드에서 계산해 넣는다.
    // 사용처를 묻지 않는 일반 질문("문화상품권이랑 같은 거야?")에 엉뚱한 사용처 순서가 붙지 않게,
    // 이름·업종이 나왔거나 1순위가 충분히 비슷할 때만 단계를 넣는다.
    const primary = pinned[0] || (matches[0].score >= 0.5 ? matches[0] : null);
    const stepHint = primary ? buildStepHint(question, primary.id) : '';
    const context = matches
      .map((m, i) => `--- [${i + 1}] ${m.name} (${m.cat}) ---\n${m.chunk}`)
      .join('\n\n');
    const answer = await chatComplete(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `[자료]\n${context}\n\n${stepHint ? `${stepHint}\n\n` : ''}[질문]\n${question}` },
      ],
      {
        apiKey,
        model: process.env.OPENAI_CHAT_MODEL || DEFAULT_CHAT_MODEL,
        temperature: 0.2,
        maxTokens: 700,
      },
    );

    return res.status(200).json({
      answer,
      // 질문에 사용처 이름이 하나만 나왔으면 화면이 그 사용처의 '사용 안내 보기' 버튼을 띄운다.
      primaryId: namedEntries.length === 1 ? namedEntries[0].id : null,
      sources: matches.map((m) => ({
        id: m.id,
        name: m.name,
        cat: m.cat,
        type: m.type,
        sourceUrl: m.sourceUrl,
        score: Math.round(m.score * 1000) / 1000,
      })),
      matched: true,
    });
  } catch (err) {
    console.error('[api/ask]', err instanceof Error ? err.message : err);
    if (/credit_balance_exhausted|insufficient_quota|no credits remaining/i.test(String(err))) {
      return res.status(503).json({ error: 'AI_CREDITS_EXHAUSTED', message: 'AI API 크레딧이 소진되었어요. 결제 잔액을 확인해 주세요.' });
    }
    return res.status(502).json({ error: 'UPSTREAM_ERROR', message: 'AI 검색이 잠시 안 돼요. 나중에 다시 시도해주세요.' });
  }
}
