import { supabase } from "@/lib/supabase";

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  primary?: boolean;
  accessRole?: string;
}

interface GoogleEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: string;
  created?: string;
  updated?: string;
  recurringEventId?: string;
  recurrence?: string[];
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: string;
  }[];
}

/**
 * Get access token for the current user
 *
 * IMPORTANT: Supabase does not expose Google's provider token through the standard session API.
 * We use a Supabase Edge Function that accesses the Admin API to retrieve the real Google OAuth token.
 */
async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  console.log("Fetching Google token from Edge Function for user:", session.user.id);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-google-token`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));

      if (response.status === 404) {
        throw new Error("No Google account connected. Please complete the onboarding process or reconnect your Google Calendar.");
      }

      throw new Error(error.error || `Edge Function error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Edge Function response:", responseData);

    const { access_token, refresh_token, expires_at } = responseData;

    if (!access_token) {
      console.error("Edge Function response missing access_token:", responseData);
      throw new Error("Edge Function did not return an access token");
    }

    console.log("✓ Google token retrieved from Edge Function");
    console.log("- Token length:", access_token.length);
    console.log("- Token prefix:", access_token.substring(0, 20));
    console.log("- Looks like Google token?", access_token.startsWith('ya29.'));

    // Note: Token caching removed - Edge Function is the source of truth
    return access_token;
  } catch (error: any) {
    console.error("Failed to get Google token from Edge Function:", error);

    // If Edge Function fails, try to get token from database as fallback
    console.log("Attempting fallback: fetching from connected_accounts...");
    const { data: accounts, error: dbError } = await supabase
      .from("connected_accounts")
      .select("access_token, refresh_token, expires_at")
      .eq("user_id", session.user.id)
      .eq("provider", "google")
      .maybeSingle();

    if (dbError || !accounts?.access_token) {
      throw new Error(`Failed to retrieve Google Calendar token: ${error.message}`);
    }

    // Check if token is expired and refresh if needed
    if (accounts.expires_at && accounts.refresh_token) {
      const expiresAt = new Date(accounts.expires_at);
      const now = new Date();

      if (now >= expiresAt) {
        console.log("Cached token expired, refreshing...");

        try {
          const { access_token, expires_in } = await refreshGoogleToken(accounts.refresh_token);

          // Update the database with new token
          const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
          await supabase.from('connected_accounts').update({
            access_token,
            expires_at: newExpiresAt,
          }).eq('user_id', session.user.id).eq('provider', 'google');

          console.log("✓ Token refreshed and updated in database");
          return access_token;
        } catch (refreshError: any) {
          throw new Error(
            `Access token expired and refresh failed: ${refreshError.message}. Please log out and log in again.`
          );
        }
      }
    }

    console.log("✓ Using cached token from database");
    return accounts.access_token;
  }
}

/**
 * Refresh Google OAuth token using refresh_token
 */
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  console.log("Refreshing Google OAuth token...");

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error_description || `Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("✓ Token refreshed successfully");

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
    };
  } catch (error: any) {
    console.error("Failed to refresh token:", error);
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}

/**
 * Make authenticated request to Google Calendar API
 */
async function makeGoogleCalendarRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Google Calendar API error: ${response.status}`
    );
  }

  return response.json();
}

/**
 * Fetch all calendars from Google Calendar
 */
export async function fetchGoogleCalendars(): Promise<GoogleCalendar[]> {
  const data = await makeGoogleCalendarRequest("/users/me/calendarList");
  return data.items || [];
}

/**
 * Fetch events from a specific Google Calendar
 */
export async function fetchGoogleEvents(
  calendarId: string = "primary",
  options: {
    timeMin?: string;
    timeMax?: string;
    maxResults?: number;
    singleEvents?: boolean;
    orderBy?: string;
  } = {}
): Promise<GoogleEvent[]> {
  const params = new URLSearchParams({
    calendarId,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
    ...options,
  } as any);

  const data = await makeGoogleCalendarRequest(
    `/calendars/${encodeURIComponent(calendarId)}/events?${params}`
  );

  return data.items || [];
}

/**
 * Create an event in Google Calendar
 */
export async function createGoogleEvent(
  event: {
    summary: string;
    description?: string;
    location?: string;
    start: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    end: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    attendees?: { email: string }[];
    recurrence?: string[];
  },
  calendarId: string = "primary"
): Promise<GoogleEvent> {
  return makeGoogleCalendarRequest(
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      body: JSON.stringify(event),
    }
  );
}

/**
 * Update an event in Google Calendar
 */
export async function updateGoogleEvent(
  eventId: string,
  event: Partial<{
    summary: string;
    description?: string;
    location?: string;
    start: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    end: {
      dateTime?: string;
      date?: string;
      timeZone?: string;
    };
    attendees?: { email: string }[];
    status?: string;
  }>,
  calendarId: string = "primary"
): Promise<GoogleEvent> {
  return makeGoogleCalendarRequest(
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
      eventId
    )}`,
    {
      method: "PATCH",
      body: JSON.stringify(event),
    }
  );
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteGoogleEvent(
  eventId: string,
  calendarId: string = "primary"
): Promise<void> {
  await makeGoogleCalendarRequest(
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(
      eventId
    )}`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Watch for changes to a calendar (push notifications)
 */
export async function watchCalendar(
  calendarId: string = "primary",
  webhookUrl: string
): Promise<any> {
  return makeGoogleCalendarRequest(
    `/calendars/${encodeURIComponent(calendarId)}/events/watch`,
    {
      method: "POST",
      body: JSON.stringify({
        id: `calendar-${calendarId}-${Date.now()}`,
        type: "web_hook",
        address: webhookUrl,
      }),
    }
  );
}
