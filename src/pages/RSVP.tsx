import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, FileText, Check, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/types";
import { getEventByRSVPToken, updateRSVP } from "@/services/eventSharing";

export default function RSVP() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [attendee, setAttendee] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [responded, setResponded] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!token) {
        setError("Invalid RSVP link");
        setLoading(false);
        return;
      }

      try {
        const data = await getEventByRSVPToken(token);
        setEvent(data.event);
        setAttendee(data.attendee);

        // Check if already responded
        if (data.attendee.rsvp_status !== "pending") {
          setResponded(true);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [token]);

  const handleRSVP = async (status: "accepted" | "declined" | "maybe") => {
    if (!token) return;

    setSubmitting(true);
    try {
      await updateRSVP(token, status, comment);
      toast.success(
        status === "accepted"
          ? "You're attending! 🎉"
          : status === "declined"
          ? "RSVP declined"
          : "Marked as maybe"
      );
      setResponded(true);
      setAttendee({ ...attendee, rsvp_status: status, response_comment: comment });
    } catch (err: any) {
      toast.error(err.message || "Failed to update RSVP");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
          <p className="text-lg font-semibold text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <div className="mb-4 inline-block h-12 w-12 rounded-full border-4 border-destructive"></div>
          <h1 className="mb-2 text-2xl font-bold text-destructive">Invalid RSVP Link</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-lg bg-primary px-6 py-2 font-semibold text-white hover:opacity-90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Event Card */}
        <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="gradient-primary p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-white/90">You're invited by {attendee.name || attendee.email}</p>
          </div>

          {/* Event Details */}
          <div className="p-8 space-y-6">
            {/* Date & Time */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">When</h3>
                <p className="text-muted-foreground">
                  {format(startDate, "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
                </p>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Where</h3>
                  <p className="text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Details</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            )}

            {/* Current Status */}
            {responded && (
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="text-sm font-medium mb-1">Your Response:</p>
                <p className="text-lg font-semibold capitalize">
                  {attendee.rsvp_status === "accepted" && (
                    <span className="text-green-600">✓ Attending</span>
                  )}
                  {attendee.rsvp_status === "declined" && (
                    <span className="text-red-600">✗ Not Attending</span>
                  )}
                  {attendee.rsvp_status === "maybe" && (
                    <span className="text-yellow-600">? Maybe</span>
                  )}
                </p>
                {attendee.response_comment && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Note: {attendee.response_comment}
                  </p>
                )}
              </div>
            )}

            {/* Comment/Note */}
            {!responded && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add a note (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Let the host know if you have any questions or special requests..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            )}

            {/* RSVP Buttons */}
            {!responded ? (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => handleRSVP("accepted")}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="h-5 w-5" />
                  {submitting ? "Updating..." : "I'll be there"}
                </button>
                <button
                  onClick={() => handleRSVP("maybe")}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-yellow-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <HelpCircle className="h-5 w-5" />
                  {submitting ? "Updating..." : "Maybe"}
                </button>
                <button
                  onClick={() => handleRSVP("declined")}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                  {submitting ? "Updating..." : "Can't make it"}
                </button>
              </div>
            ) : (
              <div className="pt-4">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Need to change your response?
                </p>
                <button
                  onClick={() => setResponded(false)}
                  className="w-full rounded-lg border border-border px-6 py-2 font-semibold transition-colors hover:bg-muted"
                >
                  Update RSVP
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border bg-muted/30 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by <span className="font-semibold gradient-text">HeyCal</span>
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Create your own events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
