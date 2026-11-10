import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { browseTabs, holdings } from '../data';
import { readSession } from '../lib/utils';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// 페이지를 오가도 유지돼야 하는 상태(가진 수단, 바텀시트, 사용처 조회 필터, AI 대화)만 둔다.
export function AppProvider({ children }) {
  const [holding, setHolding] = useState(() => { const saved = readSession('cultureland-holding', null); return holdings[saved] ? saved : null; });
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState('voucher');

  const [category, setCategory] = useState('금융');
  const [subCategory, setSubCategory] = useState('전체');
  const [expanded, setExpanded] = useState(false);
  const [browseQuery, setBrowseQuery] = useState('');

  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState([]);

  useEffect(() => {
    if (holding) sessionStorage.setItem('cultureland-holding', JSON.stringify(holding));
  }, [holding]);

  const openSheet = useCallback((current) => { setDraft(current || 'voucher'); setSheet(true); }, []);
  const closeSheet = useCallback(() => setSheet(false), []);
  const confirmSheet = useCallback(() => { setHolding(draft); setSheet(false); }, [draft]);
  const resetBrowse = useCallback((mode) => { setCategory(browseTabs[mode][0]); setSubCategory('전체'); setBrowseQuery(''); setExpanded(false); }, []);

  const value = useMemo(() => ({
    holding, setHolding, sheet, draft, setDraft, openSheet, closeSheet, confirmSheet,
    category, setCategory, subCategory, setSubCategory, expanded, setExpanded, browseQuery, setBrowseQuery, resetBrowse,
    aiQuery, setAiQuery, aiMessages, setAiMessages,
  }), [holding, sheet, draft, openSheet, closeSheet, confirmSheet, category, subCategory, expanded, browseQuery, resetBrowse, aiQuery, aiMessages]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
