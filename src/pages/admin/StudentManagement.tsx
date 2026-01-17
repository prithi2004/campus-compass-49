import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MoreVertical,
  Download,
  History,
  GraduationCap,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  year: number;
  semester: number;
  status: "active" | "completed" | "left";
  enrollDate: string;
  endDate?: string;
  reason?: string;
  rollNo: string;
}

const initialStudentData: Student[] = [
  { id: "STU001", rollNo: "CS2024001", name: "Arjun Patel", email: "arjun@student.dhaanish.edu", phone: "+91 98765 11111", department: "Computer Science", course: "B.Tech CSE", year: 3, semester: 5, status: "active", enrollDate: "2022-08-01" },
  { id: "STU002", rollNo: "EC2024002", name: "Sneha Reddy", email: "sneha@student.dhaanish.edu", phone: "+91 98765 22222", department: "Electronics", course: "B.Tech ECE", year: 2, semester: 3, status: "active", enrollDate: "2023-08-01" },
  { id: "STU003", rollNo: "ME2021001", name: "Mohammed Ali", email: "ali@student.dhaanish.edu", phone: "+91 98765 33333", department: "Mechanical", course: "B.Tech Mech", year: 4, semester: 8, status: "active", enrollDate: "2021-08-01" },
  { id: "STU004", rollNo: "CS2024004", name: "Priya Nair", email: "priya@student.dhaanish.edu", phone: "+91 98765 44444", department: "Computer Science", course: "M.Tech CSE", year: 1, semester: 2, status: "active", enrollDate: "2024-08-01" },
  { id: "STU005", rollNo: "CE2022001", name: "Rahul Sharma", email: "rahul@student.dhaanish.edu", phone: "+91 98765 55555", department: "Civil", course: "B.Tech Civil", year: 3, semester: 5, status: "left", enrollDate: "2022-08-01", endDate: "2024-06-15", reason: "Transfer to another college" },
  { id: "STU006", rollNo: "CS2020001", name: "Kavitha Krishnan", email: "kavitha@student.dhaanish.edu", phone: "+91 98765 66666", department: "Computer Science", course: "B.Tech CSE", year: 4, semester: 8, status: "completed", enrollDate: "2020-08-01", endDate: "2024-05-30" },
];

const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "MBA"];
const courses = ["B.Tech CSE", "B.Tech ECE", "B.Tech Mech", "B.Tech Civil", "M.Tech CSE", "MBA"];
const years = [1, 2, 3, 4];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const StudentManagement = () => {
  const [studentData, setStudentData] = useState<Student[]>(initialStudentData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    year: 1,
    semester: 1,
    status: "active" as Student["status"],
    enrollDate: new Date().toISOString().split('T')[0],
    reason: "",
  });

  const stats = {
    total: studentData.length,
    active: studentData.filter(s => s.status === "active").length,
    completed: studentData.filter(s => s.status === "completed").length,
    left: studentData.filter(s => s.status === "left").length,
  };

  const filteredStudents = studentData.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "all" || student.department === filterDept;
    const matchesStatus = filterStatus === "all" || student.status === filterStatus;
    const matchesYear = filterYear === "all" || student.year === parseInt(filterYear);
    return matchesSearch && matchesDept && matchesStatus && matchesYear;
  });

  const activeStudents = filteredStudents.filter(s => s.status === "active");
  const historyStudents = filteredStudents.filter(s => s.status !== "active");

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      department: "",
      course: "",
      year: 1,
      semester: 1,
      status: "active",
      enrollDate: new Date().toISOString().split('T')[0],
      reason: "",
    });
  };

  const generateRollNo = (dept: string) => {
    const deptCode = dept === "Computer Science" ? "CS" : 
                     dept === "Electronics" ? "EC" : 
                     dept === "Mechanical" ? "ME" : 
                     dept === "Civil" ? "CE" : "MBA";
    const year = new Date().getFullYear();
    const count = studentData.filter(s => s.department === dept).length + 1;
    return `${deptCode}${year}${String(count).padStart(3, '0')}`;
  };

  const handleAddStudent = () => {
    if (!formData.name || !formData.email || !formData.department || !formData.course) {
      toast.error("Please fill all required fields");
      return;
    }
    
    const newStudent: Student = {
      id: `STU${String(studentData.length + 1).padStart(3, '0')}`,
      rollNo: generateRollNo(formData.department),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      course: formData.course,
      year: formData.year,
      semester: formData.semester,
      status: formData.status,
      enrollDate: formData.enrollDate,
    };
    
    setStudentData(prev => [...prev, newStudent]);
    toast.success("Student added successfully");
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;
    
    setStudentData(prev => prev.map(s => 
      s.id === selectedStudent.id 
        ? { 
            ...s, 
            ...formData, 
            rollNo: s.rollNo,
            endDate: formData.status !== "active" ? new Date().toISOString().split('T')[0] : undefined,
            reason: formData.status !== "active" ? formData.reason : undefined,
          }
        : s
    ));
    
    toast.success("Student updated successfully");
    setIsEditModalOpen(false);
    setSelectedStudent(null);
    resetForm();
  };

  const handleDeleteStudent = (id: string) => {
    setStudentData(prev => prev.filter(s => s.id !== id));
    toast.success("Student deleted successfully");
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      course: student.course,
      year: student.year,
      semester: student.semester,
      status: student.status,
      enrollDate: student.enrollDate,
      reason: student.reason || "",
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "completed": return <Badge className="bg-blue-500">Completed</Badge>;
      case "left": return <Badge className="bg-yellow-500">Left</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const StudentForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name" 
            className="mt-1" 
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email"
            className="mt-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Phone</Label>
          <Input 
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone" 
            className="mt-1" 
          />
        </div>
        <div>
          <Label>Department *</Label>
          <Select value={formData.department} onValueChange={(v) => setFormData(prev => ({ ...prev, department: v }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Course *</Label>
          <Select value={formData.course} onValueChange={(v) => setFormData(prev => ({ ...prev, course: v }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course} value={course}>{course}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Enroll Date</Label>
          <Input 
            type="date"
            value={formData.enrollDate}
            onChange={(e) => setFormData(prev => ({ ...prev, enrollDate: e.target.value }))}
            className="mt-1" 
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Year</Label>
          <Select value={String(formData.year)} onValueChange={(v) => setFormData(prev => ({ ...prev, year: parseInt(v) }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Semester</Label>
          <Select value={String(formData.semester)} onValueChange={(v) => setFormData(prev => ({ ...prev, semester: parseInt(v) }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map(sem => (
                <SelectItem key={sem} value={String(sem)}>{sem}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as Student["status"] }))}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="left">Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {formData.status !== "active" && (
        <div>
          <Label>Reason</Label>
          <Input 
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Enter reason for status change" 
            className="mt-1" 
          />
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <DashboardLayout role="admin" title="Student Management">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-green-500/10">
              <UserCheck className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Graduated</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-yellow-500/10">
              <UserX className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.left}</p>
              <p className="text-sm text-muted-foreground">Left</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto flex-wrap">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-muted"
            />
          </div>
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>Year {year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm onSubmit={handleAddStudent} submitLabel="Add Student" />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Active and History */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Students ({activeStudents.length})</TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Completed/Left ({historyStudents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Year</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="font-medium text-card-foreground">{student.rollNo}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-info">
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">Since {student.enrollDate}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="text-xs">{student.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{student.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-card-foreground">{student.department}</td>
                      <td className="text-card-foreground">{student.course}</td>
                      <td className="text-card-foreground text-center">{student.year}</td>
                      <td className="text-card-foreground text-center">{student.semester}</td>
                      <td>{getStatusBadge(student.status)}</td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(student)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteStudent(student.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
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
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Enroll Date</th>
                    <th>End Date</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="font-medium text-card-foreground">{student.rollNo}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-card-foreground">{student.department}</td>
                      <td className="text-card-foreground">{student.course}</td>
                      <td className="text-muted-foreground">{student.enrollDate}</td>
                      <td className="text-muted-foreground">{student.endDate || "-"}</td>
                      <td className="text-muted-foreground max-w-32 truncate">{student.reason || "-"}</td>
                      <td>{getStatusBadge(student.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">Edit Student</DialogTitle>
          </DialogHeader>
          <StudentForm onSubmit={handleEditStudent} submitLabel="Save Changes" />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StudentManagement;
