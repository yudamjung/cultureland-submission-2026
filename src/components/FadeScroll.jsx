import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// 가로로 스크롤되는 목록. 더 볼 내용이 있는 쪽 끝을 흐리게 가려 준다.
export default function FadeScroll({ className, color = '#fff', label, listRef, children }) {
  const own = useRef(null);
  const ref = listRef || own;
  const [edge, setEdge] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setEdge((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, [ref]);

  useLayoutEffect(update);
  useEffect(() => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  return <div className="fade-wrap" data-left={edge.left} data-right={edge.right} style={{ '--fade-color': color }}>
    <div className={className} aria-label={label} ref={ref} onScroll={update}>{children}</div>
  </div>;
}
