import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Settings as SettingsIcon,
  Shield,
  Database,
  Bell,
  Palette,
  Globe,
  Lock,
  Cloud,
  Mail,
  Save,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  return (
    <DashboardLayout role="admin" title="System Settings">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-card mb-6">
          <TabsTrigger value="general">
            <SettingsIcon className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="w-4 h-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Institution Details */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Institution Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground">Institution Name</label>
                  <Input defaultValue="Dhaanish Ahmed College" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground">Address</label>
                  <Input defaultValue="123 Education Street, Chennai" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-card-foreground">Phone</label>
                    <Input defaultValue="+91 44 1234 5678" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground">Email</label>
                    <Input defaultValue="info@dhaanish.edu" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Settings */}
            <div className="glass-card p-6">
              <h3 className="font-heading font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Academic Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground">Current Academic Year</label>
                  <Input defaultValue="2024-2025" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground">Current Semester</label>
                  <Input defaultValue="Even Semester" className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-card-foreground">Min Attendance %</label>
                    <Input type="number" defaultValue="75" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-card-foreground">Pass Percentage</label>
                    <Input type="number" defaultValue="40" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-card-foreground mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Session Timeout</p>
                  <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                </div>
                <Input type="number" defaultValue="30" className="w-20" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Password Policy</p>
                  <p className="text-sm text-muted-foreground">Enforce strong password requirements</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Login Attempts</p>
                  <p className="text-sm text-muted-foreground">Max failed attempts before lockout</p>
                </div>
                <Input type="number" defaultValue="5" className="w-20" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-card-foreground mb-6 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email & Notification Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Fee Reminders</p>
                  <p className="text-sm text-muted-foreground">Send automatic fee payment reminders</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Attendance Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify parents for low attendance</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Exam Notifications</p>
                  <p className="text-sm text-muted-foreground">Send exam schedules and results</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">System Updates</p>
                  <p className="text-sm text-muted-foreground">Notify admins about system updates</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backup">
          <div className="glass-card p-6">
            <h3 className="font-heading font-semibold text-card-foreground mb-6 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              Backup & Recovery
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div>
                  <p className="font-medium text-card-foreground">Automatic Backups</p>
                  <p className="text-sm text-muted-foreground">Daily automatic database backup</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-card-foreground">Last Backup</p>
                    <p className="text-sm text-muted-foreground">Jan 9, 2025 02:00 AM</p>
                  </div>
                  <span className="badge-success">Success</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Backup Now
                  </Button>
                  <Button variant="outline">
                    <Cloud className="w-4 h-4 mr-2" />
                    Restore Backup
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30">
                <p className="font-medium text-card-foreground mb-2">Backup History</p>
                <div className="space-y-2">
                  {[
                    { date: "Jan 9, 2025 02:00 AM", size: "245 MB", status: "success" },
                    { date: "Jan 8, 2025 02:00 AM", size: "243 MB", status: "success" },
                    { date: "Jan 7, 2025 02:00 AM", size: "241 MB", status: "success" },
                  ].map((backup, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-card-foreground">{backup.date}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{backup.size}</span>
                        <span className="badge-success">{backup.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
