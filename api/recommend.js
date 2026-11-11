// POST /api/recommend — 방금 쓴 사용처와 비슷한 사용처 3곳을 추천한다(사용 완료 화면).
// 인덱서가 미리 만들어 둔 사용처 임베딩(data/catalog-vectors.json)끼리 코사인 유사도를 비교하므로
// 요청마다 OpenAI를 부르지 않는다(비용 0). 같은 사용처와 사용법이 미확인(listed)인 곳은 뺀다.
import { topK, loadVectors } from './_lib/retrieval.js';

const COUNT = 3;

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

export function recommend(placeId, entries, count = COUNT) {
  const base = entries.find((entry) => entry.id === placeId);
  if (!base?.vector) return [];
  const candidates = entries.filter((entry) => entry.id !== placeId && entry.status !== 'listed');
  return topK(base.vector, candidates, count).map(({ id, name, score }) => ({ id, name, score: Math.round(score * 1000) / 1000 }));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }
  const body = readBody(req);
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  if (!/^[a-z0-9_-]{1,40}$/i.test(id)) return res.status(400).json({ error: 'INVALID_ID' });

  const { entries } = loadVectors();
  if (entries.length === 0) return res.status(503).json({ error: 'VECTORS_NOT_READY' });
  const items = recommend(id, entries);
  if (items.length === 0) return res.status(404).json({ error: 'PLACE_NOT_FOUND' });
  return res.status(200).json({ items });
}
