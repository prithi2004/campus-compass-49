import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, 
  Bell, 
  Users, 
  Send, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Settings,
  History,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface NotificationTemplate {
  id: string;
  name: string;
  type: "leave" | "attendance" | "exam" | "fee" | "general";
  message: string;
  enabled: boolean;
}

interface SentNotification {
  id: string;
  recipient: string;
  type: string;
  message: string;
  sentAt: string;
  status: "delivered" | "pending" | "failed";
}

const templates: NotificationTemplate[] = [
  { id: "1", name: "Leave Approval", type: "leave", message: "Your leave request for {dates} has been {status}.", enabled: true },
  { id: "2", name: "Leave Rejection", type: "leave", message: "Your leave request for {dates} has been rejected. Reason: {reason}", enabled: true },
  { id: "3", name: "Attendance Alert", type: "attendance", message: "Alert: {name} has not marked attendance for {date}.", enabled: true },
  { id: "4", name: "Missing Entry Report", type: "attendance", message: "Missing attendance entries detected for {count} staff members.", enabled: true },
  { id: "5", name: "Exam Reminder", type: "exam", message: "Reminder: {exam_name} scheduled for {date} at {time}.", enabled: true },
  { id: "6", name: "Fee Due Alert", type: "fee", message: "Fee payment of ₹{amount} is due on {date}.", enabled: false },
];

const sentHistory: SentNotification[] = [
  { id: "1", recipient: "Dr. Kumar (STF001)", type: "Leave", message: "Your leave request has been approved.", sentAt: "Today, 10:30 AM", status: "delivered" },
  { id: "2", recipient: "HOD - Computer Science", type: "Attendance", message: "3 staff members have missing attendance entries.", sentAt: "Today, 09:00 AM", status: "delivered" },
  { id: "3", recipient: "Principal", type: "Report", message: "Daily attendance summary: 45/50 present.", sentAt: "Yesterday, 06:00 PM", status: "delivered" },
  { id: "4", recipient: "All Staff", type: "General", message: "Staff meeting scheduled for Friday 3 PM.", sentAt: "Yesterday, 02:00 PM", status: "delivered" },
];

const Notifications = () => {
  const [notificationTemplates, setTemplates] = useState(templates);
  const [selectedType, setSelectedType] = useState("sms");
  const [recipientType, setRecipientType] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const toggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
    toast.success("Template updated");
  };

  const sendNotification = () => {
    if (!recipientType || !message) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success("Notification sent successfully!");
    setMessage("");
    setRecipientType("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered": return <Badge className="bg-green-500">Delivered</Badge>;
      case "pending": return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      leave: "bg-purple-500",
      attendance: "bg-blue-500",
      exam: "bg-orange-500",
      fee: "bg-green-500",
      general: "bg-gray-500",
    };
    return <Badge className={colors[type] || "bg-gray-500"}>{type}</Badge>;
  };

  return (
    <DashboardLayout role="admin" title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SMS & Notifications</h1>
            <p className="text-muted-foreground">Manage notifications for leave, attendance alerts, and reports</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Send className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Sent Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">98%</p>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="send" className="space-y-4">
          <TabsList>
            <TabsTrigger value="send">Send Notification</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="alerts">Auto Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Send New Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Notification Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="all">All Channels</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <Select value={recipientType} onValueChange={setRecipientType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipients" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="all-staff">All Staff</SelectItem>
                        <SelectItem value="all-students">All Students</SelectItem>
                        <SelectItem value="hod">HODs Only</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {recipientType === "individual" && (
                  <div className="space-y-2">
                    <Label>Search Person</Label>
                    <Input placeholder="Search by name, ID, or phone..." />
                  </div>
                )}

                {recipientType === "department" && (
                  <div className="space-y-2">
                    <Label>Select Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cs">Computer Science</SelectItem>
                        <SelectItem value="ec">Electronics</SelectItem>
                        <SelectItem value="me">Mechanical</SelectItem>
                        <SelectItem value="ce">Civil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">{message.length}/160 characters</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={sendNotification}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Now
                  </Button>
                  <Button variant="outline">
                    <Clock className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Templates</CardTitle>
                <CardDescription>Manage predefined message templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationTemplates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{template.name}</p>
                          {getTypeBadge(template.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">{template.message}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Switch 
                          checked={template.enabled}
                          onCheckedChange={() => toggleTemplate(template.id)}
                        />
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Notification History
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search..."
                      className="pl-9 w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-3 font-medium">Recipient</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Message</th>
                      <th className="text-left p-3 font-medium">Sent At</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentHistory.map(notification => (
                      <tr key={notification.id} className="border-b hover:bg-muted/30">
                        <td className="p-3">{notification.recipient}</td>
                        <td className="p-3">
                          <Badge variant="outline">{notification.type}</Badge>
                        </td>
                        <td className="p-3 max-w-xs truncate">{notification.message}</td>
                        <td className="p-3 text-muted-foreground">{notification.sentAt}</td>
                        <td className="p-3">{getStatusBadge(notification.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Missing Attendance Alerts</CardTitle>
                  <CardDescription>Notify HOD/Principal when staff miss attendance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Enable auto-alerts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Send alert after</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notify to</Label>
                    <Select defaultValue="hod">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hod">HOD Only</SelectItem>
                        <SelectItem value="principal">Principal Only</SelectItem>
                        <SelectItem value="both">Both HOD & Principal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leave Request Notifications</CardTitle>
                  <CardDescription>Auto-notify on leave request status changes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>On approval</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>On rejection</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reminder before leave starts</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notify substitute staff</span>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
