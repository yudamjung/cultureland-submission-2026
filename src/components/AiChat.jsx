import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { places } from '../data';
import { ask } from '../api/client';
import { useApp } from '../context/AppContext';
import { useOpenPlace } from '../hooks/useNav';
import { ASSET } from '../lib/constants';

// "자세히 알아보기" 바텀시트 문구. 법률 문서가 아니라 사용자가 알아야 할 안내만 담는다.
const AI_INFO = [
  '컬쳐랜드 AI는 컬쳐랜드 사용처 안내 자료를 바탕으로 AI가 답변을 만들어요. 그래서 실수가 있을 수 있고, 답변을 확인할 책임은 이용자에게 있어요.',
  '사용처의 결제 수단·수수료·한도는 바뀔 수 있어요. 결제 전에 사용처나 컬쳐랜드 공식 페이지에서 한 번 더 확인해 주세요.',
  '답변은 참고용 안내예요. 환불·분쟁처럼 중요한 문제는 컬쳐랜드 고객센터에 문의해 주세요.',
  '상품권 PIN·바코드 번호, 카드·계좌 번호, 비밀번호 같은 개인정보나 결제 정보는 입력하지 마세요.',
  '입력한 질문은 답변을 만들기 위해 외부 AI 서비스 제공업체에 전달돼요.',
];

function ChatIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3.5c-4.97 0-9 3.36-9 7.5 0 2.2 1.14 4.18 2.96 5.55L5.2 20.2l4.08-2.06c.87.23 1.79.36 2.72.36 4.97 0 9-3.36 9-7.5s-4.03-7.5-9-7.5Z" fill="currentColor" />
    <circle cx="8.2" cy="11" r="1.2" fill="var(--color-brand-primary-red)" /><circle cx="12" cy="11" r="1.2" fill="var(--color-brand-primary-red)" /><circle cx="15.8" cy="11" r="1.2" fill="var(--color-brand-primary-red)" />
  </svg>;
}

export default function AiChat() {
  const { aiQuery: query, setAiQuery: setQuery, aiMessages: messages, setAiMessages: setMessages } = useApp();
  const openPlace = useOpenPlace();
  const [open, setOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const pending = messages.some((message) => message.loading);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fabRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [messages, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  // 입력창은 글이 길어질수록 아래로 늘어나고, 최대 높이(CSS)를 넘으면 안에서 스크롤된다.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [query, open]);
  useEffect(() => { if (infoOpen) infoRef.current?.focus(); }, [infoOpen]);

  const close = () => { setInfoOpen(false); setOpen(false); requestAnimationFrame(() => fabRef.current?.focus()); };

  useEffect(() => {
    if (!open) return undefined;
    // Esc는 바텀시트가 열려 있으면 바텀시트만, 아니면 대화창을 닫는다.
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (infoOpen) setInfoOpen(false); else close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, infoOpen]);

  const send = async (event) => {
    event.preventDefault();
    const question = query.trim();
    if (!question || pending) return;
    const id = crypto.randomUUID();
    setMessages((current) => [...current, { id, question, loading: true }]);
    setQuery('');
    const { answer, sourceId } = await ask(question);
    const match = sourceId ? places.find((place) => place.id === sourceId) : null;
    setMessages((current) => current.map((message) => message.id === id ? { ...message, loading: false, answer, match } : message));
  };

  if (!open) return <button ref={fabRef} className="ai-fab" onClick={() => setOpen(true)} aria-label="AI에게 질문하기"><ChatIcon /></button>;

  return <section className="ai-panel" role="dialog" aria-labelledby="ai-panel-title">
    <header className="ai-panel-head">
      <strong id="ai-panel-title">컬쳐랜드 AI</strong>
      <button className="ai-panel-close" onClick={close} aria-label="AI 대화 닫기">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
      </button>
    </header>
    <div className="ai-panel-body" aria-live="polite" inert={infoOpen || undefined}>
      <div className="ai-welcome">
        <h2>여기서 쓸 수 있을까?<br />AI에게 질문하세요.</h2>
        <p>가지고 계신 금액권·바코드·컬쳐캐쉬가 해당 사용처에서 쓰이는지 알려줘요.</p>
      </div>
      <p className="ai-disclaimer">
        AI가 안내한 정보는 실제와 다를 수 있으니,<br />결제 전 사용처에서 한 번 더 확인해 주세요.
        <button type="button" className="ai-learn" onClick={() => setInfoOpen(true)}>자세히 알아보기</button>
      </p>
      {messages.map((message) => <React.Fragment key={message.id}>
        <p className="ai-bubble user">{message.question}</p>
        <strong className="ai-speaker">컬쳐랜드 AI</strong>
        <div className="ai-bubble reply">{message.loading
          ? <span className="thinking-dots" role="status" aria-label="답변 생성 중"><span /><span /><span /></span>
          : <>{message.answer}{message.match && <button onClick={() => openPlace(message.match)}>{message.match.name} 사용 안내 보기 ›</button>}</>}</div>
      </React.Fragment>)}
      <span ref={endRef} />
    </div>
    <form className="ai-compose" onSubmit={send} inert={infoOpen || undefined}>
      <textarea ref={inputRef} rows={1} value={query} onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }}
        aria-label="AI에게 질문" placeholder="예: 선물받은 교환권 예스24에서 돼?" />
      <button type="submit" aria-label="질문 보내기" disabled={!query.trim() || pending}><img src={`${ASSET}figma-ai-send.svg`} alt="" /></button>
    </form>
    {infoOpen && <div className="ai-info-overlay" onClick={(event) => { if (event.target === event.currentTarget) setInfoOpen(false); }}>
      <div className="ai-info-sheet" role="dialog" aria-modal="true" aria-labelledby="ai-info-title" tabIndex={-1} ref={infoRef}>
        <div className="sheet-handle" />
        <h2 id="ai-info-title">컬쳐랜드 AI는 이렇게 답변해요</h2>
        <ul className="ai-info-list">{AI_INFO.map((line) => <li key={line}>{line}</li>)}</ul>
        <button className="primary-button" onClick={() => setInfoOpen(false)}>확인했어요</button>
      </div>
    </div>}
  </section>;
}
