import { supabase } from "@/lib/supabase";
import type { Event } from "@/types";

/**
 * Generate a shareable link for an event with RSVP token
 */
export async function generateEventShareLink(
  eventId: string,
  attendeeEmail: string,
  attendeeName?: string
): Promise<string> {
  // Check if attendee already exists
  const { data: existing } = await supabase
    .from("event_attendees")
    .select()
    .eq("event_id", eventId)
    .eq("email", attendeeEmail)
    .maybeSingle();

  let attendee;

  if (existing) {
    // Update existing attendee
    const { data, error: updateError } = await supabase
      .from("event_attendees")
      .update({
        name: attendeeName || existing.name,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update attendee:", updateError);
      throw new Error("Failed to generate share link");
    }
    attendee = data;
  } else {
    // Create new attendee record with RSVP token
    const { data, error: insertError } = await supabase
      .from("event_attendees")
      .insert({
        event_id: eventId,
        email: attendeeEmail,
        name: attendeeName || attendeeEmail,
        rsvp_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create attendee:", insertError);
      throw new Error("Failed to generate share link");
    }
    attendee = data;
  }

  // Generate shareable URL with RSVP token
  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/rsvp/${attendee.rsvp_token}`;

  return shareUrl;
}

/**
 * Generate a public event link (no RSVP required, just view)
 */
export function generatePublicEventLink(eventId: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/event/${eventId}`;
}

/**
 * Get event details by RSVP token
 */
export async function getEventByRSVPToken(token: string) {
  // Get attendee record by token
  const { data: attendee, error: attendeeError } = await supabase
    .from("event_attendees")
    .select("*, event:events(*)")
    .eq("rsvp_token", token)
    .single();

  if (attendeeError || !attendee) {
    throw new Error("Invalid RSVP link");
  }

  return {
    event: attendee.event as unknown as Event,
    attendee: {
      id: attendee.id,
      email: attendee.email,
      name: attendee.name,
      rsvp_status: attendee.rsvp_status,
      response_comment: attendee.response_comment,
    },
  };
}

/**
 * Update RSVP status
 */
export async function updateRSVP(
  token: string,
  status: "accepted" | "declined" | "maybe",
  comment?: string
): Promise<void> {
  const { error } = await supabase
    .from("event_attendees")
    .update({
      rsvp_status: status,
      responded_at: new Date().toISOString(),
      response_comment: comment,
    })
    .eq("rsvp_token", token);

  if (error) {
    throw new Error("Failed to update RSVP");
  }
}

/**
 * Get all attendees for an event
 */
export async function getEventAttendees(eventId: string) {
  const { data, error } = await supabase
    .from("event_attendees")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to fetch attendees");
  }

  return data;
}

/**
 * Format event details for sharing
 */
export function formatEventForSharing(event: Event): {
  title: string;
  description: string;
} {
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const dateStr = startDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const startTimeStr = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const endTimeStr = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  const description = `📅 ${dateStr}
⏰ ${startTimeStr} - ${endTimeStr}${
    event.location ? `\n📍 ${event.location}` : ""
  }${event.description ? `\n\n${event.description}` : ""}

Click to RSVP!`;

  return {
    title: `📌 ${event.title}`,
    description,
  };
}
