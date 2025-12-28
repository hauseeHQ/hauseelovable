import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => navigate("/signin", { replace: true }), 3000);
          return;
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("Error exchanging code:", exchangeError);
            setError(exchangeError.message);
            setTimeout(() => navigate("/signin", { replace: true }), 3000);
            return;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          setError(sessionError.message);
          setTimeout(() => navigate("/signin", { replace: true }), 3000);
          return;
        }

        if (data.session) {
          const returnTo = location.state?.returnTo || url.searchParams.get("returnTo") || "/plan";
          navigate(returnTo, { replace: true });
        } else {
          console.warn("No session found after auth callback");
          setTimeout(() => navigate("/signin", { replace: true }), 2000);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setTimeout(() => navigate("/signin", { replace: true }), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {error ? (
          <div className="space-y-3">
            <div className="text-red-600 text-lg font-medium">Authentication Error</div>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to sign in...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-gray-700">Signing you in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
