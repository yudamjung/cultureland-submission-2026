import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getCoupon } from '../coupons';
import { hasPayChoice, payOptions } from '../lib/methods';
import { infoPath } from '../lib/paths';

// 사용처 열기: 세부 권종이 있으면 권종 목록, 결제 방식이 여러 개면 결제 방법 선택,
// 세부 정보가 없는(listed) 곳은 noinfo, 나머지(쿠폰으로 사는 곳 포함)는 사용 순서로 바로 간다.
// 금액권 구매 화면은 사용 순서의 쿠폰 구매 단계에서 이어진다.
// via: 온라인/오프라인 사용처 목록에서 열었으면 'online' | 'store'. 그 목록에 맞는 방식이 하나뿐이면
// 방식 선택 없이 그 순서로 바로 가고, 메인·검색·AI처럼 경로를 모르면 방식을 고르게 한다.
export function useOpenPlace() {
  const navigate = useNavigate();
  const { setHolding } = useApp();
  return (place, inferredHolding = null, via = null) => {
    if (inferredHolding) setHolding(inferredHolding);
    const base = `/place/${place.id}`;
    const options = hasPayChoice(place) ? payOptions(place, via) : [];
    navigate(
      place.children?.length ? `${base}/types`
        : options.length === 1 ? `${infoPath(place)}?pay=${options[0]}`
        : options.length > 1 ? `${base}/methods${via ? `?via=${via}` : ''}`
        : getCoupon(place) ? infoPath(place)
        : place.status === 'listed' ? `${base}/noinfo`
        : infoPath(place),
    );
  };
}

// 뒤로 가기: 앱 안에서 이동해 온 경우엔 브라우저 히스토리, 주소로 바로 들어왔으면 fallback.
export function useGoBack(fallback = '/') {
  const navigate = useNavigate();
  const { key } = useLocation();
  return () => (key !== 'default' ? navigate(-1) : navigate(fallback, { replace: true }));
}
