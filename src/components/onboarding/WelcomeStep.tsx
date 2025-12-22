import { Calendar, Bell, Users, Zap } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">
          Welcome to <span className="gradient-text">HeyCal</span>!
        </h1>
        <p className="text-lg text-muted-foreground">
          Let's get you set up in just a few steps. This will only take 2 minutes.
        </p>
      </div>

      <div className="mb-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6 text-left shadow-card">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Google Calendar Sync</h3>
          <p className="text-sm text-muted-foreground">
            Seamlessly integrate with your Google Calendar for real-time event management.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 text-left shadow-card">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Smart Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Send event notifications via email or Facebook Messenger automatically.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 text-left shadow-card">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">RSVP Tracking</h3>
          <p className="text-sm text-muted-foreground">
            Track who's attending your events with real-time RSVP updates.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 text-left shadow-card">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Automation</h3>
          <p className="text-sm text-muted-foreground">
            Set up rules to automatically notify attendees based on your preferences.
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="gradient-primary rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-soft transition-all hover:scale-105 hover:shadow-elevated"
      >
        Get Started
      </button>
    </div>
  );
}
