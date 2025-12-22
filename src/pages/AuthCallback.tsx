import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        const fullUrl = window.location.href;
        const hash = window.location.hash;
        const search = window.location.search;

        console.log('=== AUTH CALLBACK DEBUG ===');
        console.log('Full URL:', fullUrl);
        console.log('Hash:', hash);
        console.log('Search:', search);

        // Check if we have the code in the URL (OAuth callback)
        const hashParams = new URLSearchParams(hash.substring(1));
        const queryParams = new URLSearchParams(search);

        const code = queryParams.get('code');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorCode = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');

        console.log('Parsed params:');
        console.log('- code:', code);
        console.log('- access_token:', accessToken ? 'YES' : 'NO');
        console.log('- refresh_token:', refreshToken ? 'YES' : 'NO');
        console.log('- error:', errorCode);
        console.log('- error_description:', errorDescription);

        // Check for OAuth errors
        if (errorCode) {
          throw new Error(errorDescription || errorCode);
        }

        // If we have a code, exchange it for a session (PKCE flow)
        if (code) {
          console.log('✓ Found code, exchanging for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          console.log('Exchange result:', { data: !!data.session, error: exchangeError });

          if (exchangeError) {
            console.error("Exchange error:", exchangeError);
            throw exchangeError;
          }

          if (data.session) {
            console.log("✓ Session created successfully!");
            console.log("User email:", data.session.user.email);
            console.log("User ID:", data.session.user.id);

            toast.success("Successfully authenticated!");

            // Wait for database trigger to create profile
            console.log('Waiting for profile creation...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Navigating to onboarding...');
            navigate("/onboarding");
            return;
          }
        }

        // If we have tokens in the hash (implicit flow - shouldn't happen with PKCE)
        if (accessToken) {
          console.log('✓ Found access token in hash, setting session...');
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            throw sessionError;
          }

          if (data.session) {
            console.log("✓ Session set successfully!");
            toast.success("Successfully authenticated!");

            await new Promise(resolve => setTimeout(resolve, 2000));
            navigate("/onboarding");
            return;
          }
        }

        // Try to get existing session as fallback
        console.log('Checking for existing session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (sessionData.session) {
          console.log("✓ Found existing session!");
          console.log("User email:", sessionData.session.user.email);
          toast.success("Successfully authenticated!");
          navigate("/onboarding");
          return;
        }

        // No session found
        console.error('✗ No session found after all attempts');
        console.error('URL had no code and no access_token');
        throw new Error("No authentication data received. Please try again.");

      } catch (err: any) {
        console.error("✗ Callback error:", err);
        setError(err.message || "Authentication failed");
        toast.error("Authentication failed: " + (err.message || "Unknown error"));

        // Don't redirect immediately in case user wants to see the error
        setTimeout(() => {
          console.log('Redirecting to login...');
          navigate("/login");
        }, 5000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <div className="mb-4 inline-block h-12 w-12 rounded-full border-4 border-destructive"></div>
            <p className="mb-2 text-lg font-semibold text-destructive">Authentication failed</p>
            <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-left">
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Check the browser console (F12) for more details.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Redirecting to login in 5 seconds...
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-white"
            >
              Go to Login Now
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg font-semibold text-muted-foreground">
              Completing authentication...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Processing your Google login
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              This may take a few seconds
            </p>
          </>
        )}
      </div>
    </div>
  );
}
