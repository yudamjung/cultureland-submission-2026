import test from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity, topK, _resetVectorsCache, _setVectorsCache } from '../api/_lib/retrieval.js';
import { buildChunkText } from '../api/_lib/chunks.js';
import { catalog } from '../src/catalog.js';
import handler from '../api/ask.js';

test('cosineSimilarity: 같은 벡터는 1, 직교는 0, 반대는 -1', () => {
  assert.ok(Math.abs(cosineSimilarity([1, 0], [1, 0]) - 1) < 1e-9);
  assert.ok(Math.abs(cosineSimilarity([1, 0], [0, 1])) < 1e-9);
  assert.ok(Math.abs(cosineSimilarity([1, 0], [-1, 0]) + 1) < 1e-9);
  assert.equal(cosineSimilarity([0, 0], [1, 2]), 0);
});

test('cosineSimilarity: 차원이 다르면 예외', () => {
  assert.throws(() => cosineSimilarity([1, 2], [1]), /COSINE_DIM_MISMATCH/);
});

test('topK: 점수 내림차순 상위 k개, 벡터 없는 항목 제외', () => {
  const entries = [
    { id: 'a', vector: [1, 0] },
    { id: 'b', vector: [0, 1] },
    { id: 'c', vector: [0.7, 0.7] },
    { id: 'd' },
  ];
  const ranked = topK([1, 0], entries, 2);
  assert.deepEqual(ranked.map((r) => r.id), ['a', 'c']);
  assert.ok(ranked[0].score > ranked[1].score);
  assert.equal(topK([1, 0], entries, 10).length, 3);
});

test('buildChunkText: 이름·사용법·수수료를 담는다', () => {
  const text = buildChunkText({
    id: 'bunjang',
    name: '번개장터',
    cat: '쇼핑',
    type: 'direct',
    status: 'confirmed',
    summary: '결제 단계에서 컬쳐캐쉬 조회·사용.',
    sourceUrl: 'https://example.com',
    fee: '5% 수수료',
  });
  assert.match(text, /번개장터/);
  assert.match(text, /결제 단계에서 컬쳐캐쉬 조회·사용/);
  assert.match(text, /5% 수수료/);
  assert.match(text, /공식 상세 확인됨/);
});

test('catalog: 모든 항목이 빈틈없는 청크를 만들고 id가 유일하다', () => {
  assert.ok(catalog.length > 100, `catalog too small: ${catalog.length}`);
  const ids = new Set();
  for (const place of catalog) {
    assert.ok(place.id && place.name && place.summary, `incomplete: ${place.id}`);
    assert.ok(!ids.has(place.id), `duplicate id: ${place.id}`);
    ids.add(place.id);
    const text = buildChunkText(place);
    assert.ok(text.length > 20, `chunk too short: ${place.id}`);
    assert.ok(text.includes(place.name), `chunk misses name: ${place.id}`);
  }
});

function mockRes() {
  const res = {
    code: null,
    payload: null,
    headers: {},
    status(code) {
      this.code = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
    },
  };
  return res;
}

test('api/ask: 키가 없으면 503 AI_SEARCH_UNAVAILABLE (키워드 미리보기 유지 신호)', async () => {
  const saved = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const req = { method: 'POST', body: { question: '카톡으로 받은 상품권 예스24에서 돼?' }, headers: {}, socket: { remoteAddress: '127.0.0.1-test-no-key' } };
    const res = mockRes();
    await handler(req, res);
    assert.equal(res.code, 503);
    assert.equal(res.payload.error, 'AI_SEARCH_UNAVAILABLE');
  } finally {
    if (saved !== undefined) process.env.OPENAI_API_KEY = saved;
  }
});

test('api/ask: 잘못된 요청은 400, POST가 아니면 405', async () => {
  const emptyReq = { method: 'POST', body: { question: '   ' }, headers: {}, socket: { remoteAddress: '127.0.0.1-test-bad' } };
  const res1 = mockRes();
  await handler(emptyReq, res1);
  assert.equal(res1.code, 400);

  const getReq = { method: 'GET', body: null, headers: {}, socket: {} };
  const res2 = mockRes();
  await handler(getReq, res2);
  assert.equal(res2.code, 405);
});

test('api/ask: 사용처 벡터가 비어 있으면 준비 중 오류를 반환한다', async () => {
  const saved = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test-key';
  // 실제 data/catalog-vectors.json은 인덱싱돼 있으므로 빈 벡터 상태를 직접 넣는다.
  _setVectorsCache({ model: null, dim: 0, generatedAt: null, entries: [] });
  try {
    const req = { method: 'POST', body: { question: '예스24에서 쓸 수 있나요?' }, headers: {}, socket: { remoteAddress: '127.0.0.1-test-vectors' } };
    const res = mockRes();
    await handler(req, res);
    assert.equal(res.code, 503);
    assert.equal(res.payload.error, 'VECTORS_NOT_READY');
    assert.doesNotMatch(res.payload.message, /npm/);
  } finally {
    if (saved === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = saved;
    _resetVectorsCache();
  }
});
