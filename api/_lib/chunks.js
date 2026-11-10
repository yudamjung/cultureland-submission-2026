// 카탈로그 항목 1개 = 청크 1개. 임베딩할 텍스트를 만든다.
// 인덱서(scripts/index-catalog.mjs)가 이 함수로 청크를 만들고,
// 그 텍스트를 벡터와 함께 data/catalog-vectors.json에 저장한다.
// 런타임(api/ask.js)은 저장된 청크를 그대로 프롬프트에 넣는다.
// 별칭·그룹은 카탈로그 항목의 aliases/groups(IA 테이블)에서 읽는다.
// "편의점 → CU/GS25" 같은 의미 연결은 임베딩이 맡는다. 별칭을 늘리고 싶으면
// src/catalog.js의 IA 테이블에 추가하고 인덱서를 다시 돌리면 된다.
const STATUS_GLOSS = {
  confirmed: '공식 상세 확인됨',
  partial: '일반 사용법만 확인됨 (세부 조건 미확인일 수 있음)',
  listed: '목록 등재만 확인됨 (사용법 미확인)',
};

const TYPE_GLOSS = {
  direct: '바로사용 (결제창에서 컬쳐캐쉬 선택)',
  convert: '포인트·머니 전환',
  coupon: '쿠폰·기프트카드 구매 후 등록',
  store: '오프라인 매장 바코드 결제',
};

// place: src/catalog.js의 항목 1개
// { id, name, cat, type, status, summary, sourceUrl, fee?, limit?, variants?, offline?, aliases?, groups?, subItems?, brand? }
export function buildChunkText(place) {
  const lines = [];
  const aliases = place.aliases;
  lines.push(`이름: ${place.name}${aliases ? ` (${aliases.join(', ')})` : ''}`);
  lines.push(`카테고리: ${place.cat}`);
  if (place.groups) lines.push(`그룹: ${place.groups.join(', ')}`);
  if (place.brand) lines.push(`브랜드: ${place.brand}`);
  if (place.subItems) lines.push(`세부: ${place.subItems.join(', ')}`);
  lines.push(`방식: ${TYPE_GLOSS[place.type] || place.type}`);
  lines.push(`확인 상태: ${STATUS_GLOSS[place.status] || place.status}`);
  lines.push(`사용법: ${place.summary}`);
  if (place.fee) lines.push(`수수료: ${place.fee}`);
  if (place.limit) lines.push(`한도: ${place.limit}`);
  if (place.variants) lines.push(`권종: ${place.variants}`);
  if (place.offline === 'yes') lines.push('오프라인 바코드 결제로도 가능 (브랜드별 제외 매장 확인 필요)');
  lines.push(`출처: ${place.sourceUrl}`);
  return lines.join('\n');
}
