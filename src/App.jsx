import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AiPage from './pages/AiPage';
import BrowsePage from './pages/BrowsePage';
import GuidePage from './pages/GuidePage';
import NoInfoPage from './pages/NoInfoPage';
import ResultPage from './pages/ResultPage';
import SearchPage from './pages/SearchPage';

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<SearchPage />} />
      <Route path="ai" element={<AiPage />} />
      <Route path="browse/:mode" element={<BrowsePage />} />
      <Route path="place/:id" element={<ResultPage />} />
      <Route path="place/:id/guide" element={<GuidePage />} />
      <Route path="place/:id/noinfo" element={<NoInfoPage />} />
      <Route path="noinfo" element={<NoInfoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
