import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Clinic } from "@/types/patient";

export const CLINIC_QUERY_KEY = ["clinic"];

export function useClinic() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [CLINIC_QUERY_KEY, user?.id],
    queryFn: async () => {
      if (!user) return null;
      // A query para encontrar a clínica do utilizador agora é feita através da tabela de membros
      const { data: memberData, error: memberError } = await supabase
        .from("clinic_members")
        .select("clinics(*)") // O Supabase faz o "join" automaticamente
        .eq("user_id", user.id)
        .limit(1)
        .single();
      
      if (memberError && memberError.code !== 'PGRST116') { // PGRST116 = 0 rows
        throw memberError;
      }
      // O resultado vem aninhado, por isso retornamos memberData.clinics
      return memberData ? memberData.clinics as Clinic : null;
    },
    enabled: !!user,
  });

  const createClinicMutation = useMutation({
    // O payload corresponde aos argumentos da nossa função RPC
    mutationFn: async (payload: { name: string, clinic_type: string, employee_count: number }) => {
      if (!user) throw new Error("Utilizador não autenticado");

      // Chamada à função RPC
      const { data, error } = await supabase.rpc('create_clinic_with_admin', {
        clinic_name: payload.name,
        clinic_type: payload.clinic_type,
        employee_count: payload.employee_count
      });

      if (error) throw error;
      return data as Clinic;
    },
    onSuccess: () => {
      // Invalida a query para forçar a busca dos novos dados da clínica
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