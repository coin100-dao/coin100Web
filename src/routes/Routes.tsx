// src/routes/Routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import ICO from '../pages/ICO';
import FAQPage from '../pages/FAQPage';
import Dashboard from '../pages/Dashboard';

const AppRoutes: React.FC = () => {
  const routes = [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/ico',
      element: <ICO />,
    },
    {
      path: '/faq',
      element: <FAQPage />,
    },
    {
      path: '/dashboard',
      element: <Dashboard />,
    },
  ];

  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
