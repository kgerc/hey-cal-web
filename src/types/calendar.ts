export interface CalendarEvent {
  id: string;
  userId: string;
  googleEventId?: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  recurrence?: string;
  color?: string;
  calendarId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EventAttendee {
  id: string;
  eventId: string;
  email: string;
  name?: string;
  notificationChannel: "email" | "messenger" | "both";
  rsvpStatus: "pending" | "accepted" | "declined" | "maybe";
  notifiedAt?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  primary?: boolean;
}

export type CalendarView = "day" | "week" | "month";

export interface EventFormData {
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  recurrence?: string;
  color?: string;
  attendees: {
    email: string;
    name?: string;
    notificationChannel: "email" | "messenger" | "both";
  }[];
  attachments?: File[];
}
