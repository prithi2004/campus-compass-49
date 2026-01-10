import DashboardLayout from "@/components/layout/DashboardLayout";
import { Award, Download, TrendingUp, FileText, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const semesterResults = [
  {
    semester: "Semester 5 (Current)",
    year: "2024-25",
    status: "ongoing",
    sgpa: 8.67,
    subjects: [
      { code: "CS501", name: "Data Structures & Algorithms", credits: 4, internal: 42, external: 46, total: 88, grade: "A" },
      { code: "CS502", name: "Operating Systems", credits: 4, internal: 45, external: 47, total: 92, grade: "A+" },
      { code: "CS503", name: "Database Management Systems", credits: 4, internal: 38, external: 40, total: 78, grade: "B+" },
      { code: "MA501", name: "Engineering Mathematics III", credits: 3, internal: 40, external: 45, total: 85, grade: "A" },
      { code: "CS504", name: "Computer Networks", credits: 3, internal: 41, external: 43, total: 84, grade: "A-" },
      { code: "CS505", name: "Software Engineering", credits: 3, internal: 44, external: 42, total: 86, grade: "A" },
    ],
  },
  {
    semester: "Semester 4",
    year: "2023-24",
    status: "completed",
    sgpa: 8.45,
    subjects: [
      { code: "CS401", name: "Design & Analysis of Algorithms", credits: 4, internal: 40, external: 44, total: 84, grade: "A" },
      { code: "CS402", name: "Computer Architecture", credits: 4, internal: 38, external: 42, total: 80, grade: "A-" },
      { code: "CS403", name: "Theory of Computation", credits: 3, internal: 42, external: 45, total: 87, grade: "A" },
      { code: "MA401", name: "Probability & Statistics", credits: 3, internal: 35, external: 40, total: 75, grade: "B+" },
    ],
  },
  {
    semester: "Semester 3",
    year: "2023-24",
    status: "completed",
    sgpa: 8.32,
    subjects: [
      { code: "CS301", name: "Object Oriented Programming", credits: 4, internal: 44, external: 48, total: 92, grade: "A+" },
      { code: "CS302", name: "Digital Logic Design", credits: 4, internal: 36, external: 39, total: 75, grade: "B+" },
      { code: "CS303", name: "Discrete Mathematics", credits: 3, internal: 40, external: 42, total: 82, grade: "A-" },
      { code: "MA301", name: "Linear Algebra", credits: 3, internal: 38, external: 40, total: 78, grade: "B+" },
    ],
  },
];

const cgpaHistory = [
  { semester: "Sem 1", cgpa: 7.89 },
  { semester: "Sem 2", cgpa: 8.12 },
  { semester: "Sem 3", cgpa: 8.32 },
  { semester: "Sem 4", cgpa: 8.45 },
  { semester: "Sem 5", cgpa: 8.67 },
];

const getGradeColor = (grade: string) => {
  if (grade === "A+" || grade === "A") return "text-success";
  if (grade === "A-" || grade === "B+") return "text-info";
  return "text-warning";
};

const StudentResults = () => {
  const handleDownload = (semester: string) => {
    // In a real app, this would trigger a PDF download
    alert(`Downloading ${semester} results...`);
  };

  return (
    <DashboardLayout role="student" title="My Results">
      {/* CGPA Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current CGPA</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">8.45</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-success" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 text-sm text-success">
            <TrendingUp className="w-4 h-4" />
            <span>+0.13 from last semester</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current SGPA</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">8.67</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Medal className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Semester 5</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Credits</p>
              <p className="text-3xl font-bold text-card-foreground mt-1">105</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-info/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-info" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Earned so far</p>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Backlogs</p>
              <p className="text-3xl font-bold text-success mt-1">0</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          </div>
          <p className="text-sm text-success mt-2">All clear!</p>
        </div>
      </div>

      {/* CGPA Progress */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
          CGPA Progression
        </h3>
        <div className="flex items-end gap-4 h-32">
          {cgpaHistory.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary"
                style={{ height: `${(item.cgpa / 10) * 100}%` }}
              />
              <p className="text-xs text-muted-foreground mt-2">{item.semester}</p>
              <p className="text-sm font-bold text-card-foreground">{item.cgpa}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Semester Results */}
      <div className="space-y-6">
        {semesterResults.map((sem) => (
          <div key={sem.semester} className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-heading font-semibold text-card-foreground">
                  {sem.semester}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Academic Year {sem.year} • SGPA: <span className="font-bold text-primary">{sem.sgpa}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  sem.status === "ongoing" 
                    ? "bg-warning/20 text-warning" 
                    : "bg-success/20 text-success"
                }`}>
                  {sem.status === "ongoing" ? "In Progress" : "Completed"}
                </span>
                {sem.status === "completed" && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(sem.semester)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Subject</th>
                    <th className="text-center">Credits</th>
                    <th className="text-center">Internal (50)</th>
                    <th className="text-center">External (50)</th>
                    <th className="text-center">Total (100)</th>
                    <th className="text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {sem.subjects.map((subject) => (
                    <tr key={subject.code}>
                      <td className="font-medium text-primary">{subject.code}</td>
                      <td>{subject.name}</td>
                      <td className="text-center">{subject.credits}</td>
                      <td className="text-center">{subject.internal}</td>
                      <td className="text-center">{subject.external}</td>
                      <td className="text-center font-medium">{subject.total}</td>
                      <td className="text-center">
                        <span className={`font-bold ${getGradeColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default StudentResults;
