import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText,
  Plus,
  Save,
  Download,
  Eye,
  Shuffle,
  Lock,
  Brain,
  BookOpen,
  Settings2,
  CheckCircle2,
  Trash2,
  Copy,
  FileDown,
  Database,
  Search,
  Star,
  Tag,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuestionBank, useCreateBankQuestion, useToggleFavorite, type QuestionBankItem } from "@/hooks/useQuestionBank";
import { useSavePaperConfig } from "@/hooks/useQuestionPaperConfig";
import { useDepartments } from "@/hooks/useDepartments";
import { useSubjects, useAcademicYears } from "@/hooks/useSubjects";
import CSVUpload from "@/components/question-paper/CSVUpload";
import PDFUpload, { type ExtractedQuestion } from "@/components/question-paper/PDFUpload";
import AutoGenerateButton from "@/components/question-paper/AutoGenerateButton";
import PaperPreview from "@/components/question-paper/PaperPreview";
import PaperHistory from "@/components/question-paper/PaperHistory";
import { generateQuestionPaperPDF } from "@/utils/generateQuestionPaperPDF";

interface Question {
  id: number;
  text: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
}

const StaffQuestionPaper = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Backend hooks
  const { data: questionBank = [], isLoading: bankLoading } = useQuestionBank();
  const createBankQuestion = useCreateBankQuestion();
  const toggleFavorite = useToggleFavorite();
  const savePaperConfig = useSavePaperConfig();
  const { data: departments = [] } = useDepartments();
  const { data: subjects = [] } = useSubjects();
  const { data: academicYears = [] } = useAcademicYears();
  
  // Question Bank State
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [bankFilterDifficulty, setBankFilterDifficulty] = useState("all");
  const [bankFilterType, setBankFilterType] = useState("all");
  const [showBankDialog, setShowBankDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newBankQuestion, setNewBankQuestion] = useState({
    question: "",
    type: "short",
    subject_id: "",
    unit: "Unit 1",
    difficulty: "medium",
    bloom_level: "Understand",
    marks: 5,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");
  
  // Basic Details
  const [collegeName, setCollegeName] = useState("DHAANISH AHMED COLLEGE OF ENGINEERING");
  const [examName, setExamName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [department, setDepartment] = useState("");
  const [courseName, setCourseName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [examDate, setExamDate] = useState("");
  const [duration, setDuration] = useState("");
  const [maxMarks, setMaxMarks] = useState("");

  // Question Paper Pattern
  const [partA, setPartA] = useState({ questions: 10, marks: 2, total: 20 });
  const [partB, setPartB] = useState({ questions: 5, marks: 8, total: 40 });
  const [partC, setPartC] = useState({ questions: 2, marks: 20, total: 40 });

  // Syllabus & Difficulty
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [unitPercentages, setUnitPercentages] = useState<Record<string, number>>({});
  const [difficultyMix, setDifficultyMix] = useState({ easy: 30, medium: 50, hard: 20 });

  // Bloom's Taxonomy
  const [bloomDistribution, setBloomDistribution] = useState({
    remember: 20,
    understand: 20,
    apply: 25,
    analyze: 15,
    evaluate: 10,
    create: 10,
  });

  // Security Options
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [multipleVersions, setMultipleVersions] = useState(false);
  const [versionsCount, setVersionsCount] = useState("2");
  const [watermark, setWatermark] = useState(true);
  const [encryptPdf, setEncryptPdf] = useState(false);

  // Output Format
  const [outputFormat, setOutputFormat] = useState("pdf");
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [includeMarkingScheme, setIncludeMarkingScheme] = useState(true);

  const units = [
    "Unit 1: Introduction to Data Structures",
    "Unit 2: Arrays and Linked Lists",
    "Unit 3: Stacks and Queues",
    "Unit 4: Trees and Graphs",
    "Unit 5: Sorting and Searching",
  ];

  // Computed names for display
  const selectedSubject = subjects.find(s => s.id === courseName);
  const selectedDept = departments.find(d => d.id === department);
  const selectedYear = academicYears.find(a => a.id === academicYear);
  const selectedSubjectName = selectedSubject?.name || "";
  const selectedDeptName = selectedDept?.name || "";
  const selectedYearName = selectedYear?.name || "";

  // Filter question bank
  const filteredBankQuestions = questionBank.filter(q => {
    const matchesSearch = q.question.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
                         q.tags.some(t => t.toLowerCase().includes(bankSearchQuery.toLowerCase()));
    const matchesDifficulty = bankFilterDifficulty === "all" || q.difficulty === bankFilterDifficulty;
    const matchesType = bankFilterType === "all" || q.type === bankFilterType;
    return matchesSearch && matchesDifficulty && matchesType;
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      text: "",
      type: "descriptive",
      marks: 2,
      unit: "Unit 1",
      difficulty: "medium",
      bloomLevel: "understand",
    };
    setQuestions([...questions, newQuestion]);
  };

  const addFromBank = (bankQ: QuestionBankItem) => {
    const newQuestion: Question = {
      id: questions.length + 1,
      text: bankQ.question,
      type: bankQ.type,
      marks: bankQ.marks,
      unit: bankQ.unit,
      difficulty: bankQ.difficulty,
      bloomLevel: bankQ.bloom_level.toLowerCase(),
    };
    setQuestions([...questions, newQuestion]);
    toast({
      title: "Question Added",
      description: "Question imported from bank successfully.",
    });
  };

  const saveToBank = () => {
    if (!newBankQuestion.question || !newBankQuestion.subject_id) {
      toast({
        title: "Error",
        description: "Please enter question text and select a subject.",
        variant: "destructive"
      });
      return;
    }
    
    createBankQuestion.mutate({
      question: newBankQuestion.question,
      type: newBankQuestion.type,
      subject_id: newBankQuestion.subject_id,
      unit: newBankQuestion.unit,
      difficulty: newBankQuestion.difficulty,
      bloom_level: newBankQuestion.bloom_level,
      marks: newBankQuestion.marks,
      tags: newBankQuestion.tags,
    });
    
    setNewBankQuestion({
      question: "",
      type: "short",
      subject_id: "",
      unit: "Unit 1",
      difficulty: "medium",
      bloom_level: "Understand",
      marks: 5,
      tags: [],
    });
    setShowSaveDialog(false);
  };

  const addTagToNewQuestion = () => {
    if (newTag.trim() && !newBankQuestion.tags?.includes(newTag.trim().toLowerCase())) {
      setNewBankQuestion({
        ...newBankQuestion,
        tags: [...(newBankQuestion.tags || []), newTag.trim().toLowerCase()]
      });
      setNewTag("");
    }
  };

  const removeTagFromNewQuestion = (tag: string) => {
    setNewBankQuestion({
      ...newBankQuestion,
      tags: newBankQuestion.tags?.filter(t => t !== tag) || []
    });
  };

  const toggleBankFavorite = (id: string) => {
    const item = questionBank.find(q => q.id === id);
    if (item) {
      toggleFavorite.mutate({ id, is_favorite: !item.is_favorite });
    }
  };
  const updateQuestion = (id: number, field: keyof Question, value: string | number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const generatePaper = async () => {
    if (!courseName) {
      toast({ title: "Error", description: "Please select a subject first.", variant: "destructive" });
      return;
    }
    
    // Save config to database
    savePaperConfig.mutate({
      subject_id: courseName,
      title: examName || "Untitled Paper",
      academic_year_id: academicYear || null,
      semester: semester ? parseInt(semester) : null,
      department_id: department || null,
      exam_date: examDate || null,
      duration,
      max_marks: maxMarks ? parseInt(maxMarks) : 100,
      paper_pattern: { partA, partB, partC },
      difficulty_mix: difficultyMix,
      bloom_distribution: bloomDistribution,
      security_options: { shuffleQuestions, shuffleOptions, multipleVersions, versionsCount, watermark, encryptPdf },
      output_format: outputFormat,
      status: "generated",
    });

    // Generate and download PDF
    if (questions.length === 0) {
      toast({ title: "No questions", description: "Add questions before generating the paper.", variant: "destructive" });
      return;
    }

    await generateQuestionPaperPDF(questions, {
      examName,
      academicYear: selectedYearName,
      semester,
      department: selectedDeptName,
      courseName: selectedSubjectName,
      subjectCode: subjectCode || selectedSubject?.code || "",
      examDate,
      duration,
      maxMarks,
      partA,
      partB,
      partC,
      watermark,
      includeAnswerKey,
    });

    toast({ title: "PDF Generated!", description: "Your question paper has been downloaded." });
  };

  const saveDraft = () => {
    if (!courseName) {
      toast({ title: "Error", description: "Please select a subject first.", variant: "destructive" });
      return;
    }
    savePaperConfig.mutate({
      subject_id: courseName,
      title: examName || "Untitled Draft",
      academic_year_id: academicYear || null,
      semester: semester ? parseInt(semester) : null,
      department_id: department || null,
      exam_date: examDate || null,
      duration,
      max_marks: maxMarks ? parseInt(maxMarks) : 100,
      paper_pattern: { partA, partB, partC },
      difficulty_mix: difficultyMix,
      bloom_distribution: bloomDistribution,
      security_options: { shuffleQuestions, shuffleOptions, multipleVersions, versionsCount, watermark, encryptPdf },
      output_format: outputFormat,
      status: "draft",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      hard: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[difficulty] || "";
  };

  return (
    <DashboardLayout role="staff" title="Generate Question Paper">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground">Generate Question Paper</h2>
          <p className="text-muted-foreground">Create comprehensive question papers with advanced options</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <PaperHistory subjects={subjects} departments={departments} />
          <PaperPreview
            collegeName={collegeName}
            examName={examName}
            department={selectedDeptName}
            subjectName={selectedSubjectName}
            subjectCode={subjectCode}
            duration={duration}
            maxMarks={maxMarks}
            examDate={examDate}
            semester={semester}
            academicYear={selectedYearName}
            questions={questions}
            partA={partA}
            partB={partB}
            partC={partC}
            watermark={watermark}
          />
          <Button variant="outline" onClick={saveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={generatePaper}>
            <FileDown className="w-4 h-4 mr-2" />
            Generate Paper
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Basic Details" },
            { num: 2, label: "Paper Pattern" },
            { num: 3, label: "Syllabus & Difficulty" },
            { num: 4, label: "Bloom's Taxonomy" },
            { num: 5, label: "Security Options" },
            { num: 6, label: "Add Questions" },
            { num: 7, label: "Output Format" },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <span className="hidden lg:inline text-sm">{s.label}</span>
              </button>
              {idx < 6 && (
                <div className={`w-8 lg:w-16 h-0.5 mx-2 ${step > s.num ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="glass-card p-6">
        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Basic Exam Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2 lg:col-span-3">
                <Label className="text-card-foreground">College Name *</Label>
                <Input
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  placeholder="Enter college name"
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Exam Name *</Label>
                <Select value={examName} onValueChange={setExamName}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal1">Internal Test 1</SelectItem>
                    <SelectItem value="internal2">Internal Test 2</SelectItem>
                    <SelectItem value="model">Model Exam</SelectItem>
                    <SelectItem value="endsem">End Semester Exam</SelectItem>
                    <SelectItem value="reexam">Re-Examination</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Academic Year *</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map(ay => (
                      <SelectItem key={ay.id} value={ay.id}>{ay.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Semester *</Label>
                <Select value={semester} onValueChange={setSemester}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Department *</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Course / Subject Name *</Label>
                <Select value={courseName} onValueChange={(val) => {
                  setCourseName(val);
                  const sub = subjects.find(s => s.id === val);
                  if (sub) setSubjectCode(sub.code);
                }}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(sub => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Subject Code *</Label>
                <Input
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  placeholder="e.g., CS301"
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Date of Exam *</Label>
                <Input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="bg-muted/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Duration *</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="1.5">1.5 Hours</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="3">3 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Maximum Marks *</Label>
                <Select value={maxMarks} onValueChange={setMaxMarks}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select marks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 Marks</SelectItem>
                    <SelectItem value="50">50 Marks</SelectItem>
                    <SelectItem value="75">75 Marks</SelectItem>
                    <SelectItem value="100">100 Marks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Question Paper Pattern */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Question Paper Pattern / Structure
            </h3>
            
            {/* Part A */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="font-medium text-card-foreground mb-3">Part A - Short Answers</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">No. of Questions</Label>
                  <Input
                    type="number"
                    value={partA.questions}
                    onChange={(e) => setPartA({ ...partA, questions: parseInt(e.target.value), total: parseInt(e.target.value) * partA.marks })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Marks Each</Label>
                  <Input
                    type="number"
                    value={partA.marks}
                    onChange={(e) => setPartA({ ...partA, marks: parseInt(e.target.value), total: partA.questions * parseInt(e.target.value) })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Total Marks</Label>
                  <Input
                    type="number"
                    value={partA.total}
                    disabled
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>
            </div>

            {/* Part B */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="font-medium text-card-foreground mb-3">Part B - Descriptive (Answer Any)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">No. of Questions</Label>
                  <Input
                    type="number"
                    value={partB.questions}
                    onChange={(e) => setPartB({ ...partB, questions: parseInt(e.target.value), total: parseInt(e.target.value) * partB.marks })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Marks Each</Label>
                  <Input
                    type="number"
                    value={partB.marks}
                    onChange={(e) => setPartB({ ...partB, marks: parseInt(e.target.value), total: partB.questions * parseInt(e.target.value) })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Total Marks</Label>
                  <Input
                    type="number"
                    value={partB.total}
                    disabled
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>
            </div>

            {/* Part C */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <h4 className="font-medium text-card-foreground mb-3">Part C - Long Answers / Essays</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">No. of Questions</Label>
                  <Input
                    type="number"
                    value={partC.questions}
                    onChange={(e) => setPartC({ ...partC, questions: parseInt(e.target.value), total: parseInt(e.target.value) * partC.marks })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Marks Each</Label>
                  <Input
                    type="number"
                    value={partC.marks}
                    onChange={(e) => setPartC({ ...partC, marks: parseInt(e.target.value), total: partC.questions * parseInt(e.target.value) })}
                    className="bg-muted/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Total Marks</Label>
                  <Input
                    type="number"
                    value={partC.total}
                    disabled
                    className="bg-muted/30 border-border/50"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-medium text-card-foreground">Grand Total</span>
                <span className="text-2xl font-bold text-primary">{partA.total + partB.total + partC.total} Marks</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Syllabus Coverage & Difficulty */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Syllabus Coverage & Difficulty Level
            </h3>

            {/* Units Selection with custom percentage bars */}
            <div className="space-y-3">
              <Label className="text-card-foreground">Select Units to Cover *</Label>
              <div className="space-y-3">
                {units.map((unit, idx) => {
                  const isSelected = selectedUnits.includes(unit);
                  const unitPct = isSelected ? (unitPercentages[unit] || 0) : 0;
                  const barColors = [
                    "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"
                  ];
                  return (
                    <div key={unit} className={`p-4 rounded-lg border transition-colors ${isSelected ? "bg-primary/5 border-primary/30" : "bg-muted/30 border-border/50 hover:bg-muted/50"}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <Checkbox
                          id={unit}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const newSelected = [...selectedUnits, unit];
                              setSelectedUnits(newSelected);
                              // Auto-distribute equally
                              const eachPct = Math.floor(100 / newSelected.length);
                              const newPcts: Record<string, number> = {};
                              newSelected.forEach((u, i) => {
                                newPcts[u] = i === newSelected.length - 1 ? 100 - eachPct * (newSelected.length - 1) : eachPct;
                              });
                              setUnitPercentages(newPcts);
                            } else {
                              const newSelected = selectedUnits.filter(u => u !== unit);
                              setSelectedUnits(newSelected);
                              if (newSelected.length > 0) {
                                const eachPct = Math.floor(100 / newSelected.length);
                                const newPcts: Record<string, number> = {};
                                newSelected.forEach((u, i) => {
                                  newPcts[u] = i === newSelected.length - 1 ? 100 - eachPct * (newSelected.length - 1) : eachPct;
                                });
                                setUnitPercentages(newPcts);
                              } else {
                                setUnitPercentages({});
                              }
                            }
                          }}
                        />
                        <Label htmlFor={unit} className="text-card-foreground cursor-pointer flex-1 text-sm font-medium">
                          {unit}
                        </Label>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={unitPct}
                              onChange={(e) => {
                                setUnitPercentages({ ...unitPercentages, [unit]: parseInt(e.target.value) || 0 });
                              }}
                              className="w-16 h-7 text-center text-xs"
                            />
                            <span className="text-sm font-bold text-primary">%</span>
                          </div>
                        )}
                        {!isSelected && (
                          <span className="text-sm font-bold text-muted-foreground">0%</span>
                        )}
                      </div>
                      <div className="h-2 rounded-full bg-muted/50 overflow-hidden ml-7">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColors[idx % barColors.length]}`}
                          style={{ width: `${unitPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Overall unit coverage bar */}
              {selectedUnits.length > 0 && (() => {
                const totalPct = selectedUnits.reduce((sum, u) => sum + (unitPercentages[u] || 0), 0);
                return (
                  <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Unit Coverage Distribution</span>
                      <span className={`text-sm font-semibold ${totalPct === 100 ? "text-primary" : "text-destructive"}`}>
                        Total: {totalPct}%
                      </span>
                    </div>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      {selectedUnits.map((u, i) => {
                        const barColors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
                        const origIdx = units.indexOf(u);
                        return (
                          <div
                            key={u}
                            style={{ width: `${unitPercentages[u] || 0}%` }}
                            className={`${barColors[origIdx % barColors.length]} ${i === 0 ? "" : "border-l border-background"} transition-all duration-300`}
                            title={`${u}: ${unitPercentages[u] || 0}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUnits.map((u) => {
                        const barColors = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-rose-500"];
                        const origIdx = units.indexOf(u);
                        return (
                          <div key={u} className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${barColors[origIdx % barColors.length]}`} />
                            <span className="text-xs text-muted-foreground">Unit {origIdx + 1}: {unitPercentages[u] || 0}%</span>
                          </div>
                        );
                      })}
                    </div>
                    {totalPct !== 100 && (
                      <p className="text-sm text-destructive mt-2">⚠ Total must equal 100%</p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Difficulty Distribution with bars */}
            <div className="space-y-3">
              <Label className="text-card-foreground">Difficulty Level Distribution</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Easy</p>
                  <Input
                    type="number"
                    value={difficultyMix.easy}
                    onChange={(e) => setDifficultyMix({ ...difficultyMix, easy: parseInt(e.target.value) || 0 })}
                    className="text-center bg-transparent border-success/30 mb-2"
                  />
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${difficultyMix.easy}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">{difficultyMix.easy}%</p>
                </div>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Medium</p>
                  <Input
                    type="number"
                    value={difficultyMix.medium}
                    onChange={(e) => setDifficultyMix({ ...difficultyMix, medium: parseInt(e.target.value) || 0 })}
                    className="text-center bg-transparent border-warning/30 mb-2"
                  />
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 transition-all duration-300" style={{ width: `${difficultyMix.medium}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">{difficultyMix.medium}%</p>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-muted-foreground mb-2 text-center">Hard</p>
                  <Input
                    type="number"
                    value={difficultyMix.hard}
                    onChange={(e) => setDifficultyMix({ ...difficultyMix, hard: parseInt(e.target.value) || 0 })}
                    className="text-center bg-transparent border-destructive/30 mb-2"
                  />
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <div className="h-full rounded-full bg-rose-500 transition-all duration-300" style={{ width: `${difficultyMix.hard}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">{difficultyMix.hard}%</p>
                </div>
              </div>
              {/* Combined difficulty bar */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Total Distribution</span>
                  <span className={`text-sm font-semibold ${
                    difficultyMix.easy + difficultyMix.medium + difficultyMix.hard === 100
                      ? "text-primary" : "text-destructive"
                  }`}>
                    {difficultyMix.easy + difficultyMix.medium + difficultyMix.hard}%
                  </span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${difficultyMix.easy}%` }} />
                  <div className="bg-amber-500 transition-all duration-300" style={{ width: `${difficultyMix.medium}%` }} />
                  <div className="bg-rose-500 transition-all duration-300" style={{ width: `${difficultyMix.hard}%` }} />
                </div>
                <div className="flex gap-4 mt-2">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-xs text-muted-foreground">Easy: {difficultyMix.easy}%</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-xs text-muted-foreground">Medium: {difficultyMix.medium}%</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-xs text-muted-foreground">Hard: {difficultyMix.hard}%</span></div>
                </div>
              </div>
              {difficultyMix.easy + difficultyMix.medium + difficultyMix.hard !== 100 && (
                <p className="text-sm text-destructive">⚠ Total must equal 100%</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Bloom's Taxonomy */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Bloom's Taxonomy Level Distribution
            </h3>
            <p className="text-sm text-muted-foreground">
              Distribute questions across cognitive levels for balanced assessment.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(bloomDistribution).map(([level, value]) => (
                <div key={level} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-sm font-medium text-card-foreground capitalize mb-2">{level}</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => setBloomDistribution({ ...bloomDistribution, [level]: parseInt(e.target.value) })}
                      className="bg-muted/50 border-border/50"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Total Distribution</span>
                <span className={`font-medium ${
                  Object.values(bloomDistribution).reduce((a, b) => a + b, 0) === 100 
                    ? "text-success" : "text-destructive"
                }`}>
                  {Object.values(bloomDistribution).reduce((a, b) => a + b, 0)}%
                </span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                {Object.entries(bloomDistribution).map(([level, value], idx) => (
                  <div 
                    key={level} 
                    style={{ width: `${value}%` }}
                    className={`${
                      idx === 0 ? "bg-blue-500" :
                      idx === 1 ? "bg-green-500" :
                      idx === 2 ? "bg-yellow-500" :
                      idx === 3 ? "bg-orange-500" :
                      idx === 4 ? "bg-red-500" : "bg-purple-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Security Options */}
        {step === 5 && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Randomization & Security Options
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Shuffle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-card-foreground">Shuffle Questions</p>
                    <p className="text-sm text-muted-foreground">Randomize question order in each paper</p>
                  </div>
                </div>
                <Checkbox
                  checked={shuffleQuestions}
                  onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Shuffle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-card-foreground">Shuffle MCQ Options</p>
                    <p className="text-sm text-muted-foreground">Randomize answer choices for MCQs</p>
                  </div>
                </div>
                <Checkbox
                  checked={shuffleOptions}
                  onCheckedChange={(checked) => setShuffleOptions(checked as boolean)}
                />
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Copy className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-card-foreground">Generate Multiple Versions</p>
                      <p className="text-sm text-muted-foreground">Create different versions (A, B, C...)</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={multipleVersions}
                    onCheckedChange={(checked) => setMultipleVersions(checked as boolean)}
                  />
                </div>
                {multipleVersions && (
                  <div className="mt-3 pl-8">
                    <Label className="text-sm text-muted-foreground">Number of Versions</Label>
                    <Select value={versionsCount} onValueChange={setVersionsCount}>
                      <SelectTrigger className="w-32 mt-1 bg-muted/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Versions</SelectItem>
                        <SelectItem value="3">3 Versions</SelectItem>
                        <SelectItem value="4">4 Versions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-card-foreground">Add Watermark</p>
                    <p className="text-sm text-muted-foreground">Add institution watermark to PDF</p>
                  </div>
                </div>
                <Checkbox
                  checked={watermark}
                  onCheckedChange={(checked) => setWatermark(checked as boolean)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-card-foreground">Encrypt PDF</p>
                    <p className="text-sm text-muted-foreground">Password protect the generated PDF</p>
                  </div>
                </div>
                <Checkbox
                  checked={encryptPdf}
                  onCheckedChange={(checked) => setEncryptPdf(checked as boolean)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Add Questions with Question Bank */}
        {step === 6 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-heading font-semibold text-card-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Add Questions
              </h3>
              <div className="flex gap-2">
                {/* Import from Question Bank */}
                <Dialog open={showBankDialog} onOpenChange={setShowBankDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Database className="w-4 h-4 mr-2" />
                      Import from Bank
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-border/50 max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-card-foreground flex items-center gap-2">
                        <Database className="w-5 h-5 text-primary" />
                        Question Bank ({questionBank.length} questions)
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-3 py-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={bankSearchQuery}
                          onChange={(e) => setBankSearchQuery(e.target.value)}
                          placeholder="Search questions or tags..."
                          className="bg-muted/50 border-border/50 pl-10"
                        />
                      </div>
                      <Select value={bankFilterDifficulty} onValueChange={setBankFilterDifficulty}>
                        <SelectTrigger className="w-[130px] bg-muted/50 border-border/50">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={bankFilterType} onValueChange={setBankFilterType}>
                        <SelectTrigger className="w-[140px] bg-muted/50 border-border/50">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="mcq">MCQ</SelectItem>
                          <SelectItem value="short">Short Answer</SelectItem>
                          <SelectItem value="descriptive">Descriptive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Questions List */}
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {filteredBankQuestions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No questions found</p>
                        </div>
                      ) : (
                        filteredBankQuestions.map(q => (
                          <div key={q.id} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-card-foreground font-medium mb-2">{q.question}</p>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <Badge variant="outline" className="capitalize">{q.type}</Badge>
                                  <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>
                                    {q.difficulty}
                                  </Badge>
                                  <Badge variant="outline">{q.marks} marks</Badge>
                                  <Badge variant="outline" className="text-muted-foreground">{q.bloom_level}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {q.tags.map(tag => (
                                    <span key={tag} className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    addFromBank(q);
                                    setShowBankDialog(false);
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => toggleBankFavorite(q.id)}
                                >
                                  <Star className={`w-4 h-4 ${q.is_favorite ? "text-yellow-400 fill-current" : "text-muted-foreground"}`} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Save to Question Bank */}
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save to Bank
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card border-border/50 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-card-foreground">Save Question to Bank</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="text-card-foreground">Question Text *</Label>
                        <Textarea
                          value={newBankQuestion.question}
                          onChange={(e) => setNewBankQuestion({...newBankQuestion, question: e.target.value})}
                          placeholder="Enter your question..."
                          className="bg-muted/50 border-border/50 mt-1"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-muted-foreground text-sm">Subject *</Label>
                          <Select 
                            value={newBankQuestion.subject_id} 
                            onValueChange={(v) => setNewBankQuestion({...newBankQuestion, subject_id: v})}
                          >
                            <SelectTrigger className="bg-muted/50 border-border/50 mt-1">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map(sub => (
                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Type</Label>
                          <Select 
                            value={newBankQuestion.type} 
                            onValueChange={(v) => setNewBankQuestion({...newBankQuestion, type: v})}
                          >
                            <SelectTrigger className="bg-muted/50 border-border/50 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mcq">MCQ</SelectItem>
                              <SelectItem value="short">Short Answer</SelectItem>
                              <SelectItem value="descriptive">Descriptive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Difficulty</Label>
                          <Select 
                            value={newBankQuestion.difficulty} 
                            onValueChange={(v) => setNewBankQuestion({...newBankQuestion, difficulty: v})}
                          >
                            <SelectTrigger className="bg-muted/50 border-border/50 mt-1">
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
                          <Label className="text-muted-foreground text-sm">Unit</Label>
                          <Select 
                            value={newBankQuestion.unit} 
                            onValueChange={(v) => setNewBankQuestion({...newBankQuestion, unit: v})}
                          >
                            <SelectTrigger className="bg-muted/50 border-border/50 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5].map(u => (
                                <SelectItem key={u} value={`Unit ${u}`}>Unit {u}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Bloom's Level</Label>
                          <Select 
                            value={newBankQuestion.bloom_level} 
                            onValueChange={(v) => setNewBankQuestion({...newBankQuestion, bloom_level: v})}
                          >
                            <SelectTrigger className="bg-muted/50 border-border/50 mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Remember">Remember</SelectItem>
                              <SelectItem value="Understand">Understand</SelectItem>
                              <SelectItem value="Apply">Apply</SelectItem>
                              <SelectItem value="Analyze">Analyze</SelectItem>
                              <SelectItem value="Evaluate">Evaluate</SelectItem>
                              <SelectItem value="Create">Create</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Marks</Label>
                          <Input
                            type="number"
                            value={newBankQuestion.marks}
                            onChange={(e) => setNewBankQuestion({...newBankQuestion, marks: parseInt(e.target.value) || 0})}
                            className="bg-muted/50 border-border/50 mt-1"
                          />
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div>
                        <Label className="text-muted-foreground text-sm">Tags</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add a tag..."
                            className="bg-muted/50 border-border/50"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTagToNewQuestion())}
                          />
                          <Button type="button" onClick={addTagToNewQuestion} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newBankQuestion.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="bg-muted/30">
                              {tag}
                              <button onClick={() => removeTagFromNewQuestion(tag)} className="ml-1">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveToBank}>
                          <Save className="w-4 h-4 mr-2" />
                          Save to Bank
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <CSVUpload subjects={subjects} />

                <PDFUpload
                  partA={partA}
                  partB={partB}
                  partC={partC}
                  bloomDistribution={bloomDistribution}
                  difficultyMix={difficultyMix}
                  shuffleQuestions={shuffleQuestions}
                  onQuestionsExtracted={(extracted: ExtractedQuestion[]) => {
                    const newQuestions = extracted.map((q, i) => ({
                      id: i + 1,
                      text: q.question,
                      type: q.type,
                      marks: q.marks,
                      unit: q.unit,
                      difficulty: q.difficulty,
                      bloomLevel: q.bloomLevel.toLowerCase(),
                    }));
                    setQuestions(newQuestions);
                  }}
                />

                <AutoGenerateButton
                  questionBank={questionBank}
                  subjectId={courseName}
                  partA={partA}
                  partB={partB}
                  partC={partC}
                  bloomDistribution={bloomDistribution}
                  difficultyMix={difficultyMix}
                  shuffleQuestions={shuffleQuestions}
                  onGenerated={(generated) => setQuestions(generated)}
                />

                <Button onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>

            {/* Bank Stats */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <span className="text-card-foreground">
                  <strong>{questionBank.length}</strong> questions in your bank
                </span>
              </div>
              <span className="text-muted-foreground text-sm">
                {questionBank.filter(q => q.is_favorite).length} favorites
              </span>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No questions added yet.</p>
                <p className="text-sm mt-1">Click "Import from Bank" or "Add New" to start.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, idx) => (
                  <div key={question.id} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-medium text-primary">Question {idx + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Enter question text..."
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                        className="bg-muted/50 border-border/50 resize-none"
                        rows={3}
                      />
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <Select 
                          value={question.type} 
                          onValueChange={(v) => updateQuestion(question.id, "type", v)}
                        >
                          <SelectTrigger className="bg-muted/50 border-border/50">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mcq">MCQ</SelectItem>
                            <SelectItem value="short">Short Answer</SelectItem>
                            <SelectItem value="descriptive">Descriptive</SelectItem>
                            <SelectItem value="numerical">Numerical</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Marks"
                          value={question.marks}
                          onChange={(e) => updateQuestion(question.id, "marks", parseInt(e.target.value))}
                          className="bg-muted/50 border-border/50"
                        />
                        <Select 
                          value={question.unit} 
                          onValueChange={(v) => updateQuestion(question.id, "unit", v)}
                        >
                          <SelectTrigger className="bg-muted/50 border-border/50">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5].map(u => (
                              <SelectItem key={u} value={`Unit ${u}`}>Unit {u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select 
                          value={question.difficulty} 
                          onValueChange={(v) => updateQuestion(question.id, "difficulty", v)}
                        >
                          <SelectTrigger className="bg-muted/50 border-border/50">
                            <SelectValue placeholder="Difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select 
                          value={question.bloomLevel} 
                          onValueChange={(v) => updateQuestion(question.id, "bloomLevel", v)}
                        >
                          <SelectTrigger className="bg-muted/50 border-border/50">
                            <SelectValue placeholder="Bloom's" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="remember">Remember</SelectItem>
                            <SelectItem value="understand">Understand</SelectItem>
                            <SelectItem value="apply">Apply</SelectItem>
                            <SelectItem value="analyze">Analyze</SelectItem>
                            <SelectItem value="evaluate">Evaluate</SelectItem>
                            <SelectItem value="create">Create</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 7: Output Format */}
        {step === 7 && (
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-semibold text-card-foreground flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Output Format
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-card-foreground">Export Format</Label>
                <div className="grid grid-cols-3 gap-4">
                  {["pdf", "docx", "html"].map((format) => (
                    <button
                      key={format}
                      onClick={() => setOutputFormat(format)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        outputFormat === format 
                          ? "bg-primary/10 border-primary" 
                          : "bg-muted/30 border-border/50 hover:bg-muted/50"
                      }`}
                    >
                      <FileText className={`w-8 h-8 mx-auto mb-2 ${outputFormat === format ? "text-primary" : "text-muted-foreground"}`} />
                      <p className={`font-medium uppercase ${outputFormat === format ? "text-primary" : "text-card-foreground"}`}>
                        {format}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <p className="font-medium text-card-foreground">Include Answer Key</p>
                  <p className="text-sm text-muted-foreground">Generate separate answer key document</p>
                </div>
                <Checkbox
                  checked={includeAnswerKey}
                  onCheckedChange={(checked) => setIncludeAnswerKey(checked as boolean)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <p className="font-medium text-card-foreground">Include Marking Scheme</p>
                  <p className="text-sm text-muted-foreground">Generate detailed marking scheme</p>
                </div>
                <Checkbox
                  checked={includeMarkingScheme}
                  onCheckedChange={(checked) => setIncludeMarkingScheme(checked as boolean)}
                />
              </div>
            </div>

            {/* Preview & Generate */}
            <div className="flex gap-4 pt-4 border-t border-border/50">
              <div className="flex-1">
                <PaperPreview
                  collegeName={collegeName}
                  examName={examName}
                  department={selectedDeptName}
                  subjectName={selectedSubjectName}
                  subjectCode={subjectCode}
                  duration={duration}
                  maxMarks={maxMarks}
                  examDate={examDate}
                  semester={semester}
                  academicYear={selectedYearName}
                  questions={questions}
                  partA={partA}
                  partB={partB}
                  partC={partC}
                  watermark={watermark}
                />
              </div>
              <Button className="flex-1" onClick={generatePaper}>
                <FileDown className="w-4 h-4 mr-2" />
                Generate &amp; Download
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-4 border-t border-border/50">
          <Button 
            variant="outline" 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          <Button 
            onClick={() => setStep(Math.min(7, step + 1))}
            disabled={step === 7}
          >
            Next
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffQuestionPaper;
