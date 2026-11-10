import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { getRemaining, getSteps, holdings, places } from '../data';
import { useApp } from '../context/AppContext';
import { useGoBack } from '../hooks/useNav';
import { guideSteps, yesSteps } from '../lib/guide';
import { readSession } from '../lib/utils';

export default function GuidePage() {
  const { id } = useParams();
  const place = places.find((p) => p.id === id);
  if (!place) return <Navigate to="/" replace />;
  if (place.status === 'listed') return <Navigate to={`/place/${place.id}/noinfo`} replace />;
  return <Guide key={place.id} place={place} />;
}

function Guide({ place }) {
  const navigate = useNavigate();
  const goBack = useGoBack(`/place/${place.id}`);
  const { holding: savedHolding } = useApp();
  const holding = savedHolding || 'voucher';
  const steps = guideSteps(place, holding);
  const storageKey = `cultureland-guide-${place.id}-${holding}`;

  // 처음 열 단계: 이미 끝낸 단계 다음, 또는 지난번에 보던 단계.
  const [open, setOpen] = useState(() => {
    const initial = place.id === 'yes24' ? holdings[holding].start : Math.max(1, getSteps(place, savedHolding).length - getRemaining(place, holding).length + 1);
    const total = place.id === 'yes24' ? yesSteps.length : getSteps(place, savedHolding).length;
    return Math.min(total, Math.max(initial, readSession(storageKey, initial)));
  });
  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify(open)); }, [storageKey, open]);

  const headline = place.id === 'yes24' ? ['교환할 차례예요', '충전할 차례예요', '금액을 확인할 차례예요', '결제창에서 고를 차례예요'][open - 1] : place.groups.includes('생활 편의') && holding === 'cash' ? ['편의점 바코드를 열 차례예요', '매장에서 바코드를 보여 줄 차례예요'][open - 1] : `${steps[open - 1]?.title.replace('하기', '할')} 차례예요`;
  const done = open - 1;
  return <>
    <Header title={`${place.name}에서 쓰는 방법`} back onBack={goBack} />
    <div className="guide-progress"><div><h1>{headline}</h1><span>{done} / {steps.length} 완료</span></div><div className="progress-track"><span style={{ width: `${(done / steps.length) * 100}%` }} /></div></div>
    <div className="guide-list">{steps.map((step, index) => {
      const num = index + 1, complete = num < open, selected = num === open;
      return <section className={`guide-step ${selected ? 'selected' : ''}`} key={step.title}>
        <button className="step-heading" aria-expanded={selected} onClick={() => setOpen(num)}><span className={`step-number ${complete ? 'complete' : ''}`}>{complete ? '' : num}</span><strong className={complete ? 'struck' : ''}>{step.title}</strong><span className={`chevron ${selected ? 'up' : ''}`} aria-hidden="true" /></button>
        {selected && <div className="step-content">{step.lines.map((line) => <p key={line}>{line}</p>)}{step.why && <div className="why-box"><strong>왜 필요할까요?</strong><p>{step.why}</p></div>}<a className="primary-button action-button" href={step.href} target="_blank" rel="noreferrer" onClick={() => { if (open < steps.length) sessionStorage.setItem(storageKey, JSON.stringify(open + 1)); }}>{step.button}</a></div>}
      </section>;
    })}</div>
    <div className="bottom-bar"><button className="secondary-button" onClick={() => open < steps.length ? setOpen(open + 1) : navigate('/')}>{open < steps.length ? '다음 단계' : '다른 사용처 찾기'}</button></div>
  </>;
}
