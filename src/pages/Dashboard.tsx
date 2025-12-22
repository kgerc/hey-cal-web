export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-sidebar-background p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">HeyCal</h1>
          </div>
          <nav className="space-y-2">
            <a
              href="#"
              className="block rounded-lg bg-sidebar-accent px-4 py-2 text-sidebar-accent-foreground"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block rounded-lg px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Calendar
            </a>
            <a
              href="#"
              className="block rounded-lg px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Settings
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Welcome to HeyCal!</h2>
            <p className="mt-2 text-muted-foreground">
              Your calendar management dashboard is being built.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold">Upcoming Events</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="mt-2 text-sm text-muted-foreground">In the next 7 days</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold">Notifications Sent</h3>
              <p className="text-3xl font-bold">0</p>
              <p className="mt-2 text-sm text-muted-foreground">This month</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-2 text-lg font-semibold">RSVP Rate</h3>
              <p className="text-3xl font-bold">0%</p>
              <p className="mt-2 text-sm text-muted-foreground">Average response rate</p>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Getting Started</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </div>
                <span>Connect your Google Calendar</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  2
                </div>
                <span className="text-muted-foreground">
                  Configure notification preferences
                </span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  3
                </div>
                <span className="text-muted-foreground">Create your first event</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
