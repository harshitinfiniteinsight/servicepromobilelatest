import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ACHSetupSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

// Step data configuration - screenshots can be added via image property
interface StepData {
  number: number;
  title: string;
  description: string;
  image?: string; // Optional screenshot URL
  placeholderColor: string; // Fallback color for placeholder
}

const steps: StepData[] = [
  {
    number: 1,
    title: "Log in to Universell",
    description: "Go to https://universal.mybmr.com/login and sign in to your Universell account.",
    image: "/ach-setup/step-1.png",
    placeholderColor: "bg-blue-100",
  },
  {
    number: 2,
    title: "Enter Your Credentials",
    description: "Use the same credentials as Service Pro 911. If you don't have a Universell account, create one.",
    image: "/ach-setup/step-2.png",
    placeholderColor: "bg-green-100",
  },
  {
    number: 3,
    title: "Accept Terms & Continue",
    description: "For first-time users, accept the Terms and Conditions. You'll be redirected to the Link Payment Gateway screen.",
    image: "/ach-setup/step-3.png",
    placeholderColor: "bg-yellow-100",
  },
  {
    number: 4,
    title: "Connect PrimeGateway",
    description: "Select and connect PrimeGateway to your Universell account.",
    image: "/ach-setup/step-4.jpg",
    placeholderColor: "bg-purple-100",
  },
  {
    number: 5,
    title: "Enable ACH",
    description: "Enable ACH payments so your customers can pay via bank transfer.",
    image: "/ach-setup/step-5.jpg",
    placeholderColor: "bg-orange-100",
  },
];

const ACHSetupSliderModal = ({ isOpen, onClose, onBack }: ACHSetupSliderModalProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Sync carousel state with current step
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentStep(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    // Set initial state
    onSelect();

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // Reset to first step when modal opens
  useEffect(() => {
    if (isOpen && api) {
      api.scrollTo(0);
      setCurrentStep(0);
    }
  }, [isOpen, api]);

  const scrollPrev = useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  const handleEmailInstructions = async () => {
    setIsSendingEmail(true);
    
    try {
      // TODO: Replace with actual API call to send email
      // Example: await fetch('/api/send-ach-instructions', { method: 'POST' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Instructions sent to your email!");
    } catch (error) {
      toast.error("Failed to send instructions. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100%-1rem)] p-0 gap-0 rounded-2xl max-h-[90vh] overflow-hidden [&>div]:p-0 [&>button]:hidden flex flex-col">
        <DialogTitle className="sr-only">
          ACH Setup Instructions
        </DialogTitle>
        <DialogDescription className="sr-only">
          Step-by-step guide to set up ACH payments
        </DialogDescription>
        
        {/* Sticky Orange Header */}
        <div className="bg-orange-500 px-3 py-3 flex items-center justify-between safe-top shrink-0">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
            aria-label="Back to Payment Options"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <h2 className="text-base font-semibold text-white px-2 text-center flex-1">ACH Setup Guide</h2>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-orange-600 transition-colors touch-target"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white flex flex-col min-h-0 overflow-hidden">
          {/* Step Counter - Top */}
          <div className="text-center pt-4 pb-2 shrink-0">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 pb-4 shrink-0">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-6 bg-orange-500"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Carousel Container */}
          <div className="flex-1 min-h-0 relative">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: false,
              }}
              className="h-full"
            >
              <CarouselContent className="h-full -ml-0">
                {steps.map((step, index) => (
                  <CarouselItem key={index} className="h-full pl-0">
                    <div className="h-full flex flex-col px-5 pb-4">
                      {/* Screenshot Section */}
                      <div className={`w-full aspect-[4/3] rounded-xl ${step.placeholderColor} flex items-center justify-center mb-4 overflow-hidden shadow-sm`}>
                        {step.image ? (
                          <img
                            src={step.image}
                            alt={`Step ${step.number}: ${step.title}`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          // Placeholder with step number
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center mb-2 shadow-sm">
                              <span className="text-2xl font-bold text-orange-500">{step.number}</span>
                            </div>
                            <span className="text-xs text-gray-400">Screenshot</span>
                          </div>
                        )}
                      </div>

                      {/* Step Badge + Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">{step.number}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Navigation Arrows - Overlaid on carousel edges */}
            <button
              onClick={scrollPrev}
              disabled={currentStep === 0}
              className={`absolute left-1 top-1/3 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md transition-all ${
                currentStep === 0
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 hover:bg-white active:scale-95"
              }`}
              aria-label="Previous step"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            <button
              onClick={scrollNext}
              disabled={currentStep === steps.length - 1}
              className={`absolute right-1 top-1/3 -translate-y-1/2 p-2 rounded-full bg-white/90 shadow-md transition-all ${
                currentStep === steps.length - 1
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100 hover:bg-white active:scale-95"
              }`}
              aria-label="Next step"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Sticky CTA Footer */}
        <div
          className="bg-white px-5 pb-7 pt-4 border-t border-gray-100 shrink-0 safe-bottom flex justify-center"
          style={{ paddingBottom: "calc(28px + env(safe-area-inset-bottom))" }}
        >
          <Button
            onClick={handleEmailInstructions}
            disabled={isSendingEmail}
            className="w-full max-w-[320px] h-12 text-base font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSendingEmail ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5" />
                Email me the instructions
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ACHSetupSliderModal;
