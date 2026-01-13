import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Users, Calendar, DollarSign } from "lucide-react";

const slides = [
  {
    icon: FileText,
    title: "Manage Estimates",
    description: "Create and send professional estimates quickly",
  },
  {
    icon: Users,
    title: "Track Customers",
    description: "Keep all your customer information organized",
  },
  {
    icon: Calendar,
    title: "Schedule Jobs",
    description: "Never miss an appointment with smart scheduling",
  },
  {
    icon: DollarSign,
    title: "Get Paid Faster",
    description: "Send invoices and track payments effortlessly",
  },
];

const Walkthrough = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.removeItem("showWalkthrough");
      navigate("/");
    }
  };

  const handleSkip = () => {
    localStorage.removeItem("showWalkthrough");
    navigate("/");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSkip}
          className="text-muted-foreground touch-target"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center max-w-md mx-auto">
        <div className="bg-primary/10 p-8 rounded-full mb-8">
          <Icon className="h-24 w-24 text-primary" />
        </div>

        <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
        <p className="text-lg text-muted-foreground mb-8">{slide.description}</p>

        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <Button onClick={handleNext} className="w-full h-12 text-base">
          {currentSlide < slides.length - 1 ? "Next" : "Get Started"}
        </Button>
      </div>
    </div>
  );
};

export default Walkthrough;


