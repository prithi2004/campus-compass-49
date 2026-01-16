import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Fingerprint, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Download,
  Search,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
  id: string;
  name: string;
  staffId: string;
  department: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "late" | "absent" | "on-duty";
  location: { lat: number; lng: number; address: string } | null;
  method: "biometric" | "geo" | "manual";
}

const mockAttendanceData: AttendanceRecord[] = [
  {
    id: "1",
    name: "Dr. Rajesh Kumar",
    staffId: "STF001",
    department: "Computer Science",
    checkIn: "08:45 AM",
    checkOut: "05:30 PM",
    status: "present",
    location: { lat: 13.0827, lng: 80.2707, address: "Main Campus, Chennai" },
    method: "biometric",
  },
  {
    id: "2",
    name: "Prof. Priya Sharma",
    staffId: "STF002",
    department: "Electronics",
    checkIn: "09:15 AM",
    checkOut: "05:00 PM",
    status: "late",
    location: { lat: 13.0830, lng: 80.2710, address: "Main Campus, Chennai" },
    method: "geo",
  },
  {
    id: "3",
    name: "Dr. Arun Patel",
    staffId: "STF003",
    department: "Mechanical",
    checkIn: "-",
    checkOut: "-",
    status: "on-duty",
    location: { lat: 13.1000, lng: 80.2800, address: "Industry Visit - Hyundai" },
    method: "geo",
  },
  {
    id: "4",
    name: "Prof. Lakshmi Reddy",
    staffId: "STF004",
    department: "Civil",
    checkIn: "-",
    checkOut: "-",
    status: "absent",
    location: null,
    method: "manual",
  },
];

const BiometricAttendance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [attendanceData] = useState<AttendanceRecord[]>(mockAttendanceData);
  const [devices, setDevices] = useState([
    { id: "BIO001", name: "Main Entrance", status: "online", lastSync: "2 mins ago" },
    { id: "BIO002", name: "Staff Room", status: "online", lastSync: "5 mins ago" },
    { id: "BIO003", name: "Lab Block", status: "offline", lastSync: "1 hour ago" },
  ]);

  const stats = {
    present: attendanceData.filter(a => a.status === "present").length,
    late: attendanceData.filter(a => a.status === "late").length,
    absent: attendanceData.filter(a => a.status === "absent").length,
    onDuty: attendanceData.filter(a => a.status === "on-duty").length,
  };

  const filteredData = attendanceData.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.staffId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "all" || record.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const syncDevice = (deviceId: string) => {
    toast.success(`Syncing device ${deviceId}...`);
    setTimeout(() => {
      setDevices(prev => prev.map(d => 
        d.id === deviceId ? { ...d, lastSync: "Just now", status: "online" } : d
      ));
      toast.success(`Device ${deviceId} synced successfully`);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present": return <Badge className="bg-green-500">Present</Badge>;
      case "late": return <Badge className="bg-yellow-500">Late</Badge>;
      case "absent": return <Badge variant="destructive">Absent</Badge>;
      case "on-duty": return <Badge className="bg-blue-500">On Duty</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "biometric": return <Badge variant="outline"><Fingerprint className="w-3 h-3 mr-1" />Biometric</Badge>;
      case "geo": return <Badge variant="outline"><MapPin className="w-3 h-3 mr-1" />Geo-tagged</Badge>;
      default: return <Badge variant="outline">Manual</Badge>;
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Biometric & Geo-tagged Attendance</h1>
            <p className="text-muted-foreground">Staff attendance with biometric and location verification</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onDuty}</p>
                <p className="text-sm text-muted-foreground">On Duty (OD)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
            <TabsTrigger value="devices">Biometric Devices</TabsTrigger>
            <TabsTrigger value="geofence">Geo-fence Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="flex gap-4 p-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or ID..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Staff</th>
                      <th className="text-left p-4 font-medium">Department</th>
                      <th className="text-left p-4 font-medium">Check In</th>
                      <th className="text-left p-4 font-medium">Check Out</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Method</th>
                      <th className="text-left p-4 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(record => (
                      <tr key={record.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{record.name}</p>
                            <p className="text-sm text-muted-foreground">{record.staffId}</p>
                          </div>
                        </td>
                        <td className="p-4">{record.department}</td>
                        <td className="p-4">{record.checkIn}</td>
                        <td className="p-4">{record.checkOut}</td>
                        <td className="p-4">{getStatusBadge(record.status)}</td>
                        <td className="p-4">{getMethodBadge(record.method)}</td>
                        <td className="p-4">
                          {record.location ? (
                            <Button variant="ghost" size="sm">
                              <MapPin className="w-4 h-4 mr-1" />
                              View Map
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {devices.map(device => (
                <Card key={device.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Fingerprint className="w-5 h-5" />
                        {device.name}
                      </span>
                      {device.status === "online" ? (
                        <Wifi className="w-5 h-5 text-green-500" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-destructive" />
                      )}
                    </CardTitle>
                    <CardDescription>Device ID: {device.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={device.status === "online" ? "default" : "destructive"}>
                        {device.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                      <span className="text-sm">{device.lastSync}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => syncDevice(device.id)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="geofence" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Geo-fence Configuration
                </CardTitle>
                <CardDescription>Define allowed locations for geo-tagged attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campus Center (Latitude)</label>
                    <Input defaultValue="13.0827" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campus Center (Longitude)</label>
                    <Input defaultValue="80.2707" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Allowed Radius (meters)</label>
                    <Input type="number" defaultValue="500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">OD Locations</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select allowed OD locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="industry">Industry Visits</SelectItem>
                        <SelectItem value="conference">Conference Venues</SelectItem>
                        <SelectItem value="workshop">Workshop Locations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Save Configuration</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BiometricAttendance;
