/**
 * Direct Google OAuth for Calendar Access
 *
 * This is separate from Supabase's Google OAuth which is used for authentication.
 * This flow specifically requests calendar permissions and stores the resulting tokens.
 */

const GOOGLE_OAUTH_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/google-calendar-callback`;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
].join(' ');

/**
 * Initiate Google OAuth flow for Calendar access
 */
export function initiateGoogleCalendarAuth(): void {
  // Generate random state for CSRF protection
  const state = generateRandomString(32);
  sessionStorage.setItem('google_oauth_state', state);

  // Build OAuth URL
  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent screen to get refresh token
    state: state,
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Redirect to Google OAuth
  window.location.href = authUrl;
}

/**
 * Handle OAuth callback and exchange code for tokens
 */
export async function handleGoogleCalendarCallback(
  code: string,
  state: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  // Verify state to prevent CSRF
  const savedState = sessionStorage.getItem('google_oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }
  sessionStorage.removeItem('google_oauth_state');

  // Exchange code for tokens
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error_description || 'Failed to exchange authorization code');
  }

  const data = await response.json();

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

/**
 * Generate random string for state parameter
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}
