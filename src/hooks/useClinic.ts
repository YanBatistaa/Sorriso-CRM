import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Clinic } from "@/types/patient";

export const CLINIC_QUERY_KEY = ["clinic"];

export function useClinic() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CLINIC_QUERY_KEY,
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("owner_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      return data as Clinic | null;
    },
    enabled: !!user,
  });

  const createClinicMutation = useMutation({
    mutationFn: async (payload: Omit<Clinic, "id" | "owner_id" | "logo_url">) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("clinics")
        .insert({ ...payload, owner_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Clinic;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLINIC_QUERY_KEY });
    },
  });
  
  const updateClinicMutation = useMutation({
    mutationFn: async (payload: Partial<Clinic> & { id: string }) => {
        const { id, ...rest } = payload;
        const { data, error } = await supabase
            .from("clinics")
            .update(rest)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as Clinic;
    },
    onSuccess: (data) => {
        // Atualiza o cache com os dados novos para refletir na UI imediatamente
        queryClient.setQueryData(CLINIC_QUERY_KEY, data);
    }
  });

  return {
    clinic: query.data,
    isLoading: query.isLoading,
    createClinic: createClinicMutation.mutateAsync,
    updateClinic: updateClinicMutation.mutateAsync,
  };
}