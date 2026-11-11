// 질문에 사용처 이름(또는 별칭)이 그대로 나오면 그 사용처를 찾는다.
// 임베딩 검색은 "카톡으로 받은 상품권 올리브영에서 돼?"처럼 흔한 단어가 많은 질문에서
// 이름이 나온 사용처를 상위 5곳 밖으로 밀어낼 때가 있어서, 이름 일치를 검색 결과 앞에 붙인다.
import { places } from '../../src/data.js';

const compact = (text) => text.toLowerCase().replace(/\s/g, '');
const HANGUL = /[가-힣]/;
const ASCII_LETTER = /[a-z0-9]/;

const TERMS = places
  .flatMap((place) => [place.name, ...(place.aliases || [])].map((term) => ({ id: place.id, term: compact(term) })))
  .filter(({ term }) => term.length >= 2)
  .sort((a, b) => b.term.length - a.term.length);

// 짧은 이름이 다른 단어 속에 섞여 잘못 걸리지 않게 앞뒤 글자를 본다.
// 예: '로운'(로운 온라인)이 '새로운' 안에서, 'CU'가 'CULTURE' 안에서 걸리지 않게.
// 앞뒤 글자는 공백을 지우기 전 원문에서 본다('받았는데 올영'의 앞 글자는 '데'가 아니라 공백).
function isBoundary(original, positions, start, end, term) {
  const before = original[positions[start] - 1] || '';
  const after = original[positions[end - 1] + 1] || '';
  if (ASCII_LETTER.test(term[0])) return !ASCII_LETTER.test(before) && !ASCII_LETTER.test(after);
  return term.length > 2 || !HANGUL.test(before);
}

// 반환: 질문에 나온 순서대로 사용처 id(중복 없음). 긴 이름에 포함된 짧은 이름은 따로 세지 않는다.
export function findNamedPlaceIds(question) {
  const original = question.toLowerCase();
  // 공백을 지운 문자열의 i번째 글자가 원문 몇 번째 글자인지.
  const positions = [];
  for (let i = 0; i < original.length; i += 1) if (!/\s/.test(original[i])) positions.push(i);
  const text = compact(question);
  const taken = [];
  const found = [];
  for (const { id, term } of TERMS) {
    let from = 0;
    while (from <= text.length) {
      const start = text.indexOf(term, from);
      if (start < 0) break;
      const end = start + term.length;
      from = start + 1;
      if (!isBoundary(original, positions, start, end, term)) continue;
      if (taken.some(([s, e]) => start >= s && end <= e)) continue;
      taken.push([start, end]);
      found.push({ id, start });
      break;
    }
  }
  return [...new Set(found.sort((a, b) => a.start - b.start).map(({ id }) => id))];
}
