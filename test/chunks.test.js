import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../src/catalog.js';
import { couponProducts } from '../src/coupons.js';
import { buildChunkText, buildCouponLines, couponLinesFor } from '../api/_lib/chunks.js';

const chunkOf = (id) => buildChunkText(catalog.find((place) => place.id === id));

test('쿠폰 상품이 있는 사용처 청크에 쿠폰 줄이 붙는다', () => {
  assert.match(chunkOf('olive'), /\n쿠폰: 권종 1만원·2만원·3만원·5만원 \/ 수수료 1% 별도 \/ 한도 일 20만원, 월 100만원/);
  assert.doesNotMatch(chunkOf('cu'), /\n쿠폰/);
});

test('세부 권종이 있는 부모는 권종별로 한 줄씩 붙는다', () => {
  const lines = couponLinesFor('shinsegae');
  assert.equal(lines.length, 3);
  assert.match(lines[1], /^쿠폰 \[지류 상품권 \(배송상품\)\]: 권종 50만원 .*1회 최대 100장/);
});

test('수수료 지원·품절·판매가 상품을 구분해 적는다', () => {
  assert.match(buildCouponLines(couponProducts.hangame)[0], /수수료 없음 \(원래 3%지만 지금은 컬쳐랜드가 지원/);
  assert.deepEqual(buildCouponLines(couponProducts.nexon), ['쿠폰: 현재 품절']);
  assert.match(buildCouponLines(couponProducts.psstore)[0], /3,000원권\(2,910원\).*3% 할인가/);
});

test('쿠폰 상품의 사용처 id는 모두 카탈로그에 있다', () => {
  const ids = new Set(catalog.map((place) => place.id));
  for (const key of Object.keys(couponProducts)) assert.ok(ids.has(key.split('/')[0]), key);
});
