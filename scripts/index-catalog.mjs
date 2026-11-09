#!/usr/bin/env node
// 카탈로그 인덱서: src/catalog.js의 항목을 청크로 만들고 임베딩해서
// data/catalog-vectors.json을 만든다. /api/ask가 이 파일을 읽어 검색한다.
//
//   npm run index -- --dry-run     청크만 만들고 API 호출 없이 통계 출력
//   npm run index                   .env.local의 OPENAI_API_KEY로 임베딩 실행
//   node scripts/index-catalog.mjs --api-key sk-... --model text-embedding-3-small
//
// 키는 .env.local(레포 루트)이나 환경변수 OPENAI_API_KEY에서 읽는다.
// .env.local은 .gitignore에 있어 커밋되지 않는다.
// 모델을 바꾸면 벡터 공간이 달라지므로 반드시 인덱서를 다시 돌려야 한다.
// (문서와 질문은 같은 모델로 임베딩해야 코사인 유사도가 의미가 있다.)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { catalog } from '../src/catalog.js';
import { buildChunkText } from '../api/_lib/chunks.js';
import { embedTexts, DEFAULT_EMBED_MODEL } from '../api/_lib/embed.js';

const args = process.argv.slice(2);
const flag = (name, fallback = undefined) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const DRY_RUN = args.includes('--dry-run');
const OUT = flag('--out', 'data/catalog-vectors.json');
const MODEL = flag('--model', process.env.OPENAI_EMBED_MODEL || DEFAULT_EMBED_MODEL);
const BATCH_SIZE = Number(flag('--batch-size', '50')) || 50;

// .env.local을 읽어 process.env에 없는 키만 채운다. 값은 로그에 찍지 않는다.
function loadDotEnvLocal() {
  if (!existsSync('.env.local')) return;
  for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (/^[A-Z0-9_]+$/.test(key) && process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnvLocal();

const chunks = catalog.map((place) => ({ place, text: buildChunkText(place) }));

// 중복 id 검사
const ids = new Set();
for (const { place } of chunks) {
  if (ids.has(place.id)) throw new Error(`중복 id: ${place.id}`);
  ids.add(place.id);
}

const byCat = {};
for (const { place } of chunks) byCat[place.cat] = (byCat[place.cat] || 0) + 1;
const totalChars = chunks.reduce((sum, c) => sum + c.text.length, 0);
console.log(`항목: ${chunks.length}개 (카테고리별 ${JSON.stringify(byCat)})`);
console.log(`청크 글자 수: 총 ${totalChars}자, 평균 ${Math.round(totalChars / chunks.length)}자`);

if (DRY_RUN) {
  console.log('--- 샘플 청크 (첫 번째) ---');
  console.log(chunks[0].text);
  console.log('--- dry-run: API 호출 없이 종료 ---');
  process.exit(0);
}

const apiKey = flag('--api-key', process.env.OPENAI_API_KEY);
if (!apiKey) {
  console.error('OPENAI_API_KEY가 없어요. .env.local에 넣거나 --api-key로 넘기세요.');
  process.exit(1);
}

const entries = [];
for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
  const batch = chunks.slice(i, i + BATCH_SIZE);
  const vectors = await embedTexts(batch.map((c) => c.text), { apiKey, model: MODEL });
  batch.forEach(({ place, text }, j) => {
    entries.push({
      id: place.id,
      name: place.name,
      cat: place.cat,
      type: place.type,
      status: place.status,
      sourceUrl: place.sourceUrl,
      chunk: text,
      vector: vectors[j],
    });
  });
  console.log(`임베딩 ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length}`);
}

const dim = entries[0]?.vector?.length || 0;
if (!dim || !entries.every((e) => e.vector.length === dim)) {
  throw new Error('벡터 차원이 일정하지 않아요.');
}

const payload = { model: MODEL, dim, generated_at: new Date().toISOString(), entries };
writeFileSync(OUT, JSON.stringify(payload));
const bytes = Buffer.byteLength(JSON.stringify(payload));
console.log(`완료: ${entries.length}개, 차원 ${dim}, ${OUT} (${(bytes / 1024).toFixed(0)}KB)`);
console.log('참고: 임베딩 178개는 짧은 텍스트라 비용이 거의 들지 않아요. (수백 원 수준)');
