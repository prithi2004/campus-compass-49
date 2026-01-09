import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  Award,
  MoreVertical,
  Edit,
  Eye,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Exam {
  id: string;
  name: string;
  subject: string;
  course: string;
  date: string;
  time: string;
  duration: string;
  maxMarks: number;
  status: "scheduled" | "ongoing" | "completed" | "results";
}

interface Result {
  id: string;
  studentName: string;
  regNo: string;
  exam: string;
  maxMarks: number;
  obtained: number;
  percentage: number;
  grade: string;
  status: "pass" | "fail";
}

const examData: Exam[] = [
  { id: "1", name: "Mid-Term Exam", subject: "Data Structures", course: "B.Tech CSE", date: "2025-01-15", time: "10:00 AM", duration: "3 Hours", maxMarks: 100, status: "scheduled" },
  { id: "2", name: "Internal Assessment 1", subject: "DBMS", course: "B.Tech CSE", date: "2025-01-12", time: "2:00 PM", duration: "2 Hours", maxMarks: 50, status: "completed" },
  { id: "3", name: "Lab Exam", subject: "OS Lab", course: "B.Tech CSE", date: "2025-01-10", time: "9:00 AM", duration: "3 Hours", maxMarks: 50, status: "results" },
  { id: "4", name: "Quiz 1", subject: "Computer Networks", course: "B.Tech CSE", date: "2025-01-08", time: "11:00 AM", duration: "1 Hour", maxMarks: 25, status: "results" },
];

const resultData: Result[] = [
  { id: "1", studentName: "Arjun Patel", regNo: "STU001", exam: "OS Lab Exam", maxMarks: 50, obtained: 45, percentage: 90, grade: "A+", status: "pass" },
  { id: "2", studentName: "Sneha Reddy", regNo: "STU002", exam: "OS Lab Exam", maxMarks: 50, obtained: 38, percentage: 76, grade: "B+", status: "pass" },
  { id: "3", studentName: "Mohammed Ali", regNo: "STU003", exam: "OS Lab Exam", maxMarks: 50, obtained: 42, percentage: 84, grade: "A", status: "pass" },
  { id: "4", studentName: "Priya Nair", regNo: "STU004", exam: "OS Lab Exam", maxMarks: 50, obtained: 18, percentage: 36, grade: "F", status: "fail" },
  { id: "5", studentName: "Rahul Sharma", regNo: "STU005", exam: "OS Lab Exam", maxMarks: 50, obtained: 32, percentage: 64, grade: "B", status: "pass" },
];

const Exams = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);

  return (
    <DashboardLayout role="admin" title="Exams & Results">
      <Tabs defaultValue="exams" className="w-full">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <TabsList className="bg-card">
            <TabsTrigger value="exams">
              <Calendar className="w-4 h-4 mr-2" />
              Exams
            </TabsTrigger>
            <TabsTrigger value="results">
              <Award className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-muted"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="exams">
          <div className="flex justify-end mb-4">
            <Dialog open={isAddExamOpen} onOpenChange={setIsAddExamOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Exam
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">Schedule New Exam</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Exam Name</label>
                    <Input placeholder="e.g. Mid-Term Exam" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="Select subject" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Course</label>
                      <Input placeholder="Select course" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input type="date" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <Input type="time" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <Input placeholder="e.g. 3 Hours" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max Marks</label>
                      <Input type="number" placeholder="100" className="mt-1" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddExamOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Schedule Exam</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Exam Name</th>
                  <th>Subject</th>
                  <th>Course</th>
                  <th>Date & Time</th>
                  <th>Duration</th>
                  <th>Max Marks</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {examData.map((exam) => (
                  <tr key={exam.id}>
                    <td className="font-medium text-card-foreground">{exam.name}</td>
                    <td>{exam.subject}</td>
                    <td>{exam.course}</td>
                    <td>
                      <div>
                        <p className="text-card-foreground">{exam.date}</p>
                        <p className="text-xs text-muted-foreground">{exam.time}</p>
                      </div>
                    </td>
                    <td>{exam.duration}</td>
                    <td className="text-center">{exam.maxMarks}</td>
                    <td>
                      <span className={
                        exam.status === "scheduled" ? "badge-info" :
                        exam.status === "ongoing" ? "badge-warning" :
                        exam.status === "completed" ? "badge-success" : "badge-success"
                      }>
                        {exam.status}
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
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {exam.status === "completed" && (
                            <DropdownMenuItem>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Results
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="flex justify-end mb-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Reg. No</th>
                  <th>Student Name</th>
                  <th>Exam</th>
                  <th>Max Marks</th>
                  <th>Obtained</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {resultData.map((result) => (
                  <tr key={result.id}>
                    <td className="font-medium text-card-foreground">{result.regNo}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-info">
                            {result.studentName.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span className="font-medium text-card-foreground">{result.studentName}</span>
                      </div>
                    </td>
                    <td>{result.exam}</td>
                    <td className="text-center">{result.maxMarks}</td>
                    <td className="text-center font-medium">{result.obtained}</td>
                    <td className={`text-center font-medium ${result.status === "pass" ? "text-success" : "text-destructive"}`}>
                      {result.percentage}%
                    </td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        result.grade.startsWith("A") ? "bg-success/20 text-success" :
                        result.grade.startsWith("B") ? "bg-info/20 text-info" :
                        result.grade === "F" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                      }`}>
                        {result.grade}
                      </span>
                    </td>
                    <td>
                      <span className={result.status === "pass" ? "badge-success" : "badge-destructive"}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Exams;
