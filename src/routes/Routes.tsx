// src/routes/Routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import PublicSale from '../pages/PublicSale';
import FAQPage from '../pages/FAQPage';
import Dashboard from '../pages/Dashboard';
import Whitepaper from '../pages/Whitepaper';

const AppRoutes: React.FC = () => {
  const routes = [
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/sale',
      element: <PublicSale />,
    },
    {
      path: '/faq',
      element: <FAQPage />,
    },
    {
      path: '/dashboard',
      element: <Dashboard />,
    },
    {
      path: '/whitepaper',
      element: <Whitepaper />,
    },
    {
      path: '/whitepaper/c100.md',
      element: (
        <Navigate
          to="https://raw.githubusercontent.com/coin100-dao/.github/main/profile/README.md"
          replace
        />
      ),
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
