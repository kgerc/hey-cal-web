import { Plus, Bell, Settings, Calendar, Mail, MessageSquare, Zap, LogOut } from "lucide-react";

interface QuickActionsProps {
  onCreateEvent: () => void;
  onViewNotifications: () => void;
  onSettings: () => void;
  onLogout?: () => void;
}

export default function QuickActions({
  onCreateEvent,
  onViewNotifications,
  onSettings,
  onLogout,
}: QuickActionsProps) {
  const quickActions = [
    {
      icon: Plus,
      label: "Create Event",
      description: "Schedule a new event",
      onClick: onCreateEvent,
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "View recent alerts",
      onClick: onViewNotifications,
      gradient: "from-blue-500 to-cyan-500",
    },
  ];

  const integrations = [
    {
      icon: Calendar,
      label: "Google Calendar",
      description: "2-way sync active",
      status: "connected",
    },
    {
      icon: MessageSquare,
      label: "Messenger",
      description: "Connected",
      status: "connected",
    },
    {
      icon: Mail,
      label: "Email",
      description: "Configured",
      status: "configured",
    },
  ];

  const automations = [
    {
      icon: Zap,
      label: "Active Rules",
      count: 3,
      description: "Automation rules running",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Action buttons */}
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className={`w-full rounded-lg bg-gradient-to-r ${action.gradient} p-4 text-left text-white transition-transform hover:scale-105 active:scale-95 shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">{action.label}</div>
                    <div className="text-sm text-white/80">
                      {action.description}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Integrations status */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            Integrations
          </h3>
          <div className="space-y-2">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{integration.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {integration.description}
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Automations */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
            Automations
          </h3>
          <div className="space-y-2">
            {automations.map((automation) => {
              const Icon = automation.icon;
              return (
                <div
                  key={automation.label}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-lg bg-purple-500/10 p-2">
                      <Icon className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {automation.label}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {automation.count}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {automation.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={onSettings}
          className="w-full rounded-lg border border-border bg-background p-3 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">Settings</div>
              <div className="text-xs text-muted-foreground">
                Manage your preferences
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Logout button - Fixed at bottom */}
      {onLogout && (
        <div className="border-t border-border p-4">
          <button
            onClick={onLogout}
            className="w-full rounded-lg border border-red-200 dark:border-red-900 bg-background p-3 text-left hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <div className="font-medium text-sm text-red-600 dark:text-red-400">Logout</div>
                <div className="text-xs text-red-600/70 dark:text-red-400/70">
                  Sign out of your account
                </div>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
