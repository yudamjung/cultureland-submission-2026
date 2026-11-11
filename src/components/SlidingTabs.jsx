import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import FadeScroll from './FadeScroll';

// 선택된 탭 아래 밑줄이 하나의 막대로 미끄러져 이동하는 탭 목록.
export default function SlidingTabs({ tabs, active, onSelect, label }) {
  const listRef = useRef(null);
  const [bar, setBar] = useState(null);
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[aria-pressed="true"]');
    if (!el) return;
    setBar({ x: el.offsetLeft, w: el.offsetWidth });
    // 선택한 탭이 가려져 있으면 가운데로 부드럽게 스크롤한다.
    list.scrollTo({ left: el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2, behavior: animate ? 'smooth' : 'auto' });
  }, [active, tabs]);
  // 첫 그리기에서는 막대가 0에서 날아오지 않도록 transition을 한 프레임 늦게 켠다.
  useEffect(() => { const id = requestAnimationFrame(() => setAnimate(true)); return () => cancelAnimationFrame(id); }, []);

  return <FadeScroll className="browse-tabs" label={label} listRef={listRef}>
    {tabs.map((tab) => <button key={tab} aria-pressed={active === tab} className={active === tab ? 'active' : ''} onClick={() => onSelect(tab)}>{tab}</button>)}
    {bar && <span className={`tab-indicator ${animate ? 'animate' : ''}`} style={{ transform: `translateX(${bar.x}px)`, width: bar.w }} aria-hidden="true" />}
  </FadeScroll>;
}
