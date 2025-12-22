import { z } from "zod";

export const eventFormSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  timezone: z.string(),
  recurrence: z.string().optional(),
  color: z.string().optional(),
  attendees: z.array(
    z.object({
      email: z.string().email("Invalid email address"),
      name: z.string().optional(),
      notificationChannel: z.enum(["email", "messenger", "both"]),
    })
  ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
});

export const messageTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().optional(),
  body: z.string().min(1, "Message body is required"),
  channel: z.enum(["email", "messenger"]),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type MessageTemplateFormData = z.infer<typeof messageTemplateSchema>;
