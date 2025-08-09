import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { signIn, signUp, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    document.title = mode === "login" ? "Entrar • SmileTrack" : "Cadastrar • SmileTrack";
  }, [mode]);

  const title = useMemo(() => (mode === "login" ? "Bem-vindo(a)" : "Crie sua conta"), [mode]);

  const handleSubmit = async () => {
    setLoading(true);
    const action = mode === "login" ? signIn : signUp;
    const { error } = await action(email, password);
    setLoading(false);

    if (error) {
      toast({ title: "Erro", description: error });
    } else {
      if (mode === "signup") {
        toast({ title: "Verifique seu e-mail", description: "Enviamos um link de confirmação." });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </Button>
          <div className="text-sm text-muted-foreground text-center">
            {mode === "login" ? (
              <button className="underline" onClick={() => setMode("signup")}>Não tem conta? Cadastre-se</button>
            ) : (
              <button className="underline" onClick={() => setMode("login")}>Já possui conta? Entrar</button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
