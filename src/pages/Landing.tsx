import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen gradient-hero">
      <nav className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="text-2xl font-bold gradient-text">HeyCal</div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="rounded-lg border border-border px-4 py-2 transition-colors hover:bg-muted"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="gradient-primary rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold md:text-6xl lg:text-7xl">
          Calendar Management
          <br />
          <span className="gradient-text">Made Effortless</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Integrate your Google Calendar with Facebook Messenger and email notifications. Never
          miss an event again.
        </p>
        <Link
          to="/signup"
          className="gradient-primary inline-block rounded-lg px-8 py-4 text-lg font-semibold text-white shadow-soft transition-all hover:scale-105 hover:shadow-elevated"
        >
          Start Free Trial
        </Link>
      </div>

      <div className="container mx-auto grid gap-8 px-6 py-20 md:grid-cols-3">
        <div className="rounded-lg bg-card p-6 shadow-card">
          <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10"></div>
          <h3 className="mb-2 text-xl font-semibold">Google Calendar Sync</h3>
          <p className="text-muted-foreground">
            Seamlessly integrate with your Google Calendar for real-time event management.
          </p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-card">
          <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10"></div>
          <h3 className="mb-2 text-xl font-semibold">Smart Notifications</h3>
          <p className="text-muted-foreground">
            Send event notifications via email or Facebook Messenger automatically.
          </p>
        </div>
        <div className="rounded-lg bg-card p-6 shadow-card">
          <div className="mb-4 h-12 w-12 rounded-lg bg-primary/10"></div>
          <h3 className="mb-2 text-xl font-semibold">RSVP Tracking</h3>
          <p className="text-muted-foreground">
            Track who's attending your events with real-time RSVP updates.
          </p>
        </div>
      </div>
    </div>
  );
}
