export type QuestionPaperPart = "A" | "B" | "C";

export interface PartConfig {
  questions: number;
  marks: number;
  total: number;
}

export interface PaperPatternConfig {
  partA: PartConfig;
  partB: PartConfig;
  partC: PartConfig;
}

export interface PatternQuestion {
  marks: number;
  part: QuestionPaperPart;
}

export interface QuestionPair<T> {
  questionNumber: number;
  optionA: T;
  optionB: T | null;
}

const toSafeCount = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export const getPatternQuestionCounts = ({ partA, partB, partC }: PaperPatternConfig) => ({
  A: toSafeCount(partA.questions),
  B: toSafeCount(partB.questions) * 2,
  C: toSafeCount(partC.questions) * 2,
});

export const getTotalQuestionsNeeded = (pattern: PaperPatternConfig) => {
  const counts = getPatternQuestionCounts(pattern);
  return counts.A + counts.B + counts.C;
};

export const normalizeQuestionPaperQuestions = <T extends PatternQuestion>(
  questions: T[],
  pattern: PaperPatternConfig,
): T[] => {
  const counts = getPatternQuestionCounts(pattern);
  const groups = {
    A: questions.filter((q) => q.part === "A"),
    B: questions.filter((q) => q.part === "B"),
    C: questions.filter((q) => q.part === "C"),
  };

  const hasCompletePattern =
    groups.A.length >= counts.A && groups.B.length >= counts.B && groups.C.length >= counts.C;

  const source = hasCompletePattern ? groups : {
    A: questions.slice(0, counts.A),
    B: questions.slice(counts.A, counts.A + counts.B),
    C: questions.slice(counts.A + counts.B, counts.A + counts.B + counts.C),
  };

  return [
    ...source.A.slice(0, counts.A).map((q) => ({ ...q, part: "A" as const, marks: pattern.partA.marks })),
    ...source.B.slice(0, counts.B).map((q) => ({ ...q, part: "B" as const, marks: pattern.partB.marks })),
    ...source.C.slice(0, counts.C).map((q) => ({ ...q, part: "C" as const, marks: pattern.partC.marks })),
  ];
};

export const getQuestionPartGroups = <T extends PatternQuestion>(
  questions: T[],
  pattern: PaperPatternConfig,
) => {
  const normalized = normalizeQuestionPaperQuestions(questions, pattern);
  return {
    A: normalized.filter((q) => q.part === "A"),
    B: normalized.filter((q) => q.part === "B"),
    C: normalized.filter((q) => q.part === "C"),
  };
};

export const pairOrQuestions = <T>(questions: T[], startNumber: number): QuestionPair<T>[] => {
  const pairs: QuestionPair<T>[] = [];
  for (let i = 0; i < questions.length; i += 2) {
    pairs.push({
      questionNumber: startNumber + i / 2,
      optionA: questions[i],
      optionB: questions[i + 1] ?? null,
    });
  }
  return pairs;
};