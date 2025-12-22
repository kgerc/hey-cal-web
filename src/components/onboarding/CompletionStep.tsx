import { CheckCircle, Calendar, Mail, MessageCircle, Sparkles } from "lucide-react";

interface CompletionStepProps {
  data: {
    googleConnected: boolean;
    facebookConnected: boolean;
    emailConfigured: boolean;
  };
  onComplete: () => void;
}

export default function CompletionStep({ data, onComplete }: CompletionStepProps) {
  const allConnected = data.googleConnected && data.facebookConnected && data.emailConfigured;
  const someConnected = data.googleConnected || data.facebookConnected || data.emailConfigured;

  return (
    <div className="text-center">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse-glow">
        <Sparkles className="h-10 w-10 text-white" />
      </div>

      <h2 className="mb-4 text-4xl font-bold">
        {allConnected ? "You're All Set!" : someConnected ? "Good to Go!" : "Setup Complete!"}
      </h2>
      <p className="mb-12 text-lg text-muted-foreground">
        {allConnected
          ? "You've connected everything! You're ready to start managing your calendar."
          : someConnected
          ? "You've set up the essentials. You can always add more integrations later."
          : "Welcome to HeyCal! Let's explore what you can do."}
      </p>

      {/* Connection Summary */}
      <div className="mb-12 space-y-3">
        <div
          className={`flex items-center gap-4 rounded-lg border p-4 ${
            data.googleConnected
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
              : "border-border bg-card"
          }`}
        >
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
              data.googleConnected ? "bg-green-100 dark:bg-green-900" : "bg-muted"
            }`}
          >
            <Calendar
              className={`h-5 w-5 ${
                data.googleConnected
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">Google Calendar</p>
            <p className="text-sm text-muted-foreground">
              {data.googleConnected ? "Connected and syncing" : "Not connected"}
            </p>
          </div>
          {data.googleConnected && (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          )}
        </div>

        <div
          className={`flex items-center gap-4 rounded-lg border p-4 ${
            data.facebookConnected
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
              : "border-border bg-card"
          }`}
        >
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
              data.facebookConnected ? "bg-green-100 dark:bg-green-900" : "bg-muted"
            }`}
          >
            <MessageCircle
              className={`h-5 w-5 ${
                data.facebookConnected
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">Facebook Messenger</p>
            <p className="text-sm text-muted-foreground">
              {data.facebookConnected ? "Connected and ready" : "Not connected"}
            </p>
          </div>
          {data.facebookConnected && (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          )}
        </div>

        <div
          className={`flex items-center gap-4 rounded-lg border p-4 ${
            data.emailConfigured
              ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
              : "border-border bg-card"
          }`}
        >
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
              data.emailConfigured ? "bg-green-100 dark:bg-green-900" : "bg-muted"
            }`}
          >
            <Mail
              className={`h-5 w-5 ${
                data.emailConfigured
                  ? "text-green-600 dark:text-green-400"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">Email Notifications</p>
            <p className="text-sm text-muted-foreground">
              {data.emailConfigured ? "Configured and active" : "Not configured"}
            </p>
          </div>
          {data.emailConfigured && (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mb-12 rounded-lg border border-border bg-card p-6 text-left">
        <h3 className="mb-4 text-center font-semibold">Quick Tips to Get Started:</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-primary">1.</span>
            <span>Your events will automatically sync from Google Calendar</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">2.</span>
            <span>Click on any event to send notifications to attendees</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">3.</span>
            <span>Track RSVPs in real-time from your dashboard</span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary">4.</span>
            <span>Set up automation rules in Settings to save time</span>
          </li>
        </ul>
      </div>

      <button
        onClick={onComplete}
        className="gradient-primary w-full rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-soft transition-all hover:scale-105 hover:shadow-elevated"
      >
        Go to Dashboard
      </button>

      {!allConnected && (
        <p className="mt-4 text-sm text-muted-foreground">
          You can complete setup anytime in Settings
        </p>
      )}
    </div>
  );
}
