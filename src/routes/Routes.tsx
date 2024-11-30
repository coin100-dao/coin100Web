// src/routes/Routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';

const AppRoutes: React.FC = () => {
  return (
    <Routes>

      {/* Home page: Public Route */}
      <Route path="/" element={<Home />} />

      {/* About Page: Public Route */}
      <Route path="/about" element={<About />} />

      {/* Fallback Route: Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
