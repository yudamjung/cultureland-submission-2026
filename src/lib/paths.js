// 사용처(또는 부모 아래 세부 권종)의 결과 화면 주소.
export const placePath = (place) => `/place/${place.parent?.id || place.id}${place.typeId ? `/types/${place.typeId}` : ''}`;
// 방법이 하나뿐이라 결과 화면이 사용 순서와 겹치는 곳은 결과 화면을 건너뛰고 사용 순서로 바로 간다.
// 공식 이미지 가이드가 안내의 전부인 곳은 사용 순서 화면이 없고 결과 화면에서 이미지로 이어진다.
export const infoPath = (place) => (place.guideImage ? placePath(place) : `${placePath(place)}/guide`);
// 금액권(쿠폰) 구매 화면 주소.
export const couponPath = (place) => `${placePath(place)}/coupon`;
