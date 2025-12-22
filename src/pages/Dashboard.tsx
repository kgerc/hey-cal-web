import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/stores/authStore";
import type { Event } from "@/types";
import DayView from "@/components/calendar/DayView";
import WeekView from "@/components/calendar/WeekView";
import MonthView from "@/components/calendar/MonthView";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import QuickActions from "@/components/dashboard/QuickActions";
import EventModal from "@/components/dashboard/EventModal";
import { toast } from "sonner";

type ViewType = "day" | "week" | "month";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
    enabled: !!user?.id,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("events")
        .insert({
          ...eventData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create event");
    },
  });

  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, ...eventData }: any) => {
      const { data, error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  // Navigation handlers
  const handlePrevious = () => {
    if (viewType === "day") {
      setCurrentDate((prev) => subDays(prev, 1));
    } else if (viewType === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewType === "day") {
      setCurrentDate((prev) => addDays(prev, 1));
    } else if (viewType === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
    } else {
      setCurrentDate((prev) => addMonths(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleCreateEvent = (defaultDate?: Date) => {
    setSelectedEvent(null);
    setSelectedTimeSlot(defaultDate || null);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedTimeSlot(null);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    if (selectedEvent) {
      await updateEventMutation.mutateAsync({
        id: selectedEvent.id,
        ...eventData,
      });
    } else {
      await createEventMutation.mutateAsync(eventData);
    }
  };

  const handleTimeSlotClick = (date: Date) => {
    handleCreateEvent(date);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Left Sidebar - Upcoming Events */}
      <div className="w-80 flex-shrink-0">
        <UpcomingEvents events={events} onEventClick={handleEventClick} />
      </div>

      {/* Main Content - Calendar */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with navigation */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            {/* Date navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleToday}
                className="rounded-lg border border-border px-4 py-2 font-semibold hover:bg-muted transition-colors"
              >
                Today
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  className="rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* View switcher */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-1">
              <button
                onClick={() => setViewType("day")}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  viewType === "day"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewType("week")}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  viewType === "week"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewType("month")}
                className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                  viewType === "month"
                    ? "bg-background shadow-sm"
                    : "hover:bg-background/50"
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3 animate-pulse" />
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            </div>
          ) : (
            <>
              {viewType === "day" && (
                <DayView
                  date={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
              {viewType === "week" && (
                <WeekView
                  date={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              )}
              {viewType === "month" && (
                <MonthView
                  date={currentDate}
                  events={events}
                  onEventClick={handleEventClick}
                  onDayClick={handleTimeSlotClick}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar - Quick Actions */}
      <div className="w-80 flex-shrink-0">
        <QuickActions
          onCreateEvent={() => handleCreateEvent()}
          onViewNotifications={() => toast.info("Notifications coming soon!")}
          onSettings={() => toast.info("Settings coming soon!")}
        />
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
          setSelectedTimeSlot(null);
        }}
        onSave={handleSaveEvent}
        event={selectedEvent}
        defaultDate={selectedTimeSlot || undefined}
      />
    </div>
  );
}
