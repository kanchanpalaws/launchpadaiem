import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Zap, Menu, X, LogOut } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";

  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50" data-testid="navbar" style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", background: "rgba(255,255,255,0.72)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 no-underline" data-testid="nav-logo">
          <div className="w-8 h-8 bg-[#0033FF] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[#0A0A0A]" style={{ fontFamily: "Outfit, sans-serif" }}>
            LaunchPad AI
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {isLanding && (
            <>
              <a href="#features" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors no-underline">Features</a>
              <a href="#pricing" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors no-underline">Pricing</a>
              <a href="#faq" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors no-underline">FAQ</a>
            </>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors no-underline"
                data-testid="nav-dashboard"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                {user.picture && (
                  <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
                )}
                <span className="text-sm font-medium text-[#0A0A0A]">{user.name?.split(" ")[0]}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-gray-100 transition-colors"
                data-testid="nav-logout"
              >
                <LogOut className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="btn-primary px-5 py-2 text-sm"
              data-testid="nav-login-btn"
            >
              Get Started
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="nav-mobile-menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-6 py-4 animate-fade-in">
          {isLanding && (
            <div className="flex flex-col gap-3 mb-4">
              <a href="#features" className="text-sm text-[#6B7280] no-underline" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-sm text-[#6B7280] no-underline" onClick={() => setMenuOpen(false)}>Pricing</a>
              <a href="#faq" className="text-sm text-[#6B7280] no-underline" onClick={() => setMenuOpen(false)}>FAQ</a>
            </div>
          )}
          {user ? (
            <div className="flex flex-col gap-3">
              <Link to="/dashboard" className="text-sm text-[#0A0A0A] no-underline" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={onLogout} className="text-sm text-[#6B7280] text-left" data-testid="nav-mobile-logout">Logout</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="btn-primary w-full py-2 text-sm" data-testid="nav-mobile-login">
              Get Started
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
