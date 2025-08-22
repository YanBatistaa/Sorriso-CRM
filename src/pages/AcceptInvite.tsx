import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';

const AcceptInvitePage = () => {
  const { session, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o utilizador já estiver logado e a sessão estiver carregada,
    // o hook de autenticação (useAuth) tratará da associação à clínica.
    // Podemos redirecioná-lo para o dashboard.
    if (!initializing && session) {
      navigate('/dashboard', { replace: true });
    }
  }, [session, initializing, navigate]);

  // Enquanto a sessão está a ser verificada, mostramos uma mensagem de carregamento.
  // Se não houver sessão, o utilizador será redirecionado para o login pelo fluxo normal do Supabase.
  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <Panel className="w-full max-w-md">
        <PanelHeader>
          <PanelTitle className="text-2xl">A aceitar convite...</PanelTitle>
        </PanelHeader>
        <PanelContent>
          <PanelDescription>
            Estamos a verificar os detalhes do seu convite. Se necessário, ser-lhe-á pedido que crie uma conta ou faça login.
          </PanelDescription>
        </PanelContent>
      </Panel>
    </div>
  );
};

export default AcceptInvitePage;