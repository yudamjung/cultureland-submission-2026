import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getRemaining, getSteps, holdings, isReady, places, taskLabels } from '../data';
import { useApp } from '../context/AppContext';
import { useGoBack } from '../hooks/useNav';
import { formatDate } from '../lib/utils';

export default function ResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack('/');
  const { holding: savedHolding, openSheet } = useApp();
  const place = places.find((p) => p.id === id);
  const needsSheet = !!place && place.status !== 'listed' && !savedHolding;
  // 가진 수단을 아직 안 골랐으면 결과 화면에 들어오자마자 바텀시트를 띄운다.
  useEffect(() => { if (needsSheet) openSheet('voucher'); }, [needsSheet, openSheet]);

  if (!place) return <Navigate to="/" replace />;
  if (place.status === 'listed') return <Navigate to={`/place/${place.id}/noinfo`} replace />;

  const holding = savedHolding || 'voucher';
  const steps = getSteps(place, holding);
  const remaining = getRemaining(place, holding);
  const ready = isReady(place, holding);
  return <>
    <Header title="사용 안내" back onBack={goBack} />
    <div className="result-body">
      <div className="holding-line"><span>{holdings[holding].heading}</span><button onClick={() => openSheet(holding)}>바꾸기</button></div>
      <div className="merchant-head"><div className={`merchant-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></div><span className="subcat">{place.cat}</span><h1>{place.name}</h1><p>{taskLabels[place.type]}</p></div>
      <div className="result-card">
        <h2><span className={`dot ${ready ? 'mint' : place.status === 'partial' ? 'navy' : ''}`} />{ready ? '현재 수단으로 이용할 수 있어요' : place.status === 'partial' ? '기본 사용 경로를 확인했어요' : '사용하려면 준비가 필요해요'}</h2>
        <p>{place.summary}</p>
        {place.variants && <p className="result-tip">선택 경로: {place.variants}</p>}
        {place.subItems && <p className="result-tip">포함 상품: {place.subItems.join(' · ')}</p>}
        <div className="step-chips">{steps.map((step, index) => { const done = !remaining.includes(step); const current = remaining[0] === step; return <React.Fragment key={step}>{index > 0 && <span className="chip-arrow">›</span>}<span className={`step-chip ${done ? 'done' : current ? 'current' : ''}`}>{done ? '✓' : `${index + 1}`} {step}</span></React.Fragment>; })}</div>
      </div>
      {place.guideImage && <a className="secondary-button guide-image-link" href={place.guideImage} target="_blank" rel="noreferrer">공식 이미지 가이드 크게 보기 ↗</a>}
      {place.offline === 'yes' && place.type === 'direct' && <p className="cgv-note">오프라인 매장에서는 상품권 바코드 또는 컬쳐랜드 앱 바코드 결제 경로도 있어요. 일부 매장은 제외될 수 있습니다.</p>}
      {place.status === 'partial' && <p className="cgv-note">세부 수수료·한도·사용 가능 범위는 확인되지 않았을 수 있어요. 실제 이용 전에 연결된 안내를 확인하세요.</p>}
      {place.type === 'coupon' && <p className="cgv-note">컬쳐랜드 판매권의 유효기간·환불·제외 매장 등 개별 조건은 로그인 전 확인되지 않았어요.</p>}
      {(place.fee || place.limit) && <p className="cgv-note">{[place.fee, place.limit].filter(Boolean).join(' · ')}</p>}
      <p className="source">출처: <a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.source}</a> · 확인일 {formatDate(place.checkedAt)}</p>
    </div>
    <div className="bottom-bar"><button className="primary-button" onClick={() => navigate(`/place/${place.id}/guide`)}>{place.name} 사용 순서 보기</button></div>
  </>;
}
