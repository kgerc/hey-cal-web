import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Calendar, Clock, MapPin, FileText } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/types";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  location: z.string().optional(),
  event_type: z.enum(["meeting", "task", "reminder", "other"]).optional(),
  status: z.enum(["confirmed", "tentative", "cancelled"]).optional(),
  all_day: z.boolean().optional(),
}).refine(
  (data) => {
    const start = new Date(data.start_time);
    const end = new Date(data.end_time);
    return end > start;
  },
  {
    message: "End time must be after start time",
    path: ["end_time"],
  }
);

type EventFormData = z.infer<typeof eventSchema>;

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EventFormData) => Promise<void>;
  event?: Event | null;
  defaultDate?: Date;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  event,
  defaultDate,
}: EventModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description || "",
          start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
          end_time: format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"),
          location: event.location || "",
          event_type: event.event_type || "meeting",
          status: event.status || "confirmed",
          all_day: event.all_day || false,
        }
      : {
          title: "",
          description: "",
          start_time: defaultDate
            ? format(defaultDate, "yyyy-MM-dd'T'HH:mm")
            : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          end_time: defaultDate
            ? format(new Date(defaultDate.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm")
            : format(new Date(Date.now() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
          location: "",
          event_type: "meeting",
          status: "confirmed",
          all_day: false,
        },
  });

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    try {
      await onSave(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to save event:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-lg shadow-2xl border border-border m-4">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-6 z-10">
          <h2 className="text-2xl font-bold">
            {event ? "Edit Event" : "Create Event"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Event Title *
              </div>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="Team Meeting, Birthday Party, etc."
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time *
                </div>
              </label>
              <input
                {...register("start_time")}
                type="datetime-local"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.start_time && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.start_time.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  End Time *
                </div>
              </label>
              <input
                {...register("end_time")}
                type="datetime-local"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.end_time && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.end_time.message}
                </p>
              )}
            </div>
          </div>

          {/* All day checkbox */}
          <div className="flex items-center gap-2">
            <input
              {...register("all_day")}
              type="checkbox"
              id="all_day"
              className="rounded border-border focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="all_day" className="text-sm font-medium cursor-pointer">
              All day event
            </label>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </div>
            </label>
            <input
              {...register("location")}
              type="text"
              placeholder="Meeting room, address, or video call link"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Event Type</label>
            <select
              {...register("event_type")}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="meeting">Meeting</option>
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              {...register("status")}
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="confirmed">Confirmed</option>
              <option value="tentative">Tentative</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </div>
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Add event details, agenda, notes..."
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-border px-6 py-2 font-semibold transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="gradient-primary rounded-lg px-6 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : event ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
