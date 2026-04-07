import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface Question {
  id: number;
  text: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
}

interface PartConfig {
  questions: number;
  marks: number;
  total: number;
}

interface PaperPreviewProps {
  collegeName: string;
  examName: string;
  department: string;
  subjectName: string;
  subjectCode: string;
  duration: string;
  maxMarks: string;
  examDate: string;
  semester: string;
  academicYear: string;
  questions: Question[];
  partA: PartConfig;
  partB: PartConfig;
  partC: PartConfig;
  watermark: boolean;
}

const EXAM_NAMES: Record<string, string> = {
  internal1: "Internal Test 1",
  internal2: "Internal Test 2",
  model: "Model Exam",
  endsem: "End Semester Exam",
  reexam: "Re-Examination",
};

const PaperPreview = ({
  collegeName,
  examName,
  department,
  subjectName,
  subjectCode,
  duration,
  maxMarks,
  examDate,
  semester,
  academicYear,
  questions,
  partA,
  partB,
  partC,
  watermark,
}: PaperPreviewProps) => {
  const partAQuestions = questions.filter(q => q.marks <= partA.marks);
  const partBQuestions = questions.filter(q => q.marks > partA.marks && q.marks <= partB.marks);
  const partCQuestions = questions.filter(q => q.marks > partB.marks);

  // If grouping doesn't work, split sequentially
  const hasGrouping = partAQuestions.length > 0 || partBQuestions.length > 0 || partCQuestions.length > 0;
  const useGrouping = hasGrouping && (partAQuestions.length + partBQuestions.length + partCQuestions.length) === questions.length;

  const renderPartAQuestions = (qs: Question[], startNum: number) =>
    qs.map((q, i) => (
      <div key={q.id} className="flex justify-between gap-4 py-1">
        <p className="text-sm text-card-foreground">
          {startNum + i}. {q.text || <span className="italic text-muted-foreground">(Empty question)</span>}
        </p>
        <span className="text-xs text-muted-foreground whitespace-nowrap">[{q.marks} marks]</span>
      </div>
    ));

  const renderORQuestions = (qs: Question[], startNum: number) => {
    const pairs: JSX.Element[] = [];
    for (let i = 0; i < qs.length; i += 2) {
      const qA = qs[i];
      const qB = i + 1 < qs.length ? qs[i + 1] : null;
      const qNumber = startNum + Math.floor(i / 2);
      pairs.push(
        <div key={qA.id} className="border border-border/40 rounded-md p-2 mb-2">
          <div className="flex justify-between gap-4 py-1">
            <p className="text-sm text-card-foreground">
              {qNumber}. (a) {qA.text || <span className="italic text-muted-foreground">(Empty question)</span>}
            </p>
            <span className="text-xs text-muted-foreground whitespace-nowrap">[{qA.marks} marks]</span>
          </div>
          {qB && (
            <>
              <p className="text-center text-xs font-bold text-muted-foreground my-1">(OR)</p>
              <div className="flex justify-between gap-4 py-1">
                <p className="text-sm text-card-foreground">
                  &nbsp;&nbsp;&nbsp;&nbsp;(b) {qB.text || <span className="italic text-muted-foreground">(Empty question)</span>}
                </p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">[{qB.marks} marks]</span>
              </div>
            </>
          )}
        </div>
      );
    }
    return pairs;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={questions.length === 0}>
          <Eye className="w-4 h-4 mr-2" />
          Preview Paper
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Question Paper Preview</DialogTitle>
        </DialogHeader>

        <div className="relative bg-background border border-border rounded-lg p-8 mt-4 font-serif">
          {/* Watermark */}
          {watermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] rotate-[-30deg]">
              <span className="text-6xl font-bold text-foreground tracking-widest">CONFIDENTIAL</span>
            </div>
          )}

          {/* Header */}
          <div className="text-center space-y-1 mb-4">
            <h1 className="text-lg font-bold text-foreground uppercase">
              {collegeName || "DHAANISH AHMED COLLEGE OF ENGINEERING"}
            </h1>
            <h2 className="text-base font-semibold text-foreground">
              {EXAM_NAMES[examName] || examName || "Examination"}
            </h2>
          </div>

          <hr className="border-foreground/30 mb-4" />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-foreground mb-4">
            {department && <p>Department: {department}</p>}
            {academicYear && <p>Academic Year: {academicYear}</p>}
            {subjectCode && <p>Subject Code: {subjectCode}</p>}
            {subjectName && <p>Subject: {subjectName}</p>}
            {semester && <p>Semester: {semester}</p>}
            {examDate && <p>Date: {examDate}</p>}
            {duration && <p>Duration: {duration} Hour(s)</p>}
            {maxMarks && <p>Max. Marks: {maxMarks}</p>}
          </div>

          <hr className="border-foreground/30 mb-3" />

          {/* Instructions */}
          <div className="text-xs text-foreground/80 mb-4 space-y-0.5">
            <p className="font-semibold text-sm mb-1">Instructions:</p>
            <p>1. Answer all questions in Part A.</p>
            <p>2. Answer any required number of questions from Part B and Part C.</p>
            <p>3. Draw neat diagrams wherever necessary.</p>
          </div>

          <hr className="border-foreground/30 mb-4" />

          {/* Questions */}
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic">
              No questions added yet. Add questions in Step 6.
            </div>
          ) : useGrouping ? (
            <div className="space-y-6">
              {partAQuestions.length > 0 && (
                <div>
                  <h3 className="text-center font-bold text-foreground mb-2">
                    PART A — Answer all questions ({partA.marks} marks each)
                  </h3>
                  {renderPartAQuestions(partAQuestions, 1)}
                </div>
              )}
              {partBQuestions.length > 0 && (
                <div>
                  <h3 className="text-center font-bold text-foreground mb-2">
                    PART B — Answer any {partB.questions} questions ({partB.marks} marks each)
                  </h3>
                  {renderORQuestions(partBQuestions, partAQuestions.length + 1)}
                </div>
              )}
              {partCQuestions.length > 0 && (
                <div>
                  <h3 className="text-center font-bold text-foreground mb-2">
                    PART C — Answer any {partC.questions} questions ({partC.marks} marks each)
                  </h3>
                  {renderORQuestions(partCQuestions, partAQuestions.length + Math.ceil(partBQuestions.length / 2) + 1)}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {questions.map((q, i) => (
                <div key={q.id} className="flex justify-between gap-4 py-1">
                  <p className="text-sm text-card-foreground">{i + 1}. {q.text}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">[{q.marks} marks]</span>
                </div>
              ))}
            </div>
          )}

          <hr className="border-foreground/30 mt-6 mb-3" />
          <p className="text-center text-sm font-bold text-foreground">*** All the Best ***</p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline">{questions.length} Questions</Badge>
          <Badge variant="outline">{questions.reduce((s, q) => s + q.marks, 0)} Total Marks</Badge>
          {useGrouping && (
            <>
              <Badge variant="outline">Part A: {partAQuestions.length}</Badge>
              <Badge variant="outline">Part B: {partBQuestions.length}</Badge>
              <Badge variant="outline">Part C: {partCQuestions.length}</Badge>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaperPreview;
