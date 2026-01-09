import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Clock,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  duration: string;
  credits: number;
  subjects: number;
  status: "active" | "inactive";
}

interface Subject {
  id: string;
  name: string;
  code: string;
  course: string;
  semester: number;
  credits: number;
  faculty: string;
  type: "theory" | "practical" | "both";
}

const courseData: Course[] = [
  { id: "1", name: "B.Tech Computer Science", code: "BTCS", department: "Computer Science", duration: "4 Years", credits: 180, subjects: 48, status: "active" },
  { id: "2", name: "B.Tech Electronics", code: "BTEC", department: "Electronics", duration: "4 Years", credits: 180, subjects: 45, status: "active" },
  { id: "3", name: "M.Tech Computer Science", code: "MTCS", department: "Computer Science", duration: "2 Years", credits: 90, subjects: 24, status: "active" },
  { id: "4", name: "B.Tech Mechanical", code: "BTME", department: "Mechanical", duration: "4 Years", credits: 180, subjects: 42, status: "active" },
  { id: "5", name: "B.Tech Civil", code: "BTCE", department: "Civil", duration: "4 Years", credits: 180, subjects: 40, status: "inactive" },
];

const subjectData: Subject[] = [
  { id: "1", name: "Data Structures & Algorithms", code: "CS201", course: "B.Tech CSE", semester: 3, credits: 4, faculty: "Dr. Rajesh Kumar", type: "both" },
  { id: "2", name: "Database Management Systems", code: "CS301", course: "B.Tech CSE", semester: 4, credits: 4, faculty: "Prof. Priya Sharma", type: "both" },
  { id: "3", name: "Operating Systems", code: "CS302", course: "B.Tech CSE", semester: 4, credits: 3, faculty: "Dr. Arun Singh", type: "theory" },
  { id: "4", name: "Web Development Lab", code: "CS303P", course: "B.Tech CSE", semester: 4, credits: 2, faculty: "Mr. Karthik M", type: "practical" },
  { id: "5", name: "Machine Learning", code: "CS501", course: "B.Tech CSE", semester: 6, credits: 4, faculty: "Dr. Rajesh Kumar", type: "both" },
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);

  const filteredCourses = courseData.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubjects = subjectData.filter(
    (subject) =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout role="admin" title="Courses & Subjects">
      <Tabs defaultValue="courses" className="w-full">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <TabsList className="bg-card">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
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
          </div>
        </div>

        <TabsContent value="courses">
          <div className="flex justify-end mb-4">
            <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add New Course</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Course Name</label>
                    <Input placeholder="e.g. B.Tech Computer Science" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Course Code</label>
                      <Input placeholder="e.g. BTCS" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Duration</label>
                      <Input placeholder="e.g. 4 Years" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Department</label>
                      <Input placeholder="Select dept" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Total Credits</label>
                      <Input type="number" placeholder="180" className="mt-1" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Course</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Duration</th>
                  <th>Credits</th>
                  <th>Subjects</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td className="font-medium text-primary">{course.code}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-card-foreground">{course.name}</span>
                      </div>
                    </td>
                    <td>{course.department}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {course.duration}
                      </div>
                    </td>
                    <td className="text-center">{course.credits}</td>
                    <td className="text-center">{course.subjects}</td>
                    <td>
                      <span className={course.status === "active" ? "badge-success" : "badge-destructive"}>
                        {course.status}
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
        </TabsContent>

        <TabsContent value="subjects">
          <div className="flex justify-end mb-4">
            <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add New Subject</DialogTitle>
                </DialogHeader>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Subject Name</label>
                    <Input placeholder="e.g. Data Structures" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Subject Code</label>
                      <Input placeholder="e.g. CS201" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Credits</label>
                      <Input type="number" placeholder="4" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Course</label>
                      <Input placeholder="Select course" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Semester</label>
                      <Input type="number" placeholder="3" className="mt-1" min={1} max={8} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assigned Faculty</label>
                    <Input placeholder="Select faculty" className="mt-1" />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={() => setIsAddSubjectOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Subject</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Subject Name</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Credits</th>
                  <th>Faculty</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="font-medium text-info">{subject.code}</td>
                    <td className="font-medium text-card-foreground">{subject.name}</td>
                    <td>{subject.course}</td>
                    <td className="text-center">{subject.semester}</td>
                    <td className="text-center">{subject.credits}</td>
                    <td>{subject.faculty}</td>
                    <td>
                      <span className={
                        subject.type === "theory" ? "badge-info" :
                        subject.type === "practical" ? "badge-warning" : "badge-success"
                      }>
                        {subject.type}
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
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Courses;
