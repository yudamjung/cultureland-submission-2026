import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';
import { offlineIds } from './catalog.js';
import { culturelandOriginalLogos } from './culturelandOriginalLogos.js';
import { browseMatches, browseTabs, getSteps, isReady, places } from './data.js';

test('온라인·오프라인 필터가 모든 사용처를 분류하고 하위 탭과 맞는다', () => {
  for (const mode of ['online', 'store']) {
    const candidates = places.filter((place) => mode === 'store' ? place.offline === 'yes' : place.online === 'yes');
    assert.ok(candidates.every((place) => browseTabs[mode].some((group) => browseMatches(place, group))));
  }
  assert.equal(browseMatches(places.find(({ id }) => id === 'dalkomm'), '카페·베이커리'), true);
  assert.equal(browseMatches(places.find(({ id }) => id === 'tdata'), '취미·여가·학습', '데이터/로밍'), true);
  assert.equal(browseMatches(places.find(({ id }) => id === 'npay'), '금융', '간편결제'), true);
});

test('조사 목록과 오프라인 중복 통합', () => {
  assert.equal(places.length, 175);
  assert.equal(new Set(places.map(({ id }) => id)).size, 175);
  assert.equal(offlineIds.length, 28);
  assert.equal(places.filter(({ offline }) => offline === 'yes').length, 28);
  assert.ok(places.every(({ id, logo }) => logo === culturelandOriginalLogos[id] || logo.startsWith('https://image.cultureland.co.kr/') || existsSync(`public${logo}`)));
  assert.equal(Object.keys(culturelandOriginalLogos).length, 67);
  assert.equal(places.filter(({ logo }) => logo.startsWith('https://image.cultureland.co.kr/')).length, 78);
  assert.equal(places.filter(({ sourceUrl }) => sourceUrl.endsWith('/usecash/useCash.do')).length, 96);
  assert.equal(places.find(({ id }) => id === 'olive').name, '올리브영');
  assert.equal(places.find(({ id }) => id === 'ssg').name, 'SSG페이');
});

test('보유 수단에 따른 CGV와 매장 경로', () => {
  const cgv = places.find(({ id }) => id === 'cgv');
  const cu = places.find(({ id }) => id === 'cu');
  const theborn = places.find(({ id }) => id === 'theborn');
  assert.deepEqual(getSteps(cgv, 'voucher'), ['교환', '바코드 보여 주기']);
  assert.deepEqual(getSteps(cgv, 'cash'), ['교환', '충전', '결제창 선택']);
  assert.equal(isReady(cgv, 'barcode'), true);
  assert.equal(isReady(cu, 'cash'), true);
  assert.equal(isReady(theborn, 'barcode'), false);
});
