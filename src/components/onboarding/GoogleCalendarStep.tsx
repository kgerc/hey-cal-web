import { useState, useEffect } from "react";
import { Calendar, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
  onConnect,
}: GoogleCalendarStepProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user already has Google OAuth connected with calendar scopes
    const checkConnection = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.provider_token) {
          // User has OAuth token - check if it's Google with calendar scopes
          const { data: accounts } = await supabase
            .from('connected_accounts')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('provider', 'google')
            .single();

          if (accounts) {
            console.log('Google account already connected');
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.log('No existing Google connection');
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);

      // Save Google OAuth token to connected_accounts table
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      // Store the connection
      const { error: insertError } = await supabase
        .from('connected_accounts')
        .upsert({
          user_id: session.user.id,
          provider: 'google',
          provider_account_id: session.user.id,
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token,
          scope: 'calendar calendar.events',
          is_primary: true,
        });

      if (insertError) {
        console.error('Failed to save connection:', insertError);
        throw insertError;
      }

      setIsConnected(true);
      onConnect();
      toast.success("Google Calendar connected successfully!");
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || "Failed to connect Google Calendar");
    } finally {
      setIsConnecting(false);
    }
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

      <h2 className="mb-4 text-3xl font-bold">Google Calendar Connected!</h2>
      <p className="mb-8 text-lg text-muted-foreground">
        {isConnected
          ? "Your Google Calendar is already connected and ready to use."
          : "You've logged in with Google. Let's confirm calendar access."}
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

      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
        <div className="flex gap-3">
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
          <div className="text-left text-sm text-green-800 dark:text-green-200">
            <strong className="font-semibold">You're all set!</strong> You logged in with Google,
            which automatically gave us calendar access. We'll use this to sync your events.
          </div>
        </div>
      </div>

      {!isConnected && (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="mb-4 w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isConnecting ? "Saving..." : "Confirm Connection"}
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
