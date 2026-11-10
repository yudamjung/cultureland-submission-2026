import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { places, taskLabels } from '../data';
import { useGoBack } from '../hooks/useNav';
import { URLS } from '../lib/constants';
import { formatDate } from '../lib/utils';

// /place/:id/noinfo 는 세부 정보를 못 찾은 사용처, /noinfo 는 검색어 자체가 없는 경우.
export default function NoInfoPage() {
  const { id } = useParams();
  const place = id ? places.find((p) => p.id === id) : null;
  const goBack = useGoBack('/');
  const suggestions = places.filter((p) => p.verified && p.id !== place?.id).slice(0, 3);
  return <><Header title="검색 결과" back onBack={goBack} /><div className="noinfo-body">
    {place ? <><div className={`noinfo-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></div><h1>{place.name}</h1><p className="noinfo-sub">{taskLabels[place.type]} · 세부 조건 확인 필요</p><div className="noinfo-card"><h2>사용 방법을 확인하지 못했어요</h2><p>{place.summary}</p><small>확인일 {formatDate(place.checkedAt)}</small></div></>
      : <><h1>검색 결과가 없어요</h1><div className="noinfo-card"><h2>찾으시는 곳은 공식 사용처 목록에서 찾지 못했어요</h2><p>이름을 다르게 입력했거나 아직 제휴하지 않은 곳일 수 있어요.</p></div><h2 className="suggest-title">비슷한 사용처</h2><div className="suggestions">{suggestions.map((p) => <span key={p.id}>{p.name}</span>)}</div></>}
    <a className="primary-button" href={place?.sourceUrl || URLS.official} target="_blank" rel="noreferrer">원문 안내 보기</a><a className="secondary-button contact" href="tel:15772111">고객센터 1577-2111</a><p className="center-hours">고객센터: 평일 08:00~17:00</p>
  </div></>;
}
