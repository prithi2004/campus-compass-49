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
import AutoTimetable from "./pages/admin/AutoTimetable";
import BiometricAttendance from "./pages/admin/BiometricAttendance";
import Notifications from "./pages/admin/Notifications";
import PointsSystem from "./pages/admin/PointsSystem";
import QRAdmission from "./pages/admin/QRAdmission";
import StatusManagement from "./pages/admin/StatusManagement";

// Staff Pages
import StaffDashboard from "./pages/staff/Dashboard";
import StaffStudents from "./pages/staff/Students";
import StaffSubjects from "./pages/staff/Subjects";
import StaffTimetable from "./pages/staff/Timetable";
import StaffAttendance from "./pages/staff/Attendance";
import StaffExams from "./pages/staff/Exams";
import StaffLeave from "./pages/staff/Leave";
import StaffProfile from "./pages/staff/Profile";
import StaffQuestionPaper from "./pages/staff/QuestionPaper";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentAttendance from "./pages/student/Attendance";
import StudentResults from "./pages/student/Results";
import StudentFees from "./pages/student/Fees";

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
          <Route path="/admin/status" element={<StatusManagement />} />
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/students" element={<StudentManagement />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/admin/courses" element={<Courses />} />
          <Route path="/admin/auto-timetable" element={<AutoTimetable />} />
          <Route path="/admin/biometric" element={<BiometricAttendance />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/points" element={<PointsSystem />} />
          <Route path="/admin/qr-admission" element={<QRAdmission />} />
          <Route path="/admin/exams" element={<Exams />} />
          <Route path="/admin/fees" element={<Fees />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          
          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/students" element={<StaffStudents />} />
          <Route path="/staff/subjects" element={<StaffSubjects />} />
          <Route path="/staff/timetable" element={<StaffTimetable />} />
          <Route path="/staff/attendance" element={<StaffAttendance />} />
          <Route path="/staff/exams" element={<StaffExams />} />
          <Route path="/staff/question-paper" element={<StaffQuestionPaper />} />
          <Route path="/staff/leave" element={<StaffLeave />} />
          <Route path="/staff/profile" element={<StaffProfile />} />
          
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCourses />} />
          <Route path="/student/timetable" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/fees" element={<StudentFees />} />
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
