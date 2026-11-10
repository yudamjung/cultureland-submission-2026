import { useEffect, useRef } from 'react';
import { holdings } from '../data';
import { ASSET } from '../lib/constants';

export default function HoldingSheet({ draft, setDraft, onClose, onConfirm }) {
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
