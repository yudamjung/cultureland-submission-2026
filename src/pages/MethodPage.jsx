import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { couponProducts, hasMethodChoice } from '../coupons';
import { places } from '../data';
import { useGoBack } from '../hooks/useNav';

// 컬쳐캐쉬로 바로 결제할 수도 있고 쿠폰(상품권)으로 살 수도 있는 곳은 결제 방법을 먼저 고른다.
export default function MethodPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const place = places.find((p) => p.id === id);
  if (!place) return <Navigate to="/" replace />;
  if (!hasMethodChoice(place)) return <Navigate to={`/place/${place.id}`} replace />;
  const coupon = couponProducts[place.id];
  const couponNote = coupon.soldOut ? '지금은 모든 권종이 품절이에요.' : '금액권을 사서 등록해 써요.';

  return <>
    <Header title="결제 방법" back onBack={goBack} />
    <div className="types-body">
      <section className="types-hero">
        <div className={`merchant-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></div>
        <h1>{place.name}</h1>
        <p>어떤 방법으로 결제하실 건가요?</p>
      </section>
      <ul className="types-list">
        <li>
          <button className="type-card" onClick={() => navigate(`/place/${place.id}`)}>
            <span className="type-copy">
              <span className="task-badge">바로 결제</span>
              <strong>컬쳐캐쉬로 바로 결제</strong>
              <small>컬쳐캐쉬를 충전해 결제창에서 바로 써요.</small>
            </span>
            <span className="type-arrow" aria-hidden="true">›</span>
          </button>
        </li>
        <li>
          <button className="type-card" onClick={() => navigate(`/place/${place.id}/coupon`)}>
            <span className="type-copy">
              <span className="task-badge">쿠폰</span>
              <strong>쿠폰(상품권)으로 구매</strong>
              <small>{couponNote}</small>
            </span>
            <span className="type-arrow" aria-hidden="true">›</span>
          </button>
        </li>
      </ul>
    </div>
  </>;
}
