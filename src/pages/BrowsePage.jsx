import { Navigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { browseMatches, browseSubtabs, browseTabs, places, taskLabels } from '../data';
import { useApp } from '../context/AppContext';
import { useGoBack, useOpenPlace } from '../hooks/useNav';
import { ASSET } from '../lib/constants';

// 사용처 조회 페이지. 카테고리 알약·온라인/오프라인 필터는 목록과 함께 여기에 있다.
export default function BrowsePage() {
  const { mode } = useParams();
  const { category: savedCategory, setCategory, subCategory: savedSubCategory, setSubCategory, expanded, setExpanded, browseQuery: query, setBrowseQuery: setQuery } = useApp();
  const goBack = useGoBack('/');
  const openPlace = useOpenPlace();
  if (!browseTabs[mode]) return <Navigate to="/" replace />;

  const where = mode;
  // 주소로 바로 들어왔을 때 저장된 카테고리가 이 모드에 없을 수 있다.
  const category = browseTabs[where].includes(savedCategory) ? savedCategory : browseTabs[where][0];
  const subCategory = (browseSubtabs[category] || ['전체']).includes(savedSubCategory) ? savedSubCategory : '전체';
  const visible = places.filter((p) =>
    (where === 'store' ? p.offline === 'yes' : p.online === 'yes') &&
    browseMatches(p, category, subCategory)
  );
  const filtered = query.trim() ? visible.filter((place) => place.name.toLowerCase().includes(query.trim().toLowerCase())) : visible;
  const list = expanded ? filtered : filtered.slice(0, 9);
  const empty = '이 카테고리에는 조건에 맞는 곳이 없어요. 다른 카테고리를 골라 보세요.';

  return <>
    <Header title={`${where === 'store' ? '오프라인' : '온라인'} 사용처 찾기`} back onBack={goBack} />
    <div className="search-body browse-body">
      <div className="browse-tabs" aria-label="사용처 카테고리">
        {browseTabs[where].map((cat) => <button key={cat} aria-pressed={category === cat} className={category === cat ? 'active' : ''} onClick={() => { setCategory(cat); setSubCategory('전체'); setExpanded(false); }}>{cat}</button>)}
      </div>
      <div className="browse-subtabs" aria-label="세부 카테고리">
        {(browseSubtabs[category] || ['전체']).map((sub) => <button key={sub} aria-pressed={subCategory === sub} className={subCategory === sub ? 'active' : ''} onClick={() => { setSubCategory(sub); setExpanded(false); }}>{sub}</button>)}
      </div>
      <div className="browse-topline"><h2>브랜드 <span>{filtered.length}곳</span></h2><label className="browse-search"><span className="sr-only">브랜드 검색</span><input value={query} onChange={(event) => { setQuery(event.target.value); setExpanded(false); }} placeholder="예: CGV" /><img src={`${ASSET}figma-browse-online-search.svg`} alt="" /></label></div>
      {filtered.length ? <div className="tiles">{list.map((p) => <button className="tile" key={p.id} onClick={() => openPlace(p)}>
        <span className={`logo-placeholder ${p.logoOnDark ? 'logo-on-dark' : ''}`}><img src={p.logo} alt="" /></span><strong>{p.name}</strong><span className="task-badge">{taskLabels[p.type]}</span><small>{p.fee || p.limit || (p.status === 'listed' ? '상세 미확인' : p.status === 'partial' ? '일부 조건 미확인' : where === 'store' ? '오프라인' : '온라인')}</small>
      </button>)}</div> : <p className="empty-results">{empty}</p>}
      {!expanded && filtered.length > 9 && <button className="show-all" onClick={() => setExpanded(true)}>전체 {filtered.length}곳 보기</button>}
      {expanded && filtered.length > 9 && <button className="show-all" onClick={() => setExpanded(false)}>접기</button>}
      <p className="search-footnote">온라인 {places.filter((p) => p.offline !== 'yes').length}개 + 오프라인 {places.filter((p) => p.offline === 'yes').length}개 · 총 {places.length}곳 · 2026.11.09</p>
    </div>
  </>;
}
