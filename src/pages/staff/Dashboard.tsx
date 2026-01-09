import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { 
  Users, 
  BookOpen, 
  Calendar,
  ClipboardCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const todayClasses = [
  { id: 1, subject: "Data Structures", time: "9:00 - 10:00 AM", room: "CS-101", batch: "CSE-3A", status: "completed" },
  { id: 2, subject: "Data Structures Lab", time: "10:00 - 12:00 PM", room: "Lab-2", batch: "CSE-3A", status: "ongoing" },
  { id: 3, subject: "Algorithms", time: "2:00 - 3:00 PM", room: "CS-102", batch: "CSE-3B", status: "upcoming" },
  { id: 4, subject: "Data Structures", time: "3:00 - 4:00 PM", room: "CS-101", batch: "CSE-3B", status: "upcoming" },
];

const recentAssignments = [
  { id: 1, title: "DSA Assignment 3", subject: "Data Structures", dueDate: "Jan 15, 2025", submissions: 42, total: 50 },
  { id: 2, title: "Lab Exercise 5", subject: "DS Lab", dueDate: "Jan 12, 2025", submissions: 48, total: 50 },
  { id: 3, title: "Quiz 2", subject: "Algorithms", dueDate: "Jan 10, 2025", submissions: 50, total: 50 },
];

const StaffDashboard = () => {
  return (
    <DashboardLayout role="staff" title="Staff Dashboard">
      {/* Welcome Section */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-card-foreground">
              Welcome back, Dr. Rajesh Kumar!
            </h2>
            <p className="text-muted-foreground mt-1">
              Department of Computer Science & Engineering
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-lg font-semibold text-card-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="My Students"
          value="156"
          change="Across 4 sections"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          title="Today's Classes"
          value="4"
          change="2 completed, 2 remaining"
          changeType="neutral"
          icon={BookOpen}
        />
        <StatCard
          title="Pending Attendance"
          value="2"
          change="Mark before EOD"
          changeType="negative"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Leave Balance"
          value="12"
          change="Days remaining"
          changeType="positive"
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground">
              Today's Schedule
            </h3>
            <Button variant="ghost" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              View Full
            </Button>
          </div>
          <div className="space-y-4">
            {todayClasses.map((cls) => (
              <div 
                key={cls.id}
                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                  cls.status === "ongoing" ? "bg-primary/10 border border-primary/30" :
                  cls.status === "completed" ? "bg-muted/30" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  cls.status === "ongoing" ? "bg-primary" :
                  cls.status === "completed" ? "bg-success" : "bg-muted"
                }`}>
                  {cls.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-success-foreground" />
                  ) : (
                    <Clock className={`w-5 h-5 ${cls.status === "ongoing" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{cls.subject}</p>
                  <p className="text-sm text-muted-foreground">
                    {cls.batch} • {cls.room}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-card-foreground">{cls.time}</p>
                  <span className={`text-xs ${
                    cls.status === "ongoing" ? "text-primary" :
                    cls.status === "completed" ? "text-success" : "text-muted-foreground"
                  }`}>
                    {cls.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground">
              Recent Assignments
            </h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentAssignments.map((assignment) => (
              <div 
                key={assignment.id}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-card-foreground">{assignment.title}</p>
                    <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">Due: {assignment.dueDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {assignment.submissions}/{assignment.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4" variant="outline">
            Create New Assignment
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
