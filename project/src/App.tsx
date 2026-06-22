import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext as useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProfilePage from './components/ProfilePage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean; allowBoth?: boolean }> = ({ children, requireAdmin = false, allowBoth = false }) => {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) return <Navigate to="/" replace />;
  if (allowBoth) return <>{children}</>;
  if (requireAdmin && !authState.isAdmin) return <Navigate to="/student-dashboard" replace />;
  if (!requireAdmin && authState.isAdmin) return <Navigate to="/admin-dashboard" replace />;

  return <>{children}</>;
};

const RedirectIfLoggedIn: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  if (authState.isAuthenticated && authState.isAdmin) return <Navigate to="/admin-dashboard" replace />;
  if (authState.isAuthenticated && !authState.isAdmin) return <Navigate to="/student-dashboard" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectIfLoggedIn><LoginPage /></RedirectIfLoggedIn>} />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowBoth>
              <ProfilePage onBack={() => window.history.back()} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
