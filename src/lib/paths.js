// 사용처(또는 부모 아래 세부 권종)의 결과 화면 주소.
export const placePath = (place) => `/place/${place.parent?.id || place.id}${place.typeId ? `/types/${place.typeId}` : ''}`;
// 금액권(쿠폰) 구매 화면 주소.
export const couponPath = (place) => `${placePath(place)}/coupon`;
