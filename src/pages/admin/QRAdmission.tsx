import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  QrCode, 
  Scan, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  Search,
  RefreshCw,
  Users,
  FileText,
  Printer,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface Admission {
  id: string;
  name: string;
  applicationNo: string;
  department: string;
  qrCode: string;
  status: "pending" | "verified" | "enrolled" | "rejected";
  documents: { name: string; verified: boolean }[];
  verifiedAt?: string;
  verifiedBy?: string;
}

const mockAdmissions: Admission[] = [
  {
    id: "1",
    name: "Vikram Singh",
    applicationNo: "ADM2024001",
    department: "Computer Science",
    qrCode: "QR-ADM2024001-CS",
    status: "verified",
    documents: [
      { name: "10th Marksheet", verified: true },
      { name: "12th Marksheet", verified: true },
      { name: "Transfer Certificate", verified: true },
      { name: "Community Certificate", verified: false },
    ],
    verifiedAt: "2024-01-15 10:30 AM",
    verifiedBy: "Admin - John Doe",
  },
  {
    id: "2",
    name: "Ananya Krishnan",
    applicationNo: "ADM2024002",
    department: "Electronics",
    qrCode: "QR-ADM2024002-EC",
    status: "pending",
    documents: [
      { name: "10th Marksheet", verified: true },
      { name: "12th Marksheet", verified: true },
      { name: "Transfer Certificate", verified: false },
      { name: "Community Certificate", verified: false },
    ],
  },
  {
    id: "3",
    name: "Mohammed Farhan",
    applicationNo: "ADM2024003",
    department: "Mechanical",
    qrCode: "QR-ADM2024003-ME",
    status: "enrolled",
    documents: [
      { name: "10th Marksheet", verified: true },
      { name: "12th Marksheet", verified: true },
      { name: "Transfer Certificate", verified: true },
      { name: "Community Certificate", verified: true },
    ],
    verifiedAt: "2024-01-14 02:15 PM",
    verifiedBy: "Admin - Jane Smith",
  },
  {
    id: "4",
    name: "Deepika Ramesh",
    applicationNo: "ADM2024004",
    department: "Civil",
    qrCode: "QR-ADM2024004-CE",
    status: "rejected",
    documents: [
      { name: "10th Marksheet", verified: true },
      { name: "12th Marksheet", verified: false },
      { name: "Transfer Certificate", verified: false },
      { name: "Community Certificate", verified: false },
    ],
    verifiedAt: "2024-01-13 11:00 AM",
    verifiedBy: "Admin - John Doe",
  },
];

const QRAdmission = () => {
  const [admissions, setAdmissions] = useState(mockAdmissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [scannedCode, setScannedCode] = useState("");
  const [showScanResult, setShowScanResult] = useState(false);
  const [scannedAdmission, setScannedAdmission] = useState<Admission | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  const stats = {
    total: admissions.length,
    pending: admissions.filter(a => a.status === "pending").length,
    verified: admissions.filter(a => a.status === "verified").length,
    enrolled: admissions.filter(a => a.status === "enrolled").length,
  };

  const filteredAdmissions = admissions.filter(admission => {
    const matchesSearch = admission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          admission.applicationNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || admission.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleScan = () => {
    if (!scannedCode) {
      toast.error("Please enter or scan a QR code");
      return;
    }

    const found = admissions.find(a => a.qrCode === scannedCode || a.applicationNo === scannedCode);
    if (found) {
      setScannedAdmission(found);
      setShowScanResult(true);
      toast.success("Application found!");
    } else {
      toast.error("No application found with this QR code");
    }
    setScannedCode("");
  };

  const verifyDocument = (admissionId: string, docName: string) => {
    setAdmissions(prev => prev.map(a => {
      if (a.id === admissionId) {
        return {
          ...a,
          documents: a.documents.map(d => 
            d.name === docName ? { ...d, verified: true } : d
          ),
        };
      }
      return a;
    }));
    toast.success(`${docName} verified`);
  };

  const updateStatus = (admissionId: string, status: Admission["status"]) => {
    setAdmissions(prev => prev.map(a => {
      if (a.id === admissionId) {
        return {
          ...a,
          status,
          verifiedAt: new Date().toLocaleString(),
          verifiedBy: "Admin - Current User",
        };
      }
      return a;
    }));
    toast.success(`Application ${status}`);
    setShowScanResult(false);
    setShowDetails(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge className="bg-yellow-500">Pending</Badge>;
      case "verified": return <Badge className="bg-blue-500">Verified</Badge>;
      case "enrolled": return <Badge className="bg-green-500">Enrolled</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const generateQRCode = (code: string) => (
    <div className="w-32 h-32 bg-muted flex items-center justify-center border-2 border-dashed rounded-lg">
      <div className="text-center">
        <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
        <p className="text-xs mt-2 font-mono">{code}</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">QR Admission Verification</h1>
            <p className="text-muted-foreground">Scan and verify student admissions using QR codes</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export All QR Codes
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Applications</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <CheckCircle2 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verified}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enrolled}</p>
                <p className="text-sm text-muted-foreground">Enrolled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scan" className="space-y-4">
          <TabsList>
            <TabsTrigger value="scan">Scan & Verify</TabsTrigger>
            <TabsTrigger value="applications">All Applications</TabsTrigger>
            <TabsTrigger value="generate">Generate QR</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scan className="w-5 h-5" />
                    Scan QR Code
                  </CardTitle>
                  <CardDescription>Scan or enter the QR code to verify admission</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                    <div className="text-center">
                      <Scan className="w-16 h-16 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Camera preview would appear here</p>
                      <Button variant="outline" className="mt-4">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Enable Camera
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input 
                      placeholder="Or enter QR code / Application No manually..."
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value)}
                    />
                    <Button onClick={handleScan}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Scan Result */}
              {showScanResult && scannedAdmission && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Verification Result</span>
                      {getStatusBadge(scannedAdmission.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      {generateQRCode(scannedAdmission.qrCode)}
                      <div className="flex-1 space-y-2">
                        <p className="text-lg font-semibold">{scannedAdmission.name}</p>
                        <p className="text-sm text-muted-foreground">{scannedAdmission.applicationNo}</p>
                        <Badge variant="outline">{scannedAdmission.department}</Badge>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="font-medium mb-2">Document Verification</p>
                      <div className="space-y-2">
                        {scannedAdmission.documents.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex items-center gap-2">
                              {doc.verified ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">{doc.name}</span>
                            </div>
                            {!doc.verified && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => verifyDocument(scannedAdmission.id, doc.name)}
                              >
                                Verify
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {scannedAdmission.status === "pending" && (
                      <div className="flex gap-2 pt-4">
                        <Button 
                          className="flex-1"
                          onClick={() => updateStatus(scannedAdmission.id, "verified")}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="flex-1"
                          onClick={() => updateStatus(scannedAdmission.id, "rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {scannedAdmission.status === "verified" && (
                      <Button 
                        className="w-full"
                        onClick={() => updateStatus(scannedAdmission.id, "enrolled")}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Complete Enrollment
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="flex gap-4 p-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or application number..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Applications Table */}
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">QR Code</th>
                      <th className="text-left p-4 font-medium">Applicant</th>
                      <th className="text-left p-4 font-medium">Department</th>
                      <th className="text-left p-4 font-medium">Documents</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmissions.map(admission => (
                      <tr key={admission.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <QrCode className="w-6 h-6" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{admission.name}</p>
                            <p className="text-sm text-muted-foreground">{admission.applicationNo}</p>
                          </div>
                        </td>
                        <td className="p-4">{admission.department}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <span className="text-green-600">{admission.documents.filter(d => d.verified).length}</span>
                            <span>/</span>
                            <span>{admission.documents.length}</span>
                            <span className="text-muted-foreground text-sm ml-1">verified</span>
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(admission.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedAdmission(admission);
                                setShowDetails(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate QR Codes</CardTitle>
                <CardDescription>Generate QR codes for new applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Application Number</Label>
                    <Input placeholder="ADM2024XXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Applicant Name</Label>
                    <Input placeholder="Full Name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="ec">Electronics</SelectItem>
                        <SelectItem value="me">Mechanical</SelectItem>
                        <SelectItem value="ce">Civil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024-25</SelectItem>
                        <SelectItem value="2025">2025-26</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            {selectedAdmission && (
              <>
                <DialogHeader>
                  <DialogTitle>Application Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {generateQRCode(selectedAdmission.qrCode)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{selectedAdmission.name}</h3>
                      <p className="text-muted-foreground">{selectedAdmission.applicationNo}</p>
                      <Badge variant="outline" className="mt-2">{selectedAdmission.department}</Badge>
                      <div className="mt-2">{getStatusBadge(selectedAdmission.status)}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Documents</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedAdmission.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="text-sm">{doc.name}</span>
                          {doc.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => verifyDocument(selectedAdmission.id, doc.name)}>
                              Verify
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedAdmission.verifiedAt && (
                    <div className="text-sm text-muted-foreground">
                      <p>Last updated: {selectedAdmission.verifiedAt}</p>
                      <p>By: {selectedAdmission.verifiedBy}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Printer className="w-4 h-4 mr-2" />
                      Print QR
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default QRAdmission;
