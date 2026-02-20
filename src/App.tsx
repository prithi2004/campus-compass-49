import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import StaffManagement from "./pages/admin/StaffManagement";
import StudentManagement from "./pages/admin/StudentManagement";
import Departments from "./pages/admin/Departments";
import Courses from "./pages/admin/Courses";
import AutoTimetable from "./pages/admin/AutoTimetable";
import BiometricAttendance from "./pages/admin/BiometricAttendance";
import Notifications from "./pages/admin/Notifications";
import PointsSystem from "./pages/admin/PointsSystem";
import QRAdmission from "./pages/admin/QRAdmission";
import Exams from "./pages/admin/Exams";
import Fees from "./pages/admin/Fees";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
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
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/thank-you" element={<ThankYou />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/status" element={<ProtectedRoute allowedRoles={["admin"]}><StatusManagement /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={["admin"]}><StaffManagement /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><StudentManagement /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={["admin"]}><Departments /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={["admin"]}><Courses /></ProtectedRoute>} />
            <Route path="/admin/auto-timetable" element={<ProtectedRoute allowedRoles={["admin"]}><AutoTimetable /></ProtectedRoute>} />
            <Route path="/admin/biometric" element={<ProtectedRoute allowedRoles={["admin"]}><BiometricAttendance /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={["admin"]}><Notifications /></ProtectedRoute>} />
            <Route path="/admin/points" element={<ProtectedRoute allowedRoles={["admin"]}><PointsSystem /></ProtectedRoute>} />
            <Route path="/admin/qr-admission" element={<ProtectedRoute allowedRoles={["admin"]}><QRAdmission /></ProtectedRoute>} />
            <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={["admin"]}><Exams /></ProtectedRoute>} />
            <Route path="/admin/fees" element={<ProtectedRoute allowedRoles={["admin"]}><Fees /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><Reports /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
            
            {/* Staff Routes */}
            <Route path="/staff/dashboard" element={<ProtectedRoute allowedRoles={["staff"]}><StaffDashboard /></ProtectedRoute>} />
            <Route path="/staff/students" element={<ProtectedRoute allowedRoles={["staff"]}><StaffStudents /></ProtectedRoute>} />
            <Route path="/staff/subjects" element={<ProtectedRoute allowedRoles={["staff"]}><StaffSubjects /></ProtectedRoute>} />
            <Route path="/staff/timetable" element={<ProtectedRoute allowedRoles={["staff"]}><StaffTimetable /></ProtectedRoute>} />
            <Route path="/staff/attendance" element={<ProtectedRoute allowedRoles={["staff"]}><StaffAttendance /></ProtectedRoute>} />
            <Route path="/staff/exams" element={<ProtectedRoute allowedRoles={["staff"]}><StaffExams /></ProtectedRoute>} />
            <Route path="/staff/question-paper" element={<ProtectedRoute allowedRoles={["staff"]}><StaffQuestionPaper /></ProtectedRoute>} />
            <Route path="/staff/leave" element={<ProtectedRoute allowedRoles={["staff"]}><StaffLeave /></ProtectedRoute>} />
            <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={["staff"]}><StaffProfile /></ProtectedRoute>} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/courses" element={<ProtectedRoute allowedRoles={["student"]}><StudentCourses /></ProtectedRoute>} />
            <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={["student"]}><StudentAttendance /></ProtectedRoute>} />
            <Route path="/student/results" element={<ProtectedRoute allowedRoles={["student"]}><StudentResults /></ProtectedRoute>} />
            <Route path="/student/fees" element={<ProtectedRoute allowedRoles={["student"]}><StudentFees /></ProtectedRoute>} />
            <Route path="/student/certificates" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
