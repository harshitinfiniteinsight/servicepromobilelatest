import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Password reset link has been sent to your email");
      navigate("/signin");
    } else {
      toast.error("Please enter your email address");
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gradient-to-br from-primary/10 via-accent/5 to-background p-6">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">ServicePro</h1>
          <p className="text-muted-foreground">Mobile</p>
        </div>

        <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
          
          <p className="text-sm text-muted-foreground mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-6">
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/signin")}
              className="text-sm text-[#EB6A3C] hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

