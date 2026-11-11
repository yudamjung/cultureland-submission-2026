import { hasMethodChoice } from '../coupons.js';

// 사용처 타일의 알약에 보여 줄 사용 방법들. 방법이 둘 이상이면 모두 보여 준다.
// 이름은 결제 방법 선택 화면의 배지(바로 결제·쿠폰)와 맞춘다.
const BASE = { direct: '바로 결제', convert: '포인트 전환', coupon: '쿠폰', store: '바코드' };

export function placeMethods(place) {
  const methods = [BASE[place.type]];
  if (hasMethodChoice(place)) methods.push('쿠폰');
  if (place.type === 'direct' && place.offline === 'yes') methods.push('바코드');
  return [...new Set(methods.filter(Boolean))];
}

// 결제 방식 선택. 한 사용처가 지원하는 방식이 둘 이상이면 방식 선택 화면을 거친다.
//  online  결제창에서 컬쳐캐쉬로 바로 결제
//  coupon  컬쳐랜드에서 쿠폰(상품권)을 사서 등록
//  store   매장에서 바코드 결제
export const PAY_OPTIONS = {
  online: { badge: '바로 결제', title: '온라인에서 바로 결제', note: '컬쳐캐쉬를 충전해 결제창에서 바로 써요.' },
  coupon: { badge: '쿠폰', title: '쿠폰(상품권)으로 구매', note: '금액권을 사서 등록해 써요.' },
  store: { badge: '바코드', title: '매장에서 바코드 결제', note: '매장 직원에게 바코드를 보여 주고 결제해요.' },
};

// via: 어디서 들어왔는지('online' | 'store'). 온라인 목록에서 왔으면 매장 결제를, 오프라인 목록에서 왔으면
// 온라인 방식(바로 결제·쿠폰)을 빼서, 남은 방식이 하나면 선택 없이 바로 그 순서로 간다.
export function payOptions(place, via) {
  if (place.children?.length) return [];
  const options = [];
  if (place.type === 'direct') options.push('online');
  if (hasMethodChoice(place)) options.push('coupon');
  if (place.type === 'direct' && place.offline === 'yes') options.push('store');
  if (via === 'online') return options.filter((id) => id !== 'store');
  if (via === 'store') return options.filter((id) => id === 'store');
  return options;
}

export const hasPayChoice = (place) => payOptions(place).length > 1;
