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
  // 사파리는 상단 상태바와 하단 주소창, 오버스크롤 영역을 html 배경색으로 칠한다.
  // 맨 위에서는 흰색 헤더 색, 푸터가 화면 바닥에 닿으면 푸터 색으로 맞춰 색이 떠 보이지 않게 한다.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const footer = document.querySelector('.app-footer');
      if (footer && footer.getBoundingClientRect().bottom <= window.innerHeight + 1) root.style.backgroundColor = 'var(--color-surface-navy-300)';
      else if (window.scrollY <= 0) root.style.backgroundColor = '#fff';
      else root.style.backgroundColor = '';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      root.style.backgroundColor = '';
    };
  }, [pathname]);
  // AI 플로팅 버튼은 메인과 사용처 찾기 목록(온라인/오프라인)에서만 보여준다.
  const showAi = pathname === '/' || pathname.startsWith('/browse/');
  return <div className="phone-shell">
    <main ref={mainRef}><Outlet /></main>
    {showAi && <AiChat />}
    {sheet && <HoldingSheet draft={draft} setDraft={setDraft} onClose={closeSheet} onConfirm={confirmSheet} />}
  </div>;
}
