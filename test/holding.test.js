import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStepHint, detectHolding } from '../api/_lib/holding.js';

test('질문에서 가진 수단을 추정한다', () => {
  assert.equal(detectHolding('친구한테 카톡으로 컬쳐랜드 3만원권 선물 받았어'), 'voucher');
  assert.equal(detectHolding('16자리 상품권 있는데 다이소에서 돼?'), 'barcode');
  assert.equal(detectHolding('컬쳐캐쉬 충전해뒀는데 L.POINT로 바꿀 수 있어?'), 'cash');
  assert.equal(detectHolding('이마트에서 돼?'), null);
});

test('16자리 상품권으로 온라인 사용처를 물으면 충전 단계가 빠지지 않는다', () => {
  const hint = buildStepHint('16자리 상품권 있는데 다이소에서 쓸 수 있어?', 'daiso');
  assert.match(hint, /1\) 충전.*2\) 사용처 결제창/);
  assert.doesNotMatch(hint, /교환\(/);
});

test('가진 수단을 모르면 모바일 금액권 기준으로 가정한다', () => {
  assert.match(buildStepHint('벅스에서 돼?', 'yes24'), /질문에 없음.*모바일 금액권을 가지고 계시다면/);
});

test('편의점은 상품권 바코드 대신 편의점 바코드 결제 순서를 준다', () => {
  const hint = buildStepHint('CU에서 상품권 쓸 수 있어?', 'cu');
  assert.match(hint, /충전.*편의점 바코드 결제.*매장에서/);
  assert.doesNotMatch(hint, /16자리 상품권 바코드 보여/);
});

test('세부 권종이 있는 부모 사용처는 쿠폰 구매 순서를 준다', () => {
  assert.match(buildStepHint('신세계 상품권 살 수 있어?', 'shinsegae'), /교환.*충전.*쿠폰을 금액별로 구매/);
});

test('질문의 결제 방식에 맞는 순서를 준다', () => {
  assert.match(buildStepHint('로블록스 기프트카드 5만원권 있어?', 'roblox'), /쿠폰을 금액별로 구매/);
  assert.match(buildStepHint('교보문고 매장에서 상품권 쓸 수 있어?', 'kyobo'), /바코드 보여 주기/);
  assert.match(buildStepHint('교보문고 온라인에서 써도 돼?', 'kyobo'), /결제창/);
});

test('품절 쿠폰이나 확인되지 않은 매장 결제는 참고로 알려 준다', () => {
  const nexon = buildStepHint('넥슨 쿠폰 지금 살 수 있어?', 'nexon');
  assert.match(nexon, /\[참고\].*품절.*바로 결제/);
  assert.match(nexon, /결제창/);
  assert.match(buildStepHint('다이소 매장에서 바코드로 결제 돼?', 'daiso'), /\[참고\].*오프라인 매장 결제가 확인되지 않음/);
});

test('권종을 물으면 있는지 없는지를 코드에서 확인해 알려 준다', () => {
  assert.match(buildStepHint('로블록스 기프트카드 5만원권 있어?', 'roblox'), /\[참고\] 5만원권 있음/);
  assert.match(buildStepHint('스타벅스 1만원권 있어?', 'starbucks'), /\[참고\] 1만원권 없음. 있는 권종: 스타벅스 2만원·3만원·5만원/);
  assert.match(buildStepHint('롯데상품권 지류 50만원짜리 살 수 있어?', 'lotte'), /\[참고\] 50만원권 있음 \(.*지류/);
  assert.match(buildStepHint('롯데상품권 지류 50만원짜리 살 수 있어?', 'lotte'), /질문에 없음/);
});
