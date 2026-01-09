import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import Departments from "./pages/admin/Departments";
import Courses from "./pages/admin/Courses";
import Timetable from "./pages/admin/Timetable";
import Attendance from "./pages/admin/Attendance";
import Exams from "./pages/admin/Exams";
import Fees from "./pages/admin/Fees";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/thank-you" element={<ThankYou />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/courses" element={<Courses />} />
          <Route path="/admin/timetable" element={<Timetable />} />
          <Route path="/admin/attendance" element={<Attendance />} />
          <Route path="/admin/exams" element={<Exams />} />
          <Route path="/admin/fees" element={<Fees />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          
          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/students" element={<StaffDashboard />} />
          <Route path="/staff/subjects" element={<StaffDashboard />} />
          <Route path="/staff/timetable" element={<StaffDashboard />} />
          <Route path="/staff/attendance" element={<StaffDashboard />} />
          <Route path="/staff/exams" element={<StaffDashboard />} />
          <Route path="/staff/leave" element={<StaffDashboard />} />
          <Route path="/staff/profile" element={<StaffDashboard />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentDashboard />} />
          <Route path="/student/timetable" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<StudentDashboard />} />
          <Route path="/student/results" element={<StudentDashboard />} />
          <Route path="/student/fees" element={<StudentDashboard />} />
          <Route path="/student/certificates" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentDashboard />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
