// 카탈로그 항목 1개 = 청크 1개. 임베딩할 텍스트를 만든다.
// 인덱서(scripts/index-catalog.mjs)가 이 함수로 청크를 만들고,
// 그 텍스트를 벡터와 함께 data/catalog-vectors.json에 저장한다.
// 런타임(api/ask.js)은 저장된 청크를 그대로 프롬프트에 넣는다.
// 별칭·그룹은 카탈로그 항목의 aliases/groups(IA 테이블)에서 읽는다.
// 쿠폰(상품권) 구매 정보는 src/coupons.js에서 읽어 해당 사용처 청크에 덧붙인다.
// coupons.js를 고치면 인덱서(npm run index)를 다시 돌려야 AI에 반영된다.
import { couponProducts } from '../../src/coupons.js';
import { childrenByPlace } from '../../src/children.js';

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

// 50000 → '5만원', 17600 → '17,600원'. 청크를 짧게 유지하려고 딱 떨어지는 만원 단위만 줄인다.
function won(value) {
  if (value >= 10000 && value % 10000 === 0) return `${value / 10000}만원`;
  return `${value.toLocaleString('ko-KR')}원`;
}

// 금액은 화면(쿠폰 구매)과 같이 액면가로 적는다. 수수료는 금액이 아니라 비율로만 따로 적는다.
function itemText(item) {
  if (item.label) return `${item.label} ${won(item.price)}`;
  if (item.price != null) return `${won(item.face)}권(${won(item.price)})`;
  return won(item.face);
}

function feeText(product) {
  if (!product.fee) return '없음';
  const percent = +(product.fee * 100).toFixed(1);
  return product.feeWaived ? `없음 (원래 ${percent}%지만 지금은 컬쳐랜드가 지원해 구매자는 내지 않음)` : `${percent}% 별도`;
}

// 쿠폰 상품 1개 → 청크에 붙일 줄들. prefix는 세부 권종 이름(신세계 키오스크형 등).
export function buildCouponLines(product, prefix = '') {
  const head = prefix ? `쿠폰 [${prefix}]` : '쿠폰';
  if (product.soldOut) return [`${head}: 현재 품절`];
  const limits = [
    product.dailyLimit && `일 ${won(product.dailyLimit)}`,
    product.monthlyLimit && `월 ${won(product.monthlyLimit)}`,
    product.maxQty && `1회 최대 ${product.maxQty}장`,
  ].filter(Boolean);
  const parts = [
    `권종 ${product.items.map(itemText).join('·')}`,
    `수수료 ${feeText(product)}`,
    product.discountLabel,
    product.cashback && `캐쉬백 ${product.cashback * 100}%`,
    limits.length && `한도 ${limits.join(', ')}`,
    product.validity && `유효기간 ${product.validity}`,
  ].filter(Boolean);
  return [`${head}: ${parts.join(' / ')}`];
}

// 사용처 id의 쿠폰 줄. 세부 권종이 있는 부모(신세계·롯데·SKT)는 권종별로 한 줄씩.
export function couponLinesFor(placeId) {
  const children = childrenByPlace[placeId];
  if (children) {
    return children.flatMap((child) => {
      const product = couponProducts[`${placeId}/${child.id}`];
      return product ? buildCouponLines(product, child.name) : [];
    });
  }
  const product = couponProducts[placeId];
  return product ? buildCouponLines(product) : [];
}

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
  lines.push(...couponLinesFor(place.id));
  lines.push(`출처: ${place.sourceUrl}`);
  return lines.join('\n');
}
