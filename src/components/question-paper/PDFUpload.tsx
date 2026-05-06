import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Brain, Shuffle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { pairOrQuestions } from "@/utils/questionPaperPattern";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export interface ExtractedQuestion {
  question: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
  part?: "A" | "B" | "C";
}

interface PartConfig {
  questions: number;
  marks: number;
  total: number;
}

interface PDFUploadProps {
  onQuestionsExtracted: (questions: ExtractedQuestion[]) => void;
  partA: PartConfig;
  partB: PartConfig;
  partC: PartConfig;
  bloomDistribution: Record<string, number>;
  difficultyMix: Record<string, number>;
  shuffleQuestions: boolean;
}

// Taxonomy-based selection algorithm
const selectByTaxonomy = (
  pool: Array<{ q: ExtractedQuestion; i: number }>,
  count: number,
  bloomDistribution: Record<string, number>,
  difficultyMix: Record<string, number>,
  usedIndices: Set<number>
): { selected: ExtractedQuestion[]; indices: number[] } => {
  const available = pool.filter(({ i }) => !usedIndices.has(i));

  if (available.length === 0) return { selected: [], indices: [] };

  // Calculate quotas for difficulty levels
  const diffQuotas: Record<string, number> = {};
  const totalDiffPct = Object.values(difficultyMix).reduce((s, v) => s + v, 0) || 1;
  for (const [level, pct] of Object.entries(difficultyMix)) {
    if (pct > 0) diffQuotas[level] = Math.max(1, Math.round((pct / totalDiffPct) * count));
  }

  // Calculate quotas for bloom levels
  const bloomQuotas: Record<string, number> = {};
  const totalBloomPct = Object.values(bloomDistribution).reduce((s, v) => s + v, 0) || 1;
  for (const [level, pct] of Object.entries(bloomDistribution)) {
    if (pct > 0) bloomQuotas[level] = Math.max(1, Math.round((pct / totalBloomPct) * count));
  }

  const selected: { q: ExtractedQuestion; i: number }[] = [];
  const usedLocal = new Set<number>();

  // Phase 1: Fill difficulty quotas first (primary constraint)
  const diffLevels = Object.entries(diffQuotas).sort((a, b) => b[1] - a[1]);
  for (const [diff, quota] of diffLevels) {
    const matching = available.filter(
      ({ q, i }) => q.difficulty.toLowerCase() === diff && !usedLocal.has(i)
    );
    // Within each difficulty, prefer questions that also match bloom quotas
    const sorted = matching.sort((a, b) => {
      const aBloomQuota = bloomQuotas[a.q.bloomLevel.toLowerCase()] || 0;
      const bBloomQuota = bloomQuotas[b.q.bloomLevel.toLowerCase()] || 0;
      // Prefer higher bloom quota + randomness
      return (bBloomQuota - aBloomQuota) + (Math.random() - 0.5) * 2;
    });
    const toTake = Math.min(quota, sorted.length, count - selected.length);
    for (let j = 0; j < toTake; j++) {
      selected.push(sorted[j]);
      usedLocal.add(sorted[j].i);
      // Decrement bloom quota
      const bl = sorted[j].q.bloomLevel.toLowerCase();
      if (bloomQuotas[bl]) bloomQuotas[bl]--;
    }
    if (selected.length >= count) break;
  }

  // Phase 2: If still need more, fill remaining bloom quotas
  if (selected.length < count) {
    const remaining = available.filter(({ i }) => !usedLocal.has(i));
    const bloomLevels = Object.entries(bloomQuotas)
      .filter(([, q]) => q > 0)
      .sort((a, b) => b[1] - a[1]);
    for (const [bloom] of bloomLevels) {
      if (selected.length >= count) break;
      const matching = remaining.filter(
        ({ q, i }) => q.bloomLevel.toLowerCase() === bloom && !usedLocal.has(i)
      );
      if (matching.length > 0) {
        const pick = matching[Math.floor(Math.random() * matching.length)];
        selected.push(pick);
        usedLocal.add(pick.i);
      }
    }
  }

  // Phase 3: Fill any remaining slots randomly
  if (selected.length < count) {
    const remaining = available
      .filter(({ i }) => !usedLocal.has(i))
      .sort(() => Math.random() - 0.5);
    for (const item of remaining) {
      if (selected.length >= count) break;
      selected.push(item);
      usedLocal.add(item.i);
    }
  }

  return {
    selected: selected.slice(0, count).map(p => p.q),
    indices: selected.slice(0, count).map(p => p.i),
  };
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const PDFUpload = ({
  onQuestionsExtracted,
  partA,
  partB,
  partC,
  bloomDistribution,
  difficultyMix,
  shuffleQuestions,
}: PDFUploadProps) => {
  const [open, setOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<ExtractedQuestion[]>([]);
  const [generatedParts, setGeneratedParts] = useState<{ A: ExtractedQuestion[]; B: ExtractedQuestion[]; C: ExtractedQuestion[] }>({ A: [], B: [], C: [] });
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<"upload" | "review" | "generated">("upload");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
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
    setGeneratedQuestions([]);
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

      const questions: ExtractedQuestion[] = data.questions || [];
      if (questions.length === 0) {
        throw new Error("No questions could be extracted from this PDF.");
      }

      setExtractedQuestions(questions);
      setStep("review");
      toast({ title: `${questions.length} questions extracted!`, description: "Now generate paper based on Bloom's Taxonomy." });
    } catch (err: any) {
      setError(err.message || "Failed to extract questions");
      toast({ title: "Extraction failed", description: err.message, variant: "destructive" });
    } finally {
      setExtracting(false);
    }
  };

  const generateByTaxonomy = () => {
    const totalNeeded = partA.questions + partB.questions * 2 + partC.questions * 2;
    
    if (extractedQuestions.length < totalNeeded) {
      setError(`Need ${totalNeeded} questions but only ${extractedQuestions.length} extracted. Add more or reduce part counts.`);
      return;
    }

    const usedIndices = new Set<number>();
    const indexedQuestions = extractedQuestions.map((q, i) => ({ q, i }));

    // Part A: prefer low-marks, Remember/Understand bloom levels
    const partAPool = indexedQuestions.filter(({ q }) => q.marks <= partA.marks + 3);
    const { selected: partASelected, indices: partAIdx } = selectByTaxonomy(
      partAPool.length >= partA.questions ? partAPool : indexedQuestions,
      partA.questions,
      bloomDistribution,
      difficultyMix,
      usedIndices
    );
    partAIdx.forEach((i) => usedIndices.add(i));

    // Part B: medium marks, but must produce full (a) OR (b) pairs
    const partBCount = partB.questions * 2;
    const partBPool = indexedQuestions.filter(({ q }) => q.marks > partA.marks && q.marks <= partB.marks + 5);
    const { selected: partBSelected, indices: partBIdx } = selectByTaxonomy(
      partBPool.length >= partBCount ? partBPool : indexedQuestions,
      partBCount,
      bloomDistribution,
      difficultyMix,
      usedIndices
    );
    partBIdx.forEach((i) => usedIndices.add(i));

    // Part C: high marks, also full (a) OR (b) pairs
    const partCCount = partC.questions * 2;
    const partCPool = indexedQuestions.filter(({ q }) => q.marks >= partC.marks - 5);
    const { selected: partCSelected, indices: partCIdx } = selectByTaxonomy(
      partCPool.length >= partCCount ? partCPool : indexedQuestions,
      partCCount,
      bloomDistribution,
      difficultyMix,
      usedIndices
    );
    partCIdx.forEach((i) => usedIndices.add(i));

    const finalA = shuffleQuestions ? shuffleArray(partASelected) : partASelected;
    const finalB = shuffleQuestions ? shuffleArray(partBSelected) : partBSelected;
    const finalC = shuffleQuestions ? shuffleArray(partCSelected) : partCSelected;

    // Override marks to match part config
    const withMarks = (qs: ExtractedQuestion[], marks: number, part: "A" | "B" | "C") =>
      qs.map(q => ({ ...q, marks, part }));

    setGeneratedParts({
      A: withMarks(finalA, partA.marks, "A"),
      B: withMarks(finalB, partB.marks, "B"),
      C: withMarks(finalC, partC.marks, "C"),
    });
    setGeneratedQuestions([
      ...withMarks(finalA, partA.marks, "A"),
      ...withMarks(finalB, partB.marks, "B"),
      ...withMarks(finalC, partC.marks, "C"),
    ]);
    setStep("generated");
    setError("");
  };

  const handleUseQuestions = () => {
    onQuestionsExtracted(generatedQuestions);
    toast({ title: "Questions added", description: `${generatedQuestions.length} taxonomy-based questions added to your paper.` });
    setOpen(false);
    reset();
  };

  const handleAddAllRaw = () => {
    onQuestionsExtracted(extractedQuestions);
    toast({ title: "Questions added", description: `${extractedQuestions.length} questions added to your paper.` });
    setOpen(false);
    reset();
  };

  const reset = () => {
    setExtractedQuestions([]);
    setGeneratedQuestions([]);
    setGeneratedParts({ A: [], B: [], C: [] });
    setError("");
    setFileName("");
    setStep("upload");
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

  const bloomStats = (qs: ExtractedQuestion[]) => {
    const counts: Record<string, number> = {};
    qs.forEach(q => {
      const level = q.bloomLevel.toLowerCase();
      counts[level] = (counts[level] || 0) + 1;
    });
    return counts;
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
            {step === "upload" && "Extract Questions from PDF"}
            {step === "review" && "Review Extracted Questions"}
            {step === "generated" && "Taxonomy-Based Paper Generated"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
          {/* Info */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm text-card-foreground">
            {step === "upload" && "Upload a question paper PDF. AI will extract questions with Bloom's levels, then generate a paper matching your taxonomy distribution."}
            {step === "review" && `${extractedQuestions.length} questions extracted. Click "Generate by Taxonomy" to auto-select based on your Bloom's & difficulty settings.`}
            {step === "generated" && "Questions selected based on your Bloom's Taxonomy and difficulty distribution settings."}
          </div>

          {/* File input - always visible */}
          {step === "upload" && (
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
          )}

          {/* Loading */}
          {extracting && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div>
                <p className="text-card-foreground font-medium">Extracting questions from {fileName}...</p>
                <p className="text-sm text-muted-foreground">AI is reading and classifying by Bloom's Taxonomy</p>
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

          {/* Review extracted questions */}
          {step === "review" && (
            <>
              {/* Bloom's distribution summary */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Extracted Bloom's Distribution:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(bloomStats(extractedQuestions)).map(([level, count]) => (
                    <Badge key={level} variant="outline" className="capitalize text-xs">
                      {level}: {count}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Config summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">Part A</p>
                  <p className="font-bold text-sm text-card-foreground">{partA.questions} × {partA.marks}m</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">Part B</p>
                  <p className="font-bold text-sm text-card-foreground">{partB.questions} × {partB.marks}m</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/30 text-center">
                  <p className="text-xs text-muted-foreground">Part C</p>
                  <p className="font-bold text-sm text-card-foreground">{partC.questions} × {partC.marks}m</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {extractedQuestions.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-card-foreground text-sm mb-2">
                      <span className="font-medium text-primary">{i + 1}.</span> {q.question}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="capitalize text-xs">{q.type}</Badge>
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">{q.marks}m</Badge>
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">{q.bloomLevel}</Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground">{q.unit}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Generated taxonomy-based paper */}
          {step === "generated" && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {(["A", "B", "C"] as const).map((part) => {
                const partConfig = part === "A" ? partA : part === "B" ? partB : partC;
                const partQs = generatedParts[part];
                if (partQs.length === 0) return null;
                return (
                  <div key={part}>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-card-foreground text-sm">
                        Part {part} ({partConfig.marks} marks each)
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {part === "A" ? `${partQs.length} questions` : `${Math.ceil(partQs.length / 2)} pairs`}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {part === "A" ? partQs.map((q, i) => (
                        <div key={`${part}-${i}`} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                          <p className="text-card-foreground text-sm mb-1.5">
                            <span className="font-medium text-primary">Q{i + 1}.</span> {q.question}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={`text-xs ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</Badge>
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">{q.bloomLevel}</Badge>
                          </div>
                        </div>
                      )) : pairOrQuestions(partQs, 1).map(({ questionNumber, optionA, optionB }) => (
                        <div key={`${part}-${questionNumber}`} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                          <p className="text-card-foreground text-sm">
                            <span className="font-medium text-primary">Q{questionNumber}.</span> (a) {optionA.question}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className={`text-xs ${getDifficultyColor(optionA.difficulty)}`}>{optionA.difficulty}</Badge>
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">{optionA.bloomLevel}</Badge>
                          </div>
                          {optionB && (
                            <>
                              <p className="text-center text-xs font-semibold text-muted-foreground">(OR)</p>
                              <p className="text-card-foreground text-sm">(b) {optionB.question}</p>
                              <div className="flex flex-wrap gap-1.5">
                                <Badge variant="outline" className={`text-xs ${getDifficultyColor(optionB.difficulty)}`}>{optionB.difficulty}</Badge>
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">{optionB.bloomLevel}</Badge>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Bloom's stats of generated paper */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Generated Paper Bloom's Distribution:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(bloomStats(generatedQuestions)).map(([level, count]) => (
                    <Badge key={level} variant="outline" className="capitalize text-xs">
                      {level}: {count} ({Math.round((count / generatedQuestions.length) * 100)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>

            {step === "review" && (
              <>
                <Button variant="outline" onClick={handleAddAllRaw}>
                  Add All Raw
                </Button>
                <Button onClick={generateByTaxonomy}>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate by Taxonomy
                </Button>
              </>
            )}

            {step === "generated" && (
              <>
                <Button variant="outline" onClick={generateByTaxonomy}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button onClick={handleUseQuestions}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Use These Questions
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFUpload;
