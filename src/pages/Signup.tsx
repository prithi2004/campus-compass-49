import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, ShieldCheck, UserCog, Users } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roles: { value: AppRole; label: string; icon: React.ReactNode }[] = [
  { value: "admin", label: "Admin", icon: <ShieldCheck className="w-5 h-5" /> },
  { value: "staff", label: "Staff", icon: <UserCog className="w-5 h-5" /> },
  { value: "student", label: "Student", icon: <Users className="w-5 h-5" /> },
];

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuthContext();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<AppRole>("student");
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
      await signUp(email, password, fullName);

      // Update the role to the selected one
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_roles")
          .update({ role: selectedRole })
          .eq("user_id", user.id);
      }

      toast({
        title: "Account created!",
        description: `Welcome to Dhaanish Connect as ${roles.find(r => r.value === selectedRole)?.label}!`,
      });
      navigate(`/${selectedRole}/dashboard`);
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="erp-gradient-bg flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <div className="text-center mb-6">
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

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                selectedRole === role.value
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              {role.icon}
              <span className="text-xs font-semibold">{role.label}</span>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mb-4">
          Sign up as <span className="font-semibold text-primary capitalize">{selectedRole}</span>
        </p>

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
            {isLoading ? "Creating account..." : `Sign Up as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
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
