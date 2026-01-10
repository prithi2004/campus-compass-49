import DashboardLayout from "@/components/layout/DashboardLayout";
import { ClipboardCheck, TrendingUp, TrendingDown, Calendar, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const attendanceData = [
  {
    id: 1,
    code: "CS501",
    subject: "Data Structures & Algorithms",
    totalClasses: 24,
    attended: 22,
    percentage: 91.7,
    status: "good",
  },
  {
    id: 2,
    code: "CS502",
    subject: "Operating Systems",
    totalClasses: 20,
    attended: 19,
    percentage: 95.0,
    status: "good",
  },
  {
    id: 3,
    code: "CS503",
    subject: "Database Management Systems",
    totalClasses: 22,
    attended: 20,
    percentage: 90.9,
    status: "good",
  },
  {
    id: 4,
    code: "MA501",
    subject: "Engineering Mathematics III",
    totalClasses: 18,
    attended: 17,
    percentage: 94.4,
    status: "good",
  },
  {
    id: 5,
    code: "CS504",
    subject: "Computer Networks",
    totalClasses: 16,
    attended: 15,
    percentage: 93.8,
    status: "good",
  },
  {
    id: 6,
    code: "CS505",
    subject: "Software Engineering",
    totalClasses: 14,
    attended: 14,
    percentage: 100.0,
    status: "excellent",
  },
];

const monthlyAttendance = [
  { month: "August", percentage: 96 },
  { month: "September", percentage: 92 },
  { month: "October", percentage: 88 },
  { month: "November", percentage: 95 },
  { month: "December", percentage: 94 },
  { month: "January", percentage: 93 },
];

const recentAbsences = [
  { date: "Jan 8, 2025", subject: "Data Structures", reason: "Medical Leave" },
  { date: "Jan 3, 2025", subject: "Computer Networks", reason: "Personal" },
  { date: "Dec 20, 2024", subject: "DBMS", reason: "Medical Leave" },
  { date: "Dec 15, 2024", subject: "DBMS", reason: "Event Participation" },
];

const StudentAttendance = () => {
  const totalClasses = attendanceData.reduce((sum, s) => sum + s.totalClasses, 0);
  const totalAttended = attendanceData.reduce((sum, s) => sum + s.attended, 0);
  const overallPercentage = ((totalAttended / totalClasses) * 100).toFixed(1);

  return (
    <DashboardLayout role="student" title="My Attendance">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overall Attendance</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">{overallPercentage}%</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-success">
            <TrendingUp className="w-4 h-4" />
            <span>Above 75% required</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Classes Attended</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">{totalAttended}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">of {totalClasses} total classes</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Classes Missed</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">{totalClasses - totalAttended}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">This semester</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Can Miss</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">21</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-info" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">More classes safely</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-wise Attendance */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-heading font-semibold text-card-foreground mb-6">
            Subject-wise Attendance
          </h3>
          <div className="space-y-4">
            {attendanceData.map((subject) => (
              <div key={subject.id} className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                      {subject.code}
                    </span>
                    <span className="font-medium text-card-foreground">{subject.subject}</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    subject.percentage >= 90 ? "text-success" : 
                    subject.percentage >= 75 ? "text-warning" : "text-destructive"
                  }`}>
                    {subject.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress 
                    value={subject.percentage} 
                    className={`flex-1 h-2 ${
                      subject.percentage >= 90 ? "[&>div]:bg-success" : 
                      subject.percentage >= 75 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {subject.attended}/{subject.totalClasses} classes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Monthly Trend */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
              Monthly Trend
            </h3>
            <div className="space-y-3">
              {monthlyAttendance.map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          month.percentage >= 90 ? "bg-success" : "bg-warning"
                        }`}
                        style={{ width: `${month.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-card-foreground w-10">
                      {month.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Absences */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
              Recent Absences
            </h3>
            <div className="space-y-3">
              {recentAbsences.map((absence, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-card-foreground">{absence.subject}</span>
                    <span className="text-xs text-muted-foreground">{absence.date}</span>
                  </div>
                  <span className="text-xs text-warning">{absence.reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentAttendance;
