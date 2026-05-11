import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle2, FileText, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from "pdfjs-dist";
import type { ExtractedQuestion } from "./PDFUpload";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface EndSemUploadProps {
  iat1Questions: ExtractedQuestion[];
  iat2Questions: ExtractedQuestion[];
  onIat1Change: (qs: ExtractedQuestion[]) => void;
  onIat2Change: (qs: ExtractedQuestion[]) => void;
}

const extractTextFromPDF = async (file: File): Promise<string> => {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
  }
  return text;
};

const EndSemUpload = ({ iat1Questions, iat2Questions, onIat1Change, onIat2Change }: EndSemUploadProps) => {
  const { toast } = useToast();
  const iat1Ref = useRef<HTMLInputElement>(null);
  const iat2Ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<"iat1" | "iat2" | null>(null);
  const [errors, setErrors] = useState<{ iat1?: string; iat2?: string }>({});
  const [fileNames, setFileNames] = useState<{ iat1?: string; iat2?: string }>({});

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: "iat1" | "iat2",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Please upload a PDF.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB.", variant: "destructive" });
      return;
    }

    setLoading(slot);
    setErrors((p) => ({ ...p, [slot]: undefined }));
    setFileNames((p) => ({ ...p, [slot]: file.name }));

    try {
      const pdfText = await extractTextFromPDF(file);
      if (pdfText.trim().length < 20) throw new Error("Could not read enough text from this PDF.");

      const { data, error } = await supabase.functions.invoke("extract-questions-from-pdf", {
        body: { pdfText },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const qs: ExtractedQuestion[] = data.questions || [];
      if (qs.length === 0) throw new Error("No questions extracted from this PDF.");

      if (slot === "iat1") onIat1Change(qs);
      else onIat2Change(qs);

      toast({
        title: `${slot === "iat1" ? "IAT-1" : "IAT-2"}: ${qs.length} questions extracted`,
        description: "Questions classified by Bloom's Taxonomy.",
      });
    } catch (err: any) {
      const msg = err.message || "Extraction failed";
      setErrors((p) => ({ ...p, [slot]: msg }));
      toast({ title: "Extraction failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const clearSlot = (slot: "iat1" | "iat2") => {
    if (slot === "iat1") {
      onIat1Change([]);
      if (iat1Ref.current) iat1Ref.current.value = "";
    } else {
      onIat2Change([]);
      if (iat2Ref.current) iat2Ref.current.value = "";
    }
    setFileNames((p) => ({ ...p, [slot]: undefined }));
    setErrors((p) => ({ ...p, [slot]: undefined }));
  };

  const renderSlot = (
    slot: "iat1" | "iat2",
    label: string,
    questions: ExtractedQuestion[],
    ref: React.RefObject<HTMLInputElement>,
  ) => {
    const isLoading = loading === slot;
    const hasQuestions = questions.length > 0;
    return (
      <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-card-foreground font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {label} Question Paper
          </Label>
          {hasQuestions && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> {questions.length} questions
            </Badge>
          )}
        </div>

        {!hasQuestions && !isLoading && (
          <input
            ref={ref}
            type="file"
            accept=".pdf"
            onChange={(e) => handleUpload(e, slot)}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
          />
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Extracting from {fileNames[slot]}...
          </div>
        )}

        {hasQuestions && !isLoading && (
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground truncate">{fileNames[slot]}</span>
            <Button variant="ghost" size="sm" onClick={() => clearSlot(slot)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {errors[slot] && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errors[slot]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="lg:col-span-3 space-y-3">
      <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-card-foreground flex items-start gap-2">
        <Upload className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <span>
          End-Semester paper requires IAT-1 &amp; IAT-2 question papers. The generator will pick{" "}
          <strong>25% from IAT-1</strong>, <strong>25% from IAT-2</strong>, and{" "}
          <strong>50% from your question bank</strong> based on Bloom's Taxonomy.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {renderSlot("iat1", "IAT-1", iat1Questions, iat1Ref)}
        {renderSlot("iat2", "IAT-2", iat2Questions, iat2Ref)}
      </div>
    </div>
  );
};

export default EndSemUpload;
