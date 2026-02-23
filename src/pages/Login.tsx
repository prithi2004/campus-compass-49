import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, ShieldCheck, UserCog, Users } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roles: { value: AppRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "admin", label: "Admin", icon: <ShieldCheck className="w-5 h-5" />, description: "College administration" },
  { value: "staff", label: "Staff", icon: <UserCog className="w-5 h-5" />, description: "Faculty & staff" },
  { value: "student", label: "Student", icon: <Users className="w-5 h-5" />, description: "Student portal" },
];

const Login = () => {
  const navigate = useNavigate();
  const { signIn, getDashboardPath } = useAuthContext();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<AppRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      // Fetch actual role from DB and verify it matches selected role
      const { data } = await (await import("@/integrations/supabase/client")).supabase
        .from("user_roles")
        .select("role")
        .maybeSingle();

      const actualRole = data?.role ?? null;

      if (actualRole !== selectedRole) {
        // Sign out if role doesn't match
        await (await import("@/integrations/supabase/client")).supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: `Your account is not registered as ${selectedRole}. Please select the correct role.`,
          variant: "destructive",
        });
        return;
      }

      const path = getDashboardPath(actualRole);
      navigate(path);
    } catch (error: any) {
      toast({
        title: "Login failed",
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-card-foreground">
            Dhaanish Connect
          </h1>
          <p className="text-muted-foreground mt-1">
            College ERP Management System
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
          Sign in as <span className="font-semibold text-primary capitalize">{selectedRole}</span>
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border-muted"
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-muted"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Signing in..." : `Login as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Forgot your password?
          </Link>
        </p>

        <p className="text-center text-sm text-muted-foreground mt-3">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up
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

export default Login;
