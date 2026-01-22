import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Wand2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Plus,
  Trash2,
  Edit,
  Users,
  BookOpen,
  Building,
  GraduationCap,
  Settings,
  Save,
  X,
  FlaskConical,
  Presentation,
  FileText
} from "lucide-react";
import { toast } from "sonner";

// ============ TYPES & INTERFACES ============

interface AcademicStructure {
  academicYear: string;
  semester: string;
  departmentName: string;
  program: string;
  year: string;
  section: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  type: "theory" | "lab" | "seminar" | "project";
  creditsPerWeek: number;
  hoursPerWeek: number;
  continuousHours: number;
  allowedDays: string[];
  preferredTime: string;
}

interface Staff {
  id: string;
  staffId: string;
  name: string;
  department: string;
  subjectsHandled: string[];
  maxPeriodsPerDay: number;
  maxPeriodsPerWeek: number;
  preferredDays: string[];
  preferredTimeSlots: string[];
  notAvailableSlots: { day: string; period: number }[];
  canHandleLab: boolean;
}

interface ClassSection {
  id: string;
  department: string;
  year: string;
  section: string;
  studentCount: number;
  subjectsEnrolled: string[];
}

interface TimeStructure {
  workingDays: string[];
  periodsPerDay: number;
  periodDuration: number;
  breakTimings: { afterPeriod: number; duration: number }[];
  lunchBreak: { afterPeriod: number; duration: number };
  labSessionLength: number;
}

interface InstitutionalRules {
  maxPeriodsPerStaffPerDay: number;
  maxConsecutiveTheory: number;
  labCannotBeFirstPeriod: boolean;
  labCannotBeLastPeriod: boolean;
  noStaffDoubleBooking: boolean;
  noRoomDoubleBooking: boolean;
}

// ============ DEFAULT DATA ============

const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const allPeriods = [1, 2, 3, 4, 5, 6, 7, 8];
const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "MBA", "Mathematics", "Physics"];
const programs = ["B.Sc", "BCA", "B.E", "B.Tech", "M.Sc", "MCA", "M.Tech", "MBA"];
const years = ["I Year", "II Year", "III Year", "IV Year"];
const sections = ["A", "B", "C", "D"];
const timeSlots = ["Morning (9-12)", "Afternoon (12-3)", "Evening (3-5)"];
const academicYears = ["2024-2025", "2025-2026", "2026-2027"];
const semesters = ["Odd Semester", "Even Semester"];

const defaultSubjects: Subject[] = [
  { id: "1", name: "Data Structures", code: "CS201", type: "theory", creditsPerWeek: 4, hoursPerWeek: 4, continuousHours: 1, allowedDays: allDays, preferredTime: "Morning (9-12)" },
  { id: "2", name: "Database Management", code: "CS301", type: "theory", creditsPerWeek: 3, hoursPerWeek: 3, continuousHours: 1, allowedDays: allDays, preferredTime: "" },
  { id: "3", name: "DS Lab", code: "CS201L", type: "lab", creditsPerWeek: 2, hoursPerWeek: 3, continuousHours: 3, allowedDays: ["Monday", "Tuesday", "Wednesday", "Thursday"], preferredTime: "Afternoon (12-3)" },
  { id: "4", name: "DBMS Lab", code: "CS301L", type: "lab", creditsPerWeek: 2, hoursPerWeek: 2, continuousHours: 2, allowedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], preferredTime: "" },
  { id: "5", name: "Seminar", code: "CS401S", type: "seminar", creditsPerWeek: 1, hoursPerWeek: 2, continuousHours: 2, allowedDays: ["Friday"], preferredTime: "Evening (3-5)" },
];

const defaultStaff: Staff[] = [
  { id: "1", staffId: "STF001", name: "Dr. Kumar", department: "Computer Science", subjectsHandled: ["Data Structures", "Algorithms"], maxPeriodsPerDay: 5, maxPeriodsPerWeek: 20, preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], preferredTimeSlots: ["Morning (9-12)"], notAvailableSlots: [{ day: "Wednesday", period: 1 }, { day: "Wednesday", period: 2 }], canHandleLab: true },
  { id: "2", staffId: "STF002", name: "Prof. Singh", department: "Computer Science", subjectsHandled: ["Database Management", "DBMS Lab"], maxPeriodsPerDay: 6, maxPeriodsPerWeek: 24, preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], preferredTimeSlots: [], notAvailableSlots: [], canHandleLab: true },
  { id: "3", staffId: "STF003", name: "Dr. Sharma", department: "Computer Science", subjectsHandled: ["Operating Systems", "OS Lab"], maxPeriodsPerDay: 5, maxPeriodsPerWeek: 18, preferredDays: ["Monday", "Wednesday", "Friday"], preferredTimeSlots: ["Afternoon (12-3)"], notAvailableSlots: [{ day: "Tuesday", period: 1 }, { day: "Tuesday", period: 2 }], canHandleLab: true },
];

const defaultClasses: ClassSection[] = [
  { id: "1", department: "Computer Science", year: "I Year", section: "A", studentCount: 60, subjectsEnrolled: ["Data Structures", "Database Management", "DS Lab", "DBMS Lab"] },
  { id: "2", department: "Computer Science", year: "I Year", section: "B", studentCount: 55, subjectsEnrolled: ["Data Structures", "Database Management", "DS Lab", "DBMS Lab"] },
  { id: "3", department: "Computer Science", year: "II Year", section: "A", studentCount: 58, subjectsEnrolled: ["Operating Systems", "Computer Networks", "OS Lab", "CN Lab"] },
];

const defaultTimeStructure: TimeStructure = {
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  periodsPerDay: 8,
  periodDuration: 50,
  breakTimings: [{ afterPeriod: 2, duration: 10 }],
  lunchBreak: { afterPeriod: 4, duration: 60 },
  labSessionLength: 2,
};

const defaultRules: InstitutionalRules = {
  maxPeriodsPerStaffPerDay: 6,
  maxConsecutiveTheory: 2,
  labCannotBeFirstPeriod: true,
  labCannotBeLastPeriod: true,
  noStaffDoubleBooking: true,
  noRoomDoubleBooking: true,
};

// ============ MAIN COMPONENT ============

const AutoTimetable = () => {
  const [activeTab, setActiveTab] = useState("academic");
  
  // Academic Structure State
  const [academicStructure, setAcademicStructure] = useState<AcademicStructure>({
    academicYear: "2024-2025",
    semester: "Odd Semester",
    departmentName: "",
    program: "",
    year: "",
    section: "",
  });

  // Subjects State
  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: "",
    code: "",
    type: "theory",
    creditsPerWeek: 3,
    hoursPerWeek: 3,
    continuousHours: 1,
    allowedDays: [...allDays],
    preferredTime: "",
  });

  // Staff State
  const [staff, setStaff] = useState<Staff[]>(defaultStaff);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    staffId: "",
    name: "",
    department: "",
    subjectsHandled: [],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 20,
    preferredDays: [...allDays.slice(0, 5)],
    preferredTimeSlots: [],
    notAvailableSlots: [],
    canHandleLab: false,
  });

  // Class Sections State
  const [classes, setClasses] = useState<ClassSection[]>(defaultClasses);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null);
  const [newClass, setNewClass] = useState<Partial<ClassSection>>({
    department: "",
    year: "",
    section: "",
    studentCount: 0,
    subjectsEnrolled: [],
  });

  // Time Structure State
  const [timeStructure, setTimeStructure] = useState<TimeStructure>(defaultTimeStructure);

  // Institutional Rules State
  const [rules, setRules] = useState<InstitutionalRules>(defaultRules);

  // ============ SUBJECT HANDLERS ============

  const handleAddSubject = () => {
    if (!newSubject.name || !newSubject.code) {
      toast.error("Please fill in subject name and code");
      return;
    }
    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name!,
      code: newSubject.code!,
      type: newSubject.type as Subject["type"],
      creditsPerWeek: newSubject.creditsPerWeek!,
      hoursPerWeek: newSubject.hoursPerWeek!,
      continuousHours: newSubject.continuousHours!,
      allowedDays: newSubject.allowedDays!,
      preferredTime: newSubject.preferredTime || "",
    };
    setSubjects([...subjects, subject]);
    setNewSubject({
      name: "",
      code: "",
      type: "theory",
      creditsPerWeek: 3,
      hoursPerWeek: 3,
      continuousHours: 1,
      allowedDays: [...allDays],
      preferredTime: "",
    });
    setIsAddSubjectOpen(false);
    toast.success("Subject added successfully");
  };

  const handleUpdateSubject = () => {
    if (!editingSubject) return;
    setSubjects(subjects.map(s => s.id === editingSubject.id ? editingSubject : s));
    setEditingSubject(null);
    toast.success("Subject updated successfully");
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    toast.success("Subject deleted");
  };

  // ============ STAFF HANDLERS ============

  const handleAddStaff = () => {
    if (!newStaff.staffId || !newStaff.name || !newStaff.department) {
      toast.error("Please fill in staff ID, name and department");
      return;
    }
    const staffMember: Staff = {
      id: Date.now().toString(),
      staffId: newStaff.staffId!,
      name: newStaff.name!,
      department: newStaff.department!,
      subjectsHandled: newStaff.subjectsHandled || [],
      maxPeriodsPerDay: newStaff.maxPeriodsPerDay!,
      maxPeriodsPerWeek: newStaff.maxPeriodsPerWeek!,
      preferredDays: newStaff.preferredDays || [],
      preferredTimeSlots: newStaff.preferredTimeSlots || [],
      notAvailableSlots: newStaff.notAvailableSlots || [],
      canHandleLab: newStaff.canHandleLab || false,
    };
    setStaff([...staff, staffMember]);
    setNewStaff({
      staffId: "",
      name: "",
      department: "",
      subjectsHandled: [],
      maxPeriodsPerDay: 5,
      maxPeriodsPerWeek: 20,
      preferredDays: [...allDays.slice(0, 5)],
      preferredTimeSlots: [],
      notAvailableSlots: [],
      canHandleLab: false,
    });
    setIsAddStaffOpen(false);
    toast.success("Staff added successfully");
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;
    setStaff(staff.map(s => s.id === editingStaff.id ? editingStaff : s));
    setEditingStaff(null);
    toast.success("Staff updated successfully");
  };

  const handleDeleteStaff = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
    toast.success("Staff deleted");
  };

  const toggleStaffNotAvailable = (staffMember: Staff, day: string, period: number) => {
    const exists = staffMember.notAvailableSlots.find(s => s.day === day && s.period === period);
    const newSlots = exists 
      ? staffMember.notAvailableSlots.filter(s => !(s.day === day && s.period === period))
      : [...staffMember.notAvailableSlots, { day, period }];
    
    if (editingStaff) {
      setEditingStaff({ ...editingStaff, notAvailableSlots: newSlots });
    }
  };

  // ============ CLASS HANDLERS ============

  const handleAddClass = () => {
    if (!newClass.department || !newClass.year || !newClass.section) {
      toast.error("Please fill in department, year and section");
      return;
    }
    const classSection: ClassSection = {
      id: Date.now().toString(),
      department: newClass.department!,
      year: newClass.year!,
      section: newClass.section!,
      studentCount: newClass.studentCount || 0,
      subjectsEnrolled: newClass.subjectsEnrolled || [],
    };
    setClasses([...classes, classSection]);
    setNewClass({
      department: "",
      year: "",
      section: "",
      studentCount: 0,
      subjectsEnrolled: [],
    });
    setIsAddClassOpen(false);
    toast.success("Class section added successfully");
  };

  const handleUpdateClass = () => {
    if (!editingClass) return;
    setClasses(classes.map(c => c.id === editingClass.id ? editingClass : c));
    setEditingClass(null);
    toast.success("Class updated successfully");
  };

  const handleDeleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
    toast.success("Class section deleted");
  };

  // ============ UTILITY FUNCTIONS ============

  const getSubjectTypeIcon = (type: Subject["type"]) => {
    switch (type) {
      case "theory": return <BookOpen className="h-4 w-4" />;
      case "lab": return <FlaskConical className="h-4 w-4" />;
      case "seminar": return <Presentation className="h-4 w-4" />;
      case "project": return <FileText className="h-4 w-4" />;
    }
  };

  const getSubjectTypeBadge = (type: Subject["type"]) => {
    const variants: Record<string, string> = {
      theory: "bg-primary/10 text-primary",
      lab: "bg-secondary text-secondary-foreground",
      seminar: "bg-accent text-accent-foreground",
      project: "bg-muted text-muted-foreground",
    };
    return variants[type] || variants.theory;
  };

  const handleSaveConfiguration = () => {
    toast.success("Configuration saved successfully! Ready to generate timetable.");
  };

  // ============ RENDER ============

  return (
    <DashboardLayout title="Auto Timetable Configuration" role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Timetable Configuration</h2>
            <p className="text-muted-foreground">Configure all inputs for automatic timetable generation</p>
          </div>
          <Button onClick={handleSaveConfiguration} className="gap-2">
            <Save className="h-4 w-4" />
            Save Configuration
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto gap-2 bg-transparent p-0">
            <TabsTrigger value="academic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Academic</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Subjects</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Classes</span>
            </TabsTrigger>
            <TabsTrigger value="time" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 border">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Rules</span>
            </TabsTrigger>
          </TabsList>

          {/* ============ TAB 1: ACADEMIC STRUCTURE ============ */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Academic Structure Inputs
                </CardTitle>
                <CardDescription>
                  Define what needs to be scheduled - academic year, department, program, and subjects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select 
                      value={academicStructure.academicYear} 
                      onValueChange={(v) => setAcademicStructure({...academicStructure, academicYear: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select 
                      value={academicStructure.semester} 
                      onValueChange={(v) => setAcademicStructure({...academicStructure, semester: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Department Name</Label>
                    <Select 
                      value={academicStructure.departmentName} 
                      onValueChange={(v) => setAcademicStructure({...academicStructure, departmentName: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Course / Program</Label>
                    <Select 
                      value={academicStructure.program} 
                      onValueChange={(v) => setAcademicStructure({...academicStructure, program: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select 
                      value={academicStructure.year} 
                      onValueChange={(v) => setAcademicStructure({...academicStructure, year: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Section</Label>
                    <Select 
                      value={academicStructure.section} 
                      onValueChange={(v) => setAcademicStructure({...academicStructure, section: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Subjects per semester summary */}
                <div>
                  <h4 className="font-medium mb-3">Subjects per Semester (Summary)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-primary">{subjects.filter(s => s.type === "theory").length}</div>
                      <div className="text-sm text-muted-foreground">Theory Subjects</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-primary">{subjects.filter(s => s.type === "lab").length}</div>
                      <div className="text-sm text-muted-foreground">Lab Subjects</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-primary">{subjects.filter(s => s.type === "seminar").length}</div>
                      <div className="text-sm text-muted-foreground">Seminars</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-primary">{subjects.filter(s => s.type === "project").length}</div>
                      <div className="text-sm text-muted-foreground">Projects</div>
                    </Card>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>📌 Why needed:</strong> This defines the total periods required and creates the foundational structure for timetable generation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ TAB 2: STAFF (FACULTY) INPUTS ============ */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Staff (Faculty) Inputs
                    </CardTitle>
                    <CardDescription>
                      Define who teaches what and when - including availability and constraints
                    </CardDescription>
                  </div>
                  <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Staff
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Staff Member</DialogTitle>
                        <DialogDescription>Enter staff details and availability preferences</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Staff ID *</Label>
                            <Input 
                              value={newStaff.staffId || ""} 
                              onChange={(e) => setNewStaff({...newStaff, staffId: e.target.value})}
                              placeholder="e.g., STF004"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input 
                              value={newStaff.name || ""} 
                              onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                              placeholder="e.g., Dr. John Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Department *</Label>
                          <Select 
                            value={newStaff.department || ""} 
                            onValueChange={(v) => setNewStaff({...newStaff, department: v})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subjects Handled</Label>
                          <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                            {subjects.map(s => (
                              <div key={s.id} className="flex items-center gap-2">
                                <Checkbox 
                                  id={`new-staff-subject-${s.id}`}
                                  checked={newStaff.subjectsHandled?.includes(s.name)}
                                  onCheckedChange={(checked) => {
                                    const current = newStaff.subjectsHandled || [];
                                    setNewStaff({
                                      ...newStaff,
                                      subjectsHandled: checked 
                                        ? [...current, s.name]
                                        : current.filter(x => x !== s.name)
                                    });
                                  }}
                                />
                                <Label htmlFor={`new-staff-subject-${s.id}`} className="text-sm">{s.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Periods / Day</Label>
                            <Input 
                              type="number" 
                              value={newStaff.maxPeriodsPerDay || 5} 
                              onChange={(e) => setNewStaff({...newStaff, maxPeriodsPerDay: parseInt(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Periods / Week</Label>
                            <Input 
                              type="number" 
                              value={newStaff.maxPeriodsPerWeek || 20} 
                              onChange={(e) => setNewStaff({...newStaff, maxPeriodsPerWeek: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Preferred Working Days</Label>
                          <div className="flex flex-wrap gap-2">
                            {allDays.map(day => (
                              <Badge 
                                key={day}
                                variant={newStaff.preferredDays?.includes(day) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = newStaff.preferredDays || [];
                                  setNewStaff({
                                    ...newStaff,
                                    preferredDays: current.includes(day) 
                                      ? current.filter(d => d !== day)
                                      : [...current, day]
                                  });
                                }}
                              >
                                {day.slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={newStaff.canHandleLab || false}
                            onCheckedChange={(checked) => setNewStaff({...newStaff, canHandleLab: checked})}
                          />
                          <Label>Can Handle Lab Sessions</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddStaff}>Add Staff</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Max/Day</TableHead>
                        <TableHead>Max/Week</TableHead>
                        <TableHead>Lab</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.staffId}</TableCell>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.department}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {s.subjectsHandled.slice(0, 2).map(sub => (
                                <Badge key={sub} variant="secondary" className="text-xs">{sub}</Badge>
                              ))}
                              {s.subjectsHandled.length > 2 && (
                                <Badge variant="outline" className="text-xs">+{s.subjectsHandled.length - 2}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{s.maxPeriodsPerDay}</TableCell>
                          <TableCell>{s.maxPeriodsPerWeek}</TableCell>
                          <TableCell>
                            <Badge variant={s.canHandleLab ? "default" : "outline"}>
                              {s.canHandleLab ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditingStaff(s)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteStaff(s.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Staff Edit Dialog */}
                <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Staff: {editingStaff?.name}</DialogTitle>
                      <DialogDescription>Update staff details and mark unavailable slots</DialogDescription>
                    </DialogHeader>
                    {editingStaff && (
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Staff ID</Label>
                            <Input value={editingStaff.staffId} onChange={(e) => setEditingStaff({...editingStaff, staffId: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input value={editingStaff.name} onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Max Periods / Day</Label>
                            <Input type="number" value={editingStaff.maxPeriodsPerDay} onChange={(e) => setEditingStaff({...editingStaff, maxPeriodsPerDay: parseInt(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Max Periods / Week</Label>
                            <Input type="number" value={editingStaff.maxPeriodsPerWeek} onChange={(e) => setEditingStaff({...editingStaff, maxPeriodsPerWeek: parseInt(e.target.value)})} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={editingStaff.canHandleLab} onCheckedChange={(checked) => setEditingStaff({...editingStaff, canHandleLab: checked})} />
                          <Label>Can Handle Lab Sessions</Label>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <Label className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            Not Available Slots (Click to toggle)
                          </Label>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-20">Day</TableHead>
                                  {allPeriods.map(p => (
                                    <TableHead key={p} className="text-center w-12">P{p}</TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {allDays.slice(0, 6).map(day => (
                                  <TableRow key={day}>
                                    <TableCell className="font-medium">{day.slice(0, 3)}</TableCell>
                                    {allPeriods.map(period => {
                                      const isUnavailable = editingStaff.notAvailableSlots.some(s => s.day === day && s.period === period);
                                      return (
                                        <TableCell 
                                          key={period} 
                                          className={`text-center cursor-pointer transition-colors ${isUnavailable ? 'bg-destructive/10' : 'hover:bg-muted'}`}
                                          onClick={() => toggleStaffNotAvailable(editingStaff, day, period)}
                                        >
                                          {isUnavailable ? <X className="h-4 w-4 mx-auto text-destructive" /> : ""}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
                      <Button onClick={handleUpdateStaff}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>📌 Why needed:</strong> Staff availability and constraints ensure proper workload distribution and prevent scheduling conflicts.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ TAB 3: SUBJECT CONSTRAINTS ============ */}
          <TabsContent value="subjects" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Subject Constraints
                    </CardTitle>
                    <CardDescription>
                      Define how subjects must be placed - periods, continuous hours, and allowed days
                    </CardDescription>
                  </div>
                  <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Subject</DialogTitle>
                        <DialogDescription>Enter subject details and scheduling constraints</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Subject Name *</Label>
                            <Input 
                              value={newSubject.name || ""} 
                              onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                              placeholder="e.g., Computer Networks"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Subject Code *</Label>
                            <Input 
                              value={newSubject.code || ""} 
                              onChange={(e) => setNewSubject({...newSubject, code: e.target.value})}
                              placeholder="e.g., CS401"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject Type</Label>
                          <Select 
                            value={newSubject.type || "theory"} 
                            onValueChange={(v) => setNewSubject({...newSubject, type: v as Subject["type"]})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="theory">Theory</SelectItem>
                              <SelectItem value="lab">Lab</SelectItem>
                              <SelectItem value="seminar">Seminar / Presentation</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Credits/Week</Label>
                            <Input 
                              type="number" 
                              value={newSubject.creditsPerWeek || 3} 
                              onChange={(e) => setNewSubject({...newSubject, creditsPerWeek: parseInt(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Hours/Week</Label>
                            <Input 
                              type="number" 
                              value={newSubject.hoursPerWeek || 3} 
                              onChange={(e) => setNewSubject({...newSubject, hoursPerWeek: parseInt(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Continuous Hrs</Label>
                            <Input 
                              type="number" 
                              value={newSubject.continuousHours || 1} 
                              onChange={(e) => setNewSubject({...newSubject, continuousHours: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Allowed Days</Label>
                          <div className="flex flex-wrap gap-2">
                            {allDays.map(day => (
                              <Badge 
                                key={day}
                                variant={newSubject.allowedDays?.includes(day) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  const current = newSubject.allowedDays || [];
                                  setNewSubject({
                                    ...newSubject,
                                    allowedDays: current.includes(day) 
                                      ? current.filter(d => d !== day)
                                      : [...current, day]
                                  });
                                }}
                              >
                                {day.slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Preferred Time (Optional)</Label>
                          <Select 
                            value={newSubject.preferredTime || ""} 
                            onValueChange={(v) => setNewSubject({...newSubject, preferredTime: v})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="No preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">No preference</SelectItem>
                              {timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddSubjectOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSubject}>Add Subject</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Credits</TableHead>
                        <TableHead>Hours/Week</TableHead>
                        <TableHead>Continuous</TableHead>
                        <TableHead>Allowed Days</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.code}</TableCell>
                          <TableCell>{subject.name}</TableCell>
                          <TableCell>
                            <Badge className={getSubjectTypeBadge(subject.type)}>
                              <span className="flex items-center gap-1">
                                {getSubjectTypeIcon(subject.type)}
                                {subject.type}
                              </span>
                            </Badge>
                          </TableCell>
                          <TableCell>{subject.creditsPerWeek}</TableCell>
                          <TableCell>{subject.hoursPerWeek}</TableCell>
                          <TableCell>{subject.continuousHours} hr(s)</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {subject.allowedDays.length === 6 ? (
                                <Badge variant="outline" className="text-xs">All Days</Badge>
                              ) : (
                                subject.allowedDays.slice(0, 3).map(d => (
                                  <Badge key={d} variant="outline" className="text-xs">{d.slice(0, 2)}</Badge>
                                ))
                              )}
                              {subject.allowedDays.length > 3 && subject.allowedDays.length < 6 && (
                                <Badge variant="outline" className="text-xs">+{subject.allowedDays.length - 3}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditingSubject(subject)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteSubject(subject.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Subject Edit Dialog */}
                <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit Subject: {editingSubject?.name}</DialogTitle>
                    </DialogHeader>
                    {editingSubject && (
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Subject Name</Label>
                            <Input value={editingSubject.name} onChange={(e) => setEditingSubject({...editingSubject, name: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Subject Code</Label>
                            <Input value={editingSubject.code} onChange={(e) => setEditingSubject({...editingSubject, code: e.target.value})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject Type</Label>
                          <Select value={editingSubject.type} onValueChange={(v) => setEditingSubject({...editingSubject, type: v as Subject["type"]})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="theory">Theory</SelectItem>
                              <SelectItem value="lab">Lab</SelectItem>
                              <SelectItem value="seminar">Seminar / Presentation</SelectItem>
                              <SelectItem value="project">Project</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Credits/Week</Label>
                            <Input type="number" value={editingSubject.creditsPerWeek} onChange={(e) => setEditingSubject({...editingSubject, creditsPerWeek: parseInt(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Hours/Week</Label>
                            <Input type="number" value={editingSubject.hoursPerWeek} onChange={(e) => setEditingSubject({...editingSubject, hoursPerWeek: parseInt(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                            <Label>Continuous Hrs</Label>
                            <Input type="number" value={editingSubject.continuousHours} onChange={(e) => setEditingSubject({...editingSubject, continuousHours: parseInt(e.target.value)})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Allowed Days</Label>
                          <div className="flex flex-wrap gap-2">
                            {allDays.map(day => (
                              <Badge 
                                key={day}
                                variant={editingSubject.allowedDays.includes(day) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => {
                                  setEditingSubject({
                                    ...editingSubject,
                                    allowedDays: editingSubject.allowedDays.includes(day)
                                      ? editingSubject.allowedDays.filter(d => d !== day)
                                      : [...editingSubject.allowedDays, day]
                                  });
                                }}
                              >
                                {day.slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingSubject(null)}>Cancel</Button>
                      <Button onClick={handleUpdateSubject}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>📌 Why needed:</strong> Subject constraints define how each subject should be scheduled, including continuous lab hours and day restrictions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ TAB 4: CLASS / SECTION INPUTS ============ */}
          <TabsContent value="classes" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Class / Section Inputs
                    </CardTitle>
                    <CardDescription>
                      Define where students belong - department, year, section, and enrolled subjects
                    </CardDescription>
                  </div>
                  <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Class Section
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add New Class Section</DialogTitle>
                        <DialogDescription>Enter class details and enrolled subjects</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Department *</Label>
                          <Select value={newClass.department || ""} onValueChange={(v) => setNewClass({...newClass, department: v})}>
                            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                            <SelectContent>
                              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Year *</Label>
                            <Select value={newClass.year || ""} onValueChange={(v) => setNewClass({...newClass, year: v})}>
                              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                              <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Section *</Label>
                            <Select value={newClass.section || ""} onValueChange={(v) => setNewClass({...newClass, section: v})}>
                              <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                              <SelectContent>
                                {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Student Count</Label>
                          <Input 
                            type="number" 
                            value={newClass.studentCount || 0} 
                            onChange={(e) => setNewClass({...newClass, studentCount: parseInt(e.target.value)})}
                            placeholder="e.g., 60"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subjects Enrolled</Label>
                          <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                            {subjects.map(s => (
                              <div key={s.id} className="flex items-center gap-2">
                                <Checkbox 
                                  id={`new-class-subject-${s.id}`}
                                  checked={newClass.subjectsEnrolled?.includes(s.name)}
                                  onCheckedChange={(checked) => {
                                    const current = newClass.subjectsEnrolled || [];
                                    setNewClass({
                                      ...newClass,
                                      subjectsEnrolled: checked 
                                        ? [...current, s.name]
                                        : current.filter(x => x !== s.name)
                                    });
                                  }}
                                />
                                <Label htmlFor={`new-class-subject-${s.id}`} className="text-sm">{s.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddClassOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddClass}>Add Class</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Subjects Enrolled</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((cls) => (
                        <TableRow key={cls.id}>
                          <TableCell className="font-medium">{cls.department}</TableCell>
                          <TableCell>{cls.year}</TableCell>
                          <TableCell>{cls.section}</TableCell>
                          <TableCell>{cls.studentCount}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {cls.subjectsEnrolled.slice(0, 3).map(sub => (
                                <Badge key={sub} variant="secondary" className="text-xs">{sub}</Badge>
                              ))}
                              {cls.subjectsEnrolled.length > 3 && (
                                <Badge variant="outline" className="text-xs">+{cls.subjectsEnrolled.length - 3}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => setEditingClass(cls)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteClass(cls.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {/* Class Edit Dialog */}
                <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Edit Class: {editingClass?.department} - {editingClass?.year} {editingClass?.section}</DialogTitle>
                    </DialogHeader>
                    {editingClass && (
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={editingClass.department} onValueChange={(v) => setEditingClass({...editingClass, department: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Year</Label>
                            <Select value={editingClass.year} onValueChange={(v) => setEditingClass({...editingClass, year: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Section</Label>
                            <Select value={editingClass.section} onValueChange={(v) => setEditingClass({...editingClass, section: v})}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Student Count</Label>
                          <Input type="number" value={editingClass.studentCount} onChange={(e) => setEditingClass({...editingClass, studentCount: parseInt(e.target.value)})} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subjects Enrolled</Label>
                          <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-40 overflow-y-auto">
                            {subjects.map(s => (
                              <div key={s.id} className="flex items-center gap-2">
                                <Checkbox 
                                  id={`edit-class-subject-${s.id}`}
                                  checked={editingClass.subjectsEnrolled.includes(s.name)}
                                  onCheckedChange={(checked) => {
                                    setEditingClass({
                                      ...editingClass,
                                      subjectsEnrolled: checked 
                                        ? [...editingClass.subjectsEnrolled, s.name]
                                        : editingClass.subjectsEnrolled.filter(x => x !== s.name)
                                    });
                                  }}
                                />
                                <Label htmlFor={`edit-class-subject-${s.id}`} className="text-sm">{s.name}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingClass(null)}>Cancel</Button>
                      <Button onClick={handleUpdateClass}>Save Changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong>📌 Why needed:</strong> Class sections define which students take which subjects, enabling proper room allocation based on student count.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ TAB 5: TIME STRUCTURE INPUTS ============ */}
          <TabsContent value="time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Structure Inputs
                </CardTitle>
                <CardDescription>
                  Define when the college works - working days, periods, breaks, and lab sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Working Days */}
                <div className="space-y-3">
                  <Label>College Working Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {allDays.map(day => (
                      <Badge 
                        key={day}
                        variant={timeStructure.workingDays.includes(day) ? "default" : "outline"}
                        className="cursor-pointer px-4 py-2"
                        onClick={() => {
                          setTimeStructure({
                            ...timeStructure,
                            workingDays: timeStructure.workingDays.includes(day)
                              ? timeStructure.workingDays.filter(d => d !== day)
                              : [...timeStructure.workingDays, day]
                          });
                        }}
                      >
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Periods Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Periods Per Day</Label>
                    <Input 
                      type="number" 
                      value={timeStructure.periodsPerDay} 
                      onChange={(e) => setTimeStructure({...timeStructure, periodsPerDay: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">Total number of teaching periods</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Period Duration (minutes)</Label>
                    <Select 
                      value={timeStructure.periodDuration.toString()} 
                      onValueChange={(v) => setTimeStructure({...timeStructure, periodDuration: parseInt(v)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="50">50 minutes</SelectItem>
                        <SelectItem value="55">55 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lab Session Length (periods)</Label>
                    <Select 
                      value={timeStructure.labSessionLength.toString()} 
                      onValueChange={(v) => setTimeStructure({...timeStructure, labSessionLength: parseInt(v)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 periods</SelectItem>
                        <SelectItem value="3">3 periods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Breaks Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Break Timings</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Short Break</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">After Period</Label>
                          <Select 
                            value={timeStructure.breakTimings[0]?.afterPeriod.toString() || "2"} 
                            onValueChange={(v) => {
                              const newBreaks = [...timeStructure.breakTimings];
                              if (newBreaks[0]) newBreaks[0].afterPeriod = parseInt(v);
                              else newBreaks[0] = { afterPeriod: parseInt(v), duration: 10 };
                              setTimeStructure({...timeStructure, breakTimings: newBreaks});
                            }}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7].map(p => (
                                <SelectItem key={p} value={p.toString()}>Period {p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Duration (min)</Label>
                          <Input 
                            type="number" 
                            value={timeStructure.breakTimings[0]?.duration || 10}
                            onChange={(e) => {
                              const newBreaks = [...timeStructure.breakTimings];
                              if (newBreaks[0]) newBreaks[0].duration = parseInt(e.target.value);
                              setTimeStructure({...timeStructure, breakTimings: newBreaks});
                            }}
                          />
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-3">Lunch Break</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">After Period</Label>
                          <Select 
                            value={timeStructure.lunchBreak.afterPeriod.toString()} 
                            onValueChange={(v) => setTimeStructure({
                              ...timeStructure, 
                              lunchBreak: {...timeStructure.lunchBreak, afterPeriod: parseInt(v)}
                            })}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {[3, 4, 5, 6].map(p => (
                                <SelectItem key={p} value={p.toString()}>Period {p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Duration (min)</Label>
                          <Input 
                            type="number" 
                            value={timeStructure.lunchBreak.duration}
                            onChange={(e) => setTimeStructure({
                              ...timeStructure, 
                              lunchBreak: {...timeStructure.lunchBreak, duration: parseInt(e.target.value)}
                            })}
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>📌 Why needed:</strong> Time structure defines the daily schedule framework that the timetable must fit into.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ============ TAB 6: INSTITUTIONAL RULES & CONSTRAINTS ============ */}
          <TabsContent value="rules" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Institutional Rules & Constraints
                </CardTitle>
                <CardDescription>
                  Control quality and feasibility - workload limits, scheduling restrictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Numeric Constraints */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Max Periods Per Staff Per Day</Label>
                    <Input 
                      type="number" 
                      value={rules.maxPeriodsPerStaffPerDay} 
                      onChange={(e) => setRules({...rules, maxPeriodsPerStaffPerDay: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">Limits staff workload per day</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Consecutive Theory Periods</Label>
                    <Input 
                      type="number" 
                      value={rules.maxConsecutiveTheory} 
                      onChange={(e) => setRules({...rules, maxConsecutiveTheory: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">For student attention span</p>
                  </div>
                </div>

                <Separator />

                {/* Boolean Constraints */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Scheduling Rules</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Lab Cannot Be First Period</h4>
                          <p className="text-sm text-muted-foreground">Labs should not be scheduled in the first period</p>
                        </div>
                        <Switch 
                          checked={rules.labCannotBeFirstPeriod}
                          onCheckedChange={(checked) => setRules({...rules, labCannotBeFirstPeriod: checked})}
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Lab Cannot Be Last Period</h4>
                          <p className="text-sm text-muted-foreground">Labs should not be scheduled in the last period</p>
                        </div>
                        <Switch 
                          checked={rules.labCannotBeLastPeriod}
                          onCheckedChange={(checked) => setRules({...rules, labCannotBeLastPeriod: checked})}
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">No Staff Double-Booking</h4>
                          <p className="text-sm text-muted-foreground">Staff cannot handle two classes at same time</p>
                        </div>
                        <Switch 
                          checked={rules.noStaffDoubleBooking}
                          onCheckedChange={(checked) => setRules({...rules, noStaffDoubleBooking: checked})}
                        />
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">No Room Double-Booking</h4>
                          <p className="text-sm text-muted-foreground">One class → one room at a time</p>
                        </div>
                        <Switch 
                          checked={rules.noRoomDoubleBooking}
                          onCheckedChange={(checked) => setRules({...rules, noRoomDoubleBooking: checked})}
                        />
                      </div>
                    </Card>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>📌 Why needed:</strong> These rules ensure the generated timetable is feasible, avoids conflicts, and maintains quality standards.
                  </p>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                  <Button size="lg" className="gap-2 px-8" onClick={handleSaveConfiguration}>
                    <Wand2 className="h-5 w-5" />
                    Save & Proceed to Generate Timetable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AutoTimetable;
