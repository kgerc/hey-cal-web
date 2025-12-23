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
        const providerToken = hashParams.get('provider_token');
        const providerRefreshToken = hashParams.get('provider_refresh_token');
        const errorCode = queryParams.get('error');
        const errorDescription = queryParams.get('error_description');

        console.log('Parsed params:');
        console.log('- code:', code);
        console.log('- access_token:', accessToken ? 'YES' : 'NO');
        console.log('- refresh_token:', refreshToken ? 'YES' : 'NO');
        console.log('- provider_token:', providerToken ? 'YES' : 'NO');
        console.log('- provider_refresh_token:', providerRefreshToken ? 'YES' : 'NO');
        console.log('- error:', errorCode);
        console.log('- error_description:', errorDescription);

        if (accessToken) {
          console.log('Access token details:');
          console.log('- Length:', accessToken.length);
          console.log('- First 20 chars:', accessToken.substring(0, 20));
          console.log('- Looks like JWT?', accessToken.includes('.'));
        }

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
            console.log("Provider token available:", !!data.session.provider_token);
            console.log("Provider refresh token available:", !!data.session.provider_refresh_token);

            // CRITICAL: Supabase session.provider_token is the Google OAuth token
            // This is ONLY available immediately after OAuth, we MUST save it now
            if (data.session.provider_token) {
              console.log('✓ Found provider_token (Google OAuth token)!');
              console.log('Saving Google OAuth tokens to connected_accounts...');
              console.log('Token details:');
              console.log('- Token length:', data.session.provider_token.length);
              console.log('- Token prefix:', data.session.provider_token.substring(0, 20));

              const { error: saveError } = await supabase
                .from('connected_accounts')
                .upsert({
                  user_id: data.session.user.id,
                  provider: 'google',
                  provider_account_id: data.session.user.id,
                  access_token: data.session.provider_token,
                  refresh_token: data.session.provider_refresh_token,
                  scope: 'calendar calendar.events',
                  is_primary: true,
                });

              if (saveError) {
                console.error('Failed to save OAuth tokens:', saveError);
                toast.warning("Logged in, but failed to save calendar connection");
              } else {
                console.log('✓ Google OAuth tokens saved successfully!');
              }
            } else {
              console.error('⚠⚠⚠ NO provider_token in session after code exchange!');
              console.error('This means we cannot access Google Calendar API');
              console.error('Session data:', Object.keys(data.session));
            }

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

            // Save Google OAuth tokens to connected_accounts table
            // IMPORTANT: Use provider_token (real Google token), not access_token (Supabase JWT)
            if (providerToken) {
              console.log('Saving REAL Google OAuth tokens to connected_accounts...');
              console.log('Provider token prefix:', providerToken.substring(0, 20));

              const { error: saveError } = await supabase
                .from('connected_accounts')
                .upsert({
                  user_id: data.session.user.id,
                  provider: 'google',
                  provider_account_id: data.session.user.id,
                  access_token: providerToken,  // Real Google token!
                  refresh_token: providerRefreshToken,
                  scope: 'calendar calendar.events',
                  is_primary: true,
                });

              if (saveError) {
                console.error('Failed to save OAuth tokens:', saveError);
                toast.warning("Logged in, but failed to save calendar connection");
              } else {
                console.log('✓ Google OAuth tokens saved successfully!');
              }
            } else {
              console.warn('⚠ No provider_token found in URL hash');
            }

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
