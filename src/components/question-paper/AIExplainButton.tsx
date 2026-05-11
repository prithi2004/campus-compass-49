import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIExplainButtonProps {
  question: string;
  subject?: string;
  unit?: string;
  marks?: number;
  type?: string;
}

interface ExplainResult {
  explanation: string;
  answer_outline: string;
  diagram?: { format: string; content: string; caption?: string };
  graph?: { format: string; content: string; caption?: string };
  program?: { language: string; code: string };
  formula?: string;
  table?: string;
  notes?: string;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-semibold text-primary">{title}</h4>
    {children}
  </div>
);

const CodeBlock = ({ content, label }: { content: string; label?: string }) => {
  const { toast } = useToast();
  return (
    <div className="relative">
      {label && (
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
      )}
      <pre className="p-3 rounded-md bg-muted text-xs overflow-x-auto whitespace-pre-wrap break-words border border-border/50">
        {content}
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-1 right-1 h-7 w-7 p-0"
        onClick={() => {
          navigator.clipboard.writeText(content);
          toast({ title: "Copied" });
        }}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};

const AIExplainButton = ({ question, subject, unit, marks, type }: AIExplainButtonProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);

  const run = async () => {
    if (!question?.trim()) {
      toast({
        title: "Empty question",
        description: "Add question text first.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-explain-question", {
        body: { question, subject, unit, marks, type },
      });
      if (error) throw error;
      if ((data as { error?: string })?.error) {
        throw new Error((data as { error: string }).error);
      }
      setResult((data as { result: ExplainResult }).result);
    } catch (e) {
      toast({
        title: "AI failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v && !result) run();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          title="Explain with AI (diagrams, programs, graphs...)"
        >
          <Sparkles className="w-4 h-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Explanation & Supplementary Content
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-3">
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-muted/40 border border-border/50 text-sm">
              <span className="font-medium">Q: </span>
              {question}
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating explanation, diagrams, and code...
              </div>
            )}

            {result && (
              <div className="space-y-5">
                <Section title="Explanation">
                  <p className="text-sm whitespace-pre-wrap">{result.explanation}</p>
                </Section>

                <Section title="Expected Answer Outline">
                  <p className="text-sm whitespace-pre-wrap">{result.answer_outline}</p>
                </Section>

                {result.diagram && result.diagram.format !== "none" && result.diagram.content && (
                  <Section title={`Diagram (${result.diagram.format})`}>
                    <CodeBlock
                      content={result.diagram.content}
                      label={result.diagram.caption}
                    />
                  </Section>
                )}

                {result.graph && result.graph.format !== "none" && result.graph.content && (
                  <Section title={`Graph (${result.graph.format})`}>
                    <CodeBlock
                      content={result.graph.content}
                      label={result.graph.caption}
                    />
                  </Section>
                )}

                {result.program && result.program.code && (
                  <Section title={`Program (${result.program.language})`}>
                    <CodeBlock content={result.program.code} />
                  </Section>
                )}

                {result.formula && (
                  <Section title="Formula / Derivation">
                    <CodeBlock content={result.formula} />
                  </Section>
                )}

                {result.table && (
                  <Section title="Table">
                    <CodeBlock content={result.table} />
                  </Section>
                )}

                {result.notes && (
                  <Section title="Notes">
                    <p className="text-sm whitespace-pre-wrap">{result.notes}</p>
                  </Section>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={run} disabled={loading}>
                    <Sparkles className="w-3 h-3 mr-1" /> Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AIExplainButton;
