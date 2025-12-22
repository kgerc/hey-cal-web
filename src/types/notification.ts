export interface NotificationLog {
  id: string;
  eventId: string;
  attendeeId: string;
  channel: "email" | "messenger";
  status: "sent" | "failed" | "pending";
  errorMessage?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  userId: string;
  name: string;
  subject?: string;
  body: string;
  channel: "email" | "messenger";
  isDefault: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  defaultChannel: "email" | "messenger" | "both";
  templates: MessageTemplate[];
  signature?: string;
  doNotDisturbHours?: {
    start: string;
    end: string;
  };
}
