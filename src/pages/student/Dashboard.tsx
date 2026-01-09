import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { 
  BookOpen, 
  Calendar,
  ClipboardCheck,
  CreditCard,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const todayClasses = [
  { id: 1, subject: "Data Structures", time: "9:00 - 10:00 AM", room: "CS-101", faculty: "Dr. Rajesh Kumar", status: "completed" },
  { id: 2, subject: "Operating Systems", time: "10:00 - 11:00 AM", room: "CS-102", faculty: "Prof. Priya Sharma", status: "ongoing" },
  { id: 3, subject: "Mathematics", time: "11:15 - 12:15 PM", room: "M-201", faculty: "Mrs. Lakshmi Devi", status: "upcoming" },
  { id: 4, subject: "DBMS Lab", time: "2:00 - 4:00 PM", room: "Lab-1", faculty: "Mr. Karthik M", status: "upcoming" },
];

const upcomingAssignments = [
  { id: 1, title: "DSA Assignment 3", subject: "Data Structures", dueDate: "Jan 15, 2025", status: "pending" },
  { id: 2, title: "OS Case Study", subject: "Operating Systems", dueDate: "Jan 18, 2025", status: "pending" },
  { id: 3, title: "Database Design Project", subject: "DBMS", dueDate: "Jan 20, 2025", status: "in-progress" },
];

const semesterGrades = [
  { subject: "Data Structures", grade: "A", marks: 88 },
  { subject: "Operating Systems", grade: "A+", marks: 92 },
  { subject: "DBMS", grade: "B+", marks: 78 },
  { subject: "Mathematics", grade: "A", marks: 85 },
];

const StudentDashboard = () => {
  return (
    <DashboardLayout role="student" title="Student Dashboard">
      {/* Welcome Section */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-card-foreground">
              Welcome back, Arjun Patel!
            </h2>
            <p className="text-muted-foreground mt-1">
              B.Tech CSE - 3rd Year • Reg. No: STU001
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-muted-foreground">Semester 5</p>
            <p className="text-lg font-semibold text-card-foreground">
              Academic Year 2024-25
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Attendance"
          value="93.3%"
          change="Above required 75%"
          changeType="positive"
          icon={ClipboardCheck}
          iconColor="text-success"
        />
        <StatCard
          title="Current CGPA"
          value="8.45"
          change="+0.2 from last sem"
          changeType="positive"
          icon={Award}
          iconColor="text-warning"
        />
        <StatCard
          title="Fee Status"
          value="Paid"
          change="Next due: June 2025"
          changeType="positive"
          icon={CreditCard}
          iconColor="text-info"
        />
        <StatCard
          title="Today's Classes"
          value="4"
          change="1 completed"
          changeType="neutral"
          icon={BookOpen}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground">
              Today's Classes
            </h3>
            <Button variant="ghost" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Full Timetable
            </Button>
          </div>
          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <div 
                key={cls.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  cls.status === "ongoing" ? "bg-primary/10 border border-primary/30" :
                  cls.status === "completed" ? "bg-muted/30 opacity-60" : "bg-muted/50"
                }`}
              >
                <div className={`w-2 h-12 rounded-full ${
                  cls.status === "ongoing" ? "bg-primary" :
                  cls.status === "completed" ? "bg-success" : "bg-muted-foreground/30"
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{cls.subject}</p>
                  <p className="text-sm text-muted-foreground">{cls.faculty} • {cls.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-card-foreground">{cls.time}</p>
                  <span className={`text-xs capitalize ${
                    cls.status === "ongoing" ? "text-primary font-medium" :
                    cls.status === "completed" ? "text-success" : "text-muted-foreground"
                  }`}>
                    {cls.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Semester Performance */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground">
              This Semester
            </h3>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="space-y-4">
            {semesterGrades.map((item) => (
              <div key={item.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-card-foreground">{item.subject}</span>
                  <span className={`text-sm font-bold ${
                    item.grade.startsWith("A") ? "text-success" : "text-info"
                  }`}>{item.grade}</span>
                </div>
                <Progress 
                  value={item.marks} 
                  className="h-2 [&>div]:bg-primary"
                />
              </div>
            ))}
          </div>
          <Button className="w-full mt-6" variant="outline">
            View Full Results
          </Button>
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-heading font-semibold text-card-foreground">
            Upcoming Assignments
          </h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingAssignments.map((assignment) => (
            <div 
              key={assignment.id}
              className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  assignment.status === "pending" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"
                }`}>
                  {assignment.status}
                </span>
              </div>
              <h4 className="font-medium text-card-foreground mb-1">{assignment.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{assignment.subject}</p>
              <p className="text-xs text-primary">Due: {assignment.dueDate}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
