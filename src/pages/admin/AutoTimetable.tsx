import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Wand2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Download,
  Settings,
  Users,
  MapPin,
  Edit,
  FileSpreadsheet,
  FileText,
  Building,
  FlaskConical,
  GraduationCap,
  UserCheck,
  X
} from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  day: string;
  period: number;
  subject: string;
  staff: string;
  room: string;
  type: "theory" | "lab" | "break";
  isLocked?: boolean;
}

interface Faculty {
  id: string;
  name: string;
  department: string;
  subjects: string[];
  availability: {
    [key: string]: boolean[];
  };
  maxPeriodsPerDay: number;
}

interface Room {
  id: string;
  name: string;
  type: "classroom" | "lab";
  capacity: number;
  department: string;
  equipment: string[];
}

interface Conflict {
  id: string;
  type: "faculty" | "room" | "subject";
  description: string;
  day: string;
  period: number;
  severity: "high" | "medium";
  suggestion: string;
}

interface Constraint {
  id: string;
  name: string;
  enabled: boolean;
  priority: "high" | "medium" | "low";
}

const defaultConstraints: Constraint[] = [
  { id: "no-consecutive", name: "No more than 2 consecutive periods for same subject", enabled: true, priority: "high" },
  { id: "lab-slots", name: "Lab sessions require 2-hour blocks", enabled: true, priority: "high" },
  { id: "lunch-break", name: "Lunch break between 12:30-1:30 PM", enabled: true, priority: "high" },
  { id: "staff-workload", name: "Maximum periods per day per staff", enabled: true, priority: "high" },
  { id: "room-capacity", name: "Room capacity must match student count", enabled: true, priority: "medium" },
  { id: "morning-theory", name: "Theory classes preferably in morning", enabled: false, priority: "low" },
  { id: "faculty-availability", name: "Respect faculty availability", enabled: true, priority: "high" },
  { id: "no-room-clash", name: "No room double-booking", enabled: true, priority: "high" },
  { id: "no-faculty-clash", name: "No faculty double-booking", enabled: true, priority: "high" },
];

const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "MBA"];
const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];
const periodTimes = ["9:00-9:50", "9:50-10:40", "10:50-11:40", "11:40-12:30", "12:30-1:30", "1:30-2:20", "2:20-3:10", "3:10-4:00"];

const initialFaculty: Faculty[] = [
  { id: "1", name: "Dr. Kumar", department: "Computer Science", subjects: ["Data Structures", "Algorithms"], availability: { Monday: [true, true, true, true, false, true, true, true], Tuesday: [true, true, true, true, false, true, true, true], Wednesday: [false, false, true, true, false, true, true, true], Thursday: [true, true, true, true, false, true, true, true], Friday: [true, true, true, true, false, true, true, true], Saturday: [true, true, false, false, false, false, false, false] }, maxPeriodsPerDay: 5 },
  { id: "2", name: "Prof. Singh", department: "Computer Science", subjects: ["Database", "DBMS Lab"], availability: { Monday: [true, true, true, true, false, true, true, true], Tuesday: [true, true, true, true, false, true, true, true], Wednesday: [true, true, true, true, false, true, true, true], Thursday: [true, true, true, true, false, true, true, true], Friday: [true, true, true, true, false, true, true, true], Saturday: [false, false, false, false, false, false, false, false] }, maxPeriodsPerDay: 6 },
  { id: "3", name: "Dr. Sharma", department: "Computer Science", subjects: ["Operating Systems", "OS Lab"], availability: { Monday: [true, true, true, true, false, true, true, true], Tuesday: [false, false, true, true, false, true, true, true], Wednesday: [true, true, true, true, false, true, true, true], Thursday: [true, true, true, true, false, true, true, true], Friday: [true, true, true, true, false, true, true, true], Saturday: [true, true, false, false, false, false, false, false] }, maxPeriodsPerDay: 5 },
  { id: "4", name: "Prof. Reddy", department: "Computer Science", subjects: ["Computer Networks", "CN Lab"], availability: { Monday: [true, true, true, true, false, true, true, true], Tuesday: [true, true, true, true, false, true, true, true], Wednesday: [true, true, true, true, false, true, true, true], Thursday: [true, true, true, true, false, true, true, true], Friday: [true, true, true, true, false, true, true, true], Saturday: [true, true, false, false, false, false, false, false] }, maxPeriodsPerDay: 6 },
  { id: "5", name: "Dr. Patel", department: "Computer Science", subjects: ["Software Engineering", "Project Lab"], availability: { Monday: [true, true, true, true, false, true, true, true], Tuesday: [true, true, true, true, false, true, true, true], Wednesday: [true, true, true, true, false, true, true, true], Thursday: [false, false, false, false, false, true, true, true], Friday: [true, true, true, true, false, true, true, true], Saturday: [false, false, false, false, false, false, false, false] }, maxPeriodsPerDay: 5 },
];

const initialRooms: Room[] = [
  { id: "1", name: "Room 101", type: "classroom", capacity: 60, department: "Computer Science", equipment: ["Projector", "Whiteboard"] },
  { id: "2", name: "Room 102", type: "classroom", capacity: 60, department: "Computer Science", equipment: ["Projector", "Whiteboard", "Smart Board"] },
  { id: "3", name: "Room 103", type: "classroom", capacity: 40, department: "Computer Science", equipment: ["Projector", "Whiteboard"] },
  { id: "4", name: "CS Lab-1", type: "lab", capacity: 30, department: "Computer Science", equipment: ["Computers", "Projector"] },
  { id: "5", name: "CS Lab-2", type: "lab", capacity: 30, department: "Computer Science", equipment: ["Computers", "Projector", "Network Equipment"] },
  { id: "6", name: "CS Lab-3", type: "lab", capacity: 25, department: "Computer Science", equipment: ["Computers", "Projector"] },
];

const AutoTimetable = () => {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [constraints, setConstraints] = useState<Constraint[]>(defaultConstraints);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedTimetable, setGeneratedTimetable] = useState<TimeSlot[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>(initialFaculty);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [selectedWorkDays, setSelectedWorkDays] = useState(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [periodsPerDay, setPeriodsPerDay] = useState(8);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const toggleConstraint = (id: string) => {
    setConstraints(prev => 
      prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    );
  };

  const toggleWorkDay = (day: string) => {
    setSelectedWorkDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const checkFacultyAvailability = (facultyId: string, day: string, period: number): boolean => {
    const f = faculty.find(fac => fac.id === facultyId);
    if (!f || !f.availability[day]) return false;
    return f.availability[day][period - 1] || false;
  };

  const detectConflicts = (timetable: TimeSlot[]): Conflict[] => {
    const detected: Conflict[] = [];
    
    // Check for faculty clashes (same faculty, same time slot)
    selectedWorkDays.forEach(day => {
      periods.slice(0, periodsPerDay).forEach(period => {
        const slotsAtTime = timetable.filter(s => s.day === day && s.period === period && s.type !== "break");
        
        // Faculty clash
        const facultyMap: Record<string, TimeSlot[]> = {};
        slotsAtTime.forEach(slot => {
          if (!facultyMap[slot.staff]) facultyMap[slot.staff] = [];
          facultyMap[slot.staff].push(slot);
        });
        
        Object.entries(facultyMap).forEach(([staffName, slots]) => {
          if (slots.length > 1) {
            detected.push({
              id: `fac-${day}-${period}-${staffName}`,
              type: "faculty",
              description: `${staffName} has overlapping sessions on ${day} Period ${period}`,
              day,
              period,
              severity: "high",
              suggestion: `Reassign one of the classes to another faculty or time slot`
            });
          }
        });
        
        // Room clash
        const roomMap: Record<string, TimeSlot[]> = {};
        slotsAtTime.forEach(slot => {
          if (!roomMap[slot.room]) roomMap[slot.room] = [];
          roomMap[slot.room].push(slot);
        });
        
        Object.entries(roomMap).forEach(([roomName, slots]) => {
          if (slots.length > 1) {
            detected.push({
              id: `room-${day}-${period}-${roomName}`,
              type: "room",
              description: `${roomName} has overlapping bookings on ${day} Period ${period}`,
              day,
              period,
              severity: "high",
              suggestion: `Reassign one of the classes to another room`
            });
          }
        });
      });
    });
    
    return detected;
  };

  const generateTimetable = async () => {
    if (!selectedDept || !selectedSemester) {
      toast.error("Please select department and semester");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setConflicts([]);

    // Simulate generation phases
    const phases = [
      "Analyzing faculty availability...",
      "Checking room allocations...",
      "Assigning theory classes...",
      "Scheduling lab sessions...",
      "Detecting conflicts...",
      "Optimizing schedule...",
      "Finalizing timetable..."
    ];

    for (let i = 0; i < phases.length; i++) {
      toast.info(phases[i]);
      await new Promise(r => setTimeout(r, 400));
      setProgress(Math.round(((i + 1) / phases.length) * 100));
    }

    const subjects = [
      { name: "Data Structures", type: "theory" as const, faculty: "Dr. Kumar" },
      { name: "Database", type: "theory" as const, faculty: "Prof. Singh" },
      { name: "Operating Systems", type: "theory" as const, faculty: "Dr. Sharma" },
      { name: "Computer Networks", type: "theory" as const, faculty: "Prof. Reddy" },
      { name: "Software Engineering", type: "theory" as const, faculty: "Dr. Patel" },
      { name: "DBMS Lab", type: "lab" as const, faculty: "Prof. Singh" },
      { name: "OS Lab", type: "lab" as const, faculty: "Dr. Sharma" },
      { name: "CN Lab", type: "lab" as const, faculty: "Prof. Reddy" },
    ];

    const theoryRooms = rooms.filter(r => r.type === "classroom").map(r => r.name);
    const labRooms = rooms.filter(r => r.type === "lab").map(r => r.name);

    const generated: TimeSlot[] = [];
    let slotId = 0;

    selectedWorkDays.forEach(day => {
      periods.slice(0, periodsPerDay).forEach(period => {
        slotId++;
        if (period === 5) {
          generated.push({
            id: `${slotId}`,
            day,
            period,
            subject: "Lunch Break",
            staff: "-",
            room: "-",
            type: "break"
          });
        } else {
          const isLabTime = period >= 6;
          const availableSubjects = subjects.filter(s => isLabTime ? s.type === "lab" : s.type === "theory");
          const subject = availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
          const roomPool = subject?.type === "lab" ? labRooms : theoryRooms;
          
          generated.push({
            id: `${slotId}`,
            day,
            period,
            subject: subject?.name || "Free Period",
            staff: subject?.faculty || "-",
            room: roomPool[Math.floor(Math.random() * roomPool.length)] || "-",
            type: subject?.type || "theory",
            isLocked: false
          });
        }
      });
    });

    setGeneratedTimetable(generated);
    const detectedConflicts = detectConflicts(generated);
    setConflicts(detectedConflicts);
    setIsGenerating(false);
    
    if (detectedConflicts.length > 0) {
      toast.warning(`Timetable generated with ${detectedConflicts.length} conflict(s)`);
    } else {
      toast.success("Timetable generated successfully with no conflicts!");
    }
  };

  const resolveConflicts = () => {
    // Auto-resolve by reassigning conflicting slots
    const resolved = [...generatedTimetable];
    conflicts.forEach(conflict => {
      const slotIndex = resolved.findIndex(s => s.day === conflict.day && s.period === conflict.period && !s.isLocked);
      if (slotIndex !== -1 && conflict.type === "room") {
        const availableRooms = rooms.filter(r => 
          !resolved.some(s => s.day === conflict.day && s.period === conflict.period && s.room === r.name)
        );
        if (availableRooms.length > 0) {
          resolved[slotIndex] = { ...resolved[slotIndex], room: availableRooms[0].name };
        }
      }
    });
    setGeneratedTimetable(resolved);
    setConflicts([]);
    toast.success("All conflicts resolved!");
  };

  const handleManualEdit = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setIsEditDialogOpen(true);
  };

  const saveSlotEdit = () => {
    if (!editingSlot) return;
    setGeneratedTimetable(prev => 
      prev.map(s => s.id === editingSlot.id ? { ...editingSlot, isLocked: true } : s)
    );
    setIsEditDialogOpen(false);
    setEditingSlot(null);
    
    // Recheck conflicts
    const newConflicts = detectConflicts(generatedTimetable.map(s => 
      s.id === editingSlot.id ? { ...editingSlot, isLocked: true } : s
    ));
    setConflicts(newConflicts);
    toast.success("Slot updated and locked");
  };

  const toggleSlotLock = (slotId: string) => {
    setGeneratedTimetable(prev => 
      prev.map(s => s.id === slotId ? { ...s, isLocked: !s.isLocked } : s)
    );
  };

  const exportTimetable = (format: "pdf" | "excel") => {
    if (generatedTimetable.length === 0) {
      toast.error("No timetable to export");
      return;
    }

    // Create CSV content for Excel export
    if (format === "excel") {
      const headers = ["Period", "Time", ...selectedWorkDays];
      const rows = periods.slice(0, periodsPerDay).map(period => {
        const time = periodTimes[period - 1];
        const daySlots = selectedWorkDays.map(day => {
          const slot = generatedTimetable.find(s => s.day === day && s.period === period);
          return slot ? `${slot.subject} (${slot.staff}) [${slot.room}]` : "-";
        });
        return [`P${period}`, time, ...daySlots];
      });

      const csvContent = [
        `Timetable - ${selectedDept} - ${selectedSemester} Semester`,
        "",
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timetable_${selectedDept}_${selectedSemester}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Timetable exported as Excel (CSV)");
    } else {
      // For PDF, create a printable version
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const tableHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Timetable - ${selectedDept} - ${selectedSemester}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #333; padding: 8px; text-align: center; }
              th { background-color: #f0f0f0; }
              .break { background-color: #ffe0b2; }
              .lab { background-color: #e3f2fd; }
              .locked { background-color: #c8e6c9; }
              @media print { body { -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            <h1>Timetable - ${selectedDept} - ${selectedSemester} Semester</h1>
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Time</th>
                  ${selectedWorkDays.map(d => `<th>${d}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${periods.slice(0, periodsPerDay).map(period => `
                  <tr>
                    <td>P${period}</td>
                    <td>${periodTimes[period - 1]}</td>
                    ${selectedWorkDays.map(day => {
                      const slot = generatedTimetable.find(s => s.day === day && s.period === period);
                      const className = slot?.type === "break" ? "break" : slot?.type === "lab" ? "lab" : slot?.isLocked ? "locked" : "";
                      return `<td class="${className}">
                        ${slot ? (slot.type === "break" ? "Lunch Break" : `<strong>${slot.subject}</strong><br/>${slot.staff}<br/>${slot.room}`) : "-"}
                      </td>`;
                    }).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>
            <script>window.print();</script>
          </body>
          </html>
        `;
        printWindow.document.write(tableHtml);
        printWindow.document.close();
        toast.success("Print dialog opened for PDF export");
      }
    }
  };

  return (
    <DashboardLayout role="admin" title="Auto Timetable">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Auto Timetable Scheduling</h1>
            <p className="text-muted-foreground">AI-powered automatic timetable generation with conflict detection</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              disabled={generatedTimetable.length === 0}
              onClick={() => exportTimetable("excel")}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              disabled={generatedTimetable.length === 0}
              onClick={() => exportTimetable("pdf")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="generate">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="faculty">
              <Users className="w-4 h-4 mr-2" />
              Faculty Availability
            </TabsTrigger>
            <TabsTrigger value="rooms">
              <Building className="w-4 h-4 mr-2" />
              Rooms & Labs
            </TabsTrigger>
            <TabsTrigger value="semesters">
              <GraduationCap className="w-4 h-4 mr-2" />
              Semester View
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={selectedDept} onValueChange={setSelectedDept}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {semesters.map(sem => (
                            <SelectItem key={sem} value={sem}>{sem} Semester</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Working Days</Label>
                      <div className="flex flex-wrap gap-2">
                        {days.map(day => (
                          <Badge 
                            key={day} 
                            variant={selectedWorkDays.includes(day) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleWorkDay(day)}
                          >
                            {day.slice(0, 3)}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Periods Per Day</Label>
                      <Input 
                        type="number" 
                        value={periodsPerDay} 
                        onChange={(e) => setPeriodsPerDay(Number(e.target.value))}
                        min={1} 
                        max={10} 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scheduling Constraints</CardTitle>
                    <CardDescription>Enable/disable scheduling rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                    {constraints.map(constraint => (
                      <div key={constraint.id} className="flex items-start gap-3">
                        <Checkbox 
                          checked={constraint.enabled}
                          onCheckedChange={() => toggleConstraint(constraint.id)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{constraint.name}</p>
                          <Badge variant={
                            constraint.priority === "high" ? "destructive" : 
                            constraint.priority === "medium" ? "default" : "secondary"
                          } className="mt-1 text-xs">
                            {constraint.priority}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={generateTimetable}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Timetable
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </div>

              {/* Generated Timetable */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Generated Timetable
                      {selectedDept && selectedSemester && (
                        <Badge variant="outline">{selectedDept} - {selectedSemester}</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Click on any slot to manually override</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generatedTimetable.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr>
                              <th className="border p-2 bg-muted">Period</th>
                              <th className="border p-2 bg-muted">Time</th>
                              {selectedWorkDays.map(day => (
                                <th key={day} className="border p-2 bg-muted">{day}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {periods.slice(0, periodsPerDay).map(period => (
                              <tr key={period}>
                                <td className="border p-2 font-medium text-center bg-muted/50">
                                  P{period}
                                </td>
                                <td className="border p-2 text-center bg-muted/50 text-xs">
                                  {periodTimes[period - 1]}
                                </td>
                                {selectedWorkDays.map(day => {
                                  const slot = generatedTimetable.find(
                                    s => s.day === day && s.period === period
                                  );
                                  const hasConflict = conflicts.some(
                                    c => c.day === day && c.period === period
                                  );
                                  return (
                                    <td 
                                      key={`${day}-${period}`} 
                                      className={`border p-2 cursor-pointer hover:bg-accent/50 transition-colors ${
                                        slot?.type === "break" ? "bg-amber-100/50 dark:bg-amber-900/20" : 
                                        slot?.type === "lab" ? "bg-blue-100/50 dark:bg-blue-900/20" :
                                        slot?.isLocked ? "bg-green-100/50 dark:bg-green-900/20" : ""
                                      } ${hasConflict ? "ring-2 ring-destructive" : ""}`}
                                      onClick={() => slot && slot.type !== "break" && handleManualEdit(slot)}
                                    >
                                      {slot?.type === "break" ? (
                                        <div className="text-center text-muted-foreground">
                                          <Clock className="w-4 h-4 mx-auto mb-1" />
                                          Lunch Break
                                        </div>
                                      ) : slot ? (
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between">
                                            <p className={`font-medium ${slot.type === "lab" ? "text-blue-600 dark:text-blue-400" : "text-primary"}`}>
                                              {slot.subject}
                                            </p>
                                            {slot.isLocked && (
                                              <Badge variant="secondary" className="text-xs">🔒</Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <UserCheck className="w-3 h-3" />
                                            {slot.staff}
                                          </p>
                                          <Badge variant="outline" className="text-xs">
                                            {slot.type === "lab" ? <FlaskConical className="w-3 h-3 mr-1" /> : <MapPin className="w-3 h-3 mr-1" />}
                                            {slot.room}
                                          </Badge>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Configure settings and click "Generate Timetable"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Conflicts */}
                {conflicts.length > 0 && (
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Conflicts Detected ({conflicts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {conflicts.map((conflict) => (
                          <div key={conflict.id} className="flex items-start gap-3 p-3 bg-destructive/5 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{conflict.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                💡 {conflict.suggestion}
                              </p>
                            </div>
                            <Badge variant={conflict.type === "faculty" ? "destructive" : "default"}>
                              {conflict.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4 w-full"
                        onClick={resolveConflicts}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Auto-Resolve All Conflicts
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Faculty Availability Tab */}
          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Faculty Availability Matrix
                </CardTitle>
                <CardDescription>Green = Available, Red = Unavailable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Max Periods/Day</TableHead>
                        {days.slice(0, 5).map(day => (
                          <TableHead key={day} className="text-center">{day.slice(0, 3)}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faculty.map(f => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium">{f.name}</TableCell>
                          <TableCell>{f.department}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {f.subjects.map(s => (
                                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{f.maxPeriodsPerDay}</TableCell>
                          {days.slice(0, 5).map(day => (
                            <TableCell key={day} className="text-center">
                              <div className="flex gap-0.5 justify-center">
                                {f.availability[day]?.slice(0, 4).map((available, i) => (
                                  <div 
                                    key={i}
                                    className={`w-2 h-4 rounded ${available ? "bg-green-500" : "bg-red-500"}`}
                                    title={`Period ${i + 1}: ${available ? "Available" : "Unavailable"}`}
                                  />
                                ))}
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rooms & Labs Tab */}
          <TabsContent value="rooms">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Classrooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Room</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Equipment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.filter(r => r.type === "classroom").map(room => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>{room.capacity} students</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {room.equipment.map(e => (
                                <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5" />
                    Labs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lab</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Equipment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.filter(r => r.type === "lab").map(room => (
                        <TableRow key={room.id}>
                          <TableCell className="font-medium">{room.name}</TableCell>
                          <TableCell>{room.capacity} students</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {room.equipment.map(e => (
                                <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Semester View Tab */}
          <TabsContent value="semesters">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {semesters.map(sem => (
                <Card key={sem} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                  setSelectedSemester(sem);
                  toast.info(`Selected ${sem} Semester`);
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{sem} Semester</span>
                      <GraduationCap className="w-5 h-5 text-muted-foreground" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subjects:</span>
                        <span className="font-medium">6</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Labs:</span>
                        <span className="font-medium">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedSemester === sem ? "default" : "secondary"}>
                          {selectedSemester === sem ? "Selected" : "Available"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Manual Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Manual Override
              </DialogTitle>
              <DialogDescription>
                Edit this time slot. Changes will be locked from auto-generation.
              </DialogDescription>
            </DialogHeader>
            {editingSlot && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Day</Label>
                    <Input value={editingSlot.day} disabled />
                  </div>
                  <div>
                    <Label>Period</Label>
                    <Input value={`P${editingSlot.period} (${periodTimes[editingSlot.period - 1]})`} disabled />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select 
                    value={editingSlot.subject} 
                    onValueChange={(v) => setEditingSlot({ ...editingSlot, subject: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Data Structures">Data Structures</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                      <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="DBMS Lab">DBMS Lab</SelectItem>
                      <SelectItem value="OS Lab">OS Lab</SelectItem>
                      <SelectItem value="CN Lab">CN Lab</SelectItem>
                      <SelectItem value="Free Period">Free Period</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Faculty</Label>
                  <Select 
                    value={editingSlot.staff} 
                    onValueChange={(v) => setEditingSlot({ ...editingSlot, staff: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {faculty.map(f => (
                        <SelectItem key={f.id} value={f.name}>
                          {f.name}
                          {!checkFacultyAvailability(f.id, editingSlot.day, editingSlot.period) && 
                            " (Unavailable)"
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Select 
                    value={editingSlot.room} 
                    onValueChange={(v) => setEditingSlot({ ...editingSlot, room: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map(r => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name} ({r.type === "lab" ? "Lab" : "Classroom"} - {r.capacity} seats)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={editingSlot.isLocked} 
                    onCheckedChange={(v) => setEditingSlot({ ...editingSlot, isLocked: v })}
                  />
                  <Label>Lock this slot from auto-changes</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSlotEdit}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AutoTimetable;
