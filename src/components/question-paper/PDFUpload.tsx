import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from "pdfjs-dist";

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ExtractedQuestion {
  question: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
}

interface PDFUploadProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
}

const PDFUpload = ({ onQuestionsExtracted }: PDFUploadProps) => {
  const [open, setOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
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

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setError("");
    setExtractedQuestions([]);
    setExtracting(true);

    try {
      // Extract text from PDF
      const pdfText = await extractTextFromPDF(file);

      if (pdfText.trim().length < 20) {
        throw new Error("Could not extract enough text from this PDF. It may be scanned/image-based.");
      }

      // Send to AI for question extraction
      const { data, error: fnError } = await supabase.functions.invoke(
        "extract-questions-from-pdf",
        { body: { pdfText } }
      );

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const questions: ExtractedQuestion[] = data.questions || [];
      if (questions.length === 0) {
        throw new Error("No questions could be extracted from this PDF.");
      }

      setExtractedQuestions(questions);
      toast({ title: `${questions.length} questions extracted!`, description: "Review and add them to your paper." });
    } catch (err: any) {
      setError(err.message || "Failed to extract questions");
      toast({ title: "Extraction failed", description: err.message, variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const handleAddAll = () => {
    onQuestionsExtracted(extractedQuestions);
    toast({ title: "Questions added", description: `${extractedQuestions.length} questions added to your paper.` });
    setOpen(false);
    reset();
  };

  const reset = () => {
    setExtractedQuestions([]);
    setError("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const getDifficultyColor = (d: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      hard: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[d] || "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Extract Questions from PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
          {/* Info */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-card-foreground">
            Upload a question paper PDF. AI will extract individual questions with marks, difficulty, and Bloom's level.
          </div>

          {/* File input */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={extracting}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* Loading */}
          {extracting && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-card-foreground font-medium">Extracting questions from {fileName}...</p>
                <p className="text-sm text-muted-foreground">AI is reading and parsing the PDF</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}

          {/* Results */}
          {extractedQuestions.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-card-foreground font-medium">
                  {extractedQuestions.length} questions extracted
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {extractedQuestions.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-card-foreground text-sm mb-2">
                      <span className="font-medium text-primary">{i + 1}.</span> {q.question}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize text-xs">{q.type}</Badge>
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{q.marks} marks</Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">{q.bloomLevel}</Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">{q.unit}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            {extractedQuestions.length > 0 && (
              <Button onClick={handleAddAll}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Add All {extractedQuestions.length} Questions
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFUpload;
