import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Users, LogOut, DollarSign, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Componente para o conteúdo da navegação, para evitar repetição
const NavigationLinks = () => (
  <nav className="flex-1 px-4 py-4 space-y-1">
    <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
      <Home className="h-4 w-4" /> Dashboard
    </NavLink>
    <NavLink to="/patients" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
      <Users className="h-4 w-4" /> Pacientes
    </NavLink>
    <NavLink to="/vendas" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
      <DollarSign className="h-4 w-4" /> Vendas
    </NavLink>
  </nav>
);

const SidebarLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="h-screen w-full flex bg-background">
      {/* --- SIDEBAR PARA DESKTOP --- */}
      <aside className="hidden md:flex w-[260px] flex-col border-r bg-card">
        <div className="h-16 flex items-center justify-center px-6 border-b shrink-0">
          <img 
            src="/sorriso-crm.png" 
            alt="Sorriso CRM Logo" 
            className="h-12"
          />
        </div>
        <NavigationLinks />
        <div className="mt-auto p-4 shrink-0">
          <Button variant="secondary" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      
      {/* --- CONTAINER PRINCIPAL (CONTEÚDO + HEADER MOBILE) --- */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* --- CABEÇALHO PARA MOBILE --- */}
        <header className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-card shrink-0">
          <img 
            src="/sorriso-crm.png" 
            alt="Sorriso CRM Logo" 
            className="h-10"
          />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[260px] p-0 flex flex-col">
              <div className="h-16 flex items-center justify-center px-6 border-b shrink-0">
                <img src="/sorriso-crm.png" alt="Sorriso CRM Logo" className="h-12" />
              </div>
              <NavigationLinks />
              <div className="mt-auto p-4 shrink-0">
                <Button variant="secondary" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {/* --- ÁREA DE CONTEÚDO COM SCROLL --- */}
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