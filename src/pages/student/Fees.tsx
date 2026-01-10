import DashboardLayout from "@/components/layout/DashboardLayout";
import { CreditCard, Download, CheckCircle2, Clock, AlertCircle, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

const feeStructure = {
  tuitionFee: 75000,
  examFee: 5000,
  libraryFee: 2000,
  labFee: 8000,
  transportFee: 15000,
  hostelFee: 45000,
  miscFee: 5000,
  total: 155000,
};

const paymentHistory = [
  {
    id: 1,
    transactionId: "TXN2025010512345",
    date: "Jan 5, 2025",
    semester: "Semester 5",
    amount: 77500,
    mode: "Online - Net Banking",
    status: "success",
    receiptNo: "REC/2025/00145",
  },
  {
    id: 2,
    transactionId: "TXN2024070598765",
    date: "Jul 5, 2024",
    semester: "Semester 4",
    amount: 75000,
    mode: "Online - UPI",
    status: "success",
    receiptNo: "REC/2024/00892",
  },
  {
    id: 3,
    transactionId: "TXN2024010534521",
    date: "Jan 8, 2024",
    semester: "Semester 3",
    amount: 72000,
    mode: "Online - Credit Card",
    status: "success",
    receiptNo: "REC/2024/00123",
  },
  {
    id: 4,
    transactionId: "TXN2023070567890",
    date: "Jul 10, 2023",
    semester: "Semester 2",
    amount: 70000,
    mode: "Offline - DD",
    status: "success",
    receiptNo: "REC/2023/00567",
  },
  {
    id: 5,
    transactionId: "TXN2023010512378",
    date: "Jan 15, 2023",
    semester: "Semester 1",
    amount: 85000,
    mode: "Online - Net Banking",
    status: "success",
    receiptNo: "REC/2023/00089",
  },
];

const upcomingPayments = [
  {
    id: 1,
    type: "Semester 6 Fee",
    amount: 77500,
    dueDate: "Jun 15, 2025",
    status: "upcoming",
  },
];

const StudentFees = () => {
  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);

  const handleDownloadReceipt = (receiptNo: string) => {
    alert(`Downloading receipt ${receiptNo}...`);
  };

  return (
    <DashboardLayout role="student" title="Fee Status">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fee Status</p>
              <p className="text-2xl font-bold text-success mt-1">Paid</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Semester 5 - Clear</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-card-foreground mt-1">
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Till date</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Next Due</p>
              <p className="text-2xl font-bold text-card-foreground mt-1">₹77,500</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Jun 15, 2025</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-success mt-1">₹0</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-success" />
            </div>
          </div>
          <p className="text-sm text-success mt-2">No dues</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment History */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground">
              Payment History
            </h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          </div>

          <div className="space-y-4">
            {paymentHistory.map((payment) => (
              <div 
                key={payment.id}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-card-foreground">{payment.semester}</h4>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-card-foreground">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                      {payment.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">
                      <span className="text-card-foreground">TXN:</span> {payment.transactionId}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="text-card-foreground">Mode:</span> {payment.mode}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadReceipt(payment.receiptNo)}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Fee Structure */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
              Fee Structure (Per Semester)
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Tuition Fee</span>
                <span className="font-medium text-card-foreground">₹{feeStructure.tuitionFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Exam Fee</span>
                <span className="font-medium text-card-foreground">₹{feeStructure.examFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Library Fee</span>
                <span className="font-medium text-card-foreground">₹{feeStructure.libraryFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Lab Fee</span>
                <span className="font-medium text-card-foreground">₹{feeStructure.labFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Transport Fee</span>
                <span className="font-medium text-card-foreground">₹{feeStructure.transportFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Hostel Fee</span>
                <span className="font-medium text-card-foreground">₹{feeStructure.hostelFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Misc. Fee</span>
                <span className="font-medium text-card-foreground">₹{feeStructure.miscFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="font-semibold text-card-foreground">Total</span>
                <span className="font-bold text-primary text-lg">₹{feeStructure.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Payments */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
              Upcoming Payments
            </h3>
            {upcomingPayments.length > 0 ? (
              <div className="space-y-3">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="p-4 rounded-xl bg-warning/10 border border-warning/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-card-foreground">{payment.type}</span>
                      <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-card-foreground mb-1">
                      ₹{payment.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {payment.dueDate}
                    </p>
                    <Button className="w-full mt-3" size="sm">
                      Pay Now
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                <p className="text-muted-foreground">No upcoming payments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentFees;
