import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getSteps, places } from '../data.js';
import { hasPayChoice, payOptions } from './methods.js';
import { guideSteps } from './guide.js';

const byId = (id) => places.find((place) => place.id === id);

test('온라인·매장 결제를 모두 지원하는 곳은 들어온 경로에 맞는 방식만 남긴다', () => {
  const lotte = byId('lottecinema');
  assert.deepEqual(payOptions(lotte), ['online', 'store']);
  assert.deepEqual(payOptions(lotte, 'online'), ['online']);
  assert.deepEqual(payOptions(lotte, 'store'), ['store']);
});

test('CGV는 바로 결제·쿠폰·매장 결제 세 가지이고, 온라인 목록에서 오면 매장 결제를 뺀다', () => {
  const cgv = byId('cgv');
  assert.deepEqual(payOptions(cgv), ['online', 'coupon', 'store']);
  assert.deepEqual(payOptions(cgv, 'online'), ['online', 'coupon']);
  assert.deepEqual(payOptions(cgv, 'store'), ['store']);
});

test('방식이 하나뿐인 곳은 방식 선택이 없다', () => {
  for (const id of ['yes24', 'cu', 'olive']) assert.equal(hasPayChoice(byId(id)), false, id);
  assert.equal(hasPayChoice(byId('megabox')), true);
});

test('고른 방식에 맞는 사용 순서를 준다', () => {
  const mega = byId('megabox');
  assert.deepEqual(getSteps(mega, 'voucher', 'online'), ['교환', '충전', '결제창 선택']);
  assert.deepEqual(getSteps(mega, 'voucher', 'store'), ['교환', '바코드 보여 주기']);
  assert.deepEqual(getSteps(mega, 'cash', 'store'), ['앱 바코드 열기', '매장에서 보여 주기']);
  assert.equal(guideSteps(mega, 'barcode', 'online').length, 3);
  assert.equal(guideSteps(byId('cgv'), 'voucher', 'coupon').at(-1).title, '쿠폰 구매하기');
});
