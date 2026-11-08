import { catalog, offlineIds } from './catalog.js';
export const categories = ['전체', '쇼핑', '게임', '콘텐츠', '문화생활', '외식', '금융'];
export const holdings = {
  voucher: { name: '컬쳐랜드 모바일 금액권', detail: '12자리 번호', heading: '컬쳐랜드 모바일 금액권 기준', start: 1 },
  barcode: { name: '컬쳐랜드 상품권 바코드', detail: '16자리 번호', heading: '컬쳐랜드 상품권 바코드 (교환 완료) 기준', start: 2 },
  cash: { name: '컬쳐랜드 컬쳐캐쉬', detail: '앱에 사용 가능 금액이 있음', heading: '컬쳐캐쉬 (충전 완료) 기준', start: 4 },
};
export const baseSteps = {
  direct: ['교환', '충전', '결제창 선택'],
  convert: ['교환', '충전', '포인트로 전환'],
  coupon: ['교환', '충전', '쿠폰 구매', '쿠폰 등록'],
  store: ['교환', '바코드 보여 주기'],
};
export const doneByHolding = {
  voucher: [], barcode: ['교환'], cash: ['교환', '충전'],
};
export const taskLabels = {
  direct: '결제창에서 선택', convert: '포인트로 바꿔 쓰기', coupon: '쿠폰 사서 쓰기', store: '바코드 보여 주기',
};

export const places = catalog.map((place) => ({
  online: place.type === 'store' ? 'unknown' : 'yes',
  verified: place.status === 'confirmed',
  source: place.type === 'store' ? '사용자 제공 오프라인 목록·컬쳐랜드 일반 사용법' : place.sourceUrl.includes('cultureland.co.kr') ? '컬쳐랜드 공식 안내' : '제휴사 안내·조사 자료',
  ...place,
  offline: offlineIds.includes(place.id) ? 'yes' : 'unknown',
}));

export function getSteps(place, holding) {
  if (place.type === 'direct' && place.offline === 'yes' && holding !== 'cash') return baseSteps.store;
  if (place.type === 'store' && holding === 'cash') return ['앱 바코드 열기', '매장에서 보여 주기'];
  return place.extraSteps || baseSteps[place.type];
}
export function getRemaining(place, holding) {
  const done = doneByHolding[holding] || [];
  return getSteps(place, holding).filter((step) => !done.includes(step));
}
export function isReady(place, holding) {
  if (place.type === 'store' && place.offline === 'yes' && (holding === 'barcode' || holding === 'cash')) return true;
  if (place.type === 'direct' && place.offline === 'yes' && holding === 'barcode') return true;
  return place.verified && holding === 'cash' && place.type === 'direct' && place.online === 'yes';
}
export function searchPlaces(query) {
  const q = query.trim().toLowerCase().replace(/\s/g, '');
  if (!q) return [];
  const aliases = { yes24: ['yes24', '예스24', '예스이십사'], cgv: ['cgv', '씨지브이'], roblox: ['roblox', '로블록스'] };
  return places.filter((p) => [p.name, ...(aliases[p.id] || [])].some((term) => q.includes(term.toLowerCase().replace(/\s/g, ''))));
}
export function parseHolding(query) {
  if (/16자리|바코드/.test(query)) return 'barcode';
  if (/컬쳐캐쉬|컬처캐쉬|캐쉬|잔액/.test(query)) return 'cash';
  if (/12자리|선물|카톡|금액권/.test(query)) return 'voucher';
  return null;
}
