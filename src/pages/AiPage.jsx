import React, { useEffect, useRef } from 'react';
import { places } from '../data';
import { ask } from '../api/client';
import { useApp } from '../context/AppContext';
import { useGoBack, useOpenPlace } from '../hooks/useNav';
import { ASSET } from '../lib/constants';

export default function AiPage() {
  const { aiQuery: query, setAiQuery: setQuery, aiMessages: messages, setAiMessages: setMessages } = useApp();
  const goBack = useGoBack('/');
  const openPlace = useOpenPlace();
  const pending = messages.some((message) => message.loading);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [messages]);

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

  return <>
    <header className="header"><button className="back" onClick={goBack} aria-label="뒤로 가기"><img src={`${ASSET}figma-ai-back.svg`} alt="" /></button><strong>AI에게 질문하기</strong></header>
    <div className="ai-notice"><img src={`${ASSET}figma-ai-info.svg`} alt="" />AI가 안내한 정보는 실제와 다를 수 있으니, 결제 전 사용처에서 한 번 더 확인해 주세요.</div>
    <div className="ai-chat" aria-live="polite">{messages.map((message) => <React.Fragment key={message.id}><p className="ai-bubble user">{message.question}</p><strong className="ai-speaker">컬쳐랜드 AI</strong><div className="ai-bubble reply">{message.loading ? <span className="thinking-dots" role="status" aria-label="답변 생성 중"><span /><span /><span /></span> : <>{message.answer}{message.match && <button onClick={() => openPlace(message.match)}>{message.match.name} 사용 안내 보기 ›</button>}</>}</div></React.Fragment>)}<span ref={endRef} /></div>
    <form className="ai-compose" onSubmit={send}><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="AI에게 질문" placeholder="예: 선물받은 교환권 예스24에서 돼?" /><button type="submit" aria-label="질문 보내기" disabled={!query.trim() || pending}><img src={`${ASSET}figma-ai-send.svg`} alt="" /></button></form>
  </>;
}
