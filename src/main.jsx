import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { categories, getRemaining, getSteps, holdings, isReady, parseHolding, places, searchPlaces, taskLabels } from './data';
import { POPULAR, POPULAR_TABS } from './popular.js';
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
  const [popularTab, setPopularTab] = useState('쇼핑');
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState([]);
  // AI 답변 패널: 기본은 안 보이다가, 자연어 질문에 사용처가 하나만
  // 매칭되면 검색창 아래에 뜬다. /api/ask 연결 전에는 카탈로그 키워드
  // 검색으로 찾은 항목의 확인된 내용만으로 답하는 미리보기다.
  const [aiAnswer, setAiAnswer] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (holding) sessionStorage.setItem('cultureland-holding', JSON.stringify(holding));
  }, [holding]);
  useEffect(() => {
    if (screen === 'guide' && place) sessionStorage.setItem(`cultureland-guide-${place.id}-${holding || 'voucher'}`, JSON.stringify(openStep));
  }, [screen, place, holding, openStep]);
  useEffect(() => { if (mainRef.current) mainRef.current.inert = sheet; }, [sheet]);
  useEffect(() => { window.scrollTo(0, 0); }, [screen, place?.id]);
  useEffect(() => {
    if (screen !== 'search') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setPopularTab((current) => POPULAR_TABS[(POPULAR_TABS.indexOf(current) + 1) % POPULAR_TABS.length]), 2000);
    return () => window.clearInterval(timer);
  }, [screen]);

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
  const isQuestion = (text) => /[?？]|돼|가능|어떻게|어디|할 수 있|되나|되나요/.test(text);
  const onSearch = (event) => {
    event.preventDefault();
    setSearchIds(null);
    setAiAnswer(null);
    if (!query.trim()) return;
    const matches = searchPlaces(query);
    const inferred = parseHolding(query);
    // 자연어 질문 + 사용처 하나 매칭: 바로 결과로 넘기지 않고 AI 답변
    // 패널을 검색창 아래에 띄운다. 패널 안 링크로 결과 화면에 갈 수 있다.
    if (matches.length === 1 && isQuestion(query)) { setAiAnswer({ place: matches[0], query: query.trim(), holding: inferred }); return; }
    if (matches.length === 1) { openResult(matches[0], inferred); return; }
    if (matches.length > 1) { setCategory('전체'); setWhere('all'); setReadyOnly(false); setSearchIds(matches.map((p) => p.id)); setExpanded(true); navigate('browse', null); return; }
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
      {screen === 'search' && <SearchScreen {...{ popularTab, setPopularTab, openResult, goBrowse: () => { setSearchIds(null); setQuery(''); navigate('browse', null); }, goAi: () => navigate('ai', null) }} />}
      {screen === 'ai' && <AiScreen query={aiQuery} setQuery={setAiQuery} messages={aiMessages} setMessages={setAiMessages} onBack={() => navigate('search', null)} onOpen={openResult} />}
      {screen === 'browse' && <BrowseScreen {...{ category, setCategory, where, setWhere, readyOnly, setReadyOnly, expanded, setExpanded, visible, holding, openResult, searchIds, setSearchIds, query, setQuery, onBack: () => navigate('search', null) }} />}
      {screen === 'result' && place && <ResultScreen place={place} holding={holding || 'voucher'} onBack={goBack} onChange={() => { setDraft(holding || 'voucher'); setSheet(true); }} onGuide={goGuide} />}
      {screen === 'guide' && place && <GuideScreen place={place} holding={holding || 'voucher'} open={openStep} setOpen={setOpenStep} onBack={goBack} onHome={() => navigate('search', null)} />}
      {screen === 'noinfo' && <NoInfoScreen place={place} query={unknownQuery} onBack={() => navigate('search', null)} />}
    </main>
    {sheet && <HoldingSheet draft={draft} setDraft={setDraft} onClose={() => setSheet(false)} onConfirm={() => { setHolding(draft); setSheet(false); }} />}
  </div>;
}

function Header({ title, back = false, onBack }) {
  return <header className="header">
    {back ? <button className="back" onClick={onBack} aria-label="뒤로 가기">‹</button> : <span className="brand-logo"><img src={`${ASSET}figma-cultureland-logo.svg`} alt="CULTURE LAND" /></span>}
    <strong>{title}</strong>
  </header>;
}

function SearchScreen({ popularTab, setPopularTab, openResult, goBrowse, goAi }) {
  const byId = new Map(places.map((p) => [p.id, p]));
  const popularItems = POPULAR[popularTab].map((item) => ({ ...item, place: byId.get(item.id) })).filter((item) => item.place);
  return <>
    <Header title="사용처 찾기" />
    <div className="search-body landing-body">
      <section className="hero">
        <div><h1>상품권,<br />어디서 쓰실 건가요?</h1></div>
        <div className="hero-character"><img src={`${ASSET}figma-hero-character.png`} alt="컬쳐랜드 캐릭터" /></div>
      </section>
      <h2 className="section-title">컬쳐랜드 인기 사용처</h2>
      <div className="popular-showcase">
        <div className="popular-tabs" aria-label="인기 사용처 카테고리">
          {POPULAR_TABS.map((tab) => <button key={tab} className={`popular-tab ${popularTab === tab ? 'active' : ''}`} aria-pressed={popularTab === tab} onClick={() => setPopularTab(tab)}>{tab}</button>)}
        </div>
        <div className="popular-grid" key={popularTab}>
          {popularItems.map(({ id, label, place }) => <button className="popular-cell" key={id} onClick={() => openResult(place)}>
            <span className="popular-logo"><img src={place.logo} alt="" /></span><strong>{label}</strong>
          </button>)}
        </div>
        <img className="popular-mascots" src={`${ASSET}figma-popular-mascots.png`} alt="" />
      </div>
      <button className="secondary-button landing-link" onClick={goBrowse}>전체 사용처 보러 가기</button>
      <section className="landing-ai"><h2>여기서 쓸 수 있을까?<br />AI에게 질문하세요.</h2><p>가지고 계신 금액권·바코드·컬쳐캐쉬가 해당 사용처에서 쓰이는지 알려줘요.</p><button className="secondary-button landing-link" onClick={goAi}>AI에게 질문하러 가기</button></section>
    </div>
  </>;
}

function AiScreen({ query, setQuery, messages, setMessages, onBack, onOpen }) {
  const send = (event) => {
    event.preventDefault();
    const question = query.trim();
    if (!question) return;
    const matches = searchPlaces(question);
    setMessages((current) => [...current, { question, match: matches.length === 1 ? matches[0] : null, count: matches.length }]);
    setQuery('');
  };
  return <><header className="header"><button className="back" onClick={onBack} aria-label="뒤로 가기"><img src={`${ASSET}figma-ai-back.svg`} alt="" /></button><strong>AI에게 질문하기</strong></header><div className="ai-notice"><img src={`${ASSET}figma-ai-info.svg`} alt="" />AI가 안내한 정보는 실제와 다를 수 있으니, 결제 전 사용처에서 한 번 더 확인해 주세요.</div><div className="ai-chat" aria-live="polite">{messages.map((message, index) => <React.Fragment key={index}><p className="ai-bubble user">{message.question}</p><strong className="ai-speaker">컬쳐랜드 AI</strong><div className="ai-bubble reply">{message.match ? <>{message.match.summary}<button onClick={() => onOpen(message.match)}>{message.match.name} 사용 안내 보기 ›</button></> : message.count > 1 ? '여러 사용처가 검색됐어요. 전체 사용처에서 이름을 더 구체적으로 찾아 주세요.' : '공식 사용처 목록에서 찾지 못했어요. 이름을 확인한 뒤 다시 질문해 주세요.'}</div></React.Fragment>)}</div><form className="ai-compose" onSubmit={send}><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="AI에게 질문" placeholder="예: 선물받은 교환권 예스24에서 돼?" /><button type="submit" aria-label="질문 보내기" disabled={!query.trim()}><img src={`${ASSET}figma-ai-send.svg`} alt="" /></button></form></>;
}

// AI 답변 패널(피그마 메인 v3 예시): 기본은 안 보이다가 자연어 질문에
// 사용처가 하나만 매칭되면 검색창 아래에 뜬다. 지금은 /api/ask 연결 전이라
// 카탈로그에서 확인된 내용(사용처 요약 + 사용 순서)만으로 답하고,
// "예스24 사용처 보기 ›" 링크로 결과 화면에 갈 수 있다.
function AiAnswerPanel({ answer, holding, onOpen, onClose }) {
  const { place } = answer;
  const steps = place.id === 'yes24'
    ? yesSteps.map((step) => step.title)
    : getSteps(place, holding || 'voucher');
  return <section className="ai-answer" aria-live="polite">
    <div className="ai-answer-head"><span className="ai-chip">AI 답변</span><button className="ai-close" onClick={onClose} aria-label="AI 답변 닫기">×</button></div>
    <p className="ai-answer-text"><strong>네, 돼요.</strong> {place.summary}</p>
    <div className="step-chips">{steps.map((step, index) => <React.Fragment key={step}>{index > 0 && <span className="chip-arrow">›</span>}<span className="step-chip">{index + 1} {step}</span></React.Fragment>)}</div>
    <button className="ai-answer-link" onClick={() => onOpen(place)}>{place.name} 사용처 보기 ›</button>
    <p className="ai-answer-note">카탈로그에서 확인한 내용만으로 답한 미리보기예요. AI 연결 전에는 키워드 검색 결과로 답해요.</p>
  </section>;
}

// 사용처 조회 전용 페이지(메인에서 분리). 카테고리 알약·온라인/오프라인·
// 바로 쓸 수 있는 곳만 필터는 목록이랑 같이 여기에 있다.
function BrowseScreen({ category, setCategory, where, setWhere, readyOnly, setReadyOnly, expanded, setExpanded, visible, holding, openResult, searchIds, setSearchIds, query, setQuery, onBack }) {
  const filtered = query.trim() ? visible.filter((place) => place.name.toLowerCase().includes(query.trim().toLowerCase())) : visible;
  const list = expanded ? filtered : filtered.slice(0, 9);
  const empty = readyOnly
    ? '현재 가진 수단으로 바로 쓸 수 있는 확인된 사용처가 없어요. 수단이나 조건을 바꿔 보세요.'
    : '이 카테고리에는 조건에 맞는 곳이 없어요. 다른 카테고리를 골라 보세요.';
  return <>
    <Header title="전체 사용처" back onBack={onBack} />
    <div className="search-body browse-body">
      <label className="browse-label" htmlFor="browse-search">사용처 이름으로 검색하기</label>
      <div className="search-form browse-search"><input id="browse-search" value={query} onChange={(event) => { setQuery(event.target.value); setExpanded(false); }} placeholder="사용처 검색" /><img src={`${ASSET}16-2-img.svg`} alt="" /></div>
      <div className="segment" aria-label="어디서">
        {[['all', '전체'], ['online', '온라인'], ['store', '오프라인']].map(([value, label]) => <button key={value} className={where === value ? 'active' : ''} aria-pressed={where === value} onClick={() => { setWhere(value); setExpanded(false); }}>{label}</button>)}
      </div>
      {searchIds && <button className="clear-search" onClick={() => { setSearchIds(null); setQuery(''); }}>검색 결과 지우기 ×</button>}
      <h2 className="section-title">카테고리로 찾기</h2>
      <div className="category-scroll" aria-label="카테고리">
        {categories.map((cat) => <button key={cat} className={`pill ${category === cat ? 'active' : ''}`} aria-pressed={category === cat} onClick={() => { setCategory(cat); setExpanded(false); }}>{cat}</button>)}
      </div>

      <div className="ready-row">
        <div><strong>지금 바로 쓸 수 있는 곳만</strong><small>{holdings[holding || 'voucher'].name} 기준 · {holding === 'cash' ? '결제창에서 고르면 돼요' : holding === 'barcode' ? '매장에서 바코드를 보여 주세요' : '먼저 상품권을 교환해야 해요'}</small></div>
        <button className={`switch ${readyOnly ? 'on' : ''}`} role="switch" aria-checked={readyOnly} aria-label="지금 바로 쓸 수 있는 곳만" onClick={() => { setReadyOnly(!readyOnly); setExpanded(false); }}><span /></button>
      </div>
      <p className="count">{filtered.length}곳</p>
      {filtered.length ? <div className="tiles">{list.map((p) => <button className="tile" key={p.id} onClick={() => openResult(p)}>
        <span className="logo-placeholder"><img src={p.logo} alt="" /></span><strong>{p.name}</strong><span className="task-badge">{taskLabels[p.type]}</span><small>{p.fee || p.limit || (p.status === 'listed' ? '상세 미확인' : p.status === 'partial' ? '일부 조건 미확인' : '공식 경로 확인')}</small>
      </button>)}</div> : <p className="empty-results">{empty}</p>}
      {!expanded && filtered.length > 9 && <button className="show-all" onClick={() => setExpanded(true)}>전체 {filtered.length}곳 보기</button>}
      {expanded && filtered.length > 9 && <button className="show-all" onClick={() => setExpanded(false)}>접기</button>}
      <p className="search-footnote">원본 온라인 154개(동일 권종 통합 150개) + 오프라인 28개 · 총 {places.length}곳 · 2026.11.09</p>
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
      <img src={`${ASSET}figma-holding-${key}.png`} alt="" />
      <span className="holding-option-copy"><strong>{item.name}</strong><small>{item.detail}</small></span>
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
