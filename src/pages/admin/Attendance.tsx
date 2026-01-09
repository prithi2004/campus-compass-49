import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AttendanceRecord {
  id: string;
  studentName: string;
  regNo: string;
  course: string;
  totalClasses: number;
  attended: number;
  percentage: number;
  status: "good" | "average" | "low";
}

const attendanceData: AttendanceRecord[] = [
  { id: "1", studentName: "Arjun Patel", regNo: "STU001", course: "B.Tech CSE", totalClasses: 120, attended: 112, percentage: 93.3, status: "good" },
  { id: "2", studentName: "Sneha Reddy", regNo: "STU002", course: "B.Tech ECE", totalClasses: 120, attended: 96, percentage: 80, status: "average" },
  { id: "3", studentName: "Mohammed Ali", regNo: "STU003", course: "B.Tech Mech", totalClasses: 120, attended: 108, percentage: 90, status: "good" },
  { id: "4", studentName: "Priya Nair", regNo: "STU004", course: "M.Tech CSE", totalClasses: 60, attended: 58, percentage: 96.7, status: "good" },
  { id: "5", studentName: "Rahul Sharma", regNo: "STU005", course: "B.Tech Civil", totalClasses: 120, attended: 72, percentage: 60, status: "low" },
  { id: "6", studentName: "Kavitha Krishnan", regNo: "STU006", course: "B.Tech CSE", totalClasses: 120, attended: 90, percentage: 75, status: "average" },
];

const todayStats = [
  { label: "Total Classes", value: 48, icon: Calendar, color: "text-info" },
  { label: "Present", value: 1842, icon: CheckCircle2, color: "text-success" },
  { label: "Absent", value: 156, icon: XCircle, color: "text-destructive" },
  { label: "On Leave", value: 23, icon: Clock, color: "text-warning" },
];

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = attendanceData.filter(
    (record) =>
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Attendance Management">
      {/* Today's Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {todayStats.map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-muted"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Select Date
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Reg. No</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Total Classes</th>
                <th>Attended</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className="font-medium text-card-foreground">{record.regNo}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-info">
                          {record.studentName.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <span className="font-medium text-card-foreground">{record.studentName}</span>
                    </div>
                  </td>
                  <td>{record.course}</td>
                  <td className="text-center">{record.totalClasses}</td>
                  <td className="text-center">{record.attended}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Progress 
                        value={record.percentage} 
                        className={`h-2 w-24 ${
                          record.status === "good" ? "[&>div]:bg-success" :
                          record.status === "average" ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                        }`}
                      />
                      <span className={`text-sm font-medium ${
                        record.status === "good" ? "text-success" :
                        record.status === "average" ? "text-warning" : "text-destructive"
                      }`}>
                        {record.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={
                      record.status === "good" ? "badge-success" :
                      record.status === "average" ? "badge-warning" : "badge-destructive"
                    }>
                      {record.status === "good" ? "Good" : record.status === "average" ? "Average" : "Low"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
