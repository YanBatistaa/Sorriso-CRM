import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "@/types/patient";
import { useAuth } from "./useAuth";
import { useClinic } from "./useClinic";

export const PATIENTS_QUERY_KEY = ["patients"];

export function usePatients() {
  const { user } = useAuth();
  const { clinic } = useClinic();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PATIENTS_QUERY_KEY, clinic?.id],
    queryFn: async () => {
      if (!user || !clinic) return [] as Patient[];
      // ATUALIZAÇÃO: Adicionado "treatments ( name )" para buscar o nome do tratamento relacionado
      const { data, error } = await supabase
        .from("patients")
        .select("*, treatments ( name )")
        .eq("clinic_id", clinic.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return (data ?? []) as Patient[];
    },
    enabled: !!user && !!clinic,
  });

  const addPatient = useMutation({
    mutationFn: async (payload: Omit<Patient, "id" | "created_at" | "updated_at" | "user_id" | "treatments">) => {
      if (!user || !clinic) throw new Error("Usuário ou clínica não autenticados");
      const insertData = { ...payload, user_id: user.id, clinic_id: clinic.id };
      const { data, error } = await supabase.from("patients").insert(insertData).select("*").single();
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY, clinic?.id] }),
  });

  const updatePatient = useMutation({
    mutationFn: async (payload: Partial<Patient> & { id: string }) => {
      const { id, ...rest } = payload;
      const { data, error } = await supabase.from("patients").update(rest).eq("id", id).select("*").single();
      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY, clinic?.id] }),
  });

  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY, clinic?.id] }),
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    addPatient: addPatient.mutateAsync,
    updatePatient: updatePatient.mutateAsync,
    deletePatient: deletePatient.mutateAsync,
  };
}