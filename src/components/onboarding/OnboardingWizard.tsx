import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WelcomeStep from "./WelcomeStep";
import GoogleCalendarStep from "./GoogleCalendarStep";
import FacebookStep from "./FacebookStep";
import EmailConfigStep from "./EmailConfigStep";
import CompletionStep from "./CompletionStep";

export type OnboardingStep = "welcome" | "google" | "facebook" | "email" | "complete";

interface OnboardingData {
  googleConnected: boolean;
  facebookConnected: boolean;
  emailConfigured: boolean;
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [data, setData] = useState<OnboardingData>({
    googleConnected: false,
    facebookConnected: false,
    emailConfigured: false,
  });

  const steps: OnboardingStep[] = ["welcome", "google", "facebook", "email", "complete"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <div className="fixed left-0 right-0 top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="h-1 bg-muted">
          <div
            className="gradient-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Step Indicator */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {steps.map((step, index) => (
              <div
                key={step}
                className={`h-2 w-12 rounded-full transition-all ${
                  index <= currentStepIndex
                    ? "gradient-primary"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Steps */}
          <div className="animate-in">
            {currentStep === "welcome" && (
              <WelcomeStep onNext={nextStep} />
            )}
            {currentStep === "google" && (
              <GoogleCalendarStep
                onNext={nextStep}
                onBack={prevStep}
                onSkip={skipStep}
                onConnect={() => updateData({ googleConnected: true })}
              />
            )}
            {currentStep === "facebook" && (
              <FacebookStep
                onNext={nextStep}
                onBack={prevStep}
                onSkip={skipStep}
                onConnect={() => updateData({ facebookConnected: true })}
              />
            )}
            {currentStep === "email" && (
              <EmailConfigStep
                onNext={nextStep}
                onBack={prevStep}
                onSkip={skipStep}
                onConfigure={() => updateData({ emailConfigured: true })}
              />
            )}
            {currentStep === "complete" && (
              <CompletionStep
                data={data}
                onComplete={handleComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
