import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Mail, Phone, MoreVertical, Download, History, Users, UserCheck, UserX, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Staff {
  id: string; name: string; email: string; phone: string; department: string; designation: string;
  role: "HOD" | "Faculty" | "Admin" | "Lab Assistant" | "Coordinator"; status: "active" | "completed" | "left";
  joinDate: string; endDate?: string; reason?: string; courses: string[];
}

const initialStaffData: Staff[] = [
  { id: "STF001", name: "Dr. Rajesh Kumar", email: "rajesh@dhaanish.edu", phone: "+91 98765 43210", department: "Computer Science", designation: "Professor", role: "HOD", status: "active", joinDate: "2018-06-15", courses: ["Data Structures"] },
  { id: "STF002", name: "Prof. Priya Sharma", email: "priya@dhaanish.edu", phone: "+91 98765 43211", department: "Electronics", designation: "Associate Professor", role: "Faculty", status: "active", joinDate: "2019-08-20", courses: ["Digital Electronics"] },
  { id: "STF003", name: "Dr. Suresh Nair", email: "suresh@dhaanish.edu", phone: "+91 98765 43214", department: "Computer Science", designation: "Professor", role: "Faculty", status: "left", joinDate: "2015-01-10", endDate: "2023-12-31", reason: "Retirement", courses: [] },
];

const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "MBA", "Admin"];
const roles: Staff["role"][] = ["HOD", "Faculty", "Admin", "Lab Assistant", "Coordinator"];

const StaffManagement = () => {
  const [staffData, setStaffData] = useState<Staff[]>(initialStaffData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", department: "", designation: "", role: "" as Staff["role"], status: "active" as Staff["status"], joinDate: new Date().toISOString().split('T')[0] });

  const stats = { total: staffData.length, active: staffData.filter(s => s.status === "active").length, left: staffData.filter(s => s.status === "left").length, hods: staffData.filter(s => s.role === "HOD" && s.status === "active").length };
  const filteredStaff = staffData.filter(s => (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.id.toLowerCase().includes(searchTerm.toLowerCase())) && (filterDept === "all" || s.department === filterDept));
  const activeStaff = filteredStaff.filter(s => s.status === "active");
  const historyStaff = filteredStaff.filter(s => s.status !== "active");

  const handleAddStaff = () => {
    if (!formData.name || !formData.email || !formData.department || !formData.role) { toast.error("Please fill required fields"); return; }
    setStaffData(prev => [...prev, { id: `STF${String(prev.length + 1).padStart(3, '0')}`, ...formData, courses: [] }]);
    toast.success("Staff added"); setIsAddModalOpen(false);
  };

  const handleDeleteStaff = (id: string) => { setStaffData(prev => prev.filter(s => s.id !== id)); toast.success("Staff deleted"); };
  const getStatusBadge = (status: string) => status === "active" ? <Badge className="bg-green-500">Active</Badge> : <Badge className="bg-yellow-500">Left</Badge>;
  const getRoleBadge = (role: string) => role === "HOD" ? <Badge variant="destructive">HOD</Badge> : <Badge variant="outline">{role}</Badge>;

  return (
    <DashboardLayout role="admin" title="Staff Management">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="flex items-center gap-4 p-4"><div className="p-3 rounded-full bg-primary/10"><Users className="w-6 h-6 text-primary" /></div><div><p className="text-2xl font-bold">{stats.total}</p><p className="text-sm text-muted-foreground">Total</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><div className="p-3 rounded-full bg-green-500/10"><UserCheck className="w-6 h-6 text-green-500" /></div><div><p className="text-2xl font-bold">{stats.active}</p><p className="text-sm text-muted-foreground">Active</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><div className="p-3 rounded-full bg-yellow-500/10"><UserX className="w-6 h-6 text-yellow-500" /></div><div><p className="text-2xl font-bold">{stats.left}</p><p className="text-sm text-muted-foreground">Left</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-4 p-4"><div className="p-3 rounded-full bg-purple-500/10"><Briefcase className="w-6 h-6 text-purple-500" /></div><div><p className="text-2xl font-bold">{stats.hods}</p><p className="text-sm text-muted-foreground">HODs</p></div></CardContent></Card>
      </div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-80"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
          <Select value={filterDept} onValueChange={setFilterDept}><SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger><SelectContent><SelectItem value="all">All Depts</SelectItem>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}><DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Add Staff</Button></DialogTrigger>
            <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Add New Staff</DialogTitle></DialogHeader>
              <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); handleAddStaff(); }}>
                <div className="grid grid-cols-2 gap-4"><div><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="mt-1" /></div><div><Label>Email *</Label><Input value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="mt-1" /></div><div><Label>Department *</Label><Select value={formData.department} onValueChange={(v) => setFormData(p => ({ ...p, department: v }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>Designation</Label><Input value={formData.designation} onChange={(e) => setFormData(p => ({ ...p, designation: e.target.value }))} className="mt-1" /></div><div><Label>Role *</Label><Select value={formData.role} onValueChange={(v) => setFormData(p => ({ ...p, role: v as Staff["role"] }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div></div>
                <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button><Button type="submit">Add Staff</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList><TabsTrigger value="active">Active ({activeStaff.length})</TabsTrigger><TabsTrigger value="history"><History className="w-4 h-4 mr-2" />History ({historyStaff.length})</TabsTrigger></TabsList>
        <TabsContent value="active"><div className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="erp-table"><thead><tr><th>ID</th><th>Name</th><th>Contact</th><th>Dept</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {activeStaff.map(s => <tr key={s.id}><td className="font-medium">{s.id}</td><td><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-sm font-medium text-primary">{s.name.split(" ").map(n => n[0]).join("")}</span></div><div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">Since {s.joinDate}</p></div></div></td><td><div className="space-y-1"><div className="flex items-center gap-2 text-muted-foreground"><Mail className="w-3 h-3" /><span className="text-xs">{s.email}</span></div><div className="flex items-center gap-2 text-muted-foreground"><Phone className="w-3 h-3" /><span className="text-xs">{s.phone}</span></div></div></td><td>{s.department}</td><td>{getRoleBadge(s.role)}</td><td>{getStatusBadge(s.status)}</td><td><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive" onClick={() => handleDeleteStaff(s.id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu></td></tr>)}
        </tbody></table></div></div></TabsContent>
        <TabsContent value="history"><div className="glass-card overflow-hidden"><div className="overflow-x-auto"><table className="erp-table"><thead><tr><th>ID</th><th>Name</th><th>Dept</th><th>Role</th><th>End Date</th><th>Reason</th><th>Status</th></tr></thead><tbody>
          {historyStaff.map(s => <tr key={s.id}><td className="font-medium">{s.id}</td><td><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></td><td>{s.department}</td><td>{getRoleBadge(s.role)}</td><td className="text-muted-foreground">{s.endDate || "-"}</td><td className="text-muted-foreground">{s.reason || "-"}</td><td>{getStatusBadge(s.status)}</td></tr>)}
        </tbody></table></div></div></TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default StaffManagement;
