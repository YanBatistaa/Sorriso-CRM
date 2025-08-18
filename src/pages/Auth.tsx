import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Componentes da UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";

const Auth = () => {
  const { signIn, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    document.title = "Entrar • Sorriso CRM";
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({ title: "Erro", description: error });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    // Adicionado padding para telas pequenas
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <Panel className="w-full max-w-md">
        <PanelHeader>
          <PanelTitle className="text-2xl">Bem-vindo(a) de volta!</PanelTitle>
        </PanelHeader>
        <PanelContent className="pt-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={loading}>
              {loading ? "Aguarde..." : "Entrar"}
            </Button>
          </div>
        </PanelContent>
      </Panel>
    </div>
  );
};

export default Auth;