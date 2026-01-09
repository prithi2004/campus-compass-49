import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap } from "lucide-react";

type UserRole = "admin" | "staff" | "student";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate based on role
    if (role === "admin") {
      navigate("/admin/dashboard");
    } else if (role === "staff") {
      navigate("/staff/dashboard");
    } else {
      navigate("/student/dashboard");
    }
  };

  return (
    <div className="erp-gradient-bg flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        {/* Logo & Title */}
        <div className="text-center mb-8">
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

        {/* Role Selection */}
        <div className="flex justify-center gap-3 mb-8">
          {(["admin", "staff", "student"] as UserRole[]).map((r) => (
            <Button
              key={r}
              variant={role === r ? "roleActive" : "role"}
              onClick={() => setRole(r)}
              className="capitalize"
            >
              {r}
            </Button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Username / Register No"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white border-muted"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-muted"
            />
          </div>
          <Button type="submit" size="xl" className="w-full mt-6">
            Login
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2025{" "}
          <span className="text-primary font-medium">Dhaanish Connect ERP</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
