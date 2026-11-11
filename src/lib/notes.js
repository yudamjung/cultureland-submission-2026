// 사용 순서에 들어가기 전에 꼭 알려야 하는 안내. 사용 순서 페이지에서 모달로 보여 준다.
// method: 결제 방식을 고른 곳이면 'online' | 'coupon' | 'store'. 매장 결제를 고른 경우에만 매장 안내를 붙인다
// (온라인으로 고른 사람에게는 사용 순서 위의 방식 전환 버튼이 매장 결제가 있다는 걸 알려 준다).
export function getNotes(place, method) {
  return [
    place.offline === 'yes' && place.type === 'direct' && method === 'store' && '일부 매장은 바코드 결제가 제외될 수 있어요. 방문 전에 확인하세요.',
    place.status === 'partial' && '세부 수수료·한도·사용 가능 범위는 확인되지 않았을 수 있어요. 실제 이용 전에 연결된 안내를 확인하세요.',
    place.type === 'coupon' && '컬쳐랜드 판매권의 유효기간·환불·제외 매장 등 개별 조건은 로그인 전 확인되지 않았어요.',
    (place.fee || place.limit) && [place.fee, place.limit].filter(Boolean).join(' · '),
  ].filter(Boolean);
}
