import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaperConfig {
  id: string;
  exam_id: string | null;
  subject_id: string;
  title: string;
  academic_year_id: string | null;
  semester: number | null;
  department_id: string | null;
  exam_date: string | null;
  duration: string | null;
  max_marks: number;
  paper_pattern: Record<string, unknown>;
  difficulty_mix: Record<string, number>;
  bloom_distribution: Record<string, number>;
  security_options: Record<string, unknown>;
  output_format: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useQuestionPaperConfigs = () => {
  return useQuery({
    queryKey: ["question-paper-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_paper_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PaperConfig[];
    },
  });
};

export const useSavePaperConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: {
      subject_id: string;
      title: string;
      academic_year_id?: string | null;
      semester?: number | null;
      department_id?: string | null;
      exam_date?: string | null;
      duration?: string | null;
      max_marks?: number;
      paper_pattern?: Record<string, unknown>;
      difficulty_mix?: Record<string, number>;
      bloom_distribution?: Record<string, number>;
      security_options?: Record<string, unknown>;
      output_format?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from("question_paper_configs")
        .insert(config as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-paper-configs"] });
      toast.success("Question paper configuration saved");
    },
    onError: (error) => {
      toast.error(`Failed to save config: ${error.message}`);
    },
  });
};

export const useUpdatePaperConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PaperConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from("question_paper_configs")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-paper-configs"] });
      toast.success("Configuration updated");
    },
    onError: (error) => {
      toast.error(`Failed to update config: ${error.message}`);
    },
  });
};
