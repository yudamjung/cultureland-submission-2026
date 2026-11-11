import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import NoticeModal from '../components/NoticeModal';
import { getRemaining, getSteps, holdings, findPlace } from '../data';
import { useApp } from '../context/AppContext';
import { useGoBack } from '../hooks/useNav';
import { guideSteps, yesSteps } from '../lib/guide';
import { getNotes } from '../lib/notes';
import { placePath } from '../lib/paths';
import { readSession, formatDate } from '../lib/utils';

export default function GuidePage() {
  const { id, typeId } = useParams();
  const { holding } = useApp();
  const place = findPlace(id, typeId);
  if (!place) return <Navigate to={typeId ? `/place/${id}/types` : '/'} replace />;
  if (place.children?.length) return <Navigate to={`/place/${place.id}/types`} replace />;
  if (place.guideImage) return <Navigate to={placePath(place)} replace />;
  if (place.status === 'listed') return <Navigate to={`/place/${place.id}/noinfo`} replace />;
  return <Guide key={`${place.id}-${place.typeId || ''}-${holding || ''}`} place={place} />;
}

function Guide({ place }) {
  const navigate = useNavigate();
  // 결과 화면을 건너뛰는 곳은 주소로 바로 들어왔을 때 목록으로(세부 권종이면 권종 목록으로) 돌아간다.
  const goBack = useGoBack(place.parent ? `/place/${place.parent.id}/types` : '/');
  const { holding: savedHolding, sheet, openSheet } = useApp();
  // 가진 수단을 아직 안 골랐으면 들어오자마자 바텀시트를 띄운다.
  useEffect(() => { if (!savedHolding) openSheet('voucher'); }, [savedHolding, openSheet]);
  const holding = savedHolding || 'voucher';
  const steps = guideSteps(place, holding);
  const storageKey = `cultureland-guide-${place.id}${place.typeId ? `-${place.typeId}` : ''}-${holding}`;

  // 처음 열 단계: 이미 끝낸 단계 다음, 또는 지난번에 보던 단계.
  const [open, setOpen] = useState(() => {
    const initial = place.id === 'yes24' ? holdings[holding].start : Math.max(1, getSteps(place, savedHolding).length - getRemaining(place, holding).length + 1);
    const total = place.id === 'yes24' ? yesSteps.length : getSteps(place, savedHolding).length;
    return Math.min(total, Math.max(initial, readSession(storageKey, initial)));
  });
  useEffect(() => { sessionStorage.setItem(storageKey, JSON.stringify(open)); }, [storageKey, open]);

  // 들어올 때 꼭 필요한 안내가 있으면 모달로 먼저 보여 준다.
  const notes = getNotes(place);
  const [noticeOpen, setNoticeOpen] = useState(notes.length > 0);

  return <>
    <Header title="사용 순서" back onBack={goBack} />
    <div className="timeline-body">
      <div className="holding-line"><span>{holdings[holding].heading}</span><button onClick={() => openSheet(holding)}>바꾸기</button></div>
      <h1 className="timeline-title">{place.name}에서<br />쓰는 방법</h1>
      <ol className="timeline">{steps.map((step, index) => {
        const num = index + 1, complete = num < open, selected = num === open;
        return <li className={`tl-step ${complete ? 'complete' : selected ? 'current' : ''}`} key={step.title}>
          <span className="tl-num" aria-hidden="true">{complete ? '' : num}</span>
          <div className="tl-main">
            <button className="tl-head" aria-expanded={selected} onClick={() => setOpen(num)}>
              <strong>{step.title}</strong>
              {!selected && <small>{step.lines[0]}</small>}
            </button>
            {selected && <div className="step-content">{step.lines.map((line) => <p key={line}>{line}</p>)}{step.why && <div className="why-box"><strong>왜 필요할까요?</strong><p>{step.why}</p></div>}<a className="primary-button action-button" href={step.href} target="_blank" rel="noreferrer" onClick={() => { if (open < steps.length) sessionStorage.setItem(storageKey, JSON.stringify(open + 1)); }}>{step.button}</a></div>}
          </div>
        </li>;
      })}</ol>
      <p className="source">출처: <a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.source}</a> · 확인일 {formatDate(place.checkedAt)}</p>
    </div>
    {noticeOpen && !sheet && <NoticeModal notes={notes} onClose={() => setNoticeOpen(false)} />}
    <div className="bottom-bar split">
      <button className="secondary-button" disabled={open <= 1} onClick={() => setOpen(open - 1)}>이전 단계</button>
      <button className="primary-button" onClick={() => open < steps.length ? setOpen(open + 1) : navigate('/')}>{open < steps.length ? '다음 단계' : '다른 사용처 찾기'}</button>
    </div>
  </>;
}
