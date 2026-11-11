import { useEffect, useRef } from 'react';

const CL = 'https://www.cultureland.co.kr';

// 메인과 사용처 목록 하단의 안내. 배경색 블록으로 본문과 구분하고,
// 연락처·약관 링크는 컬쳐랜드 공식 페이지로 연결한다.
export default function AppFooter() {
  const ref = useRef(null);
  // 사파리는 하단 주소창과 오버스크롤 영역을 html 배경색으로 칠한다.
  // 맨 아래까지 내려 푸터가 화면 바닥에 닿으면 html 배경을 푸터 색으로 맞춰 색이 떠 보이지 않게 한다.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      root.style.backgroundColor = el.getBoundingClientRect().bottom <= window.innerHeight + 1 ? 'var(--color-surface-navy-300)' : '';
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      root.style.backgroundColor = '';
    };
  }, []);
  return <footer className="app-footer" ref={ref}>
    <div className="footer-contact">
      <strong>고객센터 <a href="tel:15772111">1577-2111</a></strong>
      <ul>
        <li>평일 08:00 - 17:00</li>
        <li>점심시간 12:00 - 13:00</li>
        <li><a href="mailto:help@cultureland.co.kr">help@cultureland.co.kr</a></li>
      </ul>
    </div>
    <nav className="footer-links" aria-label="컬쳐랜드 공식 링크">
      <a href={CL} target="_blank" rel="noopener noreferrer">컬쳐랜드 공식 사이트</a>
      <a href={`${CL}/etc/policyService.do`} target="_blank" rel="noopener noreferrer">이용약관</a>
      <a href={`${CL}/etc/policyPrivacy.do`} target="_blank" rel="noopener noreferrer">개인정보 처리방침</a>
    </nav>
    <div className="footer-notice">
      <p>사용처의 결제 수단·수수료·한도는 바뀔 수 있어요. 결제 전에 사용처나 컬쳐랜드 공식 페이지에서 한 번 더 확인해 주세요.</p>
      <p>답변과 안내는 참고용이에요. 환불·분쟁처럼 중요한 문제는 컬쳐랜드 고객센터에 문의해 주세요.</p>
    </div>
  </footer>;
}
