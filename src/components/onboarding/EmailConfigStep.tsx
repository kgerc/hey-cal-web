import { useState } from "react";
import { Mail, CheckCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface EmailConfigStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onConfigure: () => void;
}

export default function EmailConfigStep({
  onNext,
  onBack,
  onSkip,
  onConfigure,
}: EmailConfigStepProps) {
  const [emailProvider, setEmailProvider] = useState<"sendgrid" | "default">("default");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);

  const handleSave = () => {
    if (!senderName || !senderEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Here you would save the configuration to Supabase
    setIsConfigured(true);
    onConfigure();
    toast.success("Email configuration saved!");
  };

  return (
    <div className="text-center">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-10 w-10 text-primary" />
      </div>

      <h2 className="mb-4 text-3xl font-bold">Configure Email Notifications</h2>
      <p className="mb-8 text-lg text-muted-foreground">
        Set up how you want to send email notifications to event attendees.
      </p>

      <div className="mb-8 space-y-6 text-left">
        {/* Email Provider Selection */}
        <div>
          <label className="mb-3 block text-sm font-semibold">Email Provider</label>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() => setEmailProvider("default")}
              className={`rounded-lg border p-4 text-left transition-all ${
                emailProvider === "default"
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <span className="font-semibold">HeyCal Email</span>
                <span className="ml-auto rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Use our built-in email service. Quick setup, no configuration needed.
              </p>
            </button>

            <button
              onClick={() => setEmailProvider("sendgrid")}
              className={`rounded-lg border p-4 text-left transition-all ${
                emailProvider === "sendgrid"
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-semibold">Custom SMTP</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Use your own email service (SendGrid, Gmail, etc.). Advanced users.
              </p>
            </button>
          </div>
        </div>

        {/* Sender Information */}
        <div>
          <label htmlFor="senderName" className="mb-2 block text-sm font-semibold">
            Sender Name
          </label>
          <input
            type="text"
            id="senderName"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your Name or Organization"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            This name will appear in the "From" field of your emails
          </p>
        </div>

        <div>
          <label htmlFor="senderEmail" className="mb-2 block text-sm font-semibold">
            Sender Email
          </label>
          <input
            type="email"
            id="senderEmail"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {emailProvider === "default"
              ? "We'll send a verification email to this address"
              : "Your custom SMTP sender address"}
          </p>
        </div>

        {emailProvider === "sendgrid" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong className="font-semibold">Note:</strong> Custom SMTP configuration can be set
              up later in Settings. For now, we'll use default settings.
            </p>
          </div>
        )}
      </div>

      {isConfigured && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-200">
              Email configuration saved!
            </span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={handleSave}
          disabled={isConfigured}
          className="w-full rounded-lg border border-border bg-card px-6 py-3 font-semibold transition-colors hover:bg-muted disabled:opacity-50"
        >
          {isConfigured ? "Configuration Saved" : "Save Configuration"}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="rounded-lg border border-border px-6 py-3 font-semibold transition-colors hover:bg-muted"
        >
          Back
        </button>
        <div className="flex gap-4">
          <button
            onClick={onSkip}
            className="rounded-lg px-6 py-3 font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
          <button
            onClick={onNext}
            className="gradient-primary rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
