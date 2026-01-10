import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Users,
  Clock,
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const subjectsData = [
  {
    id: 1,
    code: "CS301",
    name: "Data Structures",
    batch: "CSE-3A",
    students: 50,
    classesHeld: 28,
    totalClasses: 40,
    syllabus: 70,
    assignments: 3,
    nextClass: "Tomorrow, 9:00 AM",
    room: "CS-101",
  },
  {
    id: 2,
    code: "CS301L",
    name: "Data Structures Lab",
    batch: "CSE-3A",
    students: 50,
    classesHeld: 12,
    totalClasses: 20,
    syllabus: 60,
    assignments: 5,
    nextClass: "Today, 10:00 AM",
    room: "Lab-2",
  },
  {
    id: 3,
    code: "CS302",
    name: "Algorithms",
    batch: "CSE-3B",
    students: 52,
    classesHeld: 25,
    totalClasses: 40,
    syllabus: 62,
    assignments: 2,
    nextClass: "Today, 2:00 PM",
    room: "CS-102",
  },
  {
    id: 4,
    code: "CS301",
    name: "Data Structures",
    batch: "CSE-3B",
    students: 52,
    classesHeld: 26,
    totalClasses: 40,
    syllabus: 65,
    assignments: 3,
    nextClass: "Today, 3:00 PM",
    room: "CS-101",
  },
];

const recentActivities = [
  { id: 1, action: "Uploaded assignment", subject: "Data Structures", time: "2 hours ago" },
  { id: 2, action: "Marked attendance", subject: "DS Lab", time: "4 hours ago" },
  { id: 3, action: "Updated syllabus", subject: "Algorithms", time: "Yesterday" },
  { id: 4, action: "Graded submissions", subject: "Data Structures", time: "2 days ago" },
];

const StaffSubjects = () => {
  return (
    <DashboardLayout role="staff" title="My Subjects">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Subjects</h2>
          <p className="text-muted-foreground">Manage your assigned subjects and course materials</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Upload Materials
        </Button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {subjectsData.map((subject) => (
          <div key={subject.id} className="glass-card p-6 hover:bg-card/80 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-primary">{subject.code}</span>
                  <span className="badge badge-outline">{subject.batch}</span>
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{subject.name}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold text-card-foreground">{subject.students}</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold text-card-foreground">{subject.classesHeld}/{subject.totalClasses}</p>
                <p className="text-xs text-muted-foreground">Classes</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <FileText className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-semibold text-card-foreground">{subject.assignments}</p>
                <p className="text-xs text-muted-foreground">Assignments</p>
              </div>
            </div>

            {/* Syllabus Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Syllabus Completed</span>
                <span className="font-medium text-card-foreground">{subject.syllabus}%</span>
              </div>
              <Progress value={subject.syllabus} className="h-2" />
            </div>

            {/* Next Class */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm text-card-foreground">
                  Next: <span className="font-medium">{subject.nextClass}</span>
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{subject.room}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                <FileText className="w-4 h-4 mr-1" />
                Materials
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Users className="w-4 h-4 mr-1" />
                Students
              </Button>
              <Button size="sm" className="flex-1">
                View Details
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
          Recent Activities
        </h3>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.subject}</p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffSubjects;
