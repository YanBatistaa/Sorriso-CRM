import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Home, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const SidebarLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-[260px_1fr]">
      <aside className="border-r bg-card flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <span className="text-lg font-semibold">Sorriso CRM</span>
        </div>
        <nav className="p-4 space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
            <Home className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/patients" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md transition ${isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}>
            <Users className="h-4 w-4" /> Pacientes
          </NavLink>
        </nav>
        <div className="mt-auto p-4">
          <Button variant="secondary" className="w-full" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </aside>
      <main className="min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
