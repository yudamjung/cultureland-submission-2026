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
