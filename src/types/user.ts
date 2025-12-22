export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  provider: "google" | "facebook" | "email";
  providerAccountId?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface UserPreferences {
  userId: string;
  defaultNotificationChannel: "email" | "messenger" | "both";
  defaultCalendarView: "day" | "week" | "month";
  theme: "light" | "dark" | "auto";
  weekStart: number;
  timeFormat: "12h" | "24h";
  workingHours?: {
    start: string;
    end: string;
    days: number[];
  };
  doNotDisturbHours?: {
    start: string;
    end: string;
  };
  preferences?: Record<string, any>;
  updatedAt: string;
}
