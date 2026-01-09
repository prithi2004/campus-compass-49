import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "admin" | "staff" | "student";
  title: string;
}

const DashboardLayout = ({ children, role, title }: DashboardLayoutProps) => {
  return (
    <div className="erp-gradient-bg flex">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-card/80 backdrop-blur-lg border-b border-border/50 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-heading font-semibold text-card-foreground">
              {title}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search..." 
                className="pl-10 w-64 h-9 bg-muted/50 border-0"
              />
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-card-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            
            {/* Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-card-foreground capitalize">
                  {role} User
                </p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
