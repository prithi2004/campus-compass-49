import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Calendar,
  Users,
  GraduationCap,
  CreditCard,
  ClipboardCheck,
  Award,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  lastGenerated: string;
  color: string;
}

const reports: ReportCard[] = [
  { id: "1", title: "Attendance Report", description: "Comprehensive attendance analysis for all students", icon: ClipboardCheck, lastGenerated: "Jan 8, 2025", color: "text-info" },
  { id: "2", title: "Fee Collection Report", description: "Fee status and payment history", icon: CreditCard, lastGenerated: "Jan 7, 2025", color: "text-success" },
  { id: "3", title: "Exam Performance Report", description: "Student performance analysis across exams", icon: Award, lastGenerated: "Jan 5, 2025", color: "text-warning" },
  { id: "4", title: "Staff Report", description: "Staff attendance and workload distribution", icon: Users, lastGenerated: "Jan 6, 2025", color: "text-primary" },
  { id: "5", title: "Student Enrollment Report", description: "Enrollment statistics and trends", icon: GraduationCap, lastGenerated: "Jan 3, 2025", color: "text-info" },
  { id: "6", title: "Academic Progress Report", description: "Overall academic performance trends", icon: TrendingUp, lastGenerated: "Jan 4, 2025", color: "text-success" },
];

const quickStats = [
  { label: "Reports Generated", value: "156", change: "This month" },
  { label: "Scheduled Reports", value: "12", change: "Pending" },
  { label: "Custom Templates", value: "8", change: "Available" },
];

const Reports = () => {
  return (
    <DashboardLayout role="admin" title="Reports">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {quickStats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xs text-primary">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-heading font-semibold text-foreground">Available Reports</h2>
        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Create Custom Report
          </Button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <report.icon className={`w-6 h-6 ${report.color}`} />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-card-foreground">
                  {report.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {report.description}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Last generated: {report.lastGenerated}
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Downloads */}
      <div className="glass-card p-6 mt-8">
        <h3 className="font-heading font-semibold text-card-foreground mb-4">Recent Downloads</h3>
        <div className="space-y-3">
          {[
            { name: "Attendance_Report_Jan2025.pdf", date: "Jan 8, 2025 14:32", size: "2.4 MB" },
            { name: "Fee_Collection_Q4_2024.xlsx", date: "Jan 7, 2025 10:15", size: "1.8 MB" },
            { name: "Student_Performance_Sem1.pdf", date: "Jan 5, 2025 16:45", size: "3.2 MB" },
          ].map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{file.size}</span>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
