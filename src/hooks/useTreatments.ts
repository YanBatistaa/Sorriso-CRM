import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Treatment } from "@/types/patient";
import { useClinic } from "./useClinic";

export const TREATMENTS_QUERY_KEY = ["treatments"];

export function useTreatments() {
  const { clinic } = useClinic();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [TREATMENTS_QUERY_KEY, clinic?.id],
    queryFn: async () => {
      if (!clinic) return [] as Treatment[];
      const { data, error } = await supabase
        .from("treatments")
        .select("*")
        .eq("clinic_id", clinic.id)
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Treatment[];
    },
    enabled: !!clinic,
  });

  const addTreatmentMutation = useMutation({
    mutationFn: async (payload: Omit<Treatment, "id" | "created_at" | "is_active" | "clinic_id">) => {
        if (!clinic) throw new Error("Clínica não encontrada");
        const { data, error } = await supabase
            .from("treatments")
            .insert({ ...payload, clinic_id: clinic.id })
            .select()
            .single();
        if (error) throw error;
        return data as Treatment;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TREATMENTS_QUERY_KEY, clinic?.id] });
    }
  });

  const updateTreatmentMutation = useMutation({
    mutationFn: async (payload: Partial<Treatment> & { id: string }) => {
        const { id, ...rest } = payload;
        const { data, error } = await supabase
            .from("treatments")
            .update(rest)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as Treatment;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TREATMENTS_QUERY_KEY, clinic?.id] });
    }
  });

  const deleteTreatmentMutation = useMutation({
    mutationFn: async (id: string) => {
        const { error } = await supabase.from("treatments").delete().eq("id", id);
        if (error) throw error;
        return id;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [TREATMENTS_QUERY_KEY, clinic?.id] });
    }
  });
  
  const createTreatmentsMutation = useMutation({
    mutationFn: async (treatments: { name: string; clinic_id: string }[]) => {
      const { data, error } = await supabase.from("treatments").insert(treatments).select();
      if (error) throw error;
      return data as Treatment[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TREATMENTS_QUERY_KEY, clinic?.id] });
    },
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    createTreatments: createTreatmentsMutation.mutateAsync,
    addTreatment: addTreatmentMutation.mutateAsync,
    updateTreatment: updateTreatmentMutation.mutateAsync,
    deleteTreatment: deleteTreatmentMutation.mutateAsync,
  };
}