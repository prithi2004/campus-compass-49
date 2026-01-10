import DashboardLayout from "@/components/layout/DashboardLayout";
import { BookOpen, Clock, User, ChevronRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const enrolledCourses = [
  {
    id: 1,
    code: "CS501",
    name: "Data Structures & Algorithms",
    credits: 4,
    faculty: "Dr. Rajesh Kumar",
    progress: 65,
    classes: 24,
    attended: 22,
    nextClass: "Tomorrow, 9:00 AM",
    grade: "A",
  },
  {
    id: 2,
    code: "CS502",
    name: "Operating Systems",
    credits: 4,
    faculty: "Prof. Priya Sharma",
    progress: 58,
    classes: 20,
    attended: 19,
    nextClass: "Today, 2:00 PM",
    grade: "A+",
  },
  {
    id: 3,
    code: "CS503",
    name: "Database Management Systems",
    credits: 4,
    faculty: "Mr. Karthik M",
    progress: 70,
    classes: 22,
    attended: 20,
    nextClass: "Wed, 11:00 AM",
    grade: "B+",
  },
  {
    id: 4,
    code: "MA501",
    name: "Engineering Mathematics III",
    credits: 3,
    faculty: "Mrs. Lakshmi Devi",
    progress: 55,
    classes: 18,
    attended: 17,
    nextClass: "Thu, 10:00 AM",
    grade: "A",
  },
  {
    id: 5,
    code: "CS504",
    name: "Computer Networks",
    credits: 3,
    faculty: "Dr. Anand Verma",
    progress: 48,
    classes: 16,
    attended: 15,
    nextClass: "Fri, 9:00 AM",
    grade: "A-",
  },
  {
    id: 6,
    code: "CS505",
    name: "Software Engineering",
    credits: 3,
    faculty: "Prof. Meera Nair",
    progress: 42,
    classes: 14,
    attended: 14,
    nextClass: "Mon, 3:00 PM",
    grade: "A",
  },
];

const StudentCourses = () => {
  const totalCredits = enrolledCourses.reduce((sum, c) => sum + c.credits, 0);
  
  return (
    <DashboardLayout role="student" title="My Courses">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{enrolledCourses.length}</p>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">{totalCredits}</p>
              <p className="text-sm text-muted-foreground">Total Credits</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">56%</p>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <User className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">6</p>
              <p className="text-sm text-muted-foreground">Faculty Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Semester Info */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-card-foreground">
              Semester 5 - B.Tech CSE
            </h2>
            <p className="text-muted-foreground mt-1">
              Academic Year 2024-25 • Jan - May 2025
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Semester Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={56} className="w-32 h-2 [&>div]:bg-primary" />
              <span className="text-sm font-medium text-card-foreground">56%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((course) => (
          <div key={course.id} className="glass-card p-6 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {course.code}
                </span>
                <h3 className="text-lg font-semibold text-card-foreground mt-2">
                  {course.name}
                </h3>
              </div>
              <span className={`text-lg font-bold ${
                course.grade.startsWith("A") ? "text-success" : "text-info"
              }`}>
                {course.grade}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{course.faculty}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Next: {course.nextClass}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-card-foreground">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2 [&>div]:bg-primary" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="text-sm">
                <span className="text-card-foreground font-medium">{course.credits}</span>
                <span className="text-muted-foreground"> Credits</span>
              </div>
              <div className="text-sm">
                <span className="text-card-foreground font-medium">{course.attended}</span>
                <span className="text-muted-foreground">/{course.classes} Classes</span>
              </div>
              <Button variant="ghost" size="sm" className="text-primary">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
