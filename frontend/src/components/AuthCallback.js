import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = new URLSearchParams(hash.substring(1)).get("session_id");

      if (!sessionId) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const { data: user } = await authAPI.exchangeSession(sessionId);
        window.location.hash = "";
        navigate("/dashboard", { replace: true, state: { user } });
      } catch {
        navigate("/", { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#0033FF] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#6B7280]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Authenticating...
        </p>
      </div>
    </div>
  );
}
