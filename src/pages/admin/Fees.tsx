import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/dashboard/StatCard";
import {
  Search,
  Filter,
  Download,
  CreditCard,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FeeRecord {
  id: string;
  studentName: string;
  regNo: string;
  course: string;
  totalFee: number;
  paid: number;
  pending: number;
  dueDate: string;
  status: "paid" | "partial" | "pending" | "overdue";
}

const feeData: FeeRecord[] = [
  { id: "1", studentName: "Arjun Patel", regNo: "STU001", course: "B.Tech CSE", totalFee: 125000, paid: 125000, pending: 0, dueDate: "2025-01-15", status: "paid" },
  { id: "2", studentName: "Sneha Reddy", regNo: "STU002", course: "B.Tech ECE", totalFee: 125000, paid: 75000, pending: 50000, dueDate: "2025-01-15", status: "partial" },
  { id: "3", studentName: "Mohammed Ali", regNo: "STU003", course: "B.Tech Mech", totalFee: 125000, paid: 0, pending: 125000, dueDate: "2025-01-10", status: "overdue" },
  { id: "4", studentName: "Priya Nair", regNo: "STU004", course: "M.Tech CSE", totalFee: 85000, paid: 85000, pending: 0, dueDate: "2025-01-20", status: "paid" },
  { id: "5", studentName: "Rahul Sharma", regNo: "STU005", course: "B.Tech Civil", totalFee: 125000, paid: 0, pending: 125000, dueDate: "2025-01-25", status: "pending" },
  { id: "6", studentName: "Kavitha Krishnan", regNo: "STU006", course: "B.Tech CSE", totalFee: 125000, paid: 100000, pending: 25000, dueDate: "2025-01-15", status: "partial" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const Fees = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = feeData.filter(
    (record) =>
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCollected = feeData.reduce((sum, r) => sum + r.paid, 0);
  const totalPending = feeData.reduce((sum, r) => sum + r.pending, 0);
  const overdueCount = feeData.filter((r) => r.status === "overdue").length;

  return (
    <DashboardLayout role="admin" title="Fee Management">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          change="This semester"
          changeType="positive"
          icon={CreditCard}
          iconColor="text-success"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(totalPending)}
          change={`${feeData.filter(r => r.status !== "paid").length} students`}
          changeType="negative"
          icon={IndianRupee}
          iconColor="text-warning"
        />
        <StatCard
          title="Overdue Payments"
          value={overdueCount}
          change="Immediate attention"
          changeType="negative"
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
        <StatCard
          title="Fully Paid"
          value={feeData.filter(r => r.status === "paid").length}
          change="Students cleared"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-success"
        />
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
            <Send className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Fee Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Reg. No</th>
                <th>Student Name</th>
                <th>Course</th>
                <th>Total Fee</th>
                <th>Paid</th>
                <th>Pending</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <td className="font-medium">{formatCurrency(record.totalFee)}</td>
                  <td className="text-success font-medium">{formatCurrency(record.paid)}</td>
                  <td className={record.pending > 0 ? "text-destructive font-medium" : ""}>
                    {formatCurrency(record.pending)}
                  </td>
                  <td>{record.dueDate}</td>
                  <td>
                    <span className={
                      record.status === "paid" ? "badge-success" :
                      record.status === "partial" ? "badge-warning" :
                      record.status === "overdue" ? "badge-destructive" : "badge-info"
                    }>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Record Payment</DropdownMenuItem>
                        <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                        <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default Fees;
