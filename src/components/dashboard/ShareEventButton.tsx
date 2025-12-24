import { useState } from "react";
import { Send, Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import type { Event } from "@/types";
import { generateEventShareLink, formatEventForSharing } from "@/services/eventSharing";
import { shareEventViaMessenger, initFacebookSDK } from "@/services/facebook";

interface ShareEventButtonProps {
  event: Event;
}

export default function ShareEventButton({ event }: ShareEventButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeeName, setAttendeeName] = useState("");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateLink = async () => {
    if (!attendeeEmail) {
      toast.error("Please enter attendee email");
      return;
    }

    setIsGenerating(true);
    try {
      const link = await generateEventShareLink(event.id, attendeeEmail, attendeeName);
      setShareLink(link);
      toast.success("Share link generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareViaMessenger = async () => {
    if (!shareLink) {
      await handleGenerateLink();
      return;
    }

    try {
      // Initialize Facebook SDK if needed
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
      if (!appId) {
        toast.error("Facebook App ID not configured");
        return;
      }

      await initFacebookSDK(appId);

      const { title, description } = formatEventForSharing(event);

      await shareEventViaMessenger(shareLink, title);
      toast.success("Shared via Messenger!");
      setIsOpen(false);
    } catch (error: any) {
      if (error.message.includes('cancelled')) {
        // User closed the dialog, not an error
        return;
      }
      toast.error(error.message || "Failed to share via Messenger");
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 font-semibold transition-colors hover:bg-muted"
      >
        <Share2 className="h-4 w-4" />
        Share Event
      </button>
    );
  }

  return (
    <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Share Event</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>

      {!shareLink ? (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Attendee Email *
            </label>
            <input
              type="email"
              value={attendeeEmail}
              onChange={(e) => setAttendeeEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Attendee Name (optional)
            </label>
            <input
              type="text"
              value={attendeeName}
              onChange={(e) => setAttendeeName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerateLink}
            disabled={isGenerating || !attendeeEmail}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Share Link"}
          </button>
        </>
      ) : (
        <>
          <div className="p-3 rounded-lg bg-background border border-border">
            <p className="text-xs text-muted-foreground mb-1">Share Link:</p>
            <p className="text-sm font-mono break-all">{shareLink}</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 font-semibold transition-colors hover:bg-muted"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleShareViaMessenger}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#0084FF] px-4 py-2 font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Send className="h-4 w-4" />
              Send via Messenger
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Click "Send via Messenger" to open Facebook dialog and select friends
          </p>
        </>
      )}
    </div>
  );
}
