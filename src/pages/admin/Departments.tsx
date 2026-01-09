import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  staffCount: number;
  studentCount: number;
  courseCount: number;
  status: "active" | "inactive";
}

const departmentData: Department[] = [
  { id: "1", name: "Computer Science & Engineering", code: "CSE", hod: "Dr. Rajesh Kumar", staffCount: 32, studentCount: 450, courseCount: 12, status: "active" },
  { id: "2", name: "Electronics & Communication", code: "ECE", hod: "Prof. Priya Sharma", staffCount: 28, studentCount: 380, courseCount: 10, status: "active" },
  { id: "3", name: "Mechanical Engineering", code: "MECH", hod: "Dr. Arun Singh", staffCount: 25, studentCount: 320, courseCount: 8, status: "active" },
  { id: "4", name: "Civil Engineering", code: "CIVIL", hod: "Dr. Ravi Verma", staffCount: 22, studentCount: 280, courseCount: 7, status: "active" },
  { id: "5", name: "Electrical Engineering", code: "EEE", hod: "Prof. Sunita Rao", staffCount: 20, studentCount: 250, courseCount: 6, status: "active" },
  { id: "6", name: "Information Technology", code: "IT", hod: "Dr. Karthik M", staffCount: 24, studentCount: 320, courseCount: 9, status: "active" },
  { id: "7", name: "Mathematics", code: "MATH", hod: "Mrs. Lakshmi Devi", staffCount: 12, studentCount: 0, courseCount: 4, status: "active" },
  { id: "8", name: "Physics", code: "PHY", hod: "Dr. Suresh Babu", staffCount: 10, studentCount: 0, courseCount: 3, status: "inactive" },
];

const Departments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDepts = departmentData.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.hod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Department Management">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card border-muted"
          />
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Department</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-card-foreground">
                  Department Name
                </label>
                <Input placeholder="e.g. Computer Science & Engineering" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground">
                  Department Code
                </label>
                <Input placeholder="e.g. CSE" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground">
                  Head of Department
                </label>
                <Input placeholder="Select HOD" className="mt-1" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Department</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepts.map((dept) => (
          <div key={dept.id} className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                  {dept.code}
                </span>
                <h3 className="text-lg font-heading font-semibold text-card-foreground mt-2">
                  {dept.name}
                </h3>
              </div>
              <span className={dept.status === "active" ? "badge-success" : "badge-destructive"}>
                {dept.status}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              HOD: <span className="text-card-foreground">{dept.hod}</span>
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-lg font-semibold text-card-foreground">{dept.staffCount}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="text-lg font-semibold text-card-foreground">{dept.studentCount}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <BookOpen className="w-4 h-4" />
                </div>
                <p className="text-lg font-semibold text-card-foreground">{dept.courseCount}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Departments;
