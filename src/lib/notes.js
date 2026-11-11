// 사용 순서에 들어가기 전에 꼭 알려야 하는 안내. 사용 순서 페이지에서 모달로 보여 준다.
export function getNotes(place) {
  return [
    place.offline === 'yes' && place.type === 'direct' && '오프라인 매장에서는 상품권 바코드 또는 컬쳐랜드 앱 바코드 결제 경로도 있어요. 일부 매장은 제외될 수 있습니다.',
    place.status === 'partial' && '세부 수수료·한도·사용 가능 범위는 확인되지 않았을 수 있어요. 실제 이용 전에 연결된 안내를 확인하세요.',
    place.type === 'coupon' && '컬쳐랜드 판매권의 유효기간·환불·제외 매장 등 개별 조건은 로그인 전 확인되지 않았어요.',
    (place.fee || place.limit) && [place.fee, place.limit].filter(Boolean).join(' · '),
  ].filter(Boolean);
}
