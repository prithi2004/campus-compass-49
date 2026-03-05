import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { History, Download, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { generateQuestionPaperPDF } from "@/utils/generateQuestionPaperPDF";

interface PaperHistoryProps {
  subjects: { id: string; name: string; code: string }[];
  departments: { id: string; name: string }[];
}

const PaperHistory = ({ subjects, departments }: PaperHistoryProps) => {
  const { data: configs = [], isLoading } = useQuery({
    queryKey: ["question-paper-configs-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_paper_configs")
        .select("*")
        .eq("status", "generated")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "Unknown";
  const getSubjectCode = (id: string) => subjects.find(s => s.id === id)?.code || "";
  const getDeptName = (id: string | null) => (id ? departments.find(d => d.id === id)?.name : "") || "";

  const redownload = (config: any) => {
    const pattern = config.paper_pattern as any;
    generateQuestionPaperPDF([], {
      examName: config.title,
      academicYear: "",
      semester: config.semester?.toString() || "",
      department: getDeptName(config.department_id),
      courseName: getSubjectName(config.subject_id),
      subjectCode: getSubjectCode(config.subject_id),
      examDate: config.exam_date || "",
      duration: config.duration || "",
      maxMarks: config.max_marks?.toString() || "100",
      partA: pattern?.partA || { questions: 10, marks: 2, total: 20 },
      partB: pattern?.partB || { questions: 5, marks: 8, total: 40 },
      partC: pattern?.partC || { questions: 2, marks: 20, total: 40 },
      watermark: (config.security_options as any)?.watermark ?? true,
      includeAnswerKey: false,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <History className="w-4 h-4 mr-2" />
          Paper History
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border/50 max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-card-foreground flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Generated Paper History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No generated papers yet.</p>
            </div>
          ) : (
            configs.map((cfg) => (
              <div
                key={cfg.id}
                className="p-4 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-card-foreground truncate">{cfg.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getSubjectName(cfg.subject_id)}
                    </Badge>
                    {cfg.exam_date && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(cfg.exam_date), "dd MMM yyyy")}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Created: {format(new Date(cfg.created_at), "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{cfg.max_marks} marks</Badge>
                    {cfg.duration && <Badge variant="outline" className="text-xs">{cfg.duration}h</Badge>}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => redownload(cfg)}>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaperHistory;
