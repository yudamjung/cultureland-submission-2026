// POST /api/ask — 자연어 질문에 컬쳐랜드 사용처를 답하는 RAG 엔드포인트.
// 흐름: 질문 임베딩 → data/catalog-vectors.json에서 코사인 유사도 top-k 검색
// → 검색된 청크만 프롬프트에 넣어 LLM이 답 → 답변 + 근거 사용처 반환.
// 키가 없으면 503(AI_SEARCH_UNAVAILABLE)을 돌려준다. 프론트는 그 경우
// 기존 키워드 미리보기(카탈로그 키워드 검색)를 그대로 쓴다.
// 벡터 파일이 비어 있으면 503(VECTORS_NOT_READY). 인덱서: npm run index.
import { embedTexts, DEFAULT_EMBED_MODEL } from './_lib/embed.js';
import { topK, loadVectors } from './_lib/retrieval.js';
import { chatComplete, DEFAULT_CHAT_MODEL } from './_lib/llm.js';

const SYSTEM_PROMPT = `너는 컬쳐랜드 상품권 사용처 안내 도우미야. 한국어로 간결하게 답해.
아래 [자료]에 있는 내용만으로 답해. 자료에 없는 사용법·수수료·한도는 지어내지 말고 모른다고 해.
'확인 상태'가 listed나 partial인 항목은 세부 조건이 미확인일 수 있다고 덧붙여.
답은 3~4문장 이내로, 쓸 수 있는지 없는지부터 말해.`;

const NOT_FOUND_ANSWER =
  '카탈로그 178곳에서 질문과 맞는 사용처를 찾지 못했어요. 사용처 이름을 직접 검색해보거나 카테고리별로 둘러보세요.';

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
    const matches = topK(queryVector, entries, k);
    if (matches.length === 0 || matches[0].score < minScore) {
      return res.status(200).json({ answer: NOT_FOUND_ANSWER, sources: [], matched: false });
    }

    const context = matches
      .map((m, i) => `--- [${i + 1}] ${m.name} (${m.cat}) ---\n${m.chunk}`)
      .join('\n\n');
    const answer = await chatComplete(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `[자료]\n${context}\n\n[질문]\n${question}` },
      ],
      {
        apiKey,
        model: process.env.OPENAI_CHAT_MODEL || DEFAULT_CHAT_MODEL,
        temperature: 0.2,
        maxTokens: 400,
      },
    );

    return res.status(200).json({
      answer,
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
