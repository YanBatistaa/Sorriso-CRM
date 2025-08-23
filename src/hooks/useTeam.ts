import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from "./useClinic";
import type { ClinicMember } from "@/types/patient";

export const TEAM_QUERY_KEY = ["teamMembers"];

export function useTeam() {
  const { clinic } = useClinic();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [TEAM_QUERY_KEY, clinic?.id],
    queryFn: async () => {
      if (!clinic) return [];
      const { data, error } = await supabase.rpc('get_clinic_members', { p_clinic_id: clinic.id });
      if (error) throw error;
      return data as ClinicMember[];
    },
    enabled: !!clinic,
  });

  const createMember = useMutation({
    mutationFn: async (payload: { member_name: string, birth_date: string, role: string, can_view_all_patients: boolean }) => {
        if (!clinic) throw new Error("Clínica não encontrada");

        const { data, error } = await supabase.functions.invoke('create-team-member', {
            body: { ...payload, clinic_id: clinic.id, clinic_name: clinic.name }
        });

        if (error) throw error;
        return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, clinic?.id] }); }
  });

  // Atualizar a função updateMember para incluir a nova propriedade
  const updateMember = useMutation({
    mutationFn: async (payload: { memberId: string, role: string, can_view_all_patients: boolean, tag_color: string | null }) => {
        const { memberId, ...updateData } = payload;
        const { error } = await supabase
            .from("clinic_members")
            .update(updateData)
            .eq("id", memberId);
        if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, clinic?.id] }); }
  });

  const deleteMember = useMutation({
    mutationFn: async (memberId: string) => {
        const { error } = await supabase.from("clinic_members").delete().eq("id", memberId);
        if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [TEAM_QUERY_KEY, clinic?.id] }); }
  });

  return {
    members: query.data ?? [],
    isLoading: query.isLoading,
    createMember: createMember.mutateAsync,
    updateMember: updateMember.mutateAsync, // Expor a nova função
    deleteMember: deleteMember.mutateAsync,
  };
}