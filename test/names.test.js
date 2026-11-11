import test from 'node:test';
import assert from 'node:assert/strict';
import { findNamedPlaceIds } from '../api/_lib/names.js';

test('질문에 나온 사용처 이름·별칭을 찾는다', () => {
  assert.deepEqual(findNamedPlaceIds('카톡으로 받은 상품권 올리브영에서 쓸 수 있어?'), ['olive']);
  assert.deepEqual(findNamedPlaceIds('올영에서 돼?'), ['olive']);
  assert.deepEqual(findNamedPlaceIds('메가박스랑 CGV 중 어디가 나아?'), ['megabox', 'cgv']);
  assert.deepEqual(findNamedPlaceIds('이거 벅스에서 돼?'), ['bugsmusic']);
  assert.deepEqual(findNamedPlaceIds('친구한테 받았는데 올영에서 돼?'), ['olive']);
  assert.deepEqual(findNamedPlaceIds('휘닉스리조트 돼?'), ['phoenixresort']);
});

test('짧은 이름이 다른 단어 속에서 잘못 걸리지 않는다', () => {
  assert.deepEqual(findNamedPlaceIds('새로운 사용처 알려줘'), []);
  assert.deepEqual(findNamedPlaceIds('스타벅스 카드 살 수 있어?'), ['starbucks']);
  assert.deepEqual(findNamedPlaceIds('CULTURE LAND 상품권 CU에서 돼?'), ['cu']);
});
