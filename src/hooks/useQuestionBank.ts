import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuestionBankItem {
  id: string;
  question: string;
  type: string;
  subject_id: string;
  unit: string;
  difficulty: string;
  bloom_level: string;
  marks: number;
  tags: string[];
  options: string[] | null;
  correct_answer: string | null;
  is_favorite: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  subject?: { id: string; name: string; code: string } | null;
}

export const useQuestionBank = () => {
  return useQuery({
    queryKey: ["question-bank"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("question_bank")
        .select(`*, subject:subjects(id, name, code)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as QuestionBankItem[];
    },
  });
};

export const useCreateBankQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (question: {
      question: string;
      type: string;
      subject_id: string;
      unit: string;
      difficulty: string;
      bloom_level: string;
      marks: number;
      tags: string[];
      options?: string[] | null;
      correct_answer?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("question_bank")
        .insert(question)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      toast.success("Question saved to bank");
    },
    onError: (error) => {
      toast.error(`Failed to save question: ${error.message}`);
    },
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from("question_bank")
        .update({ is_favorite })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
    },
  });
};

export const useDeleteBankQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("question_bank")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      toast.success("Question removed from bank");
    },
    onError: (error) => {
      toast.error(`Failed to delete question: ${error.message}`);
    },
  });
};
