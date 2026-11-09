import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { offlineIds } from './catalog.js';
import { culturelandOriginalLogos } from './culturelandOriginalLogos.js';
import { getSteps, isReady, places } from './data.js';

test('조사 목록과 오프라인 중복 통합', () => {
  assert.equal(places.length, 178);
  assert.equal(new Set(places.map(({ id }) => id)).size, 178);
  assert.equal(offlineIds.length, 28);
  assert.equal(places.filter(({ offline }) => offline === 'yes').length, 28);
  assert.ok(places.every(({ id, logo }) => logo === culturelandOriginalLogos[id] || logo.startsWith('https://image.cultureland.co.kr/') || existsSync(`public${logo}`)));
  assert.equal(Object.keys(culturelandOriginalLogos).length, 67);
  assert.equal(places.filter(({ logo }) => logo.startsWith('https://image.cultureland.co.kr/')).length, 80);
  assert.equal(places.filter(({ sourceUrl }) => sourceUrl.endsWith('/usecash/useCash.do')).length, 95);
  assert.equal(places.find(({ id }) => id === 'olive').name, '올리브영');
  assert.equal(places.find(({ id }) => id === 'ssg').name, 'SSG PAY');
  const dalpoint = places.find(({ id }) => id === 'dalpoint');
  assert.equal(dalpoint.status, 'partial');
  assert.equal(dalpoint.guideImage, dalpoint.sourceUrl);
  assert.match(dalpoint.summary, /달콘 앱/);
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
