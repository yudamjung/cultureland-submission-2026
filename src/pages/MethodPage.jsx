import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { couponProducts } from '../coupons';
import { places } from '../data';
import { useGoBack } from '../hooks/useNav';
import { hasPayChoice, PAY_OPTIONS, payOptions } from '../lib/methods';
import { infoPath } from '../lib/paths';

// 결제 방식이 여러 개인 곳(바로 결제·쿠폰·매장 바코드 중 둘 이상)은 방식을 먼저 고른다.
// ?via=online 으로 들어오면 온라인 목록에서 온 것이라 매장 결제는 빼고 보여 준다.
export default function MethodPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const place = places.find((p) => p.id === id);
  if (!place) return <Navigate to="/" replace />;
  if (!hasPayChoice(place)) return <Navigate to={infoPath(place)} replace />;
  const via = ['online', 'store'].includes(params.get('via')) ? params.get('via') : null;
  const options = payOptions(place, via);
  if (options.length === 1) return <Navigate to={`${infoPath(place)}?pay=${options[0]}`} replace />;
  const noteOf = (option) => (option === 'coupon' && couponProducts[place.id]?.soldOut ? '지금은 모든 권종이 품절이에요.' : PAY_OPTIONS[option].note);

  return <>
    <Header title="결제 방법" back onBack={goBack} />
    <div className="types-body">
      <section className="types-hero">
        <div className={`merchant-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></div>
        <h1>{place.name}</h1>
        <p>어떤 방법으로 결제하실 건가요?</p>
      </section>
      <ul className="types-list">{options.map((option) => <li key={option}>
        <button className="type-card" onClick={() => navigate(`${infoPath(place)}?pay=${option}`)}>
          <span className="type-copy">
            <span className="task-badge">{PAY_OPTIONS[option].badge}</span>
            <strong>{PAY_OPTIONS[option].title}</strong>
            <small>{noteOf(option)}</small>
          </span>
          <span className="type-arrow" aria-hidden="true">›</span>
        </button>
      </li>)}</ul>
    </div>
  </>;
}
