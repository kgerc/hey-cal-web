import { supabase } from "@/lib/supabase";
import {
  fetchGoogleEvents,
  createGoogleEvent,
  updateGoogleEvent,
  deleteGoogleEvent,
} from "./googleCalendar";
import type { Event } from "@/types";

interface SyncResult {
  success: boolean;
  imported: number;
  updated: number;
  deleted: number;
  errors: string[];
}

// Prevent concurrent syncs
let isSyncing = false;

/**
 * Convert Google Calendar event to our Event type
 */
function googleEventToEvent(googleEvent: any, userId: string): Partial<Event> {
  const startTime = googleEvent.start.dateTime || googleEvent.start.date;
  const endTime = googleEvent.end.dateTime || googleEvent.end.date;
  const allDay = !googleEvent.start.dateTime;

  return {
    user_id: userId,
    google_event_id: googleEvent.id,
    title: googleEvent.summary || "Untitled Event",
    description: googleEvent.description,
    location: googleEvent.location,
    start_time: startTime,
    end_time: endTime,
    is_all_day: allDay,
    timezone: googleEvent.start.timeZone || "UTC",
    status:
      googleEvent.status === "cancelled"
        ? "cancelled"
        : googleEvent.status === "tentative"
        ? "tentative"
        : "confirmed",
    recurrence: googleEvent.recurrence?.[0],
  };
}

/**
 * Convert our Event to Google Calendar event format
 */
function eventToGoogleEvent(event: Event): any {
  const googleEvent: any = {
    summary: event.title,
    description: event.description,
    location: event.location,
  };

  if (event.is_all_day) {
    // All-day event
    const startDate = new Date(event.start_time).toISOString().split("T")[0];
    const endDate = new Date(event.end_time).toISOString().split("T")[0];
    googleEvent.start = { date: startDate };
    googleEvent.end = { date: endDate };
  } else {
    // Timed event
    googleEvent.start = {
      dateTime: event.start_time,
      timeZone: event.timezone || "UTC",
    };
    googleEvent.end = {
      dateTime: event.end_time,
      timeZone: event.timezone || "UTC",
    };
  }

  if (event.status === "cancelled") {
    googleEvent.status = "cancelled";
  } else if (event.status === "tentative") {
    googleEvent.status = "tentative";
  }

  if (event.recurrence) {
    googleEvent.recurrence = [event.recurrence];
  }

  return googleEvent;
}

/**
 * Import events from Google Calendar to local database
 */
export async function importGoogleEvents(
  timeMin?: string,
  timeMax?: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    imported: 0,
    updated: 0,
    deleted: 0,
    errors: [],
  };

  try {
    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const userId = session.user.id;

    // Fetch events from Google Calendar
    const fetchOptions: any = {
      timeMin: timeMin || new Date().toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    };

    // Only add timeMax if it's defined
    if (timeMax) {
      fetchOptions.timeMax = timeMax;
    }

    const googleEvents = await fetchGoogleEvents("primary", fetchOptions);

    console.log(`Fetched ${googleEvents.length} events from Google Calendar`);

    // Process each Google event
    for (const googleEvent of googleEvents) {
      try {
        // Check if event already exists in our database
        const { data: existingEvent } = await supabase
          .from("events")
          .select("*")
          .eq("google_event_id", googleEvent.id)
          .eq("user_id", userId)
          .maybeSingle();

        const eventData = googleEventToEvent(googleEvent, userId);

        if (existingEvent) {
          // Event already exists - skip update to avoid unnecessary requests
          // Google Calendar is the source of truth, so existing events are assumed correct
          // TODO: Add proper change detection using Google Calendar's updated timestamp
        } else {
          // Insert new event
          const { error } = await supabase.from("events").insert(eventData);

          if (error) {
            console.error('❌ Insert error for event:', googleEvent.id);
            console.error('Event data being inserted:', eventData);
            console.error('Full error object:', error);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            console.error('Error hint:', error.hint);
            console.error('Error code:', error.code);
            result.errors.push(`Failed to insert event ${googleEvent.id}: ${error.message}`);
          } else {
            result.imported++;
          }
        }
      } catch (error: any) {
        result.errors.push(`Error processing event ${googleEvent.id}: ${error.message}`);
      }
    }

    // Mark cancelled/deleted Google events in our database
    const { data: localEvents } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .not("google_event_id", "is", null);

    if (localEvents) {
      const googleEventIds = new Set(googleEvents.map((e) => e.id));

      for (const localEvent of localEvents) {
        if (localEvent.google_event_id && !googleEventIds.has(localEvent.google_event_id)) {
          // Event was deleted in Google Calendar
          const { error } = await supabase
            .from("events")
            .update({ status: "cancelled" })
            .eq("id", localEvent.id);

          if (!error) {
            result.deleted++;
          }
        }
      }
    }

    console.log("Import complete:", result);
  } catch (error: any) {
    result.success = false;
    result.errors.push(`Import failed: ${error.message}`);
  }

  return result;
}

/**
 * Export a local event to Google Calendar
 */
export async function exportEventToGoogle(eventId: string): Promise<void> {
  // Get event from database
  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (fetchError || !event) {
    throw new Error("Event not found");
  }

  // Convert to Google format
  const googleEvent = eventToGoogleEvent(event);

  if (event.google_event_id) {
    // Update existing Google event
    await updateGoogleEvent(event.google_event_id, googleEvent);
  } else {
    // Create new Google event
    const createdEvent = await createGoogleEvent(googleEvent);

    // Update local event with Google ID
    await supabase
      .from("events")
      .update({ google_event_id: createdEvent.id })
      .eq("id", eventId);
  }
}

/**
 * Delete event from both local database and Google Calendar
 */
export async function deleteEventEverywhere(eventId: string): Promise<void> {
  // Get event from database
  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (fetchError || !event) {
    throw new Error("Event not found");
  }

  // Delete from Google Calendar if it exists there
  if (event.google_event_id) {
    try {
      await deleteGoogleEvent(event.google_event_id);
    } catch (error) {
      console.error("Failed to delete from Google Calendar:", error);
      // Continue anyway to delete from local database
    }
  }

  // Delete from local database
  const { error: deleteError } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (deleteError) {
    throw new Error(`Failed to delete event: ${deleteError.message}`);
  }
}

/**
 * Sync all events (import from Google and export local changes)
 */
export async function syncAllEvents(): Promise<SyncResult> {
  // Prevent concurrent syncs
  if (isSyncing) {
    console.log('⏭️ Sync already in progress, skipping...');
    return {
      success: true,
      imported: 0,
      updated: 0,
      deleted: 0,
      errors: ['Sync already in progress']
    };
  }

  isSyncing = true;
  console.log('🔄 Starting sync...');

  try {
    // First import from Google
    const importResult = await importGoogleEvents();

    // Then export any local events that don't have a Google ID
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: localOnlyEvents } = await supabase
          .from("events")
          .select("*")
          .eq("user_id", session.user.id)
          .is("google_event_id", null)
          .neq("status", "cancelled");

        if (localOnlyEvents && localOnlyEvents.length > 0) {
          console.log(`Exporting ${localOnlyEvents.length} local events to Google`);

          for (const event of localOnlyEvents) {
            try {
              await exportEventToGoogle(event.id);
            } catch (error: any) {
              importResult.errors.push(
                `Failed to export event ${event.id}: ${error.message}`
              );
            }
          }
        }
      }
    } catch (error: any) {
      importResult.errors.push(`Export phase failed: ${error.message}`);
    }

    console.log('✅ Sync complete');
    return importResult;
  } finally {
    isSyncing = false;
  }
}
