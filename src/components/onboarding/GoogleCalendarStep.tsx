import { useState, useEffect } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { initiateGoogleCalendarAuth } from "@/lib/googleOAuth";

interface GoogleCalendarStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onConnect: () => void;
}

export default function GoogleCalendarStep({
  onNext,
  onBack,
  onSkip,
}: GoogleCalendarStepProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if Google Calendar is already connected
    const checkConnection = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Check if we have Google Calendar tokens saved
          const { data: accounts } = await supabase
            .from('connected_accounts')
            .select('access_token')
            .eq('user_id', session.user.id)
            .eq('provider', 'google')
            .maybeSingle();

          if (accounts?.access_token) {
            console.log('Google Calendar already connected');
            setIsConnected(true);
          } else {
            console.log('Google Calendar not connected yet');
          }
        }
      } catch (error) {
        console.log('Error checking Google Calendar connection:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = () => {
    // Save return path for after OAuth callback
    sessionStorage.setItem('google_calendar_return_to', '/onboarding');

    // Initiate Google OAuth flow for Calendar access
    initiateGoogleCalendarAuth();
  };

  const handleContinue = () => {
    onNext();
  };

  if (isChecking) {
    return (
      <div className="text-center">
        <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="h-10 w-10 animate-pulse text-primary" />
        </div>
        <p className="text-lg text-muted-foreground">Checking Google Calendar connection...</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Calendar className="h-10 w-10 text-primary" />
      </div>

      <h2 className="mb-4 text-3xl font-bold">
        {isConnected ? "Google Calendar Connected!" : "Connect Google Calendar"}
      </h2>
      <p className="mb-8 text-lg text-muted-foreground">
        {isConnected
          ? "Your Google Calendar is already connected and ready to use."
          : "Connect your Google Calendar to enable two-way sync with your events."}
      </p>

      <div className="mb-8 rounded-lg border border-border bg-card p-6 text-left">
        <h3 className="mb-4 font-semibold">What you can do:</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Two-way sync with your Google Calendar</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Automatic event import and updates</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Send notifications to event attendees</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Track RSVPs and responses</span>
          </li>
        </ul>
      </div>

      {!isConnected ? (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex gap-3">
            <Calendar className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="text-left text-sm text-blue-800 dark:text-blue-200">
              <strong className="font-semibold">One more step!</strong> Click below to authorize
              calendar access. You'll be redirected to Google to grant permissions.
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
            <div className="text-left text-sm text-green-800 dark:text-green-200">
              <strong className="font-semibold">You're all set!</strong> Your Google Calendar is
              connected and ready to sync events.
            </div>
          </div>
        </div>
      )}

      {!isConnected && (
        <button
          onClick={handleConnect}
          className="mb-4 w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Connect Google Calendar
        </button>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="rounded-lg border border-border px-6 py-3 font-semibold transition-colors hover:bg-muted"
        >
          Back
        </button>
        <div className="flex gap-4">
          <button
            onClick={onSkip}
            className="rounded-lg px-6 py-3 font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
          <button
            onClick={handleContinue}
            className="gradient-primary rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
