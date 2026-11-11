import React, { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getRemaining, getSteps, holdings, findPlace, taskLabels } from '../data';
import { useApp } from '../context/AppContext';
import { useGoBack } from '../hooks/useNav';
import { getCoupon } from '../coupons';
import { couponPath, placePath } from '../lib/paths';
import { formatDate } from '../lib/utils';
import { URLS } from '../lib/constants';

export default function ResultPage() {
  const { id, typeId } = useParams();
  const navigate = useNavigate();
  const goBack = useGoBack(typeId ? `/place/${id}/types` : '/');
  const { holding: savedHolding, openSheet } = useApp();
  const place = findPlace(id, typeId);
  const needsSheet = !!place && place.status !== 'listed' && !savedHolding;
  // 가진 수단을 아직 안 골랐으면 결과 화면에 들어오자마자 바텀시트를 띄운다.
  useEffect(() => { if (needsSheet) openSheet('voucher'); }, [needsSheet, openSheet]);

  if (!place) return <Navigate to={typeId ? `/place/${id}/types` : '/'} replace />;
  if (place.children?.length) return <Navigate to={`/place/${place.id}/types`} replace />;
  if (place.status === 'listed') return <Navigate to={`/place/${place.id}/noinfo`} replace />;

  const holding = savedHolding || 'voucher';
  const steps = getSteps(place, holding);
  const remaining = getRemaining(place, holding);
  const isConvenience = place.groups.includes('생활 편의');
  return <>
    <Header title="사용 안내" back onBack={goBack} />
    <div className="result-body">
      <div className="holding-line"><span>{holdings[holding].heading}</span><button onClick={() => openSheet(holding)}>바꾸기</button></div>
      <div className="merchant-head"><div className={`merchant-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></div><span className="subcat">{place.parent?.name || (isConvenience ? '생활 편의' : place.cat)}</span><h1>{place.name}</h1><p>{isConvenience && holding === 'cash' ? '편의점 바코드 결제' : taskLabels[place.type]}</p></div>
      {isConvenience ? <section className="convenience-action">
        <h2>편의점에서 바코드로 결제하려면</h2>
        <p>컬쳐랜드 공식 페이지에서 <strong>‘편의점 바코드 결제’</strong>를 눌러 바코드를 준비하세요.</p>
        <a href={URLS.barcodeBrands} target="_blank" rel="noopener noreferrer">컬쳐랜드 페이지 열기</a>
      </section> : <div className="result-card">
        <p>{place.summary}</p>
        {place.variants && <p className="result-tip">선택 경로: {place.variants}</p>}
        {place.subItems && <p className="result-tip">포함 상품: {place.subItems.join(' · ')}</p>}
        <div className="step-chips">{steps.map((step, index) => {
          const done = !remaining.includes(step);
          const current = remaining[0] === step;
          return <React.Fragment key={step}>{index > 0 && <span className="chip-arrow">›</span>}<span className={`step-chip ${done ? 'done' : current ? 'current' : ''}`}>{done ? '✓' : `${index + 1}`} {step}</span></React.Fragment>;
        })}</div>
      </div>}
      {getCoupon(place) && <button className="secondary-button coupon-link" onClick={() => navigate(couponPath(place))}>상품권 금액별로 구매하기</button>}
      <p className="source">출처: <a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.source}</a> · 확인일 {formatDate(place.checkedAt)}</p>
    </div>
    <div className="bottom-bar">{place.guideImage
      ? <a className="primary-button" href={place.guideImage} target="_blank" rel="noreferrer">사용 방법 안내 이미지 보기 ↗</a>
      : <button className="primary-button" onClick={() => navigate(`${placePath(place)}/guide`)}>{place.name} 사용 순서 보기</button>}</div>
  </>;
}
