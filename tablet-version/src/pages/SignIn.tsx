import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SignIn = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState<"merchant" | "employee">("merchant");
  const [email, setEmail] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === "merchant") {
      if (email && password) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "merchant");
        localStorage.removeItem("currentEmployeeId");
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error("Please enter email and password");
      }
    } else {
      if (employeeCode && password) {
        localStorage.setItem("isAuthenticated", "true");
        // Set current employee ID (in real app, this would come from API response)
        // For demo, use employeeCode to determine employee ID
        const employeeId = employeeCode.toLowerCase().includes("mike") ? "1" : 
                          employeeCode.toLowerCase().includes("tom") ? "2" : 
                          employeeCode.toLowerCase().includes("chris") ? "3" : "1";
        localStorage.setItem("currentEmployeeId", employeeId);
        localStorage.setItem("userType", "employee");
        toast.success("Welcome back!");
        navigate("/employee-dashboard");
      } else {
        toast.error("Please enter employee code/email and password");
      }
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
          <h2 className="text-2xl font-bold mb-4">Sign In</h2>
          
          {/* Tabs */}
          <div className="flex gap-0 mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setLoginType("merchant")}
              className={cn(
                "flex-1 py-2 text-center text-sm font-medium transition-colors",
                loginType === "merchant"
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : "text-gray-600 hover:text-orange-600"
              )}
            >
              Merchant Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType("employee")}
              className={cn(
                "flex-1 py-2 text-center text-sm font-medium transition-colors",
                loginType === "employee"
                  ? "text-orange-600 border-b-2 border-orange-500"
                  : "text-gray-600 hover:text-orange-600"
              )}
            >
              Employee Login
            </button>
          </div>
          
          <form onSubmit={handleSignIn} className="space-y-4">
            {loginType === "merchant" ? (
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
            ) : (
              <div className="space-y-2">
                <Label htmlFor="employeeCode">Employee Code/Email</Label>
                <Input
                  id="employeeCode"
                  type="text"
                  placeholder="Enter employee code or email"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-[#EB6A3C] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-6">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-primary font-medium"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;


