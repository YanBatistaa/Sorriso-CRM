import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePatients } from "@/hooks/usePatients";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

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

    // Lógica para encontrar o tratamento mais frequente do mês
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Receita Ganha (Mês)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">R$ {kpis.ganhosMes.toLocaleString("pt-BR")}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Novos Pacientes (Mês)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{kpis.novosMes}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Taxa de Conversão</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{kpis.convRate}%</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Orçamentos em Aberto</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{kpis.abertos}</p></CardContent>
        </Card>
        {/* CARD ALTERADO */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tratamento do Mês</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{kpis.mostFrequentTreatment}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Receita por Status</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaPorStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fluxo de Novos Pacientes</CardTitle></CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={novosPacientesMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;