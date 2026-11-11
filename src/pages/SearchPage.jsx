import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { places } from '../data';
import { POPULAR, POPULAR_TABS } from '../popular.js';
import { useApp } from '../context/AppContext';
import AppFooter from '../components/AppFooter';
import { useOpenPlace } from '../hooks/useNav';
import { ASSET, URLS } from '../lib/constants';

const byId = new Map(places.map((p) => [p.id, p]));

export default function SearchPage() {
  const navigate = useNavigate();
  const openPlace = useOpenPlace();
  const { resetBrowse } = useApp();
  const [popularTab, setPopularTab] = useState('쇼핑');
  const popularItems = POPULAR[popularTab].map((item) => ({ ...item, place: byId.get(item.id) })).filter((item) => item.place);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setPopularTab((current) => POPULAR_TABS[(POPULAR_TABS.indexOf(current) + 1) % POPULAR_TABS.length]), 2000);
    return () => window.clearInterval(timer);
  }, []);

  const goBrowse = (mode) => { resetBrowse(mode); navigate(`/browse/${mode}`); };

  return <>
    <Header title="사용처 찾기" />
    <div className="search-body landing-body">
      <section className="hero">
        <div><h1>상품권,<br />어디서 쓰실 건가요?</h1></div>
        <div className="hero-character"><img src={`${ASSET}figma-hero-character.png`} alt="컬쳐랜드 캐릭터" /></div>
      </section>
      <h2 className="section-title">컬쳐랜드 인기 사용처</h2>
      <div className="popular-showcase">
        <div className="popular-tabs" aria-label="인기 사용처 카테고리">
          {POPULAR_TABS.map((tab) => <button key={tab} className={`popular-tab ${popularTab === tab ? 'active' : ''}`} aria-pressed={popularTab === tab} onClick={() => setPopularTab(tab)}>{tab}</button>)}
        </div>
        <div className="popular-grid" key={popularTab}>
          {popularItems.map(({ id, label, place }) => <button className="popular-cell" key={id} onClick={() => openPlace(place)}>
            <span className={`popular-logo ${place.logoOnDark ? 'logo-on-dark' : ''}`}><img src={place.logo} alt="" /></span><strong>{label}</strong>
          </button>)}
        </div>
        <img className="popular-mascots" src={`${ASSET}figma-popular-mascots.png`} alt="" />
      </div>
      <h2 className="section-title destinations-title">전체 사용처 바로가기</h2>
      <div className="landing-destinations">
        <button onClick={() => goBrowse('online')}>온라인 사용처</button>
        <button onClick={() => goBrowse('store')}>오프라인 사용처</button>
      </div>
      <h2 className="section-title family-title">컬쳐랜드 바로가기</h2>
      <div className="family-sites">
        <a href={URLS.cmall} target="_blank" rel="noopener noreferrer"><span className="family-logo"><img src={places.find((p) => p.id === 'culturemall')?.logo} alt="" /></span><span>컬쳐랜드 Cmall</span></a>
        <a href={URLS.culturelandMobile} target="_blank" rel="noopener noreferrer"><span className="family-logo"><img src={`${ASSET}figma-cultureland-logo.svg`} alt="" /></span><span>컬쳐랜드</span></a>
        <a href={URLS.voucherUsage} target="_blank" rel="noopener noreferrer"><span className="family-logo"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8.5V6.2c0-.7.6-1.2 1.2-1.2h13.6c.7 0 1.2.5 1.2 1.2v2.3a2.5 2.5 0 0 0 0 5v2.3c0 .7-.5 1.2-1.2 1.2H5.2c-.6 0-1.2-.5-1.2-1.2v-2.3a2.5 2.5 0 0 0 0-5Z" transform="translate(0 -.5)" /><circle cx="11" cy="11.5" r="2.6" /><path d="m13 13.5 2 2" /></svg></span><span>상품권 사용조회</span></a>
      </div>
    </div>
    <AppFooter />
  </>;
}
