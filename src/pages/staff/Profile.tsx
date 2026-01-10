import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  BookOpen,
  Award,
  Edit,
  Camera,
  Save,
  Shield,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const StaffProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@dhaanish.edu",
    phone: "9876543200",
    department: "Computer Science & Engineering",
    designation: "Associate Professor",
    employeeId: "STAFF001",
    joinDate: "Aug 15, 2018",
    qualification: "Ph.D in Computer Science",
    specialization: "Data Structures, Algorithms, Machine Learning",
    address: "123, Anna Nagar, Chennai - 600040",
    dob: "1985-05-15",
  });

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  return (
    <DashboardLayout role="staff" title="Profile">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">My Profile</h2>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>
        <Button onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
          {isEditing ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <User className="w-16 h-16 text-primary" />
              </div>
              {isEditing && (
                <button className="absolute bottom-4 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </button>
              )}
            </div>
            <h3 className="text-xl font-semibold text-card-foreground">{profile.name}</h3>
            <p className="text-sm text-muted-foreground">{profile.designation}</p>
            <p className="text-sm text-primary">{profile.employeeId}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-card-foreground">{profile.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-card-foreground">{profile.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-card-foreground">{profile.department}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-card-foreground">Joined: {profile.joinDate}</span>
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-4">
            <TabsList className="bg-muted/30 border border-border/50">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="glass-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Full Name</Label>
                  <Input
                    value={profile.name}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Email</Label>
                  <Input
                    value={profile.email}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Phone Number</Label>
                  <Input
                    value={profile.phone}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Date of Birth</Label>
                  <Input
                    type="date"
                    value={profile.dob}
                    disabled={!isEditing}
                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Address</Label>
                <Input
                  value={profile.address}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </TabsContent>

            <TabsContent value="academic" className="glass-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Employee ID</Label>
                  <Input
                    value={profile.employeeId}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Designation</Label>
                  <Input
                    value={profile.designation}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Department</Label>
                  <Input
                    value={profile.department}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-card-foreground">Joining Date</Label>
                  <Input
                    value={profile.joinDate}
                    disabled
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Qualification</Label>
                <Input
                  value={profile.qualification}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Specialization</Label>
                <Input
                  value={profile.specialization}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              {/* Subjects Taught */}
              <div>
                <h4 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Subjects Currently Teaching
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Data Structures", "Algorithms", "DS Lab", "Algo Lab"].map((subject) => (
                    <span key={subject} className="badge badge-outline">{subject}</span>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="glass-card p-6 space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium text-card-foreground">Password Security</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Last changed 30 days ago. We recommend changing your password regularly.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <Shield className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-card-foreground">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-card-foreground">Login History</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    View recent login activity on your account.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3">
                    View History
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="glass-card p-6 space-y-4">
              {[
                { label: "Email Notifications", desc: "Receive updates via email", enabled: true },
                { label: "SMS Alerts", desc: "Get important alerts via SMS", enabled: false },
                { label: "Attendance Reminders", desc: "Reminder to mark attendance", enabled: true },
                { label: "Leave Updates", desc: "Notifications for leave approvals", enabled: true },
                { label: "Exam Schedule", desc: "Alerts for upcoming exams", enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium text-card-foreground">{item.label}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full ${item.enabled ? "bg-primary" : "bg-muted"} relative cursor-pointer transition-colors`}>
                    <div className={`absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all ${item.enabled ? "right-0.5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffProfile;
