import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { toast } from "sonner";

export type Staff = Tables<"staff"> & {
  department?: Tables<"departments"> | null;
};

export type StaffInsert = TablesInsert<"staff">;
export type StaffUpdate = TablesUpdate<"staff">;

export const useStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select(`
          *,
          department:departments(*)
        `)
        .order("full_name");

      if (error) throw error;
      return data as Staff[];
    },
  });
};

export const useStaffByDepartment = (departmentId: string | null) => {
  return useQuery({
    queryKey: ["staff", "department", departmentId],
    queryFn: async () => {
      let query = supabase
        .from("staff")
        .select(`
          *,
          department:departments(*)
        `)
        .order("full_name");

      if (departmentId && departmentId !== "all") {
        query = query.eq("department_id", departmentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Staff[];
    },
    enabled: true,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staff: StaffInsert) => {
      const { data, error } = await supabase
        .from("staff")
        .insert(staff)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add staff: ${error.message}`);
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: StaffUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("staff")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update staff: ${error.message}`);
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete staff: ${error.message}`);
    },
  });
};
