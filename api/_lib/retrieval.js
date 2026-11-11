// 벡터 검색: 코사인 유사도 + top-k. 벡터 DB 없이 178개 규모에서
// 서버리스 함수 안에서 직접 계산한다. 카탈로그가 수천 개로 커지면
// 이 부분을 벡터 DB(pgvector 등) 조회로 바꾸면 된다.
import { readFileSync } from 'node:fs';

export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error('COSINE_DIM_MISMATCH');
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// entries: [{ id, ..., vector }] — vector가 없는 항목은 제외한다.
// 반환: score 내림차순으로 정렬된 상위 k개 [{ ..., score }]
export function topK(queryVector, entries, k) {
  const scored = [];
  for (const entry of entries) {
    if (!Array.isArray(entry.vector)) continue;
    scored.push({ ...entry, score: cosineSimilarity(queryVector, entry.vector) });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(0, k));
}

let cachedVectors = null;

// data/catalog-vectors.json을 읽어 메모리에 캐시한다.
// Vercel에서는 vercel.json의 includeFiles로 이 파일을 함수에 포함시킨다.
// 파일이 없거나 비어 있으면 entries: []를 돌려준다 (인덱서 미실행 상태).
export function loadVectors() {
  if (cachedVectors) return cachedVectors;
  try {
    const url = new URL('../../data/catalog-vectors.json', import.meta.url);
    const parsed = JSON.parse(readFileSync(url, 'utf-8'));
    cachedVectors = {
      model: parsed.model || null,
      dim: parsed.dim || 0,
      generatedAt: parsed.generated_at || null,
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    };
  } catch {
    cachedVectors = { model: null, dim: 0, generatedAt: null, entries: [] };
  }
  return cachedVectors;
}

// 테스트에서 캐시를 비울 때만 쓴다.
export function _resetVectorsCache() {
  cachedVectors = null;
}

// 테스트에서 벡터 파일 대신 쓸 값을 넣을 때만 쓴다(실제 파일 내용과 무관하게 검증하려고).
export function _setVectorsCache(value) {
  cachedVectors = value;
}
