import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AiPage from './pages/AiPage';
import BrowsePage from './pages/BrowsePage';
import CouponPage from './pages/CouponPage';
import GuidePage from './pages/GuidePage';
import MethodPage from './pages/MethodPage';
import NoInfoPage from './pages/NoInfoPage';
import ResultPage from './pages/ResultPage';
import SearchPage from './pages/SearchPage';
import TypesPage from './pages/TypesPage';

export default function App() {
  return <Routes>
    <Route element={<Layout />}>
      <Route index element={<SearchPage />} />
      <Route path="ai" element={<AiPage />} />
      <Route path="browse/:mode" element={<BrowsePage />} />
      <Route path="place/:id" element={<ResultPage />} />
      <Route path="place/:id/guide" element={<GuidePage />} />
      <Route path="place/:id/methods" element={<MethodPage />} />
      <Route path="place/:id/coupon" element={<CouponPage />} />
      <Route path="place/:id/types" element={<TypesPage />} />
      <Route path="place/:id/types/:typeId" element={<ResultPage />} />
      <Route path="place/:id/types/:typeId/guide" element={<GuidePage />} />
      <Route path="place/:id/types/:typeId/coupon" element={<CouponPage />} />
      <Route path="place/:id/noinfo" element={<NoInfoPage />} />
      <Route path="noinfo" element={<NoInfoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>;
}
