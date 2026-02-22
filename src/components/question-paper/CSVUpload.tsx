import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle2, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateBankQuestion } from "@/hooks/useQuestionBank";
import Papa from "papaparse";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_ROWS = 500;

const VALID_TYPES = ["short", "long", "mcq", "true-false", "descriptive"] as const;
const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;
const VALID_BLOOM_LEVELS = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] as const;

const csvRowSchema = z.object({
  question: z.string().trim().min(1, "Question is required").max(1000, "Question too long (max 1000 chars)"),
  type: z.string().trim().toLowerCase().pipe(z.enum(VALID_TYPES)).optional().default("short"),
  unit: z.string().trim().max(50, "Unit too long").optional().default("Unit 1"),
  difficulty: z.string().trim().toLowerCase().pipe(z.enum(VALID_DIFFICULTIES)).optional().default("medium"),
  bloom_level: z.string().trim().pipe(z.enum(VALID_BLOOM_LEVELS)).optional().default("Understand"),
  marks: z.string().optional().transform(v => {
    const n = parseInt(v || "5");
    return isNaN(n) || n < 1 || n > 100 ? 5 : n;
  }),
  tags: z.string().max(200, "Tags too long").optional().default(""),
  correct_answer: z.string().max(500, "Answer too long").optional().default(""),
});

type ValidatedRow = z.infer<typeof csvRowSchema>;

interface CSVUploadProps {
  subjects: { id: string; name: string; code: string }[];
}

const CSVUpload = ({ subjects }: CSVUploadProps) => {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [parsedRows, setParsedRows] = useState<ValidatedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createQuestion = useCreateBankQuestion();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5MB.", variant: "destructive" });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: ValidatedRow[] = [];
        const errs: string[] = [];

        if (results.data.length > MAX_ROWS) {
          errs.push(`File contains ${results.data.length} rows. Maximum allowed is ${MAX_ROWS}. Only the first ${MAX_ROWS} will be processed.`);
        }

        const rowsToProcess = results.data.slice(0, MAX_ROWS);

        rowsToProcess.forEach((row: any, idx: number) => {
          const result = csvRowSchema.safeParse(row);
          if (!result.success) {
            const issues = result.error.issues.map(i => i.message).join("; ");
            errs.push(`Row ${idx + 2}: ${issues}`);
          } else {
            validRows.push(result.data);
          }
        });

        setParsedRows(validRows);
        setErrors(errs);
      },
      error: (err) => {
        toast({ title: "Parse error", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleUpload = async () => {
    if (!subjectId) {
      toast({ title: "Select a subject", variant: "destructive" });
      return;
    }
    if (parsedRows.length === 0) {
      toast({ title: "No valid questions to upload", variant: "destructive" });
      return;
    }

    setUploading(true);
    let count = 0;

    for (const row of parsedRows) {
      try {
        await createQuestion.mutateAsync({
          question: row.question,
          type: row.type || "short",
          subject_id: subjectId,
          unit: row.unit || "Unit 1",
          difficulty: row.difficulty || "medium",
          bloom_level: row.bloom_level || "Understand",
          marks: typeof row.marks === "number" ? row.marks : 5,
          tags: row.tags ? row.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [],
          correct_answer: row.correct_answer || null,
        });
        count++;
      } catch {
        // individual failures are handled by the mutation's onError
      }
    }

    setUploadedCount(count);
    setUploading(false);
    toast({
      title: `Uploaded ${count} questions`,
      description: `${count} of ${parsedRows.length} questions imported successfully.`,
    });
  };

  const downloadTemplate = () => {
    const csv = "question,type,unit,difficulty,bloom_level,marks,tags,correct_answer\n" +
      '"What is a linked list?",short,Unit 2,easy,Remember,2,"data-structures,basics",\n' +
      '"Explain BFS and DFS algorithms",descriptive,Unit 4,medium,Understand,10,"graphs,algorithms",\n' +
      '"Which data structure uses LIFO?",mcq,Unit 3,easy,Remember,2,"stacks","Stack"';
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question_bank_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setParsedRows([]);
    setErrors([]);
    setUploadedCount(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Upload CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Upload Question Bank (CSV)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Template download */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-card-foreground">
              <FileText className="w-4 h-4 text-primary" />
              Download the CSV template to see the required format
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-1" />
              Template
            </Button>
          </div>

          {/* Subject selection */}
          <div>
            <Label className="text-card-foreground">Subject *</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-muted/50 border-border/50 mt-1">
                <SelectValue placeholder="Select subject for all questions" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File input */}
          <div>
            <Label className="text-card-foreground">CSV File *</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>

          {/* Parse results */}
          {parsedRows.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-card-foreground font-medium">{parsedRows.length} valid questions found</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {parsedRows.slice(0, 5).map((r, i) => (
                  <div key={i} className="text-sm text-muted-foreground truncate">
                    {i + 1}. {r.question}
                    <Badge variant="outline" className="ml-2 text-xs">{r.type || "short"}</Badge>
                    <Badge variant="outline" className="ml-1 text-xs">{r.marks || "5"} marks</Badge>
                  </div>
                ))}
                {parsedRows.length > 5 && (
                  <p className="text-xs text-muted-foreground">...and {parsedRows.length - 5} more</p>
                )}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-destructive font-medium text-sm">{errors.length} rows skipped</span>
              </div>
              <div className="max-h-20 overflow-y-auto">
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-destructive">{e}</p>
                ))}
              </div>
            </div>
          )}

          {uploadedCount > 0 && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-card-foreground font-medium">
                Successfully uploaded {uploadedCount} questions!
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || parsedRows.length === 0 || !subjectId}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {parsedRows.length} Questions
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUpload;
