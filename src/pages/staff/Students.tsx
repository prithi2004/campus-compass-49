import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Mail, 
  Phone,
  User,
  BookOpen,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";

const studentsData = [
  { id: "STU001", name: "Arun Kumar", rollNo: "21CS101", email: "arun.k@dhaanish.edu", phone: "9876543210", batch: "CSE-3A", attendance: 92, cgpa: 8.5, status: "regular" },
  { id: "STU002", name: "Priya Sharma", rollNo: "21CS102", email: "priya.s@dhaanish.edu", phone: "9876543211", batch: "CSE-3A", attendance: 88, cgpa: 9.1, status: "regular" },
  { id: "STU003", name: "Vikram Singh", rollNo: "21CS103", email: "vikram.s@dhaanish.edu", phone: "9876543212", batch: "CSE-3A", attendance: 65, cgpa: 6.8, status: "shortage" },
  { id: "STU004", name: "Sneha Patel", rollNo: "21CS104", email: "sneha.p@dhaanish.edu", phone: "9876543213", batch: "CSE-3A", attendance: 95, cgpa: 9.4, status: "regular" },
  { id: "STU005", name: "Rahul Verma", rollNo: "21CS105", email: "rahul.v@dhaanish.edu", phone: "9876543214", batch: "CSE-3B", attendance: 78, cgpa: 7.2, status: "regular" },
  { id: "STU006", name: "Kavitha R", rollNo: "21CS106", email: "kavitha.r@dhaanish.edu", phone: "9876543215", batch: "CSE-3B", attendance: 85, cgpa: 8.0, status: "regular" },
  { id: "STU007", name: "Mohammed Ali", rollNo: "21CS107", email: "mohammed.a@dhaanish.edu", phone: "9876543216", batch: "CSE-3B", attendance: 70, cgpa: 7.5, status: "warning" },
  { id: "STU008", name: "Deepika N", rollNo: "21CS108", email: "deepika.n@dhaanish.edu", phone: "9876543217", batch: "CSE-3B", attendance: 91, cgpa: 8.8, status: "regular" },
];

const StaffStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");

  const filteredStudents = studentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = selectedBatch === "all" || student.batch === selectedBatch;
    return matchesSearch && matchesBatch;
  });

  return (
    <DashboardLayout role="staff" title="My Students">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Students</h2>
          <p className="text-muted-foreground">Manage and view your assigned students</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Bulk Email
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              className="pl-10 bg-muted/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[180px] bg-muted/50 border-border/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="CSE-3A">CSE-3A</SelectItem>
              <SelectItem value="CSE-3B">CSE-3B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-2xl font-bold text-foreground">{studentsData.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Average Attendance</p>
          <p className="text-2xl font-bold text-success">83%</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Average CGPA</p>
          <p className="text-2xl font-bold text-primary">8.1</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Shortage Students</p>
          <p className="text-2xl font-bold text-destructive">2</p>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => (
          <div key={student.id} className="glass-card p-5 hover:bg-card/80 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-card-foreground truncate">{student.name}</h3>
                  <span className={`badge ${
                    student.status === "regular" ? "badge-success" :
                    student.status === "warning" ? "badge-warning" : "badge-error"
                  }`}>
                    {student.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{student.rollNo} • {student.batch}</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-card-foreground font-medium">{student.cgpa}</span>
                    <span className="text-muted-foreground">CGPA</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {student.attendance >= 75 ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={`font-medium ${student.attendance >= 75 ? "text-success" : "text-destructive"}`}>
                      {student.attendance}%
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StaffStudents;
