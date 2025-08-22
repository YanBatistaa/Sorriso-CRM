import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Função para verificar e processar um convite após o login
    const processInvitation = async (user: User) => {
      // O Supabase armazena os dados do convite em user_metadata
      const { clinic_id, role } = user.user_metadata;

      if (clinic_id && role) {
        console.log(`Utilizador ${user.email} aceitou o convite para a clínica ${clinic_id} com a função ${role}.`);

        // Insere o utilizador como membro da clínica
        const { error } = await supabase.from('clinic_members').insert({
          user_id: user.id,
          clinic_id: clinic_id,
          role: role,
        });

        if (error) {
          console.error("Erro ao adicionar membro à clínica:", error);
          return;
        }

        // Limpa os metadados do convite para não serem processados novamente
        await supabase.auth.updateUser({
          data: {
            clinic_id: null,
            role: null,
          }
        });
        
        console.log("Membro adicionado à clínica com sucesso.");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);

      // Se o evento for SIGNED_IN, verificamos se veio de um convite
      if (event === "SIGNED_IN" && sess?.user) {
        processInvitation(sess.user);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo<AuthContextValue>(() => ({ user, session, initializing, signIn, signOut }), [user, session, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};