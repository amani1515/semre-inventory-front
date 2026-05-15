import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import NewSalePage from './pages/NewSalePage';
import MySalesPage from './pages/MySalesPage';
import useAuthStore from './store/authStore';

function PrivateRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  return token ? children : <Navigate to="/login" replace />;
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/"          element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/products"  element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
        <Route path="/new-sale"  element={<PrivateRoute><NewSalePage /></PrivateRoute>} />
        <Route path="/my-sales"  element={<PrivateRoute><MySalesPage /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
