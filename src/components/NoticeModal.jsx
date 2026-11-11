import { useEffect, useRef } from 'react';

// 사용 순서에 들어갈 때 한 번 보여 주는 확인 모달.
export default function NoticeModal({ notes, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return <div className="sheet-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="sheet notice-modal" role="dialog" aria-modal="true" aria-labelledby="notice-title" tabIndex={-1} ref={ref}>
      <div className="sheet-handle" />
      <h2 id="notice-title">시작하기 전에 확인하세요</h2>
      <ul>{notes.map((note) => <li key={note}>{note}</li>)}</ul>
      <button className="primary-button confirm" onClick={onClose}>확인했어요</button>
    </section>
  </div>;
}
