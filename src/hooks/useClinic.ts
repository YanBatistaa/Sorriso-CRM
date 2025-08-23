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
      const { data: memberData, error: memberError } = await supabase
        .from("clinic_members")
        .select("clinics(*)")
        .eq("user_id", user.id)
        .limit(1)
        .single();
      
      if (memberError && memberError.code !== 'PGRST116') {
        throw memberError;
      }
      return memberData ? memberData.clinics as Clinic : null;
    },
    enabled: !!user,
  });

  const createClinicMutation = useMutation({
    mutationFn: async (payload: { name: string, clinic_type: string, employee_count: number }) => {
      if (!user) throw new Error("Utilizador não autenticado");

      const { data, error } = await supabase.rpc('create_clinic_with_admin', {
        clinic_name: payload.name,
        clinic_type: payload.clinic_type,
        employee_count: payload.employee_count
      });

      if (error) throw error;
      return data as Clinic;
    },
    // --- CORREÇÃO APLICADA AQUI ---
    onSuccess: (newlyCreatedClinic) => {
      // Além de invalidar para outras partes da app,
      // nós definimos o dado no cache imediatamente.
      // Isto garante que qualquer componente que use o useClinic
      // terá acesso instantâneo à nova clínica.
      queryClient.setQueryData([CLINIC_QUERY_KEY, user?.id], newlyCreatedClinic);
      queryClient.invalidateQueries({ queryKey: [CLINIC_QUERY_KEY, user?.id] });
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
        queryClient.setQueryData([CLINIC_QUERY_KEY, user?.id], data);
    }
  });

  return {
    clinic: query.data,
    isLoading: query.isLoading,
    createClinic: createClinicMutation.mutateAsync,
    updateClinic: updateClinicMutation.mutateAsync,
  };
}