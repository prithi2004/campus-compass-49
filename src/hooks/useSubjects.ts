import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSubjects = () => {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, course:courses(id, name, code, department_id)")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });
};

export const useSubjectsByDepartment = (departmentId: string | null) => {
  return useQuery({
    queryKey: ["subjects", "department", departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*, course:courses(id, name, code, department_id)")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      
      if (departmentId && departmentId !== "all") {
        return data.filter((s: any) => s.course?.department_id === departmentId);
      }
      return data;
    },
    enabled: true,
  });
};

export const useAcademicYears = () => {
  return useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("academic_years")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};
