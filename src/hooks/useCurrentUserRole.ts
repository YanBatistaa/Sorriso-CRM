import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useTeam } from './useTeam';

/**
 * Um hook customizado que retorna a função (role) do utilizador atual.
 * @returns 'admin', 'doctor', 'receptionist' ou null se não for encontrado ou estiver a carregar.
 */
export const useCurrentUserRole = () => {
  const { user } = useAuth();
  const { members, isLoading } = useTeam();

  const role = useMemo(() => {
    if (isLoading || !user || !members) {
      return null; // A carregar ou ainda sem dados
    }
    const currentUserMemberInfo = members.find(member => member.user_id === user.id);
    return currentUserMemberInfo?.role || null;
  }, [user, members, isLoading]);

  return { role, isLoading };
};