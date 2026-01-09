import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Building2,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const recentActivities = [
  { id: 1, action: "New student enrolled", user: "John Doe", time: "2 mins ago", type: "success" },
  { id: 2, action: "Fee payment received", user: "Jane Smith", time: "15 mins ago", type: "success" },
  { id: 3, action: "Attendance marked", user: "Prof. Kumar", time: "1 hour ago", type: "info" },
  { id: 4, action: "Leave request pending", user: "Dr. Priya", time: "2 hours ago", type: "warning" },
  { id: 5, action: "Exam results published", user: "Admin", time: "3 hours ago", type: "success" },
];

const upcomingEvents = [
  { id: 1, title: "Mid-Term Exams", date: "Jan 15, 2025", type: "exam" },
  { id: 2, title: "Parent-Teacher Meeting", date: "Jan 20, 2025", type: "meeting" },
  { id: 3, title: "Annual Day", date: "Feb 10, 2025", type: "event" },
  { id: 4, title: "Sports Day", date: "Feb 25, 2025", type: "event" },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value="2,547"
          change="+12% from last month"
          changeType="positive"
          icon={GraduationCap}
        />
        <StatCard
          title="Total Staff"
          value="186"
          change="+3 new this month"
          changeType="positive"
          icon={Users}
        />
        <StatCard
          title="Active Courses"
          value="48"
          change="Across 8 departments"
          changeType="neutral"
          icon={BookOpen}
        />
        <StatCard
          title="Departments"
          value="8"
          change="All active"
          changeType="neutral"
          icon={Building2}
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Attendance Rate"
          value="94.2%"
          change="+2.1% improvement"
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatCard
          title="Pending Fees"
          value="₹4.2L"
          change="12 students pending"
          changeType="negative"
          icon={AlertCircle}
          iconColor="text-warning"
        />
        <StatCard
          title="Today's Classes"
          value="24"
          change="6 completed, 18 remaining"
          changeType="neutral"
          icon={Clock}
          iconColor="text-info"
        />
      </div>

      {/* Activity & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">
              Recent Activities
            </h2>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === "success" ? "bg-success" :
                  activity.type === "warning" ? "bg-warning" : "bg-info"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by {activity.user}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-heading font-semibold text-card-foreground">
              Upcoming Events
            </h2>
            <Button variant="ghost" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">
                    {event.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.date}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  event.type === "exam" ? "badge-warning" :
                  event.type === "meeting" ? "badge-info" : "badge-success"
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
