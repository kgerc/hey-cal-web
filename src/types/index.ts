// Database types matching the Supabase schema
export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  timezone?: string;
  location?: string;
  event_type?: "meeting" | "task" | "reminder" | "other";
  status?: "confirmed" | "tentative" | "cancelled";
  is_all_day?: boolean;
  recurrence?: string;
  google_event_id?: string;
  facebook_event_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  email: string;
  name?: string;
  phone?: string;
  notification_channel: "email" | "messenger" | "both";
  rsvp_status: "pending" | "accepted" | "declined" | "maybe";
  notified_at?: string;
  responded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectedAccount {
  id: string;
  user_id: string;
  provider: "google" | "facebook";
  provider_account_id: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  token_type?: string;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationLog {
  id: string;
  event_id: string;
  attendee_id: string;
  channel: "email" | "messenger";
  status: "pending" | "sent" | "failed" | "delivered" | "read";
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  created_at?: string;
}

export interface MessageTemplate {
  id: string;
  user_id: string;
  name: string;
  template_type: "invitation" | "reminder" | "update" | "cancellation" | "rsvp_request";
  channel: "email" | "messenger" | "both";
  subject?: string;
  body: string;
  variables?: Record<string, any>;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AutomationRule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  trigger_type: "event_created" | "event_updated" | "time_before_event" | "rsvp_received";
  trigger_config: Record<string, any>;
  action_type: "send_notification" | "update_event" | "create_task";
  action_config: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_notification_channel: "email" | "messenger" | "both";
  default_reminder_minutes?: number;
  timezone?: string;
  date_format?: string;
  time_format?: string;
  week_start_day?: number;
  email_notifications_enabled?: boolean;
  messenger_notifications_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Contact {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  phone?: string;
  preferred_channel?: "email" | "messenger";
  facebook_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContactGroup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

// Re-export original types for backwards compatibility
export * from "./user";
export * from "./calendar";
export * from "./notification";
export * from "./automation";
