import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, AlertCircle, CheckCircle2, Shuffle } from "lucide-react";
import { type QuestionBankItem } from "@/hooks/useQuestionBank";
import { getQuestionPartGroups, getTotalQuestionsNeeded, pairOrQuestions, type PartConfig } from "@/utils/questionPaperPattern";

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
  const generatedPartQuestions = getQuestionPartGroups(generatedQuestions, { partA, partB, partC });

  const getPartStartNumber = (part: Question["part"]) => {
    if (part === "A") return 1;
    if (part === "B") return generatedPartQuestions.A.length + 1;
    return generatedPartQuestions.A.length + Math.ceil(generatedPartQuestions.B.length / 2) + 1;
  };

  const renderGeneratedPartPreview = (part: Question["part"]) => {
    const partQuestions = generatedPartQuestions[part];
    if (partQuestions.length === 0) return null;

    const partConfig = part === "A" ? partA : part === "B" ? partB : partC;
    const startNumber = getPartStartNumber(part);
    const sectionTitle =
      part === "A"
        ? "Answer all questions"
        : "Each question has (a) OR (b) options";

    return (
      <div key={part} className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium text-card-foreground">
            Part {part} — {sectionTitle}
          </p>
          <Badge variant="outline" className="text-xs">
            {part === "A" ? `${partQuestions.length} questions` : `${Math.ceil(partQuestions.length / 2)} pairs`} · {partConfig.marks}m
          </Badge>
        </div>

        {part === "A" ? (
          <div className="space-y-2">
            {partQuestions.map((q, index) => (
              <div key={q.id} className="p-3 rounded-lg bg-muted/20 border border-border/30">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-card-foreground">
                    <span className="font-medium text-primary">Q{startNumber + index}.</span> {q.text}
                  </p>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant="outline" className="text-xs">{q.unit}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{q.bloomLevel}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {pairOrQuestions(partQuestions, startNumber).map(({ questionNumber, optionA, optionB }) => (
                <div key={`${part}-${questionNumber}`} className="p-3 rounded-lg bg-muted/20 border border-border/30 space-y-2">
                  <p className="text-sm font-medium text-primary">{questionNumber}</p>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-card-foreground">(a) {optionA.text}</p>
                    <div className="flex gap-1 shrink-0">
                      <Badge variant="outline" className="text-xs">{optionA.unit}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{optionA.bloomLevel}</Badge>
                    </div>
                  </div>
                  {optionB && (
                    <>
                      <p className="text-center text-xs font-semibold text-muted-foreground">(OR)</p>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-card-foreground">(b) {optionB.text}</p>
                        <div className="flex gap-1 shrink-0">
                          <Badge variant="outline" className="text-xs">{optionB.unit}</Badge>
                          <Badge variant="outline" className="text-xs capitalize">{optionB.bloomLevel}</Badge>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const validate = (): ValidationError[] => {
    const errs: ValidationError[] = [];
    // Part B and C need 2x questions for (a) or (b) OR choices
    const totalNeeded = getTotalQuestionsNeeded({ partA, partB, partC });

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

    // Check section-specific availability based on configured marks.
    const partAPool = subjectQuestions.filter(q => q.marks === partA.marks);
    const partACompatiblePool = subjectQuestions.filter(q => q.marks <= partA.marks);
    const partBPool = subjectQuestions.filter(q => q.marks === partB.marks);
    const partBCompatiblePool = subjectQuestions.filter(
      (q) => q.marks >= partB.marks && (partC.marks <= partB.marks || q.marks < partC.marks)
    );
    const partCPool = subjectQuestions.filter(q => q.marks === partC.marks);
    const partCCompatiblePool = subjectQuestions.filter(q => q.marks >= partC.marks);

    if (partACompatiblePool.length < partA.questions) {
      errs.push({
        type: "warning",
        message: `Part A needs ${partA.questions} questions (${partA.marks} marks each), only ${partACompatiblePool.length} suitable questions available.`,
      });
    }

    if (partBCompatiblePool.length < partB.questions * 2) {
      errs.push({
        type: "warning",
        message: `Part B needs ${partB.questions * 2} questions (${partB.questions} main questions with a/b options, ${partB.marks} marks each), only ${partBCompatiblePool.length} suitable questions available.`,
      });
    }

    if (partCCompatiblePool.length < partC.questions * 2) {
      errs.push({
        type: "warning",
        message: `Part C needs ${partC.questions * 2} questions (${partC.questions} main questions with a/b options, ${partC.marks} marks each), only ${partCCompatiblePool.length} suitable questions available.`,
      });
    }

    // Check Bloom's distribution (normalize analyze/analyse)
    const totalNeededForDist = getTotalQuestionsNeeded({ partA, partB, partC });
    const bloomLevels = ["remember", "understand", "apply", "analyse", "evaluate", "create"];
    const normalizedBloomDist: Record<string, number> = {};
    for (const k of Object.keys(bloomDistribution)) {
      const nk = k.toLowerCase() === "analyze" ? "analyse" : k.toLowerCase();
      normalizedBloomDist[nk] = (normalizedBloomDist[nk] || 0) + (bloomDistribution[k] || 0);
    }
    for (const level of bloomLevels) {
      const pct = normalizedBloomDist[level] || 0;
      if (pct > 0) {
        const needed = Math.ceil((pct / 100) * totalNeededForDist);
        const available = subjectQuestions.filter(q => {
          const b = q.bloom_level.toLowerCase();
          return (b === "analyze" ? "analyse" : b) === level;
        }).length;
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
        const needed = Math.ceil((pct / 100) * totalNeededForDist);
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

  // Normalize bloom level strings (handles analyze/analyse, casing, whitespace)
  const normalizeBloom = (s: string): string => {
    const v = (s || "").toLowerCase().trim();
    if (v === "analyze") return "analyse";
    return v;
  };

  // Compute integer quotas from a percentage map using largest-remainder method
  const computeQuotas = (
    distribution: Record<string, number>,
    total: number,
    keys: string[]
  ): Record<string, number> => {
    const quotas: Record<string, number> = {};
    const remainders: { key: string; remainder: number }[] = [];
    let assigned = 0;
    const sumPct = keys.reduce((s, k) => s + (distribution[k] || 0), 0) || 100;

    for (const k of keys) {
      const exact = ((distribution[k] || 0) / sumPct) * total;
      const floor = Math.floor(exact);
      quotas[k] = floor;
      assigned += floor;
      remainders.push({ key: k, remainder: exact - floor });
    }

    let remaining = total - assigned;
    remainders.sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < remainders.length && remaining > 0; i++) {
      if ((distribution[remainders[i].key] || 0) > 0) {
        quotas[remainders[i].key]++;
        remaining--;
      }
    }
    // If still remaining (all percentages were 0 for some keys), distribute round-robin
    let idx = 0;
    while (remaining > 0 && remainders.length > 0) {
      quotas[remainders[idx % remainders.length].key]++;
      remaining--;
      idx++;
    }
    return quotas;
  };

  const selectQuestions = (
    pool: QuestionBankItem[],
    count: number,
    usedIds: Set<string>
  ): QuestionBankItem[] => {
    const available = pool.filter(q => !usedIds.has(q.id));
    if (available.length === 0 || count <= 0) return [];

    const bloomKeys = ["remember", "understand", "apply", "analyse", "evaluate", "create"];
    const diffKeys = ["easy", "medium", "hard"];

    // Normalize bloom distribution keys (analyze -> analyse)
    const normalizedBloom: Record<string, number> = {};
    for (const k of Object.keys(bloomDistribution)) {
      const nk = normalizeBloom(k);
      normalizedBloom[nk] = (normalizedBloom[nk] || 0) + (bloomDistribution[k] || 0);
    }

    // Global quotas across the whole part
    const bloomQuotas = computeQuotas(normalizedBloom, count, bloomKeys);
    const diffQuotas = computeQuotas(difficultyMix, count, diffKeys);

    // Build buckets by (difficulty, bloom)
    const bucket: Record<string, QuestionBankItem[]> = {};
    for (const q of available) {
      const key = `${q.difficulty}|${normalizeBloom(q.bloom_level)}`;
      (bucket[key] ||= []).push(q);
    }
    for (const k of Object.keys(bucket)) bucket[k] = shuffleArray(bucket[k]);

    const selected: QuestionBankItem[] = [];
    const selectedIds = new Set<string>();
    const unitCounts: Record<string, number> = {};
    const units = [...new Set(available.map(q => q.unit))];
    units.forEach(u => (unitCounts[u] = 0));

    const pickFromBucket = (key: string, preferLeastUsedUnit = true): QuestionBankItem | null => {
      const arr = bucket[key];
      if (!arr || arr.length === 0) return null;
      const candidates = arr.filter(q => !selectedIds.has(q.id));
      if (candidates.length === 0) return null;
      if (preferLeastUsedUnit) {
        candidates.sort((a, b) => (unitCounts[a.unit] || 0) - (unitCounts[b.unit] || 0));
      }
      return candidates[0];
    };

    // First pass: try to satisfy difficulty x bloom intersections
    for (const diff of diffKeys) {
      let dRemaining = diffQuotas[diff];
      if (dRemaining <= 0) continue;
      // Distribute this difficulty's quota across bloom levels per global bloom proportions
      const bloomForDiff = computeQuotas(normalizedBloom, dRemaining, bloomKeys);
      for (const bloom of bloomKeys) {
        let need = bloomForDiff[bloom];
        while (need > 0) {
          const q = pickFromBucket(`${diff}|${bloom}`);
          if (!q) break;
          selected.push(q);
          selectedIds.add(q.id);
          unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
          need--;
          dRemaining--;
        }
      }
      // Fill remaining difficulty quota from any bloom level of same difficulty
      if (dRemaining > 0) {
        const sameDiff = available
          .filter(q => q.difficulty === diff && !selectedIds.has(q.id))
          .sort((a, b) => (unitCounts[a.unit] || 0) - (unitCounts[b.unit] || 0));
        for (const q of sameDiff) {
          if (dRemaining <= 0) break;
          selected.push(q);
          selectedIds.add(q.id);
          unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
          dRemaining--;
        }
      }
    }

    // Second pass: enforce remaining bloom quotas with any difficulty
    const bloomFilled: Record<string, number> = {};
    bloomKeys.forEach(b => (bloomFilled[b] = 0));
    selected.forEach(q => {
      const b = normalizeBloom(q.bloom_level);
      if (bloomFilled[b] !== undefined) bloomFilled[b]++;
    });

    for (const bloom of bloomKeys) {
      let need = bloomQuotas[bloom] - bloomFilled[bloom];
      if (need <= 0) continue;
      const candidates = available
        .filter(q => normalizeBloom(q.bloom_level) === bloom && !selectedIds.has(q.id))
        .sort((a, b) => (unitCounts[a.unit] || 0) - (unitCounts[b.unit] || 0));
      for (const q of candidates) {
        if (need <= 0 || selected.length >= count) break;
        selected.push(q);
        selectedIds.add(q.id);
        unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
        need--;
      }
    }

    // Final fallback - fill remaining slots, prioritising under-represented
    // bloom levels and difficulties so we never default to "all easy/remember"
    // when intersection passes leave gaps.
    if (selected.length < count) {
      const diffFilled: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
      selected.forEach(q => { diffFilled[q.difficulty] = (diffFilled[q.difficulty] || 0) + 1; });

      while (selected.length < count) {
        const leftover = available.filter(q => !selectedIds.has(q.id));
        if (leftover.length === 0) break;

        // Score: prefer questions whose bloom + difficulty are most under-quota,
        // then least-used unit. Lower score = higher priority.
        leftover.sort((a, b) => {
          const aBloom = normalizeBloom(a.bloom_level);
          const bBloom = normalizeBloom(b.bloom_level);
          const aBloomGap = (bloomQuotas[aBloom] || 0) - (bloomFilled[aBloom] || 0);
          const bBloomGap = (bloomQuotas[bBloom] || 0) - (bloomFilled[bBloom] || 0);
          // Higher gap (more needed) should come first → negate
          if (bBloomGap !== aBloomGap) return bBloomGap - aBloomGap;
          const aDiffGap = (diffQuotas[a.difficulty] || 0) - (diffFilled[a.difficulty] || 0);
          const bDiffGap = (diffQuotas[b.difficulty] || 0) - (diffFilled[b.difficulty] || 0);
          if (bDiffGap !== aDiffGap) return bDiffGap - aDiffGap;
          return (unitCounts[a.unit] || 0) - (unitCounts[b.unit] || 0);
        });

        const q = leftover[0];
        selected.push(q);
        selectedIds.add(q.id);
        unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
        const b = normalizeBloom(q.bloom_level);
        bloomFilled[b] = (bloomFilled[b] || 0) + 1;
        diffFilled[q.difficulty] = (diffFilled[q.difficulty] || 0) + 1;
      }
    }

    return selected.slice(0, count);
  };

  const selectForPart = (
    count: number,
    usedIds: Set<string>,
    pools: QuestionBankItem[][]
  ): QuestionBankItem[] => {
    const picked: QuestionBankItem[] = [];
    const localUsed = new Set<string>(usedIds);

    for (const pool of pools) {
      const remaining = count - picked.length;
      if (remaining <= 0) break;

      const batch = selectQuestions(pool, remaining, localUsed);
      for (const q of batch) {
        if (localUsed.has(q.id)) continue;
        picked.push(q);
        localUsed.add(q.id);
      }
    }

    return picked;
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

      const partAPrimaryPool = subjectQuestions.filter((q) => q.marks === partA.marks);
      const partASecondaryPool = subjectQuestions.filter((q) => q.marks <= partA.marks);
      const partATertiaryPool = subjectQuestions.filter((q) => q.marks < partB.marks);
      const partBPrimaryPool = subjectQuestions.filter((q) => q.marks === partB.marks);
      const partBSecondaryPool = subjectQuestions.filter(
        (q) => q.marks >= partB.marks && (partC.marks <= partB.marks || q.marks < partC.marks)
      );
      const partBTertiaryPool = subjectQuestions.filter((q) => q.marks < partC.marks);
      const partCPrimaryPool = subjectQuestions.filter((q) => q.marks === partC.marks);
      const partCSecondaryPool = subjectQuestions.filter((q) => q.marks >= partC.marks);
      const partCTertiaryPool = subjectQuestions.filter((q) => q.marks > partB.marks);

      // Reserve the scarcest long-answer questions first so Part C never disappears.
      const partCNeeded = partC.questions * 2;
      const partCSelected = selectForPart(partCNeeded, usedIds, [partCPrimaryPool, partCSecondaryPool, partCTertiaryPool, subjectQuestions]);
      partCSelected.forEach((q) => usedIds.add(q.id));

      // Then reserve descriptive questions for Part B.
      const partBNeeded = partB.questions * 2;
      const partBSelected = selectForPart(partBNeeded, usedIds, [partBPrimaryPool, partBSecondaryPool, partBTertiaryPool, subjectQuestions]);
      partBSelected.forEach((q) => usedIds.add(q.id));

      // Fill Part A last from short-answer questions, then fall back only if needed.
      const partASelected = selectForPart(partA.questions, usedIds, [partAPrimaryPool, partASecondaryPool, partATertiaryPool, subjectQuestions]);
      partASelected.forEach((q) => usedIds.add(q.id));

      for (const q of partASelected) {
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

      for (const q of partBSelected) {
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

      for (const q of partCSelected) {
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
            ...shuffleArray(result.filter(q => q.part === "A")).map((q, i) => ({ ...q, id: i + 1 })),
            ...shuffleArray(result.filter(q => q.part === "B")).map((q, i) => ({ ...q, id: partA.questions + i + 1 })),
            ...shuffleArray(result.filter(q => q.part === "C")).map((q, i) => ({ ...q, id: partA.questions + partB.questions * 2 + i + 1 })),
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
              <p className="text-xs text-muted-foreground">Part A (Answer all)</p>
              <p className="font-bold text-card-foreground">{partA.questions} × {partA.marks}m</p>
              <p className="text-xs text-muted-foreground">{partA.questions} questions</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Part B (a OR b)</p>
              <p className="font-bold text-card-foreground">{partB.questions} × {partB.marks}m</p>
              <p className="text-xs text-muted-foreground">{partB.questions * 2} questions ({partB.questions} pairs)</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">Part C (a OR b)</p>
              <p className="font-bold text-card-foreground">{partC.questions} × {partC.marks}m</p>
              <p className="text-xs text-muted-foreground">{partC.questions * 2} questions ({partC.questions} pairs)</p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground">
              Available: <strong className="text-card-foreground">{subjectQuestions.length}</strong> questions for selected subject |
              Needed: <strong className="text-card-foreground">{getTotalQuestionsNeeded({ partA, partB, partC })}</strong> total
              (A: {partA.questions} + B: {partB.questions}×2 + C: {partC.questions}×2)
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

              <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
                {(["A", "B", "C"] as const).map((part) => renderGeneratedPartPreview(part))}
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
