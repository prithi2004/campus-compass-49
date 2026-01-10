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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award,
  Calendar,
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  Edit,
} from "lucide-react";
import { useState } from "react";

const upcomingExams = [
  { id: 1, name: "Internal Test 1", subject: "Data Structures", batch: "CSE-3A", date: "Jan 20, 2025", time: "10:00 AM", duration: "1 Hour", marks: 25, status: "scheduled" },
  { id: 2, name: "Internal Test 1", subject: "Algorithms", batch: "CSE-3B", date: "Jan 22, 2025", time: "10:00 AM", duration: "1 Hour", marks: 25, status: "scheduled" },
  { id: 3, name: "Model Exam", subject: "Data Structures", batch: "CSE-3A", date: "Feb 15, 2025", time: "9:00 AM", duration: "3 Hours", marks: 100, status: "upcoming" },
];

const completedExams = [
  { id: 1, name: "Quiz 1", subject: "Data Structures", batch: "CSE-3A", date: "Dec 15, 2024", avgScore: 18.5, maxMarks: 25, evaluated: true },
  { id: 2, name: "Quiz 1", subject: "Algorithms", batch: "CSE-3B", date: "Dec 18, 2024", avgScore: 17.2, maxMarks: 25, evaluated: true },
  { id: 3, name: "Assignment 1", subject: "Data Structures", batch: "CSE-3A", date: "Dec 10, 2024", avgScore: 22, maxMarks: 25, evaluated: true },
];

const studentResults = [
  { id: "STU001", name: "Arun Kumar", rollNo: "21CS101", marks: 22, status: "pass" },
  { id: "STU002", name: "Priya Sharma", rollNo: "21CS102", marks: 24, status: "pass" },
  { id: "STU003", name: "Vikram Singh", rollNo: "21CS103", marks: 12, status: "fail" },
  { id: "STU004", name: "Sneha Patel", rollNo: "21CS104", marks: 25, status: "pass" },
  { id: "STU005", name: "Rahul Verma", rollNo: "21CS105", marks: 18, status: "pass" },
  { id: "STU006", name: "Kavitha R", rollNo: "21CS106", marks: 20, status: "pass" },
];

const StaffExams = () => {
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [marks, setMarks] = useState<Record<string, number>>({});

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks(prev => ({ ...prev, [studentId]: parseInt(value) || 0 }));
  };

  return (
    <DashboardLayout role="staff" title="Exams & Results">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Exams & Results</h2>
          <p className="text-muted-foreground">Manage exams, upload marks, and view results</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="enter-marks">Enter Marks</TabsTrigger>
        </TabsList>

        {/* Upcoming Exams */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingExams.map((exam) => (
              <div key={exam.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-card-foreground">{exam.name}</h3>
                    <p className="text-sm text-muted-foreground">{exam.subject}</p>
                  </div>
                  <span className={`badge ${exam.status === "scheduled" ? "badge-warning" : "badge-outline"}`}>
                    {exam.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{exam.batch}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{exam.date} at {exam.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{exam.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span>Max Marks: {exam.marks}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-1" />
                    Question Paper
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Completed Exams */}
        <TabsContent value="completed" className="space-y-4">
          <div className="glass-card overflow-hidden">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Subject</th>
                  <th>Batch</th>
                  <th>Date</th>
                  <th>Avg Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {completedExams.map((exam) => (
                  <tr key={exam.id}>
                    <td className="font-medium">{exam.name}</td>
                    <td>{exam.subject}</td>
                    <td>{exam.batch}</td>
                    <td>{exam.date}</td>
                    <td>
                      <span className="font-semibold text-primary">
                        {exam.avgScore}/{exam.maxMarks}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Evaluated
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Enter Marks */}
        <TabsContent value="enter-marks" className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
              Select Exam
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ds">Data Structures</SelectItem>
                  <SelectItem value="algo">Algorithms</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3a">CSE-3A</SelectItem>
                  <SelectItem value="3b">CSE-3B</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiz1">Quiz 1</SelectItem>
                  <SelectItem value="it1">Internal Test 1</SelectItem>
                  <SelectItem value="model">Model Exam</SelectItem>
                </SelectContent>
              </Select>
              <Button>Load Students</Button>
            </div>
          </div>

          {/* Marks Entry Table */}
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-card-foreground">Quiz 1 - Data Structures</h3>
                <p className="text-sm text-muted-foreground">CSE-3A • Max Marks: 25</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Import CSV
                </Button>
                <Button>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Marks
                </Button>
              </div>
            </div>
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Marks (out of 25)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((student) => (
                  <tr key={student.id}>
                    <td>{student.rollNo}</td>
                    <td className="font-medium">{student.name}</td>
                    <td>
                      <Input
                        type="number"
                        min={0}
                        max={25}
                        defaultValue={student.marks}
                        onChange={(e) => handleMarkChange(student.id, e.target.value)}
                        className="w-20 bg-muted/50 border-border/50"
                      />
                    </td>
                    <td>
                      <span className={`badge ${student.status === "pass" ? "badge-success" : "badge-error"}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
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

export default StaffExams;
