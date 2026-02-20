import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuthContext();
  const { toast } = useToast();
  const [role, setRole] = useState<AppRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, fullName, role);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account before logging in.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="erp-gradient-bg flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-card-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground mt-1">
            Join Dhaanish Connect ERP
          </p>
        </div>

        {/* Role Selection */}
        <div className="flex justify-center gap-3 mb-6">
          {(["admin", "staff", "student"] as AppRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                role === r
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted/30 text-card-foreground border border-border hover:border-primary/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <Input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-white border-muted"
            required
          />
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border-muted"
            required
          />
          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white border-muted"
            required
            minLength={6}
          />
          <Button type="submit" size="lg" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Login
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2025{" "}
          <span className="text-primary font-medium">Dhaanish Connect ERP</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
