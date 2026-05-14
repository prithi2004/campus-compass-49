import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateBankQuestion } from "@/hooks/useQuestionBank";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ExtractedQ {
  question: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
}

interface PDFBankUploadProps {
  subjects: { id: string; name: string; code: string }[];
}

const PDFBankUpload = ({ subjects }: PDFBankUploadProps) => {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [questions, setQuestions] = useState<ExtractedQ[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const createQuestion = useCreateBankQuestion();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return fullText;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setError("");
    setQuestions([]);
    setExtracting(true);

    try {
      const pdfText = await extractTextFromPDF(file);
      if (pdfText.trim().length < 20) {
        throw new Error("Could not extract enough text from this PDF. It may be scanned/image-based.");
      }

      const { data, error: fnError } = await supabase.functions.invoke(
        "extract-questions-from-pdf",
        { body: { pdfText } }
      );

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const extracted: ExtractedQ[] = data.questions || [];
      if (extracted.length === 0) throw new Error("No questions could be extracted from this PDF.");

      setQuestions(extracted);
      toast({ title: `${extracted.length} questions extracted!`, description: "Select a subject and save to bank." });
    } catch (err: any) {
      setError(err.message || "Failed to extract questions");
      toast({ title: "Extraction failed", description: err.message, variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const normalizeType = (t: string): string => {
    const v = (t || "").toLowerCase();
    if (["short", "long", "mcq", "true-false", "descriptive"].includes(v)) return v;
    return "short";
  };
  const normalizeDiff = (d: string): string => {
    const v = (d || "").toLowerCase();
    return ["easy", "medium", "hard"].includes(v) ? v : "medium";
  };
  const normalizeBloom = (b: string): string => {
    const valid = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
    const found = valid.find(v => v.toLowerCase() === (b || "").toLowerCase());
    return found || "Understand";
  };

  const handleUpload = async () => {
    if (!subjectId) {
      toast({ title: "Select a subject", variant: "destructive" });
      return;
    }
    if (questions.length === 0) {
      toast({ title: "No questions to upload", variant: "destructive" });
      return;
    }

    setUploading(true);
    let count = 0;

    for (const q of questions) {
      try {
        await createQuestion.mutateAsync({
          question: q.question,
          type: normalizeType(q.type),
          subject_id: subjectId,
          unit: q.unit || "Unit 1",
          difficulty: normalizeDiff(q.difficulty),
          bloom_level: normalizeBloom(q.bloomLevel),
          marks: typeof q.marks === "number" && q.marks > 0 ? q.marks : 5,
          tags: [],
          correct_answer: null,
        });
        count++;
      } catch {
        // individual failures handled by mutation
      }
    }

    setUploadedCount(count);
    setUploading(false);
    toast({
      title: `Uploaded ${count} questions`,
      description: `${count} of ${questions.length} questions imported successfully.`,
    });
  };

  const reset = () => {
    setQuestions([]);
    setError("");
    setFileName("");
    setUploadedCount(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Upload Question Bank (PDF)
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Upload Question Bank (PDF)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1 overflow-y-auto">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-card-foreground">
            Upload a PDF containing your question bank. AI will extract questions and classify them by Bloom's Taxonomy before saving to the bank.
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
            <Label className="text-card-foreground">PDF File *</Label>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={extracting}
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer disabled:opacity-50"
            />
          </div>

          {extracting && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-card-foreground font-medium">Extracting questions from {fileName}...</p>
                <p className="text-sm text-muted-foreground">AI is reading and classifying by Bloom's Taxonomy</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {questions.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-card-foreground font-medium">{questions.length} questions extracted</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {questions.slice(0, 8).map((q, i) => (
                  <div key={i} className="text-sm">
                    <p className="text-card-foreground truncate">
                      <span className="text-primary font-medium">{i + 1}.</span> {q.question}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{q.type}</Badge>
                      <Badge variant="outline" className="text-xs">{q.marks}m</Badge>
                      <Badge variant="outline" className="text-xs">{q.bloomLevel}</Badge>
                      <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                    </div>
                  </div>
                ))}
                {questions.length > 8 && (
                  <p className="text-xs text-muted-foreground">...and {questions.length - 8} more</p>
                )}
              </div>
            </div>
          )}

          {uploadedCount > 0 && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-card-foreground font-medium">
                Successfully uploaded {uploadedCount} questions to bank!
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || extracting || questions.length === 0 || !subjectId}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Save {questions.length} to Bank
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFBankUpload;
