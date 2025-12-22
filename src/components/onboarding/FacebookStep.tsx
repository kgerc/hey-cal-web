import { useState } from "react";
import { MessageCircle, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FacebookStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onConnect: () => void;
}

export default function FacebookStep({
  onNext,
  onBack,
  onSkip,
  onConnect,
}: FacebookStepProps) {
  const { signInWithFacebook } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await signInWithFacebook();
      setIsConnected(true);
      onConnect();
      toast.success("Facebook Messenger connected successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to connect Facebook Messenger");
      setIsConnecting(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <MessageCircle className="h-10 w-10 text-primary" />
      </div>

      <h2 className="mb-4 text-3xl font-bold">Connect Facebook Messenger</h2>
      <p className="mb-2 text-lg text-muted-foreground">
        Send event notifications via Facebook Messenger for better engagement.
      </p>
      <p className="mb-8 text-sm text-muted-foreground">
        This step is optional - you can always add it later.
      </p>

      <div className="mb-8 rounded-lg border border-border bg-card p-6 text-left">
        <h3 className="mb-4 font-semibold">What you'll get:</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Send event invites via Messenger</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Higher open rates than email</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Track message read receipts</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span className="text-sm">Quick RSVP with Messenger buttons</span>
          </li>
        </ul>
      </div>

      <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <div className="text-left text-sm text-blue-800 dark:text-blue-200">
            <strong className="font-semibold">Note:</strong> You can only send messages to your
            Facebook friends. We respect Facebook's messaging policies and privacy guidelines.
          </div>
        </div>
      </div>

      {isConnected ? (
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-200">
              Facebook Messenger connected successfully!
            </span>
          </div>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-6 py-4 font-semibold transition-colors hover:bg-muted disabled:opacity-50"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          {isConnecting ? "Connecting..." : "Connect with Facebook"}
        </button>
      )}

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
