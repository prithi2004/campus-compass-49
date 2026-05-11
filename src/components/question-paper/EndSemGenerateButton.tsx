import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { QuestionBankItem } from "@/hooks/useQuestionBank";
import type { ExtractedQuestion } from "./PDFUpload";
import { selectByTaxonomy, shuffleArray } from "@/utils/taxonomySelection";

interface PartConfig {
  questions: number;
  marks: number;
  total: number;
}

interface GeneratedQuestion {
  id: number;
  text: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloomLevel: string;
  part: "A" | "B" | "C";
}

interface EndSemGenerateButtonProps {
  iat1Questions: ExtractedQuestion[];
  iat2Questions: ExtractedQuestion[];
  questionBank: QuestionBankItem[];
  subjectId: string;
  partA: PartConfig;
  partB: PartConfig;
  partC: PartConfig;
  bloomDistribution: Record<string, number>;
  difficultyMix: Record<string, number>;
  shuffleQuestions: boolean;
  onGenerated: (qs: GeneratedQuestion[]) => void;
}

// Normalize an ExtractedQuestion or QuestionBankItem into a common shape
const fromExtracted = (q: ExtractedQuestion, idx: number, source: string) => ({
  id: `${source}-${idx}`,
  question: q.question,
  type: q.type,
  unit: q.unit,
  difficulty: q.difficulty,
  bloomLevel: q.bloomLevel,
  marks: q.marks,
});
const fromBank = (q: QuestionBankItem) => ({
  id: `bank-${q.id}`,
  question: q.question,
  type: q.type,
  unit: q.unit,
  difficulty: q.difficulty,
  bloomLevel: q.bloom_level,
  marks: q.marks,
});

type Normal = ReturnType<typeof fromBank>;

const EndSemGenerateButton = ({
  iat1Questions,
  iat2Questions,
  questionBank,
  subjectId,
  partA,
  partB,
  partC,
  bloomDistribution,
  difficultyMix,
  shuffleQuestions,
  onGenerated,
}: EndSemGenerateButtonProps) => {
  const { toast } = useToast();

  const handleGenerate = () => {
    if (iat1Questions.length === 0 || iat2Questions.length === 0) {
      toast({
        title: "Missing IAT papers",
        description: "Upload both IAT-1 and IAT-2 PDFs in Basic Details first.",
        variant: "destructive",
      });
      return;
    }

    const bankFiltered = subjectId
      ? questionBank.filter((q) => q.subject_id === subjectId)
      : questionBank;

    if (bankFiltered.length === 0) {
      toast({
        title: "Empty question bank",
        description: "Add questions to the bank for this subject first.",
        variant: "destructive",
      });
      return;
    }

    const iat1Pool: { q: Normal; id: string }[] = iat1Questions.map((q, i) => {
      const n = fromExtracted(q, i, "iat1");
      return { q: n, id: n.id };
    });
    const iat2Pool: { q: Normal; id: string }[] = iat2Questions.map((q, i) => {
      const n = fromExtracted(q, i, "iat2");
      return { q: n, id: n.id };
    });
    const bankPool: { q: Normal; id: string }[] = bankFiltered.map((q) => {
      const n = fromBank(q);
      return { q: n, id: n.id };
    });

    const partsConfig: Array<{ part: "A" | "B" | "C"; needed: number; marks: number }> = [
      { part: "A", needed: partA.questions, marks: partA.marks },
      { part: "B", needed: partB.questions * 2, marks: partB.marks },
      { part: "C", needed: partC.questions * 2, marks: partC.marks },
    ];

    const finalQuestions: GeneratedQuestion[] = [];
    let qid = 1;
    const usedGlobal = new Set<string>();

    for (const { part, needed, marks } of partsConfig) {
      if (needed <= 0) continue;

      // Split per source: 25% IAT-1, 25% IAT-2, 50% bank
      let iat1Count = Math.round(needed * 0.25);
      let iat2Count = Math.round(needed * 0.25);
      let bankCount = needed - iat1Count - iat2Count;

      // Prefer questions whose marks are close to the part's marks
      const filterByMarks = (pool: { q: Normal; id: string }[]) => {
        const exact = pool.filter(({ q }) => q.marks === marks);
        if (exact.length >= 2) return exact;
        const near = pool.filter(({ q }) => Math.abs(q.marks - marks) <= Math.max(3, marks / 2));
        return near.length ? near : pool;
      };

      const pickFrom = (
        sourcePool: { q: Normal; id: string }[],
        count: number,
      ): Normal[] => {
        if (count <= 0) return [];
        const filtered = filterByMarks(sourcePool);
        const { selected, ids } = selectByTaxonomy<Normal>(
          filtered,
          count,
          bloomDistribution,
          difficultyMix,
          usedGlobal,
        );
        ids.forEach((id) => usedGlobal.add(id));

        // Fallback to full source pool if not enough matched marks
        if (selected.length < count) {
          const remaining = count - selected.length;
          const { selected: extra, ids: extraIds } = selectByTaxonomy<Normal>(
            sourcePool,
            remaining,
            bloomDistribution,
            difficultyMix,
            usedGlobal,
          );
          extraIds.forEach((id) => usedGlobal.add(id));
          selected.push(...extra);
        }
        return selected;
      };

      let iat1Picked = pickFrom(iat1Pool, iat1Count);
      let iat2Picked = pickFrom(iat2Pool, iat2Count);
      let bankPicked = pickFrom(bankPool, bankCount);

      // Cross-fill if any source was short
      const totalPicked = iat1Picked.length + iat2Picked.length + bankPicked.length;
      if (totalPicked < needed) {
        const shortfall = needed - totalPicked;
        const allPools = [...iat1Pool, ...iat2Pool, ...bankPool];
        const { selected: fill, ids: fillIds } = selectByTaxonomy<Normal>(
          allPools,
          shortfall,
          bloomDistribution,
          difficultyMix,
          usedGlobal,
        );
        fillIds.forEach((id) => usedGlobal.add(id));
        bankPicked = [...bankPicked, ...fill];
      }

      let combined = [...iat1Picked, ...iat2Picked, ...bankPicked].slice(0, needed);
      if (shuffleQuestions) combined = shuffleArray(combined);

      for (const q of combined) {
        finalQuestions.push({
          id: qid++,
          text: q.question,
          type: q.type,
          marks,
          unit: q.unit || "Unit 1",
          difficulty: q.difficulty,
          bloomLevel: q.bloomLevel.toLowerCase(),
          part,
        });
      }
    }

    onGenerated(finalQuestions);

    toast({
      title: "End-Sem paper generated",
      description: `${finalQuestions.length} questions: ~25% IAT-1, ~25% IAT-2, ~50% bank.`,
    });
  };

  return (
    <Button onClick={handleGenerate} variant="default">
      <Sparkles className="w-4 h-4 mr-2" />
      Generate End-Sem Paper
    </Button>
  );
};

export default EndSemGenerateButton;
