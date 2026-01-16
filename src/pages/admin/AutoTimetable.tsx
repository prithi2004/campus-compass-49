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
import { 
  Wand2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Download,
  Play,
  Pause,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface TimeSlot {
  day: string;
  period: number;
  subject: string;
  staff: string;
  room: string;
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
  { id: "staff-workload", name: "Maximum 6 periods per day per staff", enabled: true, priority: "medium" },
  { id: "room-capacity", name: "Room capacity must match student count", enabled: true, priority: "medium" },
  { id: "morning-theory", name: "Theory classes preferably in morning", enabled: false, priority: "low" },
];

const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "MBA"];
const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

const AutoTimetable = () => {
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [constraints, setConstraints] = useState<Constraint[]>(defaultConstraints);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedTimetable, setGeneratedTimetable] = useState<TimeSlot[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggleConstraint = (id: string) => {
    setConstraints(prev => 
      prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c)
    );
  };

  const generateTimetable = async () => {
    if (!selectedDept || !selectedSemester) {
      toast.error("Please select department and semester");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setConflicts([]);

    // Simulate generation with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 300));
      setProgress(i);
    }

    // Generate sample timetable
    const subjects = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science", "Lab"];
    const staff = ["Dr. Kumar", "Prof. Singh", "Dr. Sharma", "Prof. Reddy", "Dr. Patel"];
    const rooms = ["101", "102", "103", "Lab-1", "Lab-2"];

    const generated: TimeSlot[] = [];
    days.forEach(day => {
      periods.forEach(period => {
        if (period !== 5) { // Skip lunch
          generated.push({
            day,
            period,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            staff: staff[Math.floor(Math.random() * staff.length)],
            room: rooms[Math.floor(Math.random() * rooms.length)],
          });
        }
      });
    });

    setGeneratedTimetable(generated);
    setConflicts(["Dr. Kumar has overlapping sessions on Tuesday Period 3"]);
    setIsGenerating(false);
    toast.success("Timetable generated successfully!");
  };

  const resolveConflicts = () => {
    setConflicts([]);
    toast.success("All conflicts resolved!");
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Auto Timetable Scheduling</h1>
            <p className="text-muted-foreground">AI-powered automatic timetable generation with conflict resolution</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={generatedTimetable.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

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
                      <Badge key={day} variant="secondary">{day.slice(0, 3)}</Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Periods Per Day</Label>
                  <Input type="number" defaultValue={8} min={1} max={10} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Constraints</CardTitle>
                <CardDescription>Enable/disable scheduling rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Generated Timetable
                  {selectedDept && selectedSemester && (
                    <Badge variant="outline">{selectedDept} - {selectedSemester}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedTimetable.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="border p-2 bg-muted">Period</th>
                          {days.map(day => (
                            <th key={day} className="border p-2 bg-muted">{day}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {periods.map(period => (
                          <tr key={period}>
                            <td className="border p-2 font-medium text-center bg-muted/50">
                              {period === 5 ? "Lunch" : `P${period}`}
                            </td>
                            {days.map(day => {
                              const slot = generatedTimetable.find(
                                s => s.day === day && s.period === period
                              );
                              return (
                                <td key={`${day}-${period}`} className="border p-2">
                                  {period === 5 ? (
                                    <div className="text-center text-muted-foreground">
                                      Break
                                    </div>
                                  ) : slot ? (
                                    <div className="space-y-1">
                                      <p className="font-medium text-primary">{slot.subject}</p>
                                      <p className="text-xs text-muted-foreground">{slot.staff}</p>
                                      <Badge variant="outline" className="text-xs">{slot.room}</Badge>
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
              <Card className="mt-4 border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Conflicts Detected ({conflicts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {conflicts.map((conflict, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        {conflict}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={resolveConflicts}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Auto-Resolve Conflicts
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AutoTimetable;
