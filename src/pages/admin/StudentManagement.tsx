import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Mail,
  Phone,
  MoreVertical,
  Download,
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

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  year: number;
  status: "active" | "inactive" | "graduated";
  enrollDate: string;
}

const studentData: Student[] = [
  { id: "STU001", name: "Arjun Patel", email: "arjun@student.dhaanish.edu", phone: "+91 98765 11111", department: "Computer Science", course: "B.Tech CSE", year: 3, status: "active", enrollDate: "2022-08-01" },
  { id: "STU002", name: "Sneha Reddy", email: "sneha@student.dhaanish.edu", phone: "+91 98765 22222", department: "Electronics", course: "B.Tech ECE", year: 2, status: "active", enrollDate: "2023-08-01" },
  { id: "STU003", name: "Mohammed Ali", email: "ali@student.dhaanish.edu", phone: "+91 98765 33333", department: "Mechanical", course: "B.Tech Mech", year: 4, status: "active", enrollDate: "2021-08-01" },
  { id: "STU004", name: "Priya Nair", email: "priya@student.dhaanish.edu", phone: "+91 98765 44444", department: "Computer Science", course: "M.Tech CSE", year: 1, status: "active", enrollDate: "2024-08-01" },
  { id: "STU005", name: "Rahul Sharma", email: "rahul@student.dhaanish.edu", phone: "+91 98765 55555", department: "Civil", course: "B.Tech Civil", year: 3, status: "inactive", enrollDate: "2022-08-01" },
  { id: "STU006", name: "Kavitha Krishnan", email: "kavitha@student.dhaanish.edu", phone: "+91 98765 66666", department: "Computer Science", course: "B.Tech CSE", year: 4, status: "graduated", enrollDate: "2020-08-01" },
];

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStudents = studentData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Student Management">
      {/* Header Actions */}
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
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-heading">Add New Student</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-card-foreground">
                      Full Name
                    </label>
                    <Input placeholder="Enter full name" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-card-foreground">
                      Phone
                    </label>
                    <Input placeholder="Enter phone" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground">
                      Department
                    </label>
                    <Input placeholder="Select department" className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-card-foreground">
                      Course
                    </label>
                    <Input placeholder="Select course" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground">
                      Year
                    </label>
                    <Input type="number" placeholder="Enter year" className="mt-1" min={1} max={5} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Student</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Reg. No</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Course</th>
                <th>Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td className="font-medium text-card-foreground">
                    {student.id}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-info">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Since {student.enrollDate}
                        </p>
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
                  <td>
                    <span
                      className={
                        student.status === "active"
                          ? "badge-success"
                          : student.status === "graduated"
                          ? "badge-info"
                          : "badge-destructive"
                      }
                    >
                      {student.status}
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
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
    </DashboardLayout>
  );
};

export default StudentManagement;
