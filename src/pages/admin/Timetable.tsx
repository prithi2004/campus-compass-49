import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  Filter,
  Calendar,
} from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = ["9:00 - 10:00", "10:00 - 11:00", "11:15 - 12:15", "12:15 - 1:15", "2:00 - 3:00", "3:00 - 4:00"];

const timetableData: Record<string, Record<string, { subject: string; faculty: string; room: string } | null>> = {
  "Monday": {
    "9:00 - 10:00": { subject: "Data Structures", faculty: "Dr. Rajesh", room: "CS-101" },
    "10:00 - 11:00": { subject: "Operating Systems", faculty: "Prof. Priya", room: "CS-102" },
    "11:15 - 12:15": { subject: "Mathematics", faculty: "Mrs. Lakshmi", room: "M-201" },
    "12:15 - 1:15": null,
    "2:00 - 3:00": { subject: "DBMS Lab", faculty: "Mr. Karthik", room: "Lab-1" },
    "3:00 - 4:00": { subject: "DBMS Lab", faculty: "Mr. Karthik", room: "Lab-1" },
  },
  "Tuesday": {
    "9:00 - 10:00": { subject: "Computer Networks", faculty: "Dr. Arun", room: "CS-103" },
    "10:00 - 11:00": { subject: "Data Structures", faculty: "Dr. Rajesh", room: "CS-101" },
    "11:15 - 12:15": { subject: "Physics", faculty: "Dr. Suresh", room: "P-101" },
    "12:15 - 1:15": { subject: "Physics Lab", faculty: "Dr. Suresh", room: "PHY-Lab" },
    "2:00 - 3:00": null,
    "3:00 - 4:00": { subject: "Soft Skills", faculty: "Mrs. Sunita", room: "GH-1" },
  },
  "Wednesday": {
    "9:00 - 10:00": { subject: "Operating Systems", faculty: "Prof. Priya", room: "CS-102" },
    "10:00 - 11:00": { subject: "Mathematics", faculty: "Mrs. Lakshmi", room: "M-201" },
    "11:15 - 12:15": { subject: "Data Structures", faculty: "Dr. Rajesh", room: "CS-101" },
    "12:15 - 1:15": null,
    "2:00 - 3:00": { subject: "DS Lab", faculty: "Dr. Rajesh", room: "Lab-2" },
    "3:00 - 4:00": { subject: "DS Lab", faculty: "Dr. Rajesh", room: "Lab-2" },
  },
  "Thursday": {
    "9:00 - 10:00": { subject: "Computer Networks", faculty: "Dr. Arun", room: "CS-103" },
    "10:00 - 11:00": { subject: "DBMS", faculty: "Mr. Karthik", room: "CS-104" },
    "11:15 - 12:15": { subject: "Operating Systems", faculty: "Prof. Priya", room: "CS-102" },
    "12:15 - 1:15": null,
    "2:00 - 3:00": { subject: "Mathematics", faculty: "Mrs. Lakshmi", room: "M-201" },
    "3:00 - 4:00": { subject: "Seminar", faculty: "Dr. Rajesh", room: "Seminar Hall" },
  },
  "Friday": {
    "9:00 - 10:00": { subject: "DBMS", faculty: "Mr. Karthik", room: "CS-104" },
    "10:00 - 11:00": { subject: "Computer Networks", faculty: "Dr. Arun", room: "CS-103" },
    "11:15 - 12:15": { subject: "Physics", faculty: "Dr. Suresh", room: "P-101" },
    "12:15 - 1:15": null,
    "2:00 - 3:00": { subject: "CN Lab", faculty: "Dr. Arun", room: "Lab-3" },
    "3:00 - 4:00": { subject: "CN Lab", faculty: "Dr. Arun", room: "Lab-3" },
  },
  "Saturday": {
    "9:00 - 10:00": { subject: "Extra Class", faculty: "Dr. Rajesh", room: "CS-101" },
    "10:00 - 11:00": { subject: "Extra Class", faculty: "Prof. Priya", room: "CS-102" },
    "11:15 - 12:15": null,
    "12:15 - 1:15": null,
    "2:00 - 3:00": null,
    "3:00 - 4:00": null,
  },
};

const Timetable = () => {
  return (
    <DashboardLayout role="admin" title="Timetable Management">
      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            B.Tech CSE - Semester 4
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Timetable
          </Button>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-secondary/50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-card-foreground border-b border-border">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Time / Day
                </th>
                {days.map((day) => (
                  <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-card-foreground border-b border-border min-w-[140px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, slotIndex) => (
                <tr key={slot} className={slotIndex === 3 ? "bg-muted/20" : ""}>
                  <td className="px-4 py-3 text-sm font-medium text-card-foreground border-b border-border whitespace-nowrap">
                    {slot}
                    {slotIndex === 3 && <span className="ml-2 text-xs text-muted-foreground">(Lunch)</span>}
                  </td>
                  {days.map((day) => {
                    const classData = timetableData[day]?.[slot];
                    return (
                      <td key={day} className="px-2 py-2 border-b border-border">
                        {classData ? (
                          <div className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer">
                            <p className="text-sm font-medium text-card-foreground">{classData.subject}</p>
                            <p className="text-xs text-muted-foreground">{classData.faculty}</p>
                            <p className="text-xs text-primary">{classData.room}</p>
                          </div>
                        ) : slotIndex === 3 ? (
                          <div className="p-2 text-center text-xs text-muted-foreground">
                            Break
                          </div>
                        ) : (
                          <div className="p-2 text-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-4 mt-6">
        <p className="text-sm font-medium text-card-foreground mb-3">Color Legend</p>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/10" />
            <span className="text-sm text-muted-foreground">Theory Class</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success/20" />
            <span className="text-sm text-muted-foreground">Lab Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/20" />
            <span className="text-sm text-muted-foreground">Seminar/Extra</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30" />
            <span className="text-sm text-muted-foreground">Break/Free</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Timetable;
