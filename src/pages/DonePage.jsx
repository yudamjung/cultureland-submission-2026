import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { recommend } from '../api/client';
import { findPlace, places } from '../data';
import { ASSET } from '../lib/constants';

const COUNT = 3;
const USAGE_URL = 'https://m.cultureland.co.kr/vchr/voucherUsageGiftM.do';
const CASH_URL = 'https://m.cultureland.co.kr/index.do';

// AI 추천을 못 받았을 때(키·벡터 없음, 네트워크 오류) 같은 카테고리에서 사용법이 확인된 곳으로 채운다.
function fallbackIds(place) {
  return places
    .filter((p) => p.id !== place.id && p.cat === place.cat && p.status !== 'listed')
    .slice(0, COUNT)
    .map((p) => p.id);
}

// 사용 순서의 마지막 단계에서 넘어오는 사용 완료 화면.
export default function DonePage() {
  const { id, typeId } = useParams();
  const navigate = useNavigate();
  const place = findPlace(id, typeId);
  // 세부 권종(신세계 e마티콘 등)은 부모 사용처 기준으로 추천한다.
  const baseId = place?.parent?.id || place?.id;
  const [ids, setIds] = useState(null);

  useEffect(() => {
    if (!baseId) return undefined;
    let alive = true;
    recommend(baseId).then((result) => {
      if (!alive) return;
      const known = result.filter((rid) => places.some((p) => p.id === rid));
      setIds(known.length ? known.slice(0, COUNT) : fallbackIds(places.find((p) => p.id === baseId)));
    });
    return () => { alive = false; };
  }, [baseId]);

  if (!place) return <Navigate to="/" replace />;
  const picks = (ids || []).map((rid) => places.find((p) => p.id === rid)).filter(Boolean);

  return <div className="done-body">
    <button className="done-close" onClick={() => navigate('/')} aria-label="메인으로 가기"><img src={`${ASSET}figma-done-close.svg`} width="16" height="16" alt="" /></button>
    <img className="done-character" src={`${ASSET}figma-done-character.png`} alt="" />
    <h1>{place.name}에서 사용 완료했어요!</h1>
    <p className="done-sub">상품권 사용 조회 및 사용 후 캐쉬 조회는<br />컬쳐랜드 모바일 웹 · 앱에서 가능해요.</p>
    <a className="done-link" href={USAGE_URL} target="_blank" rel="noopener noreferrer">상품권 사용 조회</a>
    <a className="done-link" href={CASH_URL} target="_blank" rel="noopener noreferrer">컬쳐캐쉬 바로 가기</a>
    <section className="done-recommend" aria-labelledby="done-recommend-title" aria-busy={!ids}>
      <h2 id="done-recommend-title">다음에는 이 곳에서 사용해보세요!</h2>
      <p>AI가 비슷한 사용처 {COUNT}곳을 추천해드려요</p>
      <ul>{ids
        ? picks.map((p) => <li key={p.id}><span className={`done-logo ${p.logoOnDark ? 'logo-on-dark' : ''}`}><img src={p.logo} alt="" /></span><strong>{p.name}</strong></li>)
        : Array.from({ length: COUNT }, (_, index) => <li key={index} className="loading" aria-hidden="true"><span className="done-logo" /><strong /></li>)}
      </ul>
    </section>
  </div>;
}
