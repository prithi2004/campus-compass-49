import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = ["9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00", "4:00"];

const timetableData: Record<string, Record<string, { subject: string; batch: string; room: string; type: string } | null>> = {
  Monday: {
    "9:00": { subject: "Data Structures", batch: "CSE-3A", room: "CS-101", type: "lecture" },
    "10:00": { subject: "DS Lab", batch: "CSE-3A", room: "Lab-2", type: "lab" },
    "11:00": { subject: "DS Lab", batch: "CSE-3A", room: "Lab-2", type: "lab" },
    "2:00": { subject: "Algorithms", batch: "CSE-3B", room: "CS-102", type: "lecture" },
  },
  Tuesday: {
    "9:00": { subject: "Data Structures", batch: "CSE-3B", room: "CS-101", type: "lecture" },
    "11:00": { subject: "Data Structures", batch: "CSE-3A", room: "CS-101", type: "lecture" },
    "3:00": { subject: "Algorithms", batch: "CSE-3B", room: "CS-102", type: "lecture" },
  },
  Wednesday: {
    "10:00": { subject: "DS Lab", batch: "CSE-3B", room: "Lab-2", type: "lab" },
    "11:00": { subject: "DS Lab", batch: "CSE-3B", room: "Lab-2", type: "lab" },
    "2:00": { subject: "Data Structures", batch: "CSE-3A", room: "CS-101", type: "lecture" },
    "3:00": { subject: "Data Structures", batch: "CSE-3B", room: "CS-101", type: "lecture" },
  },
  Thursday: {
    "9:00": { subject: "Algorithms", batch: "CSE-3B", room: "CS-102", type: "lecture" },
    "11:00": { subject: "Data Structures", batch: "CSE-3A", room: "CS-101", type: "lecture" },
    "2:00": { subject: "Data Structures", batch: "CSE-3B", room: "CS-101", type: "lecture" },
  },
  Friday: {
    "9:00": { subject: "Data Structures", batch: "CSE-3A", room: "CS-101", type: "lecture" },
    "10:00": { subject: "Algo Lab", batch: "CSE-3B", room: "Lab-1", type: "lab" },
    "11:00": { subject: "Algo Lab", batch: "CSE-3B", room: "Lab-1", type: "lab" },
    "3:00": { subject: "Algorithms", batch: "CSE-3B", room: "CS-102", type: "lecture" },
  },
  Saturday: {
    "9:00": { subject: "Extra Class", batch: "CSE-3A", room: "CS-101", type: "extra" },
  },
};

const StaffTimetable = () => {
  const [currentWeek, setCurrentWeek] = useState("Jan 6 - Jan 11, 2025");

  const todayClasses = [
    { time: "9:00 - 10:00 AM", subject: "Data Structures", batch: "CSE-3A", room: "CS-101", status: "completed" },
    { time: "10:00 - 12:00 PM", subject: "DS Lab", batch: "CSE-3A", room: "Lab-2", status: "ongoing" },
    { time: "2:00 - 3:00 PM", subject: "Algorithms", batch: "CSE-3B", room: "CS-102", status: "upcoming" },
  ];

  return (
    <DashboardLayout role="staff" title="Timetable">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Timetable</h2>
          <p className="text-muted-foreground">View and manage your teaching schedule</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Today's Classes Quick View */}
      <div className="glass-card p-6 mb-6">
        <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
          Today's Classes
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {todayClasses.map((cls, idx) => (
            <div 
              key={idx}
              className={`flex-shrink-0 w-64 p-4 rounded-xl border ${
                cls.status === "ongoing" 
                  ? "bg-primary/10 border-primary/30" 
                  : cls.status === "completed"
                  ? "bg-muted/30 border-border/30"
                  : "bg-muted/50 border-border/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className={`w-4 h-4 ${cls.status === "ongoing" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium text-card-foreground">{cls.time}</span>
              </div>
              <p className="font-semibold text-card-foreground">{cls.subject}</p>
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {cls.batch}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {cls.room}
                </span>
              </div>
              <span className={`inline-block mt-2 text-xs font-medium capitalize ${
                cls.status === "ongoing" ? "text-primary" :
                cls.status === "completed" ? "text-success" : "text-muted-foreground"
              }`}>
                {cls.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-semibold text-card-foreground">{currentWeek}</span>
          </div>
          <Button variant="ghost" size="sm">
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="glass-card p-6 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-muted-foreground border-b border-border/50">
                Time
              </th>
              {weekDays.map((day) => (
                <th key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground border-b border-border/50">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((time) => (
              <tr key={time}>
                <td className="p-3 text-sm font-medium text-muted-foreground border-b border-border/30">
                  {time} {parseInt(time) < 8 || parseInt(time) === 12 ? "PM" : parseInt(time) >= 9 && parseInt(time) <= 11 ? "AM" : "PM"}
                </td>
                {weekDays.map((day) => {
                  const slot = timetableData[day]?.[time];
                  return (
                    <td key={`${day}-${time}`} className="p-2 border-b border-border/30">
                      {slot ? (
                        <div className={`p-3 rounded-lg text-center ${
                          slot.type === "lab" 
                            ? "bg-accent/20 border border-accent/30" 
                            : slot.type === "extra"
                            ? "bg-warning/20 border border-warning/30"
                            : "bg-primary/10 border border-primary/20"
                        }`}>
                          <p className="font-medium text-sm text-card-foreground">{slot.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">{slot.batch}</p>
                          <p className="text-xs text-muted-foreground">{slot.room}</p>
                        </div>
                      ) : (
                        <div className="h-16" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-6 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
          <span className="text-sm text-muted-foreground">Lecture</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30" />
          <span className="text-sm text-muted-foreground">Lab</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30" />
          <span className="text-sm text-muted-foreground">Extra Class</span>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffTimetable;
