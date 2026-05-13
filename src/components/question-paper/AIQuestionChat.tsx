import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2, Plus, BookmarkPlus, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useCreateBankQuestion } from "@/hooks/useQuestionBank";

export interface AIGeneratedQuestion {
  question: string;
  type: string;
  marks: number;
  unit: string;
  difficulty: string;
  bloom_level: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  questions?: AIGeneratedQuestion[];
}

interface AIQuestionChatProps {
  subjectId?: string;
  subjectName?: string;
  units?: string[];
  onAddToPaper: (q: AIGeneratedQuestion) => void;
}

const AIQuestionChat = ({
  subjectId,
  subjectName,
  units,
  onAddToPaper,
}: AIQuestionChatProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I can generate exam questions for you. Try: \"Generate 5 medium short-answer questions on Unit 2 about linked lists\" or \"Create 2 hard descriptive questions on graphs (16 marks each)\".",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const createBankQuestion = useCreateBankQuestion();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-generate-questions", {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          context: { subject: subjectName, units },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Done.",
          questions: data.questions || [],
        },
      ]);
    } catch (e) {
      toast({
        title: "Generation failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveToBank = (q: AIGeneratedQuestion) => {
    if (!subjectId) {
      toast({
        title: "Select a subject first",
        description: "Choose the course in Basic Details before saving to the bank.",
        variant: "destructive",
      });
      return;
    }
    createBankQuestion.mutate({
      question: q.question,
      type: q.type,
      subject_id: subjectId,
      unit: q.unit,
      difficulty: q.difficulty,
      bloom_level: q.bloom_level,
      marks: q.marks,
      tags: ["ai-generated"],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Question Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-3xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-border/50">
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Question Generator
            {subjectName && (
              <Badge variant="outline" className="ml-2">{subjectName}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef as any}>
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === "user" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-card-foreground" />
                  )}
                </div>
                <div className={`flex-1 max-w-[85%] ${m.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-card-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.questions && m.questions.length > 0 && (
                    <div className="mt-3 space-y-2 text-left">
                      {m.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">{q.unit}</Badge>
                              <Badge variant="outline" className="text-xs">{q.type}</Badge>
                              <Badge variant="outline" className="text-xs">{q.marks}m</Badge>
                              <Badge variant="outline" className="text-xs">{q.difficulty}</Badge>
                              <Badge variant="outline" className="text-xs">{q.bloom_level}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-card-foreground mb-2">{q.question}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                onAddToPaper(q);
                                toast({ title: "Added to paper" });
                              }}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add to Paper
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveToBank(q)}
                              disabled={createBankQuestion.isPending}
                            >
                              <BookmarkPlus className="w-3 h-3 mr-1" /> Save to Bank
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Bot className="w-4 h-4 text-card-foreground" />
                </div>
                <div className="bg-muted/50 px-4 py-2 rounded-lg text-sm text-muted-foreground inline-flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe the questions you want..."
            className="bg-muted/50 border-border/50 resize-none min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <Button onClick={send} disabled={loading || !input.trim()} className="self-end">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIQuestionChat;
