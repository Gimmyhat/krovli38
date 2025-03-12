import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../pages/Dashboard';
import Images from '../pages/Images';
import Gallery from '../pages/Gallery';
import Settings from '../pages/Settings';
import Layout from '../components/Layout';
import MediaPage from '../pages/MediaPage';
import TestSelectorPage from '../pages/TestSelectorPage';
import Login from '../pages/Login';
import Requests from '../pages/Requests';
import Logs from '../pages/Logs';
import { ReactNode } from 'react';
import ContactsPage from '../pages/ContactsPage';
import NotFoundPage from '../pages/NotFoundPage';
import { TestSelectorPage as TestSelectorPageComponent } from '../pages/TestSelectorPage';
import Users from '../pages/Users';

// Компонент для защищенных маршрутов
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

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