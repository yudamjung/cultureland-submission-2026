import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import HoldingSheet from './HoldingSheet';

export default function Layout() {
  const { sheet, draft, setDraft, closeSheet, confirmSheet } = useApp();
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  useEffect(() => { if (mainRef.current) mainRef.current.inert = sheet; }, [sheet]);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <div className="phone-shell">
    <main ref={mainRef}><Outlet /></main>
    {sheet && <HoldingSheet draft={draft} setDraft={setDraft} onClose={closeSheet} onConfirm={confirmSheet} />}
  </div>;
}
