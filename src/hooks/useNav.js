import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// 사용처 열기: 세부 정보가 없는(listed) 곳은 noinfo, 나머지는 결과 화면으로 간다.
export function useOpenPlace() {
  const navigate = useNavigate();
  const { setHolding } = useApp();
  return (place, inferredHolding = null) => {
    if (inferredHolding) setHolding(inferredHolding);
    navigate(place.status === 'listed' ? `/place/${place.id}/noinfo` : `/place/${place.id}`);
  };
}

// 뒤로 가기: 앱 안에서 이동해 온 경우엔 브라우저 히스토리, 주소로 바로 들어왔으면 fallback.
export function useGoBack(fallback = '/') {
  const navigate = useNavigate();
  const { key } = useLocation();
  return () => (key !== 'default' ? navigate(-1) : navigate(fallback, { replace: true }));
}
