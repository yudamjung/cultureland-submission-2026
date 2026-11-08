import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { categories, getRemaining, getSteps, holdings, isReady, parseHolding, places, searchPlaces, taskLabels } from './data';
import './style.css';

const ASSET = '/assets/';
const URLS = {
  cultureland: 'https://m.cultureland.co.kr/mmb/mmbMain.do',
  official: 'https://www.cultureland.co.kr/usecash/useCash.do',
  yes24: 'https://www.yes24.com/',
};
const readSession = (key, fallback) => {
  try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const formatDate = (date) => date.replaceAll('-', '.');

function App() {
  const [screen, setScreen] = useState('search');
  const [place, setPlace] = useState(null);
  const [holding, setHolding] = useState(() => { const saved = readSession('cultureland-holding', null); return holdings[saved] ? saved : null; });
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState('voucher');
  const [openStep, setOpenStep] = useState(1);
  const [category, setCategory] = useState('전체');
  const [where, setWhere] = useState('all');
  const [readyOnly, setReadyOnly] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [searchIds, setSearchIds] = useState(null);
  const [unknownQuery, setUnknownQuery] = useState('');
  const mainRef = useRef(null);

  useEffect(() => {
    if (holding) sessionStorage.setItem('cultureland-holding', JSON.stringify(holding));
  }, [holding]);
  useEffect(() => {
    if (screen === 'guide' && place) sessionStorage.setItem(`cultureland-guide-${place.id}-${holding || 'voucher'}`, JSON.stringify(openStep));
  }, [screen, place, holding, openStep]);
  useEffect(() => { if (mainRef.current) mainRef.current.inert = sheet; }, [sheet]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, place?.id]);

  const navigate = (next, nextPlace = place) => {
    setScreen(next);
    setPlace(nextPlace);
    window.scrollTo(0, 0);
  };
  const openResult = (item, inferredHolding = null) => {
    if (inferredHolding) setHolding(inferredHolding);
    setPlace(item);
    setScreen(item.status === 'listed' ? 'noinfo' : 'result');
    if (item.status !== 'listed' && !holding && !inferredHolding) { setDraft('voucher'); setSheet(true); }
  };
  const goGuide = (item = place, step = null) => {
    const initial = item.id === 'yes24' ? holdings[holding || 'voucher'].start : Math.max(1, getSteps(item, holding).length - getRemaining(item, holding || 'voucher').length + 1);
    setOpenStep(Math.min(item.id === 'yes24' ? yesSteps.length : getSteps(item, holding).length, Math.max(initial, step || readSession(`cultureland-guide-${item.id}-${holding || 'voucher'}`, initial))));
    navigate('guide', item);
  };
  const goBack = () => navigate(screen === 'guide' ? 'result' : 'search');
  const onSearch = (event) => {
    event.preventDefault();
    setSearchIds(null);
    if (!query.trim()) return;
    const matches = searchPlaces(query);
    const inferred = parseHolding(query);
    if (matches.length === 1) { openResult(matches[0], inferred); return; }
    if (matches.length > 1) { setCategory('전체'); setWhere('all'); setReadyOnly(false); setSearchIds(matches.map((p) => p.id)); setExpanded(true); return; }
    setUnknownQuery(query.trim());
    navigate('noinfo', null);
  };

  const visible = places.filter((p) =>
    (category === '전체' || p.cat === category) &&
    (where === 'all' || (where === 'store' ? p.offline === 'yes' : p.online === 'yes')) &&
    (!readyOnly || isReady(p, holding || 'voucher')) &&
    (!searchIds || searchIds.includes(p.id))
  );

  return <div className="phone-shell">
    <main ref={mainRef}>
      {screen === 'search' && <SearchScreen {...{ category, setCategory, where, setWhere, readyOnly, setReadyOnly, expanded, setExpanded, query, setQuery, visible, holding, openResult, onSearch, searchIds, setSearchIds }} />}
      {screen === 'result' && place && <ResultScreen place={place} holding={holding || 'voucher'} onBack={goBack} onChange={() => { setDraft(holding || 'voucher'); setSheet(true); }} onGuide={goGuide} />}
      {screen === 'guide' && place && <GuideScreen place={place} holding={holding || 'voucher'} open={openStep} setOpen={setOpenStep} onBack={goBack} onHome={() => navigate('search', null)} />}
      {screen === 'noinfo' && <NoInfoScreen place={place} query={unknownQuery} onBack={() => navigate('search', null)} />}
    </main>
    {sheet && <HoldingSheet draft={draft} setDraft={setDraft} onClose={() => setSheet(false)} onConfirm={() => { setHolding(draft); setSheet(false); }} />}
  </div>;
}

function Header({ title, back = false, onBack }) {
  return <header className="header">
    {back ? <button className="back" onClick={onBack} aria-label="뒤로 가기">‹</button> : <img className="brand-logo" src={`${ASSET}16-2-imgImg0.png`} alt="CULTURE LAND" />}
    <strong>{title}</strong>
  </header>;
}

function SearchScreen({ category, setCategory, where, setWhere, readyOnly, setReadyOnly, expanded, setExpanded, query, setQuery, visible, holding, openResult, onSearch, searchIds, setSearchIds }) {
  const list = expanded ? visible : visible.slice(0, 9);
  const empty = readyOnly
    ? '현재 가진 수단으로 바로 쓸 수 있는 확인된 사용처가 없어요. 수단이나 조건을 바꿔 보세요.'
    : '이 카테고리에는 조건에 맞는 곳이 없어요. 다른 카테고리를 골라 보세요.';
  return <>
    <Header title="사용처 찾기" />
    <div className="search-body">
      <section className="hero">
        <div><h1>상품권,<br />어디서 쓰실 건가요?</h1></div>
        <img src={`${ASSET}16-2-imgImg1.png`} alt="엄지척 캐릭터" />
      </section>
      <p className="search-intro">사용처 이름이나 궁금한 점을 입력하세요</p>
      <form className="search-form" onSubmit={onSearch}>
        <input aria-label="사용처 검색" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="예: 카톡으로 받은 상품권 예스24에서 돼?" />
        <button type="submit" aria-label="검색"><img src={`${ASSET}16-2-img.svg`} alt="" /></button>
      </form>
      {searchIds && <button className="clear-search" onClick={() => { setSearchIds(null); setQuery(''); }}>검색 결과 지우기 ×</button>}
      <h2 className="section-title">카테고리로 찾기</h2>
      <div className="category-scroll" aria-label="카테고리">
        {categories.map((cat) => <button key={cat} className={`pill ${category === cat ? 'active' : ''}`} aria-pressed={category === cat} onClick={() => { setCategory(cat); setExpanded(false); }}>{cat}</button>)}
      </div>
      <div className="segment" aria-label="어디서">
        {[['all', '전체'], ['online', '온라인'], ['store', '오프라인']].map(([value, label]) => <button key={value} className={where === value ? 'active' : ''} aria-pressed={where === value} onClick={() => { setWhere(value); setExpanded(false); }}>{label}</button>)}
      </div>
      <div className="ready-row">
        <div><strong>지금 바로 쓸 수 있는 곳만</strong><small>{holdings[holding || 'voucher'].name} 기준 · {holding === 'cash' ? '결제창에서 고르면 돼요' : holding === 'barcode' ? '매장에서 바코드를 보여 주세요' : '먼저 상품권을 교환해야 해요'}</small></div>
        <button className={`switch ${readyOnly ? 'on' : ''}`} role="switch" aria-checked={readyOnly} aria-label="지금 바로 쓸 수 있는 곳만" onClick={() => { setReadyOnly(!readyOnly); setExpanded(false); }}><span /></button>
      </div>
      <p className="count">{visible.length}곳</p>
      {visible.length ? <div className="tiles">{list.map((p) => <button className="tile" key={p.id} onClick={() => openResult(p)}>
        <span className="logo-placeholder"><img src={p.logo} alt="" /></span><strong>{p.name}</strong><span className="task-badge">{taskLabels[p.type]}</span><small>{p.fee || p.limit || (p.status === 'listed' ? '상세 미확인' : p.status === 'partial' ? '일부 조건 미확인' : '공식 경로 확인')}</small>
      </button>)}</div> : <p className="empty-results">{empty}</p>}
      {!expanded && visible.length > 9 && <button className="show-all" onClick={() => setExpanded(true)}>전체 {visible.length}곳 보기</button>}
      {expanded && visible.length > 9 && <button className="show-all" onClick={() => setExpanded(false)}>접기</button>}
      <p className="search-footnote">목록 {places.length}곳 · 자료 기준일 2026.11.08</p>
    </div>
  </>;
}

function ResultScreen({ place, holding, onBack, onChange, onGuide }) {
  const steps = getSteps(place, holding);
  const remaining = getRemaining(place, holding);
  const ready = isReady(place, holding);
  return <>
    <Header title="사용 안내" back onBack={onBack} />
    <div className="result-body">
      <div className="holding-line"><span>{holdings[holding].heading}</span><button onClick={onChange}>바꾸기</button></div>
      <div className="merchant-head"><div className="merchant-logo"><img src={place.logo} alt="" /></div><span className="subcat">{place.cat}</span><h1>{place.name}</h1><p>{taskLabels[place.type]}</p></div>
      <div className="result-card">
        <h2><span className={`dot ${ready ? 'mint' : place.status === 'partial' ? 'navy' : ''}`} />{ready ? '현재 수단으로 이용할 수 있어요' : place.status === 'partial' ? '기본 사용 경로를 확인했어요' : '사용하려면 준비가 필요해요'}</h2>
        <p>{place.summary}</p>
        {place.variants && <p className="result-tip">선택 경로: {place.variants}</p>}
        <div className="step-chips">{steps.map((step, index) => { const done = !remaining.includes(step); const current = remaining[0] === step; return <React.Fragment key={step}>{index > 0 && <span className="chip-arrow">›</span>}<span className={`step-chip ${done ? 'done' : current ? 'current' : ''}`}>{done ? '✓' : `${index + 1}`} {step}</span></React.Fragment>; })}</div>
      </div>
      {place.offline === 'yes' && place.type === 'direct' && <p className="cgv-note">오프라인 매장에서는 상품권 바코드 또는 컬쳐랜드 앱 바코드 결제 경로도 있어요. 일부 매장은 제외될 수 있습니다.</p>}
      {place.status === 'partial' && <p className="cgv-note">세부 수수료·한도·사용 가능 범위는 확인되지 않았을 수 있어요. 실제 이용 전에 연결된 안내를 확인하세요.</p>}
      {place.type === 'coupon' && <p className="cgv-note">컬쳐랜드 판매권의 유효기간·환불·제외 매장 등 개별 조건은 로그인 전 확인되지 않았어요.</p>}
      {(place.fee || place.limit) && <p className="cgv-note">{[place.fee, place.limit].filter(Boolean).join(' · ')}</p>}
      <p className="source">출처: <a href={place.sourceUrl} target="_blank" rel="noreferrer">{place.source}</a> · 확인일 {formatDate(place.checkedAt)}</p>
    </div>
    <div className="bottom-bar"><button className="primary-button" onClick={() => onGuide(place)}>{place.name} 사용 순서 보기</button></div>
  </>;
}

const yesSteps = [
  { title: '교환하기', lines: ['선물함에서 ‘등록하기’를 누르면 12자리 번호가 복사돼요.', '컬쳐랜드에 로그인한 뒤 위쪽 ‘교환소’ 탭에 붙여넣고 교환하세요.', '교환하면 16자리 상품권 번호가 도착해요.'], button: '교환소 열기', href: URLS.cultureland },
  { title: '컬쳐캐쉬로 충전하기', lines: ['도착한 컬쳐랜드상품권을 컬쳐캐쉬로 충전해요.'], why: '온라인 쇼핑몰은 상품권이 아니라 컬쳐캐쉬로만 결제돼요.', button: '충전 화면 열기', href: URLS.cultureland },
  { title: '사용 가능 금액 확인하기', lines: ['컬쳐랜드 앱에서 ‘사용 가능 금액’을 확인해요.', '0원이면 아직 충전 전이에요.', '안심금고에 보관된 금액은 컬쳐랜드에서 찾은 뒤 써야 해요.'], button: '사용 가능 금액 보기', href: URLS.cultureland },
  { title: '예스24 결제창에서 선택하기', lines: ['“외부 상품권/포인트 → 컬쳐랜드상품권(컬쳐캐쉬)”을 누르고 컬쳐랜드에 로그인해요.', '‘문화상품권’ 버튼이 아니에요.', '예스24에 로그인한 주문만 가능하고, 모자란 금액은 카드로 함께 결제할 수 있어요.'], button: '예스24로 가기', href: URLS.yes24 },
];
function guideSteps(place, holding) {
  if (place.id === 'yes24') return yesSteps;
  return getSteps(place, holding).map((step) => {
    if (step === '교환') return { title: '상품권 교환하기', lines: ['받은 12자리 교환권은 컬쳐랜드 교환소에서 상품권으로 교환해요.'], button: '컬쳐랜드 교환소 열기', href: URLS.cultureland };
    if (step === '충전') return { title: '컬쳐캐쉬로 충전하기', lines: ['16자리 컬쳐랜드상품권을 사용 가능 컬쳐캐쉬로 충전해요.', '안심금고에 보관된 잔액은 먼저 찾아야 해요.'], button: '컬쳐랜드 열기', href: URLS.cultureland };
    if (step === '앱 바코드 열기') return { title: '앱 바코드 열기', lines: ['컬쳐랜드 앱에 로그인한 뒤 홈 화면의 바코드결제에서 사용처를 선택해요.'], button: '공식 안내 보기', href: 'https://www.cultureland.co.kr/customer/help/serviceHelp.do?class1=2&class2=7' };
    if (step === '바코드 보여 주기' || step === '매장에서 보여 주기') return { title: '매장에서 바코드 보여 주기', lines: ['결제 전 상품권 또는 앱 바코드의 사용 가능 잔액을 확인해요.', '매장 직원에게 바코드를 보여 주세요. 일부 매장은 제외될 수 있어요.'], button: '공식 사용처 보기', href: 'https://www.cultureland.co.kr/voucher/voucheruse.do' };
    return { title: step === '포인트로 전환' ? '포인트로 전환하기' : step === '쿠폰 구매' ? '쿠폰 구매하기' : step === '쿠폰 등록' ? '쿠폰 등록·제시하기' : '결제창에서 선택하기', lines: [place.summary, ...(place.status === 'partial' ? ['세부 조건은 연결된 안내와 실제 화면에서 다시 확인하세요.'] : [])], button: '원문 안내 확인', href: place.sourceUrl };
  });
}
function GuideScreen({ place, holding, open, setOpen, onBack, onHome }) {
  const steps = guideSteps(place, holding);
  const headline = place.id === 'yes24' ? ['교환할 차례예요', '충전할 차례예요', '금액을 확인할 차례예요', '결제창에서 고를 차례예요'][open - 1] : `${steps[open - 1]?.title.replace('하기', '할')} 차례예요`;
  const done = open - 1;
  return <>
    <Header title={`${place.name}에서 쓰는 방법`} back onBack={onBack} />
    <div className="guide-progress"><div><h1>{headline}</h1><span>{done} / {steps.length} 완료</span></div><div className="progress-track"><span style={{ width: `${(done / steps.length) * 100}%` }} /></div></div>
    <div className="guide-list">{steps.map((step, index) => {
      const num = index + 1, complete = num < open, selected = num === open;
      return <section className={`guide-step ${selected ? 'selected' : ''}`} key={step.title}>
        <button className="step-heading" aria-expanded={selected} onClick={() => setOpen(num)}><span className={`step-number ${complete ? 'complete' : ''}`}>{complete ? '✓' : num}</span><strong className={complete ? 'struck' : ''}>{step.title}</strong><span className="chevron">{selected ? '⌃' : '⌄'}</span></button>
        {selected && <div className="step-content">{step.lines.map((line) => <p key={line}>{line}</p>)}{step.why && <div className="why-box"><strong>왜 필요할까요?</strong><p>{step.why}</p></div>}<a className="primary-button action-button" href={step.href} target="_blank" rel="noreferrer" onClick={() => { if (open < steps.length) sessionStorage.setItem(`cultureland-guide-${place.id}-${holding}`, JSON.stringify(open + 1)); }}>{step.button}</a></div>}
      </section>;
    })}</div>
    <div className="bottom-bar"><button className="secondary-button" onClick={() => open < steps.length ? setOpen(open + 1) : onHome()}>{open < steps.length ? '다음 단계로  ›' : '다른 사용처 찾기'}</button></div>
  </>;
}

function HoldingSheet({ draft, setDraft, onClose, onConfirm }) {
  const dialogRef = useRef(null);
  useEffect(() => { dialogRef.current?.focus(); const onKey = (e) => { if (e.key === 'Escape') onClose(); }; document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [onClose]);
  return <div className="sheet-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="sheet" role="dialog" aria-modal="true" aria-label="지금 가진 것 고르기" tabIndex={-1} ref={dialogRef}>
    <div className="sheet-handle" /><h2>잠깐, 현재 소지하신 상품권이 있나요?</h2>
    <div className="holding-options">{Object.entries(holdings).map(([key, item]) => <button key={key} className={`holding-option ${draft === key ? 'selected' : ''}`} aria-pressed={draft === key} onClick={() => setDraft(key)}>
      {key === 'cash' ? <span className="cash-placeholder">잔액 화면 이미지</span> : <img src={`${ASSET}${key === 'voucher' ? '17-2-imgImg2.png' : '17-2-imgImg3.png'}`} alt="" />}
      <span><strong>{item.name}</strong><small>{item.detail}</small></span><span className="option-radio" />
    </button>)}</div>
    <button className="primary-button confirm" onClick={onConfirm}>이 수단으로 결정하기</button>
  </section></div>;
}

function NoInfoScreen({ place, query, onBack }) {
  const suggestions = places.filter((p) => p.verified && p.id !== place?.id).slice(0, 3);
  return <><Header title="검색 결과" back onBack={onBack} /><div className="noinfo-body">
    {place ? <><div className="noinfo-logo"><img src={place.logo} alt="" /></div><h1>{place.name}</h1><p className="noinfo-sub">{taskLabels[place.type]} · 세부 조건 확인 필요</p><div className="noinfo-card"><h2>사용 방법을 확인하지 못했어요</h2><p>{place.summary}</p><small>확인일 {formatDate(place.checkedAt)}</small></div></>
      : <><h1>검색 결과가 없어요</h1><div className="noinfo-card"><h2>‘{query || '검색어'}’는 공식 사용처 목록에서 찾지 못했어요</h2><p>이름을 다르게 입력했거나 아직 제휴하지 않은 곳일 수 있어요.</p></div><h2 className="suggest-title">비슷한 사용처</h2><div className="suggestions">{suggestions.map((p) => <span key={p.id}>{p.name}</span>)}</div></>}
    <a className="primary-button" href={place?.sourceUrl || URLS.official} target="_blank" rel="noreferrer">원문 안내 보기</a><a className="secondary-button contact" href="tel:15772111">고객센터 1577-2111</a><p className="center-hours">고객센터: 평일 08:00~17:00</p>
  </div></>;
}

createRoot(document.getElementById('root')).render(<App />);
