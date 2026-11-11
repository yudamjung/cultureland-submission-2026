import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AiChat from './AiChat';
import HoldingSheet from './HoldingSheet';

export default function Layout() {
  const { sheet, draft, setDraft, closeSheet, confirmSheet } = useApp();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useEffect(() => { if (mainRef.current) mainRef.current.inert = sheet; }, [sheet]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  // AI 플로팅 버튼은 메인과 사용처 찾기 목록(온라인/오프라인)에서만 보여준다.
  const showAi = pathname === '/' || pathname.startsWith('/browse/');
  return <div className="phone-shell">
    <main ref={mainRef}><Outlet /></main>
    {showAi && <AiChat />}
    {sheet && <HoldingSheet draft={draft} setDraft={setDraft} onClose={closeSheet} onConfirm={confirmSheet} />}
  </div>;
}
