import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Mail, Phone, MoreVertical, Download, History, Users, UserCheck, UserX, Briefcase, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStaff, useCreateStaff, useDeleteStaff, type Staff } from "@/hooks/useStaff";
import { useDepartments } from "@/hooks/useDepartments";

const designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Lab Assistant", "Coordinator"];

const StaffManagement = () => {
  const { data: staffData = [], isLoading: staffLoading } = useStaff();
  const { data: departments = [], isLoading: deptLoading } = useDepartments();
  const createStaff = useCreateStaff();
  const deleteStaff = useDeleteStaff();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department_id: "",
    designation: "",
    is_hod: false,
    join_date: new Date().toISOString().split('T')[0],
    qualification: "",
    specialization: "",
  });

  const isLoading = staffLoading || deptLoading;

  const stats = {
    total: staffData.length,
    active: staffData.filter(s => s.status === "active").length,
    left: staffData.filter(s => s.status === "resigned" || s.status === "retired").length,
    hods: staffData.filter(s => s.is_hod && s.status === "active").length,
  };

  const filteredStaff = staffData.filter(s =>
    (s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staff_id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterDept === "all" || s.department_id === filterDept)
  );

  const activeStaff = filteredStaff.filter(s => s.status === "active" || s.status === "on_leave");
  const historyStaff = filteredStaff.filter(s => s.status === "resigned" || s.status === "retired");

  const generateStaffId = () => {
    const count = staffData.length + 1;
    return `STF${String(count).padStart(3, '0')}`;
  };

  const handleAddStaff = async () => {
    if (!formData.full_name || !formData.email || !formData.department_id || !formData.designation) {
      return;
    }

    await createStaff.mutateAsync({
      staff_id: generateStaffId(),
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone || null,
      department_id: formData.department_id,
      designation: formData.designation,
      is_hod: formData.is_hod,
      join_date: formData.join_date,
      qualification: formData.qualification || null,
      specialization: formData.specialization || null,
      status: "active",
    });

    setFormData({
      full_name: "",
      email: "",
      phone: "",
      department_id: "",
      designation: "",
      is_hod: false,
      join_date: new Date().toISOString().split('T')[0],
      qualification: "",
      specialization: "",
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteStaff = async (id: string) => {
    await deleteStaff.mutateAsync(id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "on_leave":
        return <Badge className="bg-blue-500">On Leave</Badge>;
      case "resigned":
        return <Badge className="bg-yellow-500">Resigned</Badge>;
      case "retired":
        return <Badge className="bg-gray-500">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (staff: Staff) => {
    if (staff.is_hod) {
      return <Badge variant="destructive">HOD</Badge>;
    }
    return <Badge variant="outline">{staff.designation}</Badge>;
  };

  const getDepartmentName = (staff: Staff) => {
    return staff.department?.name || "N/A";
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin" title="Staff Management">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="glass-card p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Staff</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Add New Staff</DialogTitle></DialogHeader>
              <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); handleAddStaff(); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input value={formData.full_name} onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label>Department *</Label>
                    <Select value={formData.department_id} onValueChange={(v) => setFormData(p => ({ ...p, department_id: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Designation *</Label>
                    <Select value={formData.designation} onValueChange={(v) => setFormData(p => ({ ...p, designation: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {designations.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Join Date *</Label>
                    <Input type="date" value={formData.join_date} onChange={(e) => setFormData(p => ({ ...p, join_date: e.target.value }))} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Qualification</Label>
                    <Input value={formData.qualification} onChange={(e) => setFormData(p => ({ ...p, qualification: e.target.value }))} className="mt-1" placeholder="e.g., Ph.D, M.Tech" />
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <Input value={formData.specialization} onChange={(e) => setFormData(p => ({ ...p, specialization: e.target.value }))} className="mt-1" placeholder="e.g., AI/ML, Data Science" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createStaff.isPending}>
                    {createStaff.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Add Staff
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeStaff.length})</TabsTrigger>
          <TabsTrigger value="history"><History className="w-4 h-4 mr-2" />History ({historyStaff.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Dept</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-muted-foreground">
                        No active staff members found. Add your first staff member above.
                      </td>
                    </tr>
                  ) : (
                    activeStaff.map(s => (
                      <tr key={s.id}>
                        <td className="font-medium">{s.staff_id}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {s.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{s.full_name}</p>
                              <p className="text-xs text-muted-foreground">Since {new Date(s.join_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span className="text-xs">{s.email}</span>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span className="text-xs">{s.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{getDepartmentName(s)}</td>
                        <td>{getRoleBadge(s)}</td>
                        <td>{getStatusBadge(s.status)}</td>
                        <td>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteStaff(s.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Role</th>
                    <th>End Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No staff history records found.
                      </td>
                    </tr>
                  ) : (
                    historyStaff.map(s => (
                      <tr key={s.id}>
                        <td className="font-medium">{s.staff_id}</td>
                        <td>
                          <p className="font-medium">{s.full_name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </td>
                        <td>{getDepartmentName(s)}</td>
                        <td>{getRoleBadge(s)}</td>
                        <td className="text-muted-foreground">
                          {s.end_date ? new Date(s.end_date).toLocaleDateString() : "-"}
                        </td>
                        <td>{getStatusBadge(s.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default StaffManagement;
