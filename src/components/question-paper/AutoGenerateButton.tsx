import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, AlertCircle, CheckCircle2, Shuffle } from "lucide-react";
import { type QuestionBankItem } from "@/hooks/useQuestionBank";

interface Question {
  id: number;
  text: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
  part: "A" | "B" | "C";
}

interface PartConfig {
  questions: number;
  marks: number;
  total: number;
}

interface AutoGenerateProps {
  questionBank: QuestionBankItem[];
  subjectId: string;
  partA: PartConfig;
  partB: PartConfig;
  partC: PartConfig;
  bloomDistribution: Record<string, number>;
  difficultyMix: Record<string, number>;
  shuffleQuestions: boolean;
  onGenerated: (questions: Question[]) => void;
}

interface ValidationError {
  type: "error" | "warning";
  message: string;
}

const AutoGenerateButton = ({
  questionBank,
  subjectId,
  partA,
  partB,
  partC,
  bloomDistribution,
  difficultyMix,
  shuffleQuestions,
  onGenerated,
}: AutoGenerateProps) => {
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const subjectQuestions = questionBank.filter(q => q.subject_id === subjectId);

  const validate = (): ValidationError[] => {
    const errs: ValidationError[] = [];
    // Part B and C need 2x questions for (a) or (b) OR choices
    const totalNeeded = partA.questions + partB.questions * 2 + partC.questions * 2;

    if (!subjectId) {
      errs.push({ type: "error", message: "Please select a subject in Step 1 first." });
      return errs;
    }

    if (subjectQuestions.length === 0) {
      errs.push({ type: "error", message: "No questions found in the bank for the selected subject." });
      return errs;
    }

    if (subjectQuestions.length < totalNeeded) {
      errs.push({
        type: "error",
        message: `Need ${totalNeeded} questions (Part A: ${partA.questions}, Part B: ${partB.questions}×2, Part C: ${partC.questions}×2) but only ${subjectQuestions.length} available.`,
      });
    }

    // Check Part A availability (low marks questions)
    const partAPool = subjectQuestions.filter(q => q.marks <= partA.marks);
    if (partAPool.length < partA.questions) {
      errs.push({
        type: "warning",
        message: `Part A needs ${partA.questions} questions (≤${partA.marks} marks), only ${partAPool.length} available.`,
      });
    }

    // Check Part C availability (high marks questions)
    const partCPool = subjectQuestions.filter(q => q.marks >= partC.marks);
    if (partCPool.length < partC.questions) {
      errs.push({
        type: "warning",
        message: `Part C needs ${partC.questions} questions (≥${partC.marks} marks), only ${partCPool.length} available.`,
      });
    }

    // Check Bloom's distribution
    const bloomLevels = ["remember", "understand", "apply", "analyze", "evaluate", "create"];
    for (const level of bloomLevels) {
      const pct = bloomDistribution[level] || 0;
      if (pct > 0) {
        const needed = Math.ceil((pct / 100) * totalNeeded);
        const available = subjectQuestions.filter(q => q.bloom_level.toLowerCase() === level).length;
        if (available < needed) {
          errs.push({
            type: "warning",
            message: `Bloom's "${level}": need ~${needed} questions (${pct}%), only ${available} available.`,
          });
        }
      }
    }

    // Check difficulty distribution
    for (const diff of ["easy", "medium", "hard"]) {
      const pct = difficultyMix[diff] || 0;
      if (pct > 0) {
        const needed = Math.ceil((pct / 100) * totalNeeded);
        const available = subjectQuestions.filter(q => q.difficulty === diff).length;
        if (available < needed) {
          errs.push({
            type: "warning",
            message: `Difficulty "${diff}": need ~${needed} questions (${pct}%), only ${available} available.`,
          });
        }
      }
    }

    return errs;
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectQuestions = (
    pool: QuestionBankItem[],
    count: number,
    usedIds: Set<string>
  ): QuestionBankItem[] => {
    const available = pool.filter(q => !usedIds.has(q.id));
    if (available.length === 0) return [];

    // Discover all unique units
    const units = [...new Set(available.map(q => q.unit))];
    
    // Calculate per-unit quota (round-robin for even distribution)
    const basePerUnit = Math.floor(count / units.length);
    let remainder = count - basePerUnit * units.length;
    const unitQuotas: Record<string, number> = {};
    for (const unit of units) {
      unitQuotas[unit] = basePerUnit + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }

    const selected: QuestionBankItem[] = [];

    // For each unit, select questions respecting difficulty & bloom quotas
    for (const unit of units) {
      const unitPool = shuffleArray(available.filter(q => q.unit === unit && !selected.some(s => s.id === q.id)));
      const unitCount = unitQuotas[unit];
      if (unitCount <= 0 || unitPool.length === 0) continue;

      // Difficulty sub-distribution within this unit
      const diffLevels = ["easy", "medium", "hard"];
      const diffQuotas: Record<string, number> = {};
      let diffAssigned = 0;
      diffLevels.forEach((d, i) => {
        const pct = difficultyMix[d] || 0;
        if (i === diffLevels.length - 1) {
          diffQuotas[d] = unitCount - diffAssigned;
        } else {
          diffQuotas[d] = Math.round((pct / 100) * unitCount);
          diffAssigned += diffQuotas[d];
        }
      });

      for (const diff of diffLevels) {
        const dNeeded = diffQuotas[diff];
        if (dNeeded <= 0) continue;
        const diffPool = unitPool.filter(q => q.difficulty === diff && !selected.some(s => s.id === q.id));

        // Bloom sub-distribution within this difficulty+unit
        const bloomLevels = ["remember", "understand", "apply", "analyse", "evaluate", "create"];
        const bloomQuotas: Record<string, number> = {};
        let bloomAssigned = 0;
        bloomLevels.forEach((b, i) => {
          const pct = bloomDistribution[b] || 0;
          if (i === bloomLevels.length - 1) {
            bloomQuotas[b] = dNeeded - bloomAssigned;
          } else {
            bloomQuotas[b] = Math.round((pct / 100) * dNeeded);
            bloomAssigned += bloomQuotas[b];
          }
        });

        for (const bloom of bloomLevels) {
          const bNeeded = bloomQuotas[bloom];
          if (bNeeded <= 0) continue;
          const bloomPool = diffPool.filter(q => q.bloom_level.toLowerCase() === bloom && !selected.some(s => s.id === q.id));
          selected.push(...bloomPool.slice(0, bNeeded));
        }

        // Fill remaining difficulty quota from this unit
        const filled = selected.filter(q => q.difficulty === diff && q.unit === unit).length;
        const remaining = dNeeded - filled;
        if (remaining > 0) {
          const leftover = diffPool.filter(q => !selected.some(s => s.id === q.id));
          selected.push(...leftover.slice(0, remaining));
        }
      }

      // Fill remaining unit quota if difficulty didn't fill it
      const unitFilled = selected.filter(q => q.unit === unit).length;
      const unitRemaining = unitCount - unitFilled;
      if (unitRemaining > 0) {
        const leftover = unitPool.filter(q => !selected.some(s => s.id === q.id));
        selected.push(...leftover.slice(0, unitRemaining));
      }
    }

    // Final fallback - fill any remaining slots from entire available pool
    if (selected.length < count) {
      const leftover = shuffleArray(available.filter(q => !selected.some(s => s.id === q.id)));
      selected.push(...leftover.slice(0, count - selected.length));
    }

    return selected.slice(0, count);
  };

  const generate = () => {
    setGenerating(true);
    const validationErrors = validate();
    setErrors(validationErrors);

    const hasBlockingError = validationErrors.some(e => e.type === "error");
    if (hasBlockingError) {
      setGenerating(false);
      return;
    }

    setTimeout(() => {
      const usedIds = new Set<string>();
      const result: Question[] = [];
      let qNum = 1;

      // Part A - short/low marks questions (answer all, no OR)
      const partAPool = subjectQuestions.filter(q => q.marks <= partA.marks + 2);
      const partASelected = selectQuestions(
        partAPool.length >= partA.questions ? partAPool : subjectQuestions,
        partA.questions,
        usedIds
      );
      for (const q of partASelected) {
        usedIds.add(q.id);
        result.push({
          id: qNum++,
          text: q.question,
          type: q.type,
          marks: partA.marks,
          unit: q.unit,
          difficulty: q.difficulty,
          bloomLevel: q.bloom_level.toLowerCase(),
          part: "A",
        });
      }

      // Part B - need 2x questions for (a) or (b) OR choices
      const partBNeeded = partB.questions * 2;
      const partBPool = subjectQuestions.filter(
        q => q.marks > partA.marks && q.marks <= partB.marks + 5
      );
      const partBSelected = selectQuestions(
        partBPool.length >= partBNeeded ? partBPool : subjectQuestions,
        partBNeeded,
        usedIds
      );
      for (const q of partBSelected) {
        usedIds.add(q.id);
        result.push({
          id: qNum++,
          text: q.question,
          type: q.type,
          marks: partB.marks,
          unit: q.unit,
          difficulty: q.difficulty,
          bloomLevel: q.bloom_level.toLowerCase(),
          part: "B",
        });
      }

      // Part C - need 2x questions for (a) or (b) OR choices
      const partCNeeded = partC.questions * 2;
      const partCPool = subjectQuestions.filter(q => q.marks >= partC.marks - 5);
      const partCSelected = selectQuestions(
        partCPool.length >= partCNeeded ? partCPool : subjectQuestions,
        partCNeeded,
        usedIds
      );
      for (const q of partCSelected) {
        usedIds.add(q.id);
        result.push({
          id: qNum++,
          text: q.question,
          type: q.type,
          marks: partC.marks,
          unit: q.unit,
          difficulty: q.difficulty,
          bloomLevel: q.bloom_level.toLowerCase(),
          part: "C",
        });
      }

      const finalResult = shuffleQuestions
        ? [
            ...shuffleArray(result.filter(q => q.marks === partA.marks)).map((q, i) => ({ ...q, id: i + 1 })),
            ...shuffleArray(result.filter(q => q.marks === partB.marks)).map((q, i) => ({ ...q, id: partA.questions + i + 1 })),
            ...shuffleArray(result.filter(q => q.marks === partC.marks)).map((q, i) => ({ ...q, id: partA.questions + partB.questions * 2 + i + 1 })),
          ]
        : result;

      setGeneratedQuestions(finalResult);
      setGenerating(false);
    }, 800);
  };

  const confirmGenerate = () => {
    onGenerated(generatedQuestions);
    setOpen(false);
    setGeneratedQuestions([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setGeneratedQuestions([]); setErrors([]); } }}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-gradient-to-r from-primary to-primary/80">
          <Brain className="w-4 h-4 mr-2" />
          Auto Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Auto Generate Question Paper
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Config summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Part A</p>
              <p className="font-bold text-card-foreground">{partA.questions} × {partA.marks}m</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Part B</p>
              <p className="font-bold text-card-foreground">{partB.questions} × {partB.marks}m</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Part C</p>
              <p className="font-bold text-card-foreground">{partC.questions} × {partC.marks}m</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground">
              Available: <strong className="text-card-foreground">{subjectQuestions.length}</strong> questions for selected subject |
              Needed: <strong className="text-card-foreground">{partA.questions + partB.questions + partC.questions}</strong> total
            </p>
          </div>

          {/* Validation errors */}
          {errors.length > 0 && (
            <div className="space-y-2">
              {errors.map((e, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                    e.type === "error"
                      ? "bg-destructive/10 border border-destructive/20 text-destructive"
                      : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {e.message}
                </div>
              ))}
            </div>
          )}

          {/* Unit distribution stats */}
          {generatedQuestions.length > 0 && (() => {
            const unitCounts: Record<string, { total: number; A: number; B: number; C: number }> = {};
            generatedQuestions.forEach(q => {
              if (!unitCounts[q.unit]) unitCounts[q.unit] = { total: 0, A: 0, B: 0, C: 0 };
              unitCounts[q.unit].total++;
              unitCounts[q.unit][q.part]++;
            });
            const units = Object.entries(unitCounts).sort(([a], [b]) => a.localeCompare(b));
            return (
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                <p className="text-sm font-medium text-card-foreground">Unit Distribution</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {units.map(([unit, counts]) => (
                    <div key={unit} className="p-2 rounded bg-background/50 border border-border/30 text-center">
                      <p className="text-xs font-medium text-card-foreground truncate">{unit}</p>
                      <p className="text-lg font-bold text-primary">{counts.total}</p>
                      <div className="flex justify-center gap-1 mt-1">
                        {counts.A > 0 && <Badge variant="outline" className="text-[10px] px-1">A:{counts.A}</Badge>}
                        {counts.B > 0 && <Badge variant="outline" className="text-[10px] px-1">B:{counts.B}</Badge>}
                        {counts.C > 0 && <Badge variant="outline" className="text-[10px] px-1">C:{counts.C}</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Generated questions preview */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-medium text-card-foreground">
                  {generatedQuestions.length} questions generated
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {generatedQuestions.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-card-foreground">
                        <span className="font-medium text-primary">Q{q.id}.</span> {q.text}
                      </p>
                      <div className="flex gap-1 shrink-0">
                        <Badge variant="outline" className="text-xs">{q.marks}m</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{q.bloomLevel}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            {generatedQuestions.length === 0 ? (
              <Button onClick={generate} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={generate}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button onClick={confirmGenerate}>
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

export default AutoGenerateButton;
