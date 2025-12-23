import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/stores/authStore';
import { handleGoogleCalendarCallback } from '@/lib/googleOAuth';
import { toast } from 'sonner';

export default function GoogleCalendarCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get code and state from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');

        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing code or state parameter');
        }

        if (!user) {
          throw new Error('Not authenticated. Please log in first.');
        }

        setStatus('processing');

        // Exchange code for tokens
        console.log('Exchanging authorization code for tokens...');
        const { access_token, refresh_token, expires_in } = await handleGoogleCalendarCallback(code, state);

        console.log('✓ Received Google OAuth tokens');
        console.log('- Access token length:', access_token.length);
        console.log('- Access token prefix:', access_token.substring(0, 20));
        console.log('- Has refresh token:', !!refresh_token);
        console.log('- Expires in:', expires_in, 'seconds');

        // Calculate expiration time
        const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

        // Save tokens to database
        console.log('Saving tokens to database...');
        const { error: saveError } = await supabase
          .from('connected_accounts')
          .upsert({
            user_id: user.id,
            provider: 'google',
            provider_account_id: user.id,
            access_token,
            refresh_token,
            expires_at: expiresAt,
            scope: 'calendar calendar.events',
            is_primary: true,
          }, {
            onConflict: 'user_id,provider'
          });

        if (saveError) {
          console.error('Failed to save tokens:', saveError);
          throw saveError;
        }

        console.log('✓ Tokens saved successfully');
        setStatus('success');
        toast.success('Google Calendar connected successfully!');

        // Redirect back to dashboard or onboarding
        setTimeout(() => {
          const returnTo = sessionStorage.getItem('google_calendar_return_to') || '/dashboard';
          sessionStorage.removeItem('google_calendar_return_to');
          navigate(returnTo);
        }, 1500);

      } catch (error: any) {
        console.error('Google Calendar callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Failed to connect Google Calendar');
        toast.error('Failed to connect Google Calendar');

        // Redirect back after showing error
        setTimeout(() => {
          const returnTo = sessionStorage.getItem('google_calendar_return_to') || '/dashboard';
          sessionStorage.removeItem('google_calendar_return_to');
          navigate(returnTo);
        }, 3000);
      }
    };

    processCallback();
  }, [navigate, user]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <h2 className="text-xl font-semibold">Connecting Google Calendar...</h2>
            <p className="mt-2 text-muted-foreground">Please wait while we set up your connection</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600 dark:text-green-400">Connected Successfully!</h2>
            <p className="mt-2 text-muted-foreground">Redirecting you back...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Connection Failed</h2>
            <p className="mt-2 text-muted-foreground">{errorMessage}</p>
            <p className="mt-1 text-sm text-muted-foreground">Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
}
