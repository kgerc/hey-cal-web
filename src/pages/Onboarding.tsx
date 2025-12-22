import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to HeyCal!</h1>
        <p className="mb-8 text-lg text-muted-foreground">
          Let's get you set up. This onboarding wizard is coming soon.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="gradient-primary rounded-lg px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
