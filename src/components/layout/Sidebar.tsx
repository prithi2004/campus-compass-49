import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  BarChart3,
  Clock,
  Award,
  Wand2,
  Fingerprint,
  Bell,
  Trophy,
  QrCode,
  UserCheck,
  UserPlus,
} from "lucide-react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface SidebarProps {
  role: "admin" | "staff" | "student";
}

const adminMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: UserCheck, label: "Status Management", path: "/admin/status" },
  { icon: Users, label: "Staff Management", path: "/admin/staff" },
  { icon: GraduationCap, label: "Student Management", path: "/admin/students" },
  { icon: Building2, label: "Departments", path: "/admin/departments" },
  { icon: BookOpen, label: "Courses & Subjects", path: "/admin/courses" },
  { icon: Wand2, label: "Auto Timetable", path: "/admin/auto-timetable" },
  { icon: Fingerprint, label: "Biometric Attendance", path: "/admin/biometric" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: Trophy, label: "Points System", path: "/admin/points" },
  { icon: QrCode, label: "QR Admission", path: "/admin/qr-admission" },
  { icon: Award, label: "Exams & Results", path: "/admin/exams" },
  { icon: CreditCard, label: "Fee Management", path: "/admin/fees" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
  { icon: UserPlus, label: "Invite Management", path: "/admin/invites" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const staffMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/staff/dashboard" },
  { icon: GraduationCap, label: "My Students", path: "/staff/students" },
  { icon: BookOpen, label: "My Subjects", path: "/staff/subjects" },
  { icon: Calendar, label: "Timetable", path: "/staff/timetable" },
  { icon: ClipboardCheck, label: "Attendance", path: "/staff/attendance" },
  { icon: Award, label: "Exams & Results", path: "/staff/exams" },
  { icon: FileText, label: "Question Paper", path: "/staff/question-paper" },
  { icon: Clock, label: "Leave Requests", path: "/staff/leave" },
  { icon: Settings, label: "Profile", path: "/staff/profile" },
];

const studentMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
  { icon: BookOpen, label: "My Courses", path: "/student/courses" },
  { icon: Calendar, label: "Timetable", path: "/student/timetable" },
  { icon: ClipboardCheck, label: "Attendance", path: "/student/attendance" },
  { icon: Award, label: "Results", path: "/student/results" },
  { icon: CreditCard, label: "Fee Status", path: "/student/fees" },
  { icon: FileText, label: "Certificates", path: "/student/certificates" },
  { icon: Settings, label: "Profile", path: "/student/profile" },
];

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthContext();
  
  const menuItems = role === "admin" 
    ? adminMenu 
    : role === "staff" 
    ? staffMenu 
    : studentMenu;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className="sidebar-glass w-64 min-h-screen flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-sidebar-foreground">
              Dhaanish
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Connect ERP</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "menu-item",
                isActive && "menu-item-active"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="menu-item text-destructive hover:bg-destructive/10 w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
