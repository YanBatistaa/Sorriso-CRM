import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "@/types/patient";
import { useAuth } from "./useAuth";

export const PATIENTS_QUERY_KEY = ["patients"];

export function usePatients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: PATIENTS_QUERY_KEY,
    queryFn: async () => {
      if (!user) return [] as Patient[];
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Patient[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async (payload: Omit<Patient, "id" | "created_at" | "updated_at" | "user_id">) => {
      if (!user) throw new Error("Usuário não autenticado");
      const insert = { ...payload, user_id: user.id } as any;
      const { data, error } = await supabase.from("patients").insert(insert).select("*").maybeSingle();
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: Partial<Patient> & { id: string }) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase.from("patients").update(rest).eq("id", id).select("*").maybeSingle();
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_QUERY_KEY }),
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    addPatient: addMutation.mutateAsync,
    updatePatient: updateMutation.mutateAsync,
    deletePatient: deleteMutation.mutateAsync,
  };
}
