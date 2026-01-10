import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ClipboardCheck,
  Calendar,
  Users,
  Check,
  X,
  MapPin,
  Camera,
  Upload,
  Clock,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const classesData = [
  { id: 1, subject: "Data Structures", batch: "CSE-3A", time: "9:00 - 10:00 AM", date: "Jan 10, 2025", status: "pending" },
  { id: 2, subject: "DS Lab", batch: "CSE-3A", time: "10:00 - 12:00 PM", date: "Jan 10, 2025", status: "pending" },
  { id: 3, subject: "Algorithms", batch: "CSE-3B", time: "2:00 - 3:00 PM", date: "Jan 10, 2025", status: "pending" },
  { id: 4, subject: "Data Structures", batch: "CSE-3B", time: "3:00 - 4:00 PM", date: "Jan 10, 2025", status: "pending" },
];

const studentsForAttendance = [
  { id: "STU001", name: "Arun Kumar", rollNo: "21CS101", status: "present" as const },
  { id: "STU002", name: "Priya Sharma", rollNo: "21CS102", status: "present" as const },
  { id: "STU003", name: "Vikram Singh", rollNo: "21CS103", status: "absent" as const },
  { id: "STU004", name: "Sneha Patel", rollNo: "21CS104", status: "present" as const },
  { id: "STU005", name: "Rahul Verma", rollNo: "21CS105", status: "od" as const },
  { id: "STU006", name: "Kavitha R", rollNo: "21CS106", status: "present" as const },
  { id: "STU007", name: "Mohammed Ali", rollNo: "21CS107", status: "present" as const },
  { id: "STU008", name: "Deepika N", rollNo: "21CS108", status: "present" as const },
];

type AttendanceStatus = "present" | "absent" | "od";

const StaffAttendance = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [attendanceList, setAttendanceList] = useState(studentsForAttendance);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showODModal, setShowODModal] = useState(false);
  const [selectedStudentForOD, setSelectedStudentForOD] = useState<string | null>(null);
  const [odPhoto, setOdPhoto] = useState<File | null>(null);
  const [odPhotoPreview, setOdPhotoPreview] = useState<string | null>(null);
  const [odReason, setOdReason] = useState("");
  const [odLocation, setOdLocation] = useState("");
  const [geotagData, setGeotagData] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    if (status === "od") {
      setSelectedStudentForOD(studentId);
      setShowODModal(true);
    } else {
      setAttendanceList(prev =>
        prev.map(s => s.id === studentId ? { ...s, status } : s)
      );
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOdPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOdPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureGeotag = () => {
    setIsCapturingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeotagData({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setOdLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setIsCapturingLocation(false);
          toast({
            title: "Location captured",
            description: "Geotag has been added to the attendance record.",
          });
        },
        (error) => {
          setIsCapturingLocation(false);
          toast({
            title: "Location error",
            description: "Unable to capture location. Please enable GPS.",
            variant: "destructive",
          });
        }
      );
    } else {
      setIsCapturingLocation(false);
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const submitODAttendance = () => {
    if (!odPhoto) {
      toast({
        title: "Photo required",
        description: "Please upload a geotagged photo for OD attendance.",
        variant: "destructive",
      });
      return;
    }

    if (!geotagData) {
      toast({
        title: "Location required",
        description: "Please capture the geotag location.",
        variant: "destructive",
      });
      return;
    }

    if (!odReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for the On Duty attendance.",
        variant: "destructive",
      });
      return;
    }

    if (selectedStudentForOD) {
      setAttendanceList(prev =>
        prev.map(s => s.id === selectedStudentForOD ? { ...s, status: "od" as const } : s)
      );
    }

    toast({
      title: "OD Attendance marked",
      description: "On Duty attendance has been recorded with geotag verification.",
    });

    // Reset modal state
    setShowODModal(false);
    setSelectedStudentForOD(null);
    setOdPhoto(null);
    setOdPhotoPreview(null);
    setOdReason("");
    setOdLocation("");
    setGeotagData(null);
  };

  const submitAttendance = () => {
    toast({
      title: "Attendance submitted",
      description: "Attendance has been marked successfully.",
    });
    setSelectedClass(null);
  };

  const presentCount = attendanceList.filter(s => s.status === "present").length;
  const absentCount = attendanceList.filter(s => s.status === "absent").length;
  const odCount = attendanceList.filter(s => s.status === "od").length;

  return (
    <DashboardLayout role="staff" title="Attendance">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Mark Attendance</h2>
          <p className="text-muted-foreground">Mark student attendance for your classes</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto bg-muted/50 border-border/50"
          />
        </div>
      </div>

      {!selectedClass ? (
        <>
          {/* Classes to Mark */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
              Today's Classes - Pending Attendance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classesData.map((cls) => (
                <div 
                  key={cls.id}
                  className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-card-foreground">{cls.subject}</h4>
                      <p className="text-sm text-muted-foreground">{cls.batch}</p>
                    </div>
                    <span className="badge badge-warning">Pending</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {cls.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {cls.date}
                    </span>
                  </div>
                  <Button onClick={() => setSelectedClass(cls.id)} className="w-full">
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Mark Attendance
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
                Today's Summary
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Classes Conducted</span>
                  <span className="font-semibold text-card-foreground">0 / 4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average Attendance</span>
                  <span className="font-semibold text-success">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">OD Requests</span>
                  <span className="font-semibold text-primary">2</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
                This Week
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Classes</span>
                  <span className="font-semibold text-card-foreground">16</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average Attendance</span>
                  <span className="font-semibold text-success">87%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shortage Alerts</span>
                  <span className="font-semibold text-destructive">3</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-heading font-semibold text-card-foreground mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Attendance History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Shortage Students List
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  OD Requests Pending
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Attendance Marking Interface */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-heading font-semibold text-card-foreground">
                  Data Structures - CSE-3A
                </h3>
                <p className="text-sm text-muted-foreground">9:00 - 10:00 AM • Jan 10, 2025</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedClass(null)}>
                  Cancel
                </Button>
                <Button onClick={submitAttendance}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Attendance
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/20 border border-success/30">
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Present: {presentCount}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 border border-destructive/30">
                <X className="w-4 h-4 text-destructive" />
                <span className="text-sm font-medium text-destructive">Absent: {absentCount}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">On Duty: {odCount}</span>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              {attendanceList.map((student) => (
                <div 
                  key={student.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                    student.status === "present" ? "bg-success/10 border border-success/20" :
                    student.status === "absent" ? "bg-destructive/10 border border-destructive/20" :
                    "bg-primary/10 border border-primary/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={student.status === "present" ? "default" : "outline"}
                      onClick={() => updateAttendance(student.id, "present")}
                      className={student.status === "present" ? "bg-success hover:bg-success/90" : ""}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "absent" ? "destructive" : "outline"}
                      onClick={() => updateAttendance(student.id, "absent")}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={student.status === "od" ? "default" : "outline"}
                      onClick={() => updateAttendance(student.id, "od")}
                      className={student.status === "od" ? "bg-primary" : ""}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      OD
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* OD Modal with Geotag Photo Upload */}
      <Dialog open={showODModal} onOpenChange={setShowODModal}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Mark On Duty Attendance</DialogTitle>
            <DialogDescription>
              Upload a geotagged photo and provide details for OD verification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-card-foreground">Geotag Photo *</Label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center">
                {odPhotoPreview ? (
                  <div className="space-y-3">
                    <img 
                      src={odPhotoPreview} 
                      alt="OD Photo" 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setOdPhoto(null);
                        setOdPhotoPreview(null);
                      }}
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <label className="cursor-pointer">
                        <span className="text-primary hover:underline">Upload photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Take a photo or upload from gallery
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Geotag Location */}
            <div className="space-y-2">
              <Label className="text-card-foreground">Location (Geotag) *</Label>
              <div className="flex gap-2">
                <Input
                  value={odLocation}
                  placeholder="Capture or enter location..."
                  readOnly
                  className="bg-muted/50 border-border/50 flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={captureGeotag}
                  disabled={isCapturingLocation}
                >
                  {isCapturingLocation ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {geotagData && (
                <p className="text-xs text-success flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Location verified: {geotagData.lat.toFixed(4)}, {geotagData.lng.toFixed(4)}
                </p>
              )}
            </div>

            {/* OD Reason */}
            <div className="space-y-2">
              <Label className="text-card-foreground">Reason for OD *</Label>
              <Select value={odReason} onValueChange={setOdReason}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workshop">Workshop/Seminar</SelectItem>
                  <SelectItem value="sports">Sports Event</SelectItem>
                  <SelectItem value="cultural">Cultural Event</SelectItem>
                  <SelectItem value="placement">Placement Activity</SelectItem>
                  <SelectItem value="nss">NSS/NCC Activity</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label className="text-card-foreground">Additional Details</Label>
              <Textarea
                placeholder="Enter event name, venue, or other relevant details..."
                className="bg-muted/50 border-border/50 resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowODModal(false)}>
              Cancel
            </Button>
            <Button onClick={submitODAttendance}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm OD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default StaffAttendance;
