import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Database, Search, Plus, Filter, Tag, BookOpen, Edit, Trash2, 
  Copy, FileText, Star, Clock, GraduationCap, X, Check, Download
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  type: "mcq" | "short" | "long" | "fill" | "truefalse";
  subject: string;
  subjectCode: string;
  unit: string;
  difficulty: "easy" | "medium" | "hard";
  bloom: string;
  marks: number;
  tags: string[];
  options?: string[];
  correctAnswer?: string;
  createdAt: string;
  usedCount: number;
  isFavorite: boolean;
}

const initialQuestions: Question[] = [
  {
    id: "1",
    question: "What is the time complexity of binary search algorithm?",
    type: "mcq",
    subject: "Data Structures",
    subjectCode: "CS201",
    unit: "Unit 2 - Searching & Sorting",
    difficulty: "easy",
    bloom: "Remember",
    marks: 2,
    tags: ["algorithms", "searching", "complexity"],
    options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
    correctAnswer: "O(log n)",
    createdAt: "2024-01-10",
    usedCount: 5,
    isFavorite: true
  },
  {
    id: "2",
    question: "Explain the concept of polymorphism in Object-Oriented Programming with suitable examples.",
    type: "long",
    subject: "Object Oriented Programming",
    subjectCode: "CS202",
    unit: "Unit 3 - OOP Concepts",
    difficulty: "medium",
    bloom: "Understand",
    marks: 10,
    tags: ["oop", "polymorphism", "inheritance"],
    createdAt: "2024-01-08",
    usedCount: 3,
    isFavorite: false
  },
  {
    id: "3",
    question: "The process of converting a source code into machine code is called ___________.",
    type: "fill",
    subject: "Compiler Design",
    subjectCode: "CS401",
    unit: "Unit 1 - Introduction",
    difficulty: "easy",
    bloom: "Remember",
    marks: 1,
    tags: ["compiler", "basics"],
    correctAnswer: "Compilation",
    createdAt: "2024-01-05",
    usedCount: 8,
    isFavorite: true
  },
  {
    id: "4",
    question: "Write a short note on TCP/IP protocol suite.",
    type: "short",
    subject: "Computer Networks",
    subjectCode: "CS301",
    unit: "Unit 2 - Network Protocols",
    difficulty: "medium",
    bloom: "Understand",
    marks: 5,
    tags: ["networking", "protocols", "tcp"],
    createdAt: "2024-01-12",
    usedCount: 2,
    isFavorite: false
  },
  {
    id: "5",
    question: "Normalization always improves database performance.",
    type: "truefalse",
    subject: "Database Management",
    subjectCode: "CS303",
    unit: "Unit 3 - Normalization",
    difficulty: "hard",
    bloom: "Analyze",
    marks: 1,
    tags: ["database", "normalization", "performance"],
    correctAnswer: "False",
    createdAt: "2024-01-15",
    usedCount: 4,
    isFavorite: false
  },
  {
    id: "6",
    question: "Derive the time complexity of merge sort algorithm and explain its divide and conquer approach.",
    type: "long",
    subject: "Data Structures",
    subjectCode: "CS201",
    unit: "Unit 2 - Searching & Sorting",
    difficulty: "hard",
    bloom: "Analyze",
    marks: 15,
    tags: ["algorithms", "sorting", "divide-conquer", "complexity"],
    createdAt: "2024-01-14",
    usedCount: 1,
    isFavorite: true
  }
];

const subjects = [
  { name: "Data Structures", code: "CS201" },
  { name: "Object Oriented Programming", code: "CS202" },
  { name: "Computer Networks", code: "CS301" },
  { name: "Database Management", code: "CS303" },
  { name: "Compiler Design", code: "CS401" },
  { name: "Operating Systems", code: "CS302" }
];

const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

export default function QuestionBank() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // New question form state
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    question: "",
    type: "mcq",
    subject: "",
    subjectCode: "",
    unit: "",
    difficulty: "medium",
    bloom: "Remember",
    marks: 2,
    tags: [],
    options: ["", "", "", ""],
    correctAnswer: ""
  });

  // Get all unique tags
  const allTags = [...new Set(questions.flatMap(q => q.tags))].sort();

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === "all" || q.subjectCode === selectedSubject;
    const matchesType = selectedType === "all" || q.type === selectedType;
    const matchesDifficulty = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(t => q.tags.includes(t));
    const matchesFavorites = !showFavorites || q.isFavorite;
    
    return matchesSearch && matchesSubject && matchesType && matchesDifficulty && matchesTags && matchesFavorites;
  });

  const handleAddTag = () => {
    if (newTag.trim() && !newQuestion.tags?.includes(newTag.trim().toLowerCase())) {
      setNewQuestion({
        ...newQuestion,
        tags: [...(newQuestion.tags || []), newTag.trim().toLowerCase()]
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewQuestion({
      ...newQuestion,
      tags: newQuestion.tags?.filter(t => t !== tag) || []
    });
  };

  const handleSubjectChange = (subjectCode: string) => {
    const subject = subjects.find(s => s.code === subjectCode);
    setNewQuestion({
      ...newQuestion,
      subject: subject?.name || "",
      subjectCode: subjectCode
    });
  };

  const handleSaveQuestion = () => {
    if (!newQuestion.question || !newQuestion.subjectCode) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingQuestion) {
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id 
          ? { ...q, ...newQuestion } as Question
          : q
      ));
      toast.success("Question updated successfully!");
    } else {
      const question: Question = {
        id: Date.now().toString(),
        question: newQuestion.question || "",
        type: newQuestion.type as Question["type"],
        subject: newQuestion.subject || "",
        subjectCode: newQuestion.subjectCode || "",
        unit: newQuestion.unit || "",
        difficulty: newQuestion.difficulty as Question["difficulty"],
        bloom: newQuestion.bloom || "Remember",
        marks: newQuestion.marks || 2,
        tags: newQuestion.tags || [],
        options: newQuestion.type === "mcq" ? newQuestion.options : undefined,
        correctAnswer: newQuestion.correctAnswer,
        createdAt: new Date().toISOString().split('T')[0],
        usedCount: 0,
        isFavorite: false
      };
      setQuestions([question, ...questions]);
      toast.success("Question added to bank!");
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingQuestion(null);
  };

  const resetForm = () => {
    setNewQuestion({
      question: "",
      type: "mcq",
      subject: "",
      subjectCode: "",
      unit: "",
      difficulty: "medium",
      bloom: "Remember",
      marks: 2,
      tags: [],
      options: ["", "", "", ""],
      correctAnswer: ""
    });
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      ...question,
      options: question.options || ["", "", "", ""]
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success("Question deleted");
  };

  const handleDuplicate = (question: Question) => {
    const duplicate: Question = {
      ...question,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      usedCount: 0
    };
    setQuestions([duplicate, ...questions]);
    toast.success("Question duplicated!");
  };

  const toggleFavorite = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
    ));
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleExportSelected = () => {
    const selected = questions.filter(q => selectedQuestions.includes(q.id));
    const exportData = JSON.stringify(selected, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-bank-export.json';
    a.click();
    toast.success(`Exported ${selected.length} questions`);
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      mcq: "MCQ",
      short: "Short Answer",
      long: "Long Answer",
      fill: "Fill in Blanks",
      truefalse: "True/False"
    };
    return labels[type] || type;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-500/20 text-green-300 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      hard: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return colors[difficulty] || "";
  };

  return (
    <DashboardLayout role="staff" title="Question Bank">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Database className="h-7 w-7 text-purple-400" />
              Question Bank
            </h1>
            <p className="text-white/60">Save, organize, and reuse questions across exams</p>
          </div>
          <div className="flex gap-2">
            {selectedQuestions.length > 0 && (
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10"
                onClick={handleExportSelected}
              >
                <Download className="h-4 w-4 mr-2" />
                Export ({selectedQuestions.length})
              </Button>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => {
                  resetForm();
                  setEditingQuestion(null);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/20 max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl">
                    {editingQuestion ? "Edit Question" : "Add New Question"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Question Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Question Type *</Label>
                      <Select 
                        value={newQuestion.type} 
                        onValueChange={(v) => setNewQuestion({...newQuestion, type: v as Question["type"]})}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                          <SelectItem value="short">Short Answer</SelectItem>
                          <SelectItem value="long">Long Answer</SelectItem>
                          <SelectItem value="fill">Fill in the Blanks</SelectItem>
                          <SelectItem value="truefalse">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/80">Subject *</Label>
                      <Select 
                        value={newQuestion.subjectCode} 
                        onValueChange={handleSubjectChange}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(s => (
                            <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <Label className="text-white/80">Question *</Label>
                    <Textarea 
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                      placeholder="Enter your question here..."
                      className="bg-white/10 border-white/20 text-white mt-1 min-h-[100px]"
                    />
                  </div>

                  {/* MCQ Options */}
                  {newQuestion.type === "mcq" && (
                    <div>
                      <Label className="text-white/80">Options</Label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {newQuestion.options?.map((opt, idx) => (
                          <Input
                            key={idx}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...(newQuestion.options || [])];
                              newOptions[idx] = e.target.value;
                              setNewQuestion({...newQuestion, options: newOptions});
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Correct Answer */}
                  {(newQuestion.type === "mcq" || newQuestion.type === "fill" || newQuestion.type === "truefalse") && (
                    <div>
                      <Label className="text-white/80">Correct Answer</Label>
                      {newQuestion.type === "truefalse" ? (
                        <Select 
                          value={newQuestion.correctAnswer} 
                          onValueChange={(v) => setNewQuestion({...newQuestion, correctAnswer: v})}
                        >
                          <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                            <SelectValue placeholder="Select answer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="True">True</SelectItem>
                            <SelectItem value="False">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={newQuestion.correctAnswer || ""}
                          onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                          placeholder={newQuestion.type === "mcq" ? "e.g., Option A" : "Enter correct answer"}
                          className="bg-white/10 border-white/20 text-white mt-1"
                        />
                      )}
                    </div>
                  )}

                  {/* Unit, Difficulty, Bloom, Marks */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-white/80">Unit</Label>
                      <Input
                        value={newQuestion.unit || ""}
                        onChange={(e) => setNewQuestion({...newQuestion, unit: e.target.value})}
                        placeholder="e.g., Unit 2"
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Difficulty</Label>
                      <Select 
                        value={newQuestion.difficulty} 
                        onValueChange={(v) => setNewQuestion({...newQuestion, difficulty: v as Question["difficulty"]})}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/80">Bloom's Level</Label>
                      <Select 
                        value={newQuestion.bloom} 
                        onValueChange={(v) => setNewQuestion({...newQuestion, bloom: v})}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {bloomLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/80">Marks</Label>
                      <Input
                        type="number"
                        value={newQuestion.marks}
                        onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value) || 0})}
                        className="bg-white/10 border-white/20 text-white mt-1"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-white/80">Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        className="bg-white/10 border-white/20 text-white"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newQuestion.tags?.map(tag => (
                        <Badge key={tag} className="bg-purple-500/30 text-purple-200 border-purple-500/30">
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); setEditingQuestion(null);}} className="border-white/20 text-white hover:bg-white/10">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveQuestion} className="bg-purple-600 hover:bg-purple-700">
                      <Check className="h-4 w-4 mr-2" />
                      {editingQuestion ? "Update Question" : "Save Question"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-white">{questions.length}</p>
              <p className="text-white/60 text-sm">Total Questions</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-400">{questions.filter(q => q.difficulty === "easy").length}</p>
              <p className="text-white/60 text-sm">Easy</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-yellow-400">{questions.filter(q => q.difficulty === "medium").length}</p>
              <p className="text-white/60 text-sm">Medium</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-400">{questions.filter(q => q.difficulty === "hard").length}</p>
              <p className="text-white/60 text-sm">Hard</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-400">{questions.filter(q => q.isFavorite).length}</p>
              <p className="text-white/60 text-sm">Favorites</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="glass-card border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or tags..."
                  className="bg-white/10 border-white/20 text-white pl-10"
                />
              </div>
              
              {/* Filters */}
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white w-full md:w-[180px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(s => (
                    <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white w-full md:w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="short">Short Answer</SelectItem>
                  <SelectItem value="long">Long Answer</SelectItem>
                  <SelectItem value="fill">Fill in Blanks</SelectItem>
                  <SelectItem value="truefalse">True/False</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white w-full md:w-[130px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFavorites ? "default" : "outline"}
                onClick={() => setShowFavorites(!showFavorites)}
                className={showFavorites ? "bg-yellow-600 hover:bg-yellow-700" : "border-white/20 text-white hover:bg-white/10"}
              >
                <Star className={`h-4 w-4 ${showFavorites ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Tag Filters */}
            {allTags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-white/60" />
                  <span className="text-white/60 text-sm">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      className={`cursor-pointer transition-all ${
                        selectedTags.includes(tag)
                          ? "bg-purple-500 text-white border-purple-400"
                          : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20"
                      }`}
                      onClick={() => setSelectedTags(prev => 
                        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedTags([])}
                      className="text-white/60 hover:text-white h-6"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
                <p className="text-white/60">Try adjusting your filters or add a new question</p>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map(question => (
              <Card key={question.id} className="glass-card border-white/10 hover:border-purple-500/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedQuestions.includes(question.id)}
                        onCheckedChange={() => toggleSelectQuestion(question.id)}
                        className="border-white/30"
                      />
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-white font-medium">{question.question}</p>
                        <button onClick={() => toggleFavorite(question.id)} className="flex-shrink-0">
                          <Star className={`h-5 w-5 ${question.isFavorite ? "text-yellow-400 fill-current" : "text-white/40 hover:text-yellow-400"}`} />
                        </button>
                      </div>

                      {/* MCQ Options */}
                      {question.type === "mcq" && question.options && (
                        <div className="grid grid-cols-2 gap-2">
                          {question.options.map((opt, idx) => (
                            <div key={idx} className={`text-sm px-3 py-1 rounded ${
                              opt === question.correctAnswer || `Option ${String.fromCharCode(65 + idx)}` === question.correctAnswer
                                ? "bg-green-500/20 text-green-300"
                                : "bg-white/5 text-white/70"
                            }`}>
                              {String.fromCharCode(65 + idx)}. {opt}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Correct Answer for Fill/True-False */}
                      {(question.type === "fill" || question.type === "truefalse") && question.correctAnswer && (
                        <p className="text-sm text-green-300">
                          Answer: {question.correctAnswer}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-200 border-purple-500/30">
                          {getTypeLabel(question.type)}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                          {question.marks} marks
                        </Badge>
                        <Badge variant="outline" className="bg-white/10 text-white/70 border-white/20">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {question.bloom}
                        </Badge>
                        <span className="text-white/40 text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Used {question.usedCount}x
                        </span>
                      </div>

                      {/* Subject & Unit */}
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <BookOpen className="h-4 w-4" />
                        <span>{question.subject} ({question.subjectCode})</span>
                        {question.unit && <span>• {question.unit}</span>}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {question.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="bg-white/5 text-white/60 border-white/10 text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(question)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDuplicate(question)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(question.id)}
                        className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Results Count */}
        {filteredQuestions.length > 0 && (
          <p className="text-white/40 text-center text-sm">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
        )}
      </div>
    </DashboardLayout>
  );
}
