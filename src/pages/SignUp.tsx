import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.businessName) {
        toast.error("Please enter your business name");
        return;
      }
      setStep(2);
    } else {
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        return;
      }
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("showWalkthrough", "true");
      toast.success("Account created successfully!");
      navigate("/walkthrough");
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6">
      <button
        onClick={() => step === 1 ? navigate("/signin") : setStep(1)}
        className="self-start mb-4 p-2 touch-target"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-muted-foreground">Step {step} of 2</p>
        </div>

        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 text-base"
                />
              </div>
            </div>
          )}

          <Button onClick={handleNext} className="w-full h-12 text-base mt-6">
            {step === 1 ? "Next" : "Create Account"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;


