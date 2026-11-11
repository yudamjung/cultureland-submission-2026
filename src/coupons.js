// 쿠폰(상품권) 구매 상품. 값은 docs/coupon-products.md 에서 옮겼다.
// 키: 사용처 id, 또는 세부 권종이 있으면 'id/typeId'.
//  fee        구매 수수료율(0.06 = 6%). 문서에 수수료 언급이 없으면 수수료 없음(0).
//  feeWaived  수수료가 발생하지만 지금은 지원돼 구매자 부담이 0원인 경우(한게임).
//  cashback   구매 금액 대비 캐쉬백 비율(T데이터쿠폰 20%).
//  items      금액권. face(액면가)로 가격을 계산하거나, 판매가(price)가 정해진 경우 price를 쓴다.
//  maxQty     한 번에 고를 수 있는 최대 수량(확인된 곳만). 없으면 DEFAULT_MAX_QTY.
//  dailyLimit 일 구매 한도(원). 넘으면 구매가 안 될 수 있다고 알려 준다.
export const DEFAULT_MAX_QTY = 10;

const faces = (...values) => values.map((face) => ({ face }));
const CJ = { fee: 0, dailyLimit: 200000, monthlyLimit: 1000000, validity: '구매일로부터 1년', items: faces(10000, 20000, 30000, 50000) };

export const couponProducts = {
  olive: { fee: 0.01, dailyLimit: 200000, monthlyLimit: 1000000, validity: '구매일로부터 1년', items: faces(10000, 20000, 30000, 50000) },
  nexon: { fee: 0, dailyLimit: 200000, soldOut: true, items: [] },
  tiktok: { fee: 0.03, dailyLimit: 100000, validity: '60개월 이내', items: faces(10000, 25000, 50000, 100000) },
  'shinsegae/kiosk': { fee: 0.06, validity: '지류 교환 발행일로부터 5년', items: faces(10000, 30000, 50000, 100000, 500000) },
  'shinsegae/paper': { fee: 0.06, maxQty: 100, items: faces(500000) },
  'shinsegae/emarticon': { fee: 0.06, monthlyLimit: 500000, validity: '구매일로부터 367일', items: faces(10000, 30000, 50000) },
  'lotte/mobile': { fee: 0.055, validity: '지류 교환 발행일로부터 5년', items: faces(100000) },
  'lotte/paper': { fee: 0.055, maxQty: 100, validity: '발행일로부터 5년', items: faces(500000) },
  soop: { fee: 0.02, maxQty: 20, validity: '구매 5년 + 충전 5년', items: faces(11000, 33000, 55000, 110000) },
  webtoon: { fee: 0.03, validity: '구매일로부터 5년 (연장 불가)', items: faces(5000, 10000, 30000) },
  hangame: { fee: 0.03, feeWaived: true, validity: '1년 (최대 5년 연장)', items: faces(10000, 20000, 30000, 40000, 50000) },
  cjgift: CJ,
  cgv: CJ,
  cjmarket: CJ,
  cjfood: { ...CJ, validity: '구매일로부터 5년' },
  smilegift: { fee: 0.04, validity: '367일', items: faces(10000, 20000, 30000, 50000) },
  ikea: { fee: 0.03, validity: '없음', items: faces(10000, 50000, 100000) },
  roblox: { fee: 0.03, dailyLimit: 2000000, validity: '없음', items: faces(8000, 10000, 30000, 50000, 100000, 200000) },
  psstore: {
    fee: 0, dailyLimit: 2000000, validity: '구매일로부터 5년', discountLabel: '3% 할인가',
    items: [
      { label: '스탠다드 에디션', price: 87106 }, { label: '얼티밋 에디션', price: 109416 },
      { face: 3000, price: 2910 }, { face: 5000, price: 4850 }, { face: 10000, price: 9700 }, { face: 30000, price: 29100 },
      { face: 50000, price: 48500 }, { face: 100000, price: 97000 }, { face: 200000, price: 194000 },
    ],
  },
  starbucks: { fee: 0.04, validity: '367일', items: faces(20000, 30000, 50000) },
  ediya: { fee: 0, dailyLimit: 500000, validity: '1년', items: faces(5000, 10000, 20000, 30000) },
  'tdata/data': {
    fee: 0, cashback: 0.2, monthlyLimit: 500000, validity: '등록 2년 · 사용 등록일부터 1년',
    items: [{ label: '100MB', price: 2000 }, { label: '500MB', price: 10000 }, { label: '1GB', price: 15000 }, { label: '2GB', price: 19000 }, { label: '5GB', price: 33000 }],
  },
  'tdata/roaming': {
    fee: 0, monthlyLimit: 500000, validity: '등록 2년 · 사용 등록일부터 180일',
    items: [
      { label: 'OnePass 500 카드', price: 9000 }, { label: 'OnePass Data VIP 카드', price: 17600 }, { label: 'OnePass VIP 카드', price: 19000 },
      { label: 'baro 3GB 카드', price: 29000 }, { label: 'baro 6GB 카드', price: 39000 }, { label: 'baro 12GB 카드', price: 59000 }, { label: 'baro 24GB 카드', price: 79000 },
    ],
  },
  'tdata/direct': { fee: 0, dailyLimit: 500000, validity: '발행일부터 2년 이내', items: faces(50000, 100000, 200000) },
  yogurt: { fee: 0, dailyLimit: 500000, validity: '367일', items: faces(10000, 30000, 50000) },
  jaws: { fee: 0, dailyLimit: 500000, validity: '1년', items: faces(10000, 20000, 30000) },
  theborn: { fee: 0, dailyLimit: 500000, validity: '구매일로부터 366일', items: faces(10000, 30000) },
  hongroo: { fee: 0, dailyLimit: 500000, validity: '367일', items: faces(5000, 10000, 20000, 30000) },
  kgc: { fee: 0, dailyLimit: 200000, validity: '5년', items: faces(30000, 50000, 100000) },
};

// 바로 결제(컬쳐캐쉬)와 쿠폰 구매를 둘 다 지원하는 곳. 이런 곳은 결제 방법을 먼저 고른다.
export const DUAL_METHOD_IDS = new Set(['cgv', 'roblox', 'nexon', 'hangame']);

export const couponKey = (place) => (place.typeId ? `${place.id}/${place.typeId}` : place.id);
export const getCoupon = (place) => (place.children?.length ? undefined : couponProducts[couponKey(place)]);
export const hasMethodChoice = (place) => DUAL_METHOD_IDS.has(place.id) && !!couponProducts[place.id];

// 금액권 하나의 가격. 판매가가 정해진 상품은 그대로, 아니면 액면가에 수수료를 더한다.
export function itemPricing(product, item) {
  if (item.price != null) return { price: item.price, fee: 0 };
  const fee = product.feeWaived ? 0 : Math.round(item.face * product.fee);
  return { price: item.face + fee, fee };
}
export const itemTitle = (item) => item.label || `${item.face.toLocaleString('ko-KR')}원권`;

// 화면에 보여 줄 금액. 수수료를 더하지 않은 금액(액면가)이고, 판매가가 정해진 상품(PS Store·T 쿠폰)은 그 판매가다.
export const itemAmount = (item) => item.price ?? item.face;
// 구매 금액에 수수료가 붙는 상품인가(지원 중인 한게임은 아님).
export const chargesFee = (product) => product.fee > 0 && !product.feeWaived;
export const feePercent = (product) => +(product.fee * 100).toFixed(1);
