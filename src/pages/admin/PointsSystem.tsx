import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trophy, 
  Star, 
  Award, 
  TrendingUp, 
  Plus, 
  Minus,
  Search,
  Download,
  Users,
  Medal,
  Target
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  semester: string;
  totalPoints: number;
  positivePoints: number;
  negativePoints: number;
  rank: number;
  badges: string[];
}

interface PointCategory {
  id: string;
  name: string;
  points: number;
  type: "positive" | "negative";
  description: string;
}

const mockStudents: Student[] = [
  { id: "1", name: "Rahul Sharma", rollNo: "CS2024001", department: "Computer Science", semester: "4th", totalPoints: 850, positivePoints: 900, negativePoints: 50, rank: 1, badges: ["Academic Excellence", "Best Attendance"] },
  { id: "2", name: "Priya Patel", rollNo: "CS2024002", department: "Computer Science", semester: "4th", totalPoints: 780, positivePoints: 800, negativePoints: 20, rank: 2, badges: ["Project Star"] },
  { id: "3", name: "Arun Kumar", rollNo: "EC2024001", department: "Electronics", semester: "4th", totalPoints: 720, positivePoints: 750, negativePoints: 30, rank: 3, badges: ["Sports Champion"] },
  { id: "4", name: "Sneha Reddy", rollNo: "ME2024001", department: "Mechanical", semester: "4th", totalPoints: 650, positivePoints: 700, negativePoints: 50, rank: 4, badges: [] },
  { id: "5", name: "Karthik Nair", rollNo: "CE2024001", department: "Civil", semester: "4th", totalPoints: 600, positivePoints: 650, negativePoints: 50, rank: 5, badges: ["Cultural Star"] },
];

const pointCategories: PointCategory[] = [
  { id: "1", name: "100% Attendance (Monthly)", points: 50, type: "positive", description: "Perfect attendance for a month" },
  { id: "2", name: "Assignment Submission", points: 10, type: "positive", description: "On-time assignment submission" },
  { id: "3", name: "Project Completion", points: 100, type: "positive", description: "Successfully completed project" },
  { id: "4", name: "Sports Participation", points: 30, type: "positive", description: "Participated in sports event" },
  { id: "5", name: "Cultural Event", points: 25, type: "positive", description: "Participated in cultural event" },
  { id: "6", name: "Academic Excellence", points: 75, type: "positive", description: "Top 5 in class tests" },
  { id: "7", name: "Late Submission", points: -10, type: "negative", description: "Late assignment submission" },
  { id: "8", name: "Absent Without Notice", points: -20, type: "negative", description: "Unexcused absence" },
  { id: "9", name: "Discipline Issue", points: -50, type: "negative", description: "Disciplinary action required" },
  { id: "10", name: "Library Fine", points: -5, type: "negative", description: "Overdue library books" },
];

const PointsSystem = () => {
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customReason, setCustomReason] = useState("");

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "all" || student.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleAddPoints = () => {
    if (!selectedStudent || !selectedCategory) {
      toast.error("Please select student and category");
      return;
    }

    const category = pointCategories.find(c => c.id === selectedCategory);
    if (!category) return;

    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudent.id) {
        const newPositive = category.type === "positive" ? s.positivePoints + category.points : s.positivePoints;
        const newNegative = category.type === "negative" ? s.negativePoints + Math.abs(category.points) : s.negativePoints;
        return {
          ...s,
          totalPoints: newPositive - newNegative,
          positivePoints: newPositive,
          negativePoints: newNegative,
        };
      }
      return s;
    }));

    toast.success(`${category.points > 0 ? "+" : ""}${category.points} points ${category.type === "positive" ? "awarded to" : "deducted from"} ${selectedStudent.name}`);
    setShowAddPoints(false);
    setSelectedStudent(null);
    setSelectedCategory("");
    setCustomReason("");
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500"><Trophy className="w-3 h-3 mr-1" />1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400"><Medal className="w-3 h-3 mr-1" />2nd</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600"><Medal className="w-3 h-3 mr-1" />3rd</Badge>;
    return <Badge variant="outline">{rank}th</Badge>;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Points System</h1>
            <p className="text-muted-foreground">Track and manage student achievements and behavior</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={showAddPoints} onOpenChange={setShowAddPoints}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add/Deduct Points
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add or Deduct Points</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <Select 
                      value={selectedStudent?.id || ""} 
                      onValueChange={(v) => setSelectedStudent(students.find(s => s.id === v) || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Search student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name} ({s.rollNo})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Point Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Positive Points</div>
                        {pointCategories.filter(c => c.type === "positive").map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="text-green-600">+{c.points}</span> {c.name}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">Negative Points</div>
                        {pointCategories.filter(c => c.type === "negative").map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <span className="text-red-600">{c.points}</span> {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Notes (Optional)</Label>
                    <Textarea 
                      placeholder="Add any additional notes..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={handleAddPoints}>
                    Confirm Points
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.reduce((a, s) => a + s.positivePoints, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Positive</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{students.filter(s => s.badges.length > 0).length}</p>
                <p className="text-sm text-muted-foreground">Badge Holders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(students.reduce((a, s) => a + s.totalPoints, 0) / students.length)}</p>
                <p className="text-sm text-muted-foreground">Avg Points</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="categories">Point Categories</TabsTrigger>
            <TabsTrigger value="badges">Badges & Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="flex gap-4 p-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name or roll number..."
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

            {/* Leaderboard */}
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Rank</th>
                      <th className="text-left p-4 font-medium">Student</th>
                      <th className="text-left p-4 font-medium">Department</th>
                      <th className="text-center p-4 font-medium">Positive</th>
                      <th className="text-center p-4 font-medium">Negative</th>
                      <th className="text-center p-4 font-medium">Total Points</th>
                      <th className="text-left p-4 font-medium">Badges</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.sort((a, b) => a.rank - b.rank).map(student => (
                      <tr key={student.id} className="border-b hover:bg-muted/30">
                        <td className="p-4">{getRankBadge(student.rank)}</td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.rollNo}</p>
                          </div>
                        </td>
                        <td className="p-4">{student.department}</td>
                        <td className="p-4 text-center">
                          <span className="text-green-600 font-medium">+{student.positivePoints}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-red-600 font-medium">-{student.negativePoints}</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xl font-bold text-primary">{student.totalPoints}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {student.badges.map((badge, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />{badge}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Plus className="w-5 h-5" />
                    Positive Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pointCategories.filter(c => c.type === "positive").map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Badge className="bg-green-500">+{category.points}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Minus className="w-5 h-5" />
                    Negative Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pointCategories.filter(c => c.type === "negative").map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <Badge variant="destructive">{category.points}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Academic Excellence", "Best Attendance", "Project Star", "Sports Champion", "Cultural Star", "Leadership Award"].map((badge, i) => (
                <Card key={badge}>
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="p-4 rounded-full bg-yellow-500/10">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-semibold">{badge}</p>
                      <p className="text-sm text-muted-foreground">Requires 500+ points</p>
                      <p className="text-xs text-muted-foreground mt-1">{Math.floor(Math.random() * 20) + 5} students earned</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default PointsSystem;
