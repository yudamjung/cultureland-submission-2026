import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { recommend } from '../api/recommend.js';

const entries = [
  { id: 'a', name: 'A', status: 'confirmed', vector: [1, 0, 0] },
  { id: 'b', name: 'B', status: 'confirmed', vector: [0.9, 0.1, 0] },
  { id: 'c', name: 'C', status: 'listed', vector: [0.95, 0.05, 0] },
  { id: 'd', name: 'D', status: 'partial', vector: [0, 1, 0] },
  { id: 'e', name: 'E', status: 'confirmed', vector: [0.5, 0.5, 0] },
];

test('자기 자신과 사용법 미확인(listed) 사용처를 빼고 비슷한 순서로 3곳을 고른다', () => {
  assert.deepEqual(recommend('a', entries).map((item) => item.id), ['b', 'e', 'd']);
});

test('없는 사용처는 빈 목록', () => {
  assert.deepEqual(recommend('zzz', entries), []);
});

test('잘못된 요청은 400, POST가 아니면 405', async () => {
  const mockRes = () => ({ code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.payload = b; return this; } });
  const bad = mockRes();
  await handler({ method: 'POST', body: { id: '../etc' } }, bad);
  assert.equal(bad.code, 400);
  const get = mockRes();
  await handler({ method: 'GET' }, get);
  assert.equal(get.code, 405);
});
