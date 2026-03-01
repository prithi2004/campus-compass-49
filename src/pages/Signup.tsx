import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, ShieldCheck, UserCog, Users } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; color: string }> = {
  admin: { label: "Admin", icon: <ShieldCheck className="w-4 h-4" />, color: "destructive" },
  staff: { label: "Staff", icon: <UserCog className="w-4 h-4" />, color: "default" },
  student: { label: "Student", icon: <Users className="w-4 h-4" />, color: "secondary" },
};

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuthContext();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteRole, setInviteRole] = useState<AppRole | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) return;
    setInviteLoading(true);
    supabase
      .from("invitations")
      .select("email, role, used_at, expires_at")
      .eq("token", token)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setInviteError("Invalid invitation link.");
        } else if (data.used_at) {
          setInviteError("This invitation has already been used.");
        } else if (new Date(data.expires_at) < new Date()) {
          setInviteError("This invitation has expired.");
        } else {
          setInviteRole(data.role as AppRole);
          setEmail(data.email);
        }
        setInviteLoading(false);
      });
  }, [token]);

  const assignedRole = inviteRole || "student";
  const rc = roleConfig[assignedRole];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, fullName);
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .maybeSingle();
      const path = roleData?.role ? `/${roleData.role}/dashboard` : "/login";
      toast({ title: "Account created!", description: `Welcome to Dhaanish Connect as ${roleConfig[roleData?.role as AppRole || "student"].label}!` });
      navigate(path);
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (inviteLoading) {
    return (
      <div className="erp-gradient-bg flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="erp-gradient-bg flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-card-foreground mb-2">Invalid Invitation</h1>
          <p className="text-muted-foreground mb-6">{inviteError}</p>
          <Link to="/login">
            <Button variant="outline">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-muted-foreground">Joining as</p>
            <Badge variant={rc.color as any} className="flex items-center gap-1">
              {rc.icon}
              {rc.label}
            </Badge>
          </div>
          {!token && (
            <p className="text-xs text-muted-foreground mt-2">
              Need a staff or admin account? Contact your administrator for an invite link.
            </p>
          )}
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
            readOnly={!!inviteRole}
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
            {isLoading ? "Creating account..." : `Sign Up as ${rc.label}`}
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
