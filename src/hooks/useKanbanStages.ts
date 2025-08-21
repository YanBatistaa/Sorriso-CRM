import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { KanbanStage } from "@/types/patient";
import { useClinic } from "./useClinic";

export const STAGES_QUERY_KEY = ["kanbanStages"];

export function useKanbanStages() {
  const { clinic } = useClinic();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [STAGES_QUERY_KEY, clinic?.id],
    queryFn: async () => {
      if (!clinic) return [] as KanbanStage[];
      const { data, error } = await supabase
        .from("kanban_stages")
        .select("*")
        .eq("clinic_id", clinic.id)
        .order("order", { ascending: true });
      if (error) throw error;
      return data as KanbanStage[];
    },
    enabled: !!clinic,
  });

  const addStage = useMutation({
    mutationFn: async (payload: { name: string, order: number }) => {
        if (!clinic) throw new Error("Clínica não encontrada");
        const { data, error } = await supabase
            .from("kanban_stages")
            .insert({ ...payload, clinic_id: clinic.id })
            .select().single();
        if (error) throw error;
        return data as KanbanStage;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [STAGES_QUERY_KEY, clinic?.id] });
    }
  });

  const updateStage = useMutation({
    mutationFn: async (payload: Partial<KanbanStage> & { id: string }) => {
        const { id, ...rest } = payload;
        const { data, error } = await supabase.from("kanban_stages").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data as KanbanStage;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [STAGES_QUERY_KEY, clinic?.id] });
    }
  });

  const updateStageOrder = useMutation({
    mutationFn: async (stages: { id: string; order: number }[]) => {
      const updates = stages.map(stage => 
        supabase.from('kanban_stages').update({ order: stage.order }).eq('id', stage.id)
      );
      const results = await Promise.all(updates);
      results.forEach(({ error }) => {
        if (error) throw error;
      });
      return results;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [STAGES_QUERY_KEY, clinic?.id] });
    }
  });

  const deleteStage = useMutation({
    mutationFn: async (id: string) => {
        const { error } = await supabase.from("kanban_stages").delete().eq("id", id);
        if (error) throw error;
        return id;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [STAGES_QUERY_KEY, clinic?.id] });
    }
  });

  return {
    stages: query.data ?? [],
    isLoading: query.isLoading,
    addStage: addStage.mutateAsync,
    updateStage: updateStage.mutateAsync,
    updateStageOrder: updateStageOrder.mutateAsync,
    deleteStage: deleteStage.mutateAsync,
  };
}