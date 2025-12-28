import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ToastContainer';

import Dashboard from './components/Dashboard';
import NotFoundPage from './pages/NotFoundPage';
import HomeDetailPage from './pages/HomeDetailPage';

import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Default */}
          <Route path="/" element={<Navigate to="/plan" replace />} />

          {/* Public auth routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Main app routes - public browsing */}
          <Route path="/plan" element={<Dashboard />} />
          <Route path="/evaluate" element={<Dashboard />} />
          <Route path="/evaluate/:homeId" element={<HomeDetailPage />} />
          <Route path="/select" element={<Dashboard />} />
          <Route path="/guide" element={<Dashboard />} />
          <Route path="/ai" element={<Dashboard />} />

          {/* Settings route - requires login */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
