import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Users, LogOut, DollarSign, Menu, Settings, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useClinic } from "@/hooks/useClinic";

// Componente para o conteúdo da navegação
const NavigationLinks = () => (
  <nav className="flex-1 px-4 py-4 space-y-1">
    <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
      <Home className="h-4 w-4" /> Dashboard
    </NavLink>
    <NavLink to="/patients" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
      <Users className="h-4 w-4" /> Pacientes
    </NavLink>
    <NavLink to="/vendas" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
      <DollarSign className="h-4 w-4" /> Vendas
    </NavLink>
  </nav>
);

// Menu inferior com configurações e sair
const SidebarFooter = ({ onSignOut }: { onSignOut: () => void }) => (
    <div className="mt-auto p-4 space-y-1 border-t">
        <NavLink to="/settings" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
            <Settings className="h-4 w-4" /> Configurações
        </NavLink>
        <Button variant="ghost" className="w-full justify-start gap-3 px-3" onClick={onSignOut}>
            <LogOut className="h-4 w-4" /> Sair
        </Button>
    </div>
);

const SidebarLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { clinic } = useClinic();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  const SidebarHeaderContent = () => (
    <div className="h-16 flex items-center px-4 border-b shrink-0 gap-3">
      <div className='w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0'>
        <Building2 className='h-5 w-5' />
      </div>
      <span className="font-semibold text-lg truncate">{clinic?.name || "Sorriso CRM"}</span>
    </div>
  );
  
  return (
    <div className="h-screen w-full flex bg-background">
      {/* --- SIDEBAR PARA DESKTOP --- */}
      <aside className="hidden md:flex w-[260px] flex-col border-r bg-card">
        <SidebarHeaderContent />
        <NavigationLinks />
        <SidebarFooter onSignOut={handleSignOut} />
      </aside>
      
      {/* --- CONTAINER PRINCIPAL --- */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* --- CABEÇALHO PARA MOBILE --- */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-card shrink-0">
           <div className="flex items-center gap-3 font-semibold truncate">
             <div className='w-8 h-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0'>
                <Building2 className='h-5 w-5' />
             </div>
             <span className="truncate">{clinic?.name}</span>
           </div>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] p-0 flex flex-col">
              <SidebarHeaderContent />
              <NavigationLinks />
              <SidebarFooter onSignOut={handleSignOut} />
            </SheetContent>
          </Sheet>
        </header>

        {/* --- ÁREA DE CONTEÚDO --- */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;