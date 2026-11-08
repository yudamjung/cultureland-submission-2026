import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { offlineIds } from './catalog.js';
import { getSteps, isReady, places } from './data.js';

test('조사 목록과 오프라인 중복 통합', () => {
  assert.equal(places.length, 98);
  assert.equal(new Set(places.map(({ id }) => id)).size, 98);
  assert.equal(offlineIds.length, 28);
  assert.equal(places.filter(({ offline }) => offline === 'yes').length, 28);
  assert.ok(places.every(({ logo }) => existsSync(`public${logo}`)));
});

test('보유 수단에 따른 CGV와 매장 경로', () => {
  const cgv = places.find(({ id }) => id === 'cgv');
  const cu = places.find(({ id }) => id === 'cu');
  const emart = places.find(({ id }) => id === 'emart');
  assert.deepEqual(getSteps(cgv, 'voucher'), ['교환', '바코드 보여 주기']);
  assert.deepEqual(getSteps(cgv, 'cash'), ['교환', '충전', '결제창 선택']);
  assert.equal(isReady(cgv, 'barcode'), true);
  assert.equal(isReady(cu, 'cash'), true);
  assert.equal(isReady(emart, 'barcode'), false);
});
