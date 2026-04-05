import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import AuthCallback from "@/components/AuthCallback";
import Navbar from "@/components/Navbar";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Wizard from "@/pages/Wizard";
import Preview from "@/pages/Preview";
import MediaGen from "@/pages/MediaGen";
import Publish from "@/pages/Publish";
import { authAPI } from "@/lib/api";

function ProtectedRoute({ user, loading, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user && !location.state?.user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-[#0033FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user && !location.state?.user) return null;
  return children;
}

function AppRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthCallback, setShowAuthCallback] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check for session_id synchronously during render
  const hasSessionId = location.hash?.includes("session_id=");

  const checkAuth = useCallback(async () => {
    // CRITICAL: If returning from OAuth callback, skip the /me check.
    // AuthCallback will exchange the session_id and establish the session first.
    if (window.location.hash?.includes("session_id=")) {
      setShowAuthCallback(true);
      setLoading(false);
      return;
    }
    try {
      const { data } = await authAPI.getMe();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch { /* ignore */ }
    setUser(null);
    navigate("/", { replace: true });
  };

  // Show AuthCallback if session_id detected
  if (hasSessionId || showAuthCallback) {
    return <AuthCallback />;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="pt-16">
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Dashboard user={user} setUser={setUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wizard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Wizard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wizard/:projectId"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Wizard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preview/:projectId"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Preview user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/media/:projectId"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <MediaGen user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/publish/:projectId"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Publish user={user} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
