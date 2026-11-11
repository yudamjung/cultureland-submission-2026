const CL = 'https://www.cultureland.co.kr';

// 메인과 사용처 목록 하단의 안내. 배경색 블록으로 본문과 구분하고,
// 연락처·약관 링크는 컬쳐랜드 공식 페이지로 연결한다.
export default function AppFooter() {
  return <footer className="app-footer">
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
