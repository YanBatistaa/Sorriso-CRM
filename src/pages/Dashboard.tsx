import { useEffect, useMemo } from "react";
import { usePatients } from "@/hooks/usePatients";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// Importa o componente Panel
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";

const Dashboard = () => {
  const { data: patients } = usePatients();

  useEffect(() => {
    document.title = "Dashboard • Sorriso CRM";
  }, []);

  const kpis = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPatients = patients.filter(p => new Date(p.created_at ?? p.birth_date) >= monthStart);
    const ganhos = patients.filter(p => p.status === "Ganha").length;
    const perdidos = patients.filter(p => p.status === "Perdida").length;
    const ganhosMes = monthPatients.filter(p => p.status === "Ganha").reduce((sum, p) => sum + (p.treatment_value || 0), 0);
    const novosMes = monthPatients.length;
    const abertos = patients.filter(p => p.status === "Em aberto").length;
    const totalConclusoes = ganhos + perdidos;
    const convRate = totalConclusoes > 0 ? Math.round((ganhos / totalConclusoes) * 100) : 0;
    const treatmentCounts = monthPatients.reduce((acc, patient) => {
      if (patient.treatment) {
        acc[patient.treatment] = (acc[patient.treatment] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const mostFrequentTreatment = Object.keys(treatmentCounts).reduce((a, b) =>
      treatmentCounts[a] > treatmentCounts[b] ? a : b,
      "Nenhum"
    );
    return { ganhosMes, novosMes, convRate, abertos, mostFrequentTreatment };
  }, [patients]);

  const receitaPorStatus = useMemo(() => {
    const map: Record<string, number> = {};
    patients.forEach(p => { map[p.status] = (map[p.status] || 0) + (p.treatment_value || 0); });
    return Object.entries(map).map(([status, total]) => ({ status, total }));
  }, [patients]);

  const novosPacientesMes = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      const d = new Date(p.created_at ?? p.birth_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total }));
  }, [patients]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI Panels com estilo corrigido */}
        <Panel>
          <PanelHeader className="p-4 pb-2">
            <PanelTitle className="text-sm font-medium">Receita Ganha (Mês)</PanelTitle>
          </PanelHeader>
          <PanelContent className="p-4 pt-0">
            <p className="text-2xl font-bold">R$ {kpis.ganhosMes.toLocaleString("pt-BR")}</p>
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader className="p-4 pb-2">
            <PanelTitle className="text-sm font-medium">Novos Pacientes (Mês)</PanelTitle>
          </PanelHeader>
          <PanelContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{kpis.novosMes}</p>
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader className="p-4 pb-2">
            <PanelTitle className="text-sm font-medium">Taxa de Conversão</PanelTitle>
          </PanelHeader>
          <PanelContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{kpis.convRate}%</p>
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader className="p-4 pb-2">
            <PanelTitle className="text-sm font-medium">Orçamentos em Aberto</PanelTitle>
          </PanelHeader>
          <PanelContent className="p-4 pt-0">
            <p className="text-2xl font-bold">{kpis.abertos}</p>
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader className="p-4 pb-2">
            <PanelTitle className="text-sm font-medium">Tratamento do Mês</PanelTitle>
          </PanelHeader>
          <PanelContent className="p-4 pt-0">
            <p className="text-xl font-bold break-words min-h-[56px] flex items-center">{kpis.mostFrequentTreatment}</p>
          </PanelContent>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel>
          <PanelHeader><PanelTitle>Receita por Status</PanelTitle></PanelHeader>
          <PanelContent className="h-80 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaPorStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </PanelContent>
        </Panel>
        <Panel>
          <PanelHeader><PanelTitle>Fluxo de Novos Pacientes</PanelTitle></PanelHeader>
          <PanelContent className="h-80 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={novosPacientesMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </PanelContent>
        </Panel>
      </div>
    </div>
  );
};

export default Dashboard;