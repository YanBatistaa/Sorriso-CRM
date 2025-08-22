import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import SidebarLayout from "@/components/layout/SidebarLayout";

const Index = lazy(() => import("./pages/Index"));
const AuthPage = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Patients = lazy(() => import("./pages/Patients"));
const Vendas = lazy(() => import("./pages/Vendas"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ClinicSettingsPage = lazy(() => import("./pages/Settings"));
const AcceptInvitePage = lazy(() => import("./pages/AcceptInvite"));

const queryClient = new QueryClient();

// O RequireAuth agora apenas verifica se o usuário está logado
const RequireAuth = () => {
  const { session, initializing } = useAuth();
  if (initializing) {
    return <div className="min-h-screen grid place-items-center"><p className="text-muted-foreground">Carregando...</p></div>;
  }
  if (!session) {
    return <Navigate to="/auth" replace />;
  }
  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen grid place-items-center"><p className="text-muted-foreground">Carregando...</p></div>}>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

              <Route element={<RequireAuth />}>
                <Route element={<SidebarLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="patients" element={<Patients />} />
                  <Route path="vendas" element={<Vendas />} />
                  <Route path="settings" element={<ClinicSettingsPage />} />
                </Route>
              </Route>
               {/* Rota de convite será pública, pois o utilizador pode não ter uma conta ainda */}
               <Route path="/accept-invite" element={<AcceptInvitePage />} /> 

               <Route path="/auth" element={<AuthPage />} />
             

              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;