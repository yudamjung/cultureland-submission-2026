// 질문에서 사용자가 가진 수단을 추정하고, 화면의 사용 순서와 같은 규칙(src/data.js getRemaining)으로
// 남은 단계를 계산한다. 단계 계산을 AI에 맡기면 "16자리면 충전 없이 바로 결제" 같은 실수를 해서
// 코드에서 정해 프롬프트에 넣는다.
import { places, getRemaining, holdings, baseSteps, doneByHolding } from '../../src/data.js';
import { couponProducts } from '../../src/coupons.js';

// 순서가 중요하다: 컬쳐캐쉬 → 16자리 → 12자리/카톡 선물 순으로 더 진행된 상태부터 본다.
const RULES = [
  ['cash', /컬쳐캐[쉬시].*(충전|있|남)|충전(해|된|돼|했)/],
  // '지류'는 넣지 않는다: "롯데상품권 지류 50만원" 같은 질문에서 사려는 상품 이름이지 가진 수단이 아니다.
  ['barcode', /16\s*자리|상품권\s*바코드|종이\s*상품권|교환(했|해\s*뒀|해놨|완료)/],
  ['voucher', /12\s*자리|카톡|카카오|선물(받|로|하기)|모바일\s*(금액권|상품권|교환권)|기프티콘/],
];

export function detectHolding(question) {
  const text = question.replace(/\s+/g, ' ');
  for (const [holding, pattern] of RULES) if (pattern.test(text)) return holding;
  return null;
}

const STEP_GLOSS = {
  교환: '교환(12자리 번호를 컬쳐랜드 교환소에서 16자리 상품권으로 교환)',
  충전: '충전(16자리 상품권을 컬쳐캐쉬로 충전)',
  '결제창 선택': '사용처 결제창에서 컬쳐랜드(컬쳐캐쉬) 선택',
  '포인트로 전환': '컬쳐캐쉬를 그 포인트로 전환',
  '쿠폰 구매': '컬쳐랜드에서(사용처가 아니라) 그 사용처 쿠폰을 금액별로 구매한 뒤 사용처에 등록',
  '바코드 보여 주기': '매장에서 16자리 상품권 바코드 보여 주기',
  '앱 바코드 열기': '컬쳐랜드 앱에서 결제 바코드 열기',
  '매장에서 보여 주기': '매장에서 앱 바코드 보여 주기',
  '편의점 바코드 열기': "컬쳐랜드 공식 페이지에서 '편의점 바코드 결제'를 눌러 결제용 바코드 준비 (편의점은 상품권 바코드를 받지 않음)",
};

// 질문에서 원하는 결제 방식을 추정한다. 바로 결제·쿠폰·매장 결제를 모두 지원하는 곳에서
// "로블록스 기프트카드 5만원권"(쿠폰), "교보문고 매장에서"(매장)처럼 묻는데 기본 순서로 답하지 않게.
const PAY_RULES = [
  ['coupon', /기프트\s*카드|쿠폰|\d+\s*만?\s*원\s*권|교환권/],
  ['store', /매장|오프라인|직접\s*가서/],
  ['online', /온라인|결제창|홈페이지|사이트|앱에서\s*결제/],
];

export function detectPay(question) {
  for (const [pay, pattern] of PAY_RULES) if (pattern.test(question)) return pay;
  return null;
}

// "5만원권 있어?"처럼 금액을 물으면 그 권종이 있는지 코드에서 확인한다(모델이 목록을 잘못 읽는 일이 있었다).
const won = (value) => (value % 10000 === 0 ? `${value / 10000}만원` : `${value.toLocaleString('ko-KR')}원`);
function askedAmount(question) {
  const match = question.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(만)?\s*원/);
  if (!match) return null;
  return Math.round(Number(match[1]) * (match[2] ? 10000 : 1));
}

function amountNote(question, place) {
  const amount = askedAmount(question);
  if (!amount) return null;
  const products = place.children?.length
    ? place.children.map((child) => [child.name, couponProducts[`${place.id}/${child.id}`]]).filter(([, product]) => product)
    : couponProducts[place.id] ? [[place.name, couponProducts[place.id]]] : [];
  if (!products.length) return null;
  const having = products.filter(([, product]) => product.items.some((item) => item.face === amount || item.price === amount));
  if (having.length) return `${won(amount)}권 있음 (${having.map(([name]) => name).join(', ')})`;
  return `${won(amount)}권 없음. 있는 권종: ${products.map(([name, product]) => `${name} ${product.items.map((item) => item.label || won(item.face)).join('·')}`).join(' / ')}`;
}

// 프롬프트에 넣을 안내 블록. 가진 수단을 모르면 모바일 금액권(가장 처음 상태) 기준으로 계산한다.
export function buildStepHint(question, placeId) {
  const place = places.find((item) => item.id === placeId);
  if (!place) return '';
  // 세부 권종이 있는 부모(신세계·롯데·SKT)는 권종을 컬쳐랜드에서 쿠폰으로 사는 순서다.
  const parentWithCoupons = place.children?.some((child) => couponProducts[`${place.id}/${child.id}`]);
  if (place.children?.length && !parentWithCoupons) return '';
  const detected = detectHolding(question);
  const holding = detected || 'voucher';
  // 편의점은 상품권 바코드를 받지 않는다. 화면(ResultPage의 편의점 카드)과 같이
  // 컬쳐캐쉬 충전 후 컬쳐랜드 '편의점 바코드 결제'로 만든 바코드를 써야 한다.
  const isConvenience = place.groups?.includes('생활 편의');
  const notDone = (steps) => steps.filter((step) => !(doneByHolding[holding] || []).includes(step));
  const coupon = couponProducts[place.id];
  const wanted = detectPay(question);
  const notes = [];
  let steps;
  if (isConvenience) {
    steps = [...(holding === 'voucher' ? ['교환'] : []), ...(holding === 'cash' ? [] : ['충전']), '편의점 바코드 열기', '매장에서 보여 주기'];
  } else if (parentWithCoupons) {
    steps = notDone(baseSteps.coupon);
  } else if (wanted === 'coupon' && coupon && place.type === 'direct') {
    // 바로 결제와 쿠폰을 모두 지원하는 곳(로블록스·넥슨·한게임·CGV)에서 쿠폰을 물었다.
    if (coupon.soldOut) {
      notes.push(`${place.name} 쿠폰은 지금 모든 권종이 품절이라 살 수 없음. 대신 결제창에서 컬쳐캐쉬로 바로 결제할 수 있음`);
      steps = getRemaining(place, holding, 'online');
    } else {
      steps = notDone(baseSteps.coupon);
    }
  } else if (wanted === 'store' && place.type === 'direct' && place.offline !== 'yes') {
    notes.push(`${place.name}는 오프라인 매장 결제가 확인되지 않음(컬쳐랜드로는 온라인 결제만 확인됨)`);
    steps = getRemaining(place, holding, 'online');
  } else {
    const pay = place.type === 'direct' && place.offline === 'yes' && (wanted === 'store' || wanted === 'online') ? wanted : undefined;
    steps = getRemaining(place, holding, pay);
  }
  const amount = amountNote(question, place);
  if (amount) notes.unshift(amount);
  const remaining = steps.map((step) => STEP_GLOSS[step] || step);
  if (!remaining.length) return '';
  return [
    detected
      ? `[가진 수단] ${holdings[holding].name}`
      : `[가진 수단] 질문에 없음. 아래 단계는 ${holdings.voucher.name}(12자리)일 때 기준이니 '${holdings.voucher.name}을 가지고 계시다면'처럼 조건으로 말할 것`,
    `[${place.name}까지 남은 단계] ${remaining.map((step, index) => `${index + 1}) ${step}`).join(' → ')}`,
    ...notes.map((note) => `[참고] ${note}`),
  ].join('\n');
}
