// src/routes/Routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Dashboard from '../pages/Dashboard';
import Signup from '../pages/Signup';
import Signin from '../pages/Signin';
import { useAppSelector } from '../store/hooks';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// ProtectedRoute Component with Loading State
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

// PublicRoute Component with Loading State
const PublicRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { token, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Route: Redirect to Dashboard if Authenticated, else Home */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />

      {/* Home page: Public Route */}
      <Route path="/" element={<Home />} />

      {/* About Page: Public Route */}
      <Route path="/about" element={<About />} />

      {/* Dashboard: Protected Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Signup: Public Route */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Signin: Public Route */}
      <Route
        path="/signin"
        element={
          <PublicRoute>
            <Signin />
          </PublicRoute>
        }
      />

      {/* Fallback Route: Redirect to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
