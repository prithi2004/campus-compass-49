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

interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: "active" | "inactive";
  joinDate: string;
}

const staffData: Staff[] = [
  { id: "STF001", name: "Dr. Rajesh Kumar", email: "rajesh@dhaanish.edu", phone: "+91 98765 43210", department: "Computer Science", designation: "Professor", status: "active", joinDate: "2020-01-15" },
  { id: "STF002", name: "Prof. Priya Sharma", email: "priya@dhaanish.edu", phone: "+91 98765 43211", department: "Electronics", designation: "Associate Professor", status: "active", joinDate: "2019-06-20" },
  { id: "STF003", name: "Dr. Arun Singh", email: "arun@dhaanish.edu", phone: "+91 98765 43212", department: "Mechanical", designation: "HOD", status: "active", joinDate: "2018-03-10" },
  { id: "STF004", name: "Mrs. Lakshmi Devi", email: "lakshmi@dhaanish.edu", phone: "+91 98765 43213", department: "Mathematics", designation: "Assistant Professor", status: "active", joinDate: "2021-08-01" },
  { id: "STF005", name: "Mr. Suresh Babu", email: "suresh@dhaanish.edu", phone: "+91 98765 43214", department: "Physics", designation: "Lecturer", status: "inactive", joinDate: "2017-11-25" },
];

const StaffManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredStaff = staffData.filter(
    (staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Staff Management">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-muted"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Add New Staff</DialogTitle>
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
                    Designation
                  </label>
                  <Input placeholder="Enter designation" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground">
                    Join Date
                  </label>
                  <Input type="date" className="mt-1" />
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
                <Button type="submit">Add Staff</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id}>
                  <td className="font-medium text-card-foreground">
                    {staff.id}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {staff.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">
                          {staff.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {staff.joinDate}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="text-xs">{staff.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span className="text-xs">{staff.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-card-foreground">{staff.department}</td>
                  <td className="text-card-foreground">{staff.designation}</td>
                  <td>
                    <span
                      className={
                        staff.status === "active"
                          ? "badge-success"
                          : "badge-destructive"
                      }
                    >
                      {staff.status}
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

export default StaffManagement;
