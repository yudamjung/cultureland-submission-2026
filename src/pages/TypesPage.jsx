import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { places, findPlace } from '../data';
import { infoPath } from '../lib/paths';
import { useGoBack } from '../hooks/useNav';

// 부모 브랜드(이마트,신세계상품권 등)를 고르면 그 아래 상품권 종류를 보여 준다.
export default function TypesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const place = places.find((p) => p.id === id);
  if (!place) return <Navigate to="/" replace />;
  if (!place.children?.length) return <Navigate to={`/place/${place.id}`} replace />;

  return <>
    <Header title="상품권 종류" back onBack={goBack} />
    <div className="types-body">
      <section className="types-hero">
        <div className={`merchant-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></div>
        <h1>{place.name}</h1>
        <p>상품권 {place.children.length}종 · 가지고 계신 종류를 골라 주세요</p>
      </section>
      <ul className="types-list">
        {place.children.map((child) => <li key={child.id}>
          <button className="type-card" onClick={() => navigate(infoPath(findPlace(place.id, child.id)))}>
            <span className={`type-mark ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={child.logo || place.logo} alt="" /></span>
            <span className="type-copy">
              <span className="task-badge">{child.tag}</span>
              <strong>{child.name}</strong>
              <small>{child.summary}</small>
            </span>
            <span className="type-arrow" aria-hidden="true">›</span>
          </button>
        </li>)}
      </ul>
    </div>
  </>;
}
