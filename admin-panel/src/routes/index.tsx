import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Requests from '../pages/Requests';
import Logs from '../pages/Logs';
import Images from '../pages/Images';
import Gallery from '../pages/Gallery';
import Settings from '../pages/Settings';
import Layout from '../components/Layout';
import { ReactNode } from 'react';
import MediaPage from '../pages/MediaPage';
import TestSelectorPage from '../pages/TestSelectorPage';

// Компонент для защищенных маршрутов
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Загрузка...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <Routes>
      <Route path="/admin/login" element={
        isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="requests" element={<Requests />} />
        <Route path="logs" element={<Logs />} />
        <Route path="images" element={<Images />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="test-selector" element={<TestSelectorPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AppRoutes; 