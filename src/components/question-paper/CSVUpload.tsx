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

interface CSVRow {
  question: string;
  type?: string;
  unit?: string;
  difficulty?: string;
  bloom_level?: string;
  marks?: string;
  tags?: string;
  correct_answer?: string;
}

interface CSVUploadProps {
  subjects: { id: string; name: string; code: string }[];
}

const CSVUpload = ({ subjects }: CSVUploadProps) => {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [parsedRows, setParsedRows] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createQuestion = useCreateBankQuestion();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: CSVRow[] = [];
        const errs: string[] = [];

        results.data.forEach((row, idx) => {
          if (!row.question?.trim()) {
            errs.push(`Row ${idx + 2}: Missing question text`);
          } else {
            validRows.push(row);
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
          question: row.question.trim(),
          type: row.type?.trim() || "short",
          subject_id: subjectId,
          unit: row.unit?.trim() || "Unit 1",
          difficulty: row.difficulty?.trim() || "medium",
          bloom_level: row.bloom_level?.trim() || "Understand",
          marks: parseInt(row.marks || "5") || 5,
          tags: row.tags ? row.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean) : [],
          correct_answer: row.correct_answer?.trim() || null,
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
