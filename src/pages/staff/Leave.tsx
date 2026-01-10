import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const leaveBalance = [
  { type: "Casual Leave", total: 12, used: 3, available: 9 },
  { type: "Sick Leave", total: 10, used: 2, available: 8 },
  { type: "Earned Leave", total: 15, used: 5, available: 10 },
  { type: "Special Leave", total: 5, used: 0, available: 5 },
];

const leaveHistory = [
  { id: 1, type: "Casual Leave", from: "Dec 20, 2024", to: "Dec 21, 2024", days: 2, reason: "Personal work", status: "approved", appliedOn: "Dec 15, 2024" },
  { id: 2, type: "Sick Leave", from: "Nov 15, 2024", to: "Nov 16, 2024", days: 2, reason: "Medical appointment", status: "approved", appliedOn: "Nov 14, 2024" },
  { id: 3, type: "Casual Leave", from: "Oct 25, 2024", to: "Oct 25, 2024", days: 1, reason: "Family function", status: "approved", appliedOn: "Oct 20, 2024" },
  { id: 4, type: "Earned Leave", from: "Sep 10, 2024", to: "Sep 14, 2024", days: 5, reason: "Vacation", status: "approved", appliedOn: "Aug 25, 2024" },
  { id: 5, type: "Casual Leave", from: "Jan 15, 2025", to: "Jan 16, 2025", days: 2, reason: "Personal work", status: "pending", appliedOn: "Jan 8, 2025" },
];

const StaffLeave = () => {
  const { toast } = useToast();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const submitLeaveRequest = () => {
    if (!leaveType || !fromDate || !toDate || !reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Leave request submitted",
      description: "Your leave request has been sent for approval.",
    });

    setShowApplyModal(false);
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setReason("");
  };

  return (
    <DashboardLayout role="staff" title="Leave Requests">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Leave Management</h2>
          <p className="text-muted-foreground">Apply for leave and track your requests</p>
        </div>
        <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Apply Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Apply for Leave</DialogTitle>
              <DialogDescription>
                Fill in the details to submit your leave request.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Leave Type *</Label>
                <Select value={leaveType} onValueChange={setLeaveType}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual Leave (9 available)</SelectItem>
                    <SelectItem value="sick">Sick Leave (8 available)</SelectItem>
                    <SelectItem value="earned">Earned Leave (10 available)</SelectItem>
                    <SelectItem value="special">Special Leave (5 available)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">From Date *</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">To Date *</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground">Reason *</Label>
                <Textarea
                  placeholder="Enter reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="bg-muted/50 border-border/50 resize-none"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-card-foreground">Supporting Document (Optional)</Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center">
                  <FileText className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-primary hover:underline text-sm">Upload document</span>
                    <input type="file" className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitLeaveRequest}>
                Submit Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {leaveBalance.map((leave) => (
          <div key={leave.type} className="glass-card p-5">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{leave.type}</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">{leave.available}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-card-foreground">{leave.used} used</p>
                <p className="text-xs text-muted-foreground">of {leave.total} total</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(leave.available / leave.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Leave History */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-heading font-semibold text-card-foreground">
            Leave History
          </h3>
        </div>
        <table className="erp-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Period</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Applied On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveHistory.map((leave) => (
              <tr key={leave.id}>
                <td className="font-medium">{leave.type}</td>
                <td>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {leave.from} - {leave.to}
                  </div>
                </td>
                <td>
                  <span className="font-semibold text-primary">{leave.days}</span>
                </td>
                <td className="max-w-xs truncate">{leave.reason}</td>
                <td className="text-muted-foreground">{leave.appliedOn}</td>
                <td>
                  <span className={`badge flex items-center gap-1 w-fit ${
                    leave.status === "approved" ? "badge-success" :
                    leave.status === "pending" ? "badge-warning" : "badge-error"
                  }`}>
                    {leave.status === "approved" && <CheckCircle2 className="w-3 h-3" />}
                    {leave.status === "pending" && <Clock className="w-3 h-3" />}
                    {leave.status === "rejected" && <XCircle className="w-3 h-3" />}
                    {leave.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default StaffLeave;
