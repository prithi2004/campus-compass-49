import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  UserX, 
  Clock,
  Search,
  Download,
  Edit,
  History,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Person {
  id: string;
  name: string;
  identifier: string;
  department: string;
  type: "staff" | "student";
  status: "active" | "completed" | "left" | "suspended";
  joinDate: string;
  endDate?: string;
  reason?: string;
}

const mockData: Person[] = [
  { id: "1", name: "Dr. Rajesh Kumar", identifier: "STF001", department: "Computer Science", type: "staff", status: "active", joinDate: "2018-06-15" },
  { id: "2", name: "Prof. Priya Sharma", identifier: "STF002", department: "Electronics", type: "staff", status: "active", joinDate: "2019-08-20" },
  { id: "3", name: "Dr. Suresh Patel", identifier: "STF003", department: "Mechanical", type: "staff", status: "left", joinDate: "2017-03-10", endDate: "2024-01-10", reason: "Personal reasons" },
  { id: "4", name: "Rahul Sharma", identifier: "CS2024001", department: "Computer Science", type: "student", status: "active", joinDate: "2024-08-01" },
  { id: "5", name: "Priya Patel", identifier: "CS2024002", department: "Computer Science", type: "student", status: "active", joinDate: "2024-08-01" },
  { id: "6", name: "Arun Kumar", identifier: "EC2020001", department: "Electronics", type: "student", status: "completed", joinDate: "2020-08-01", endDate: "2024-05-15" },
  { id: "7", name: "Sneha Reddy", identifier: "ME2023001", department: "Mechanical", type: "student", status: "left", joinDate: "2023-08-01", endDate: "2024-02-20", reason: "Transfer to another institution" },
  { id: "8", name: "Karthik Nair", identifier: "CE2022001", department: "Civil", type: "student", status: "suspended", joinDate: "2022-08-01", reason: "Disciplinary action" },
];

const StatusManagement = () => {
  const [data, setData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "staff" | "student">("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");

  const stats = {
    totalStaff: data.filter(p => p.type === "staff").length,
    activeStaff: data.filter(p => p.type === "staff" && p.status === "active").length,
    totalStudents: data.filter(p => p.type === "student").length,
    activeStudents: data.filter(p => p.type === "student" && p.status === "active").length,
    completed: data.filter(p => p.status === "completed").length,
    left: data.filter(p => p.status === "left").length,
  };

  const filteredData = data.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          person.identifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || person.type === selectedType;
    const matchesStatus = selectedStatus === "all" || person.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleStatusUpdate = () => {
    if (!selectedPerson || !newStatus) {
      toast.error("Please select a status");
      return;
    }

    setData(prev => prev.map(p => {
      if (p.id === selectedPerson.id) {
        return {
          ...p,
          status: newStatus as Person["status"],
          endDate: ["completed", "left", "suspended"].includes(newStatus) 
            ? new Date().toISOString().split('T')[0] 
            : undefined,
          reason: statusReason || undefined,
        };
      }
      return p;
    }));

    toast.success(`Status updated to ${newStatus}`);
    setShowEditDialog(false);
    setSelectedPerson(null);
    setNewStatus("");
    setStatusReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "completed": return <Badge className="bg-blue-500">Completed</Badge>;
      case "left": return <Badge className="bg-yellow-500">Left</Badge>;
      case "suspended": return <Badge variant="destructive">Suspended</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "staff" 
      ? <Badge variant="outline"><Users className="w-3 h-3 mr-1" />Staff</Badge>
      : <Badge variant="outline"><GraduationCap className="w-3 h-3 mr-1" />Student</Badge>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff & Student Status Management</h1>
            <p className="text-muted-foreground">Track Active, Completed, and Left status for all members</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Users className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalStaff}</p>
              <p className="text-xs text-muted-foreground">Total Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <UserCheck className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.activeStaff}</p>
              <p className="text-xs text-muted-foreground">Active Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <GraduationCap className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <UserCheck className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.activeStudents}</p>
              <p className="text-xs text-muted-foreground">Active Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <Clock className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center p-4">
              <UserX className="w-8 h-8 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{stats.left}</p>
              <p className="text-xs text-muted-foreground">Left</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="flex flex-wrap gap-4 p-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or ID..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="staff">Staff Only</SelectItem>
                <SelectItem value="student">Students Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Join Date</th>
                  <th className="text-left p-4 font-medium">End Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Reason</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(person => (
                  <tr key={person.id} className="border-b hover:bg-muted/30">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-muted-foreground">{person.identifier}</p>
                      </div>
                    </td>
                    <td className="p-4">{getTypeBadge(person.type)}</td>
                    <td className="p-4">{person.department}</td>
                    <td className="p-4 text-muted-foreground">{person.joinDate}</td>
                    <td className="p-4 text-muted-foreground">{person.endDate || "-"}</td>
                    <td className="p-4">{getStatusBadge(person.status)}</td>
                    <td className="p-4 max-w-xs truncate text-muted-foreground">{person.reason || "-"}</td>
                    <td className="p-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedPerson(person);
                          setNewStatus(person.status);
                          setStatusReason(person.reason || "");
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Edit Status Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
            </DialogHeader>
            {selectedPerson && (
              <div className="space-y-4 pt-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">{selectedPerson.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPerson.identifier}</p>
                  <div className="flex gap-2 mt-2">
                    {getTypeBadge(selectedPerson.type)}
                    <Badge variant="outline">{selectedPerson.department}</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Current Status</Label>
                  {getStatusBadge(selectedPerson.status)}
                </div>

                <div className="space-y-2">
                  <Label>New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {["left", "suspended", "completed"].includes(newStatus) && (
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Textarea 
                      placeholder="Enter reason for status change..."
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                    />
                  </div>
                )}

                {newStatus === "suspended" && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>This action will suspend all access for this user</span>
                  </div>
                )}

                <Button className="w-full" onClick={handleStatusUpdate}>
                  Update Status
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StatusManagement;
