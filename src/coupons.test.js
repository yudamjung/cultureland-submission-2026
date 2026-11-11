import assert from 'node:assert/strict';
import { test } from 'node:test';
import { couponProducts, DUAL_METHOD_IDS, getCoupon, itemPricing } from './coupons.js';
import { findPlace, places } from './data.js';

test('쿠폰 상품 키는 모두 실제 사용처(또는 세부 권종)로 이어진다', () => {
  for (const key of Object.keys(couponProducts)) {
    const [id, typeId] = key.split('/');
    assert.ok(findPlace(id, typeId), `${key} 없음`);
  }
  for (const id of DUAL_METHOD_IDS) assert.ok(couponProducts[id] && places.some((p) => p.id === id));
});

test('부모 사용처는 쿠폰이 없고 자식 권종마다 있다', () => {
  for (const [id, kids] of [['shinsegae', ['kiosk', 'paper', 'emarticon']], ['lotte', ['mobile', 'paper']], ['tdata', ['data', 'roaming', 'direct']]]) {
    assert.equal(getCoupon(findPlace(id)), undefined);
    for (const kid of kids) assert.ok(getCoupon(findPlace(id, kid)), `${id}/${kid}`);
  }
});

test('가격 계산: 수수료 가산, 수수료 없음, 지원, 고정 판매가', () => {
  assert.deepEqual(itemPricing(couponProducts['shinsegae/kiosk'], { face: 100000 }), { price: 106000, fee: 6000 });
  assert.deepEqual(itemPricing(couponProducts.olive, { face: 10000 }), { price: 10100, fee: 100 });
  assert.deepEqual(itemPricing(couponProducts.kgc, { face: 30000 }), { price: 30000, fee: 0 });
  assert.deepEqual(itemPricing(couponProducts.hangame, { face: 10000 }), { price: 10000, fee: 0 });
  assert.deepEqual(itemPricing(couponProducts.psstore, { face: 3000, price: 2910 }), { price: 2910, fee: 0 });
});
