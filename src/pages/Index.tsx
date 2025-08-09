import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { session, initializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (initializing) return;
    navigate(session ? "/dashboard" : "/auth", { replace: true });
  }, [session, initializing, navigate]);

  return null;
};

export default Index;
