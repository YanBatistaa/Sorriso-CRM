import { useEffect, useMemo, useState } from "react";
import { usePatients } from "@/hooks/usePatients";
import { getWeek, getYear, format, parse, isValid, startOfWeek, addWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RevenueByStatusChart } from "@/components/dashboard/RevenueByStatusChart";
import { NewPatientsFlowChart } from "@/components/dashboard/NewPatientsFlowChart";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useClinic } from "@/hooks/useClinic";
import { useAuth } from "@/hooks/useAuth";
import { ClinicSetupWizard } from "@/components/setup/ClinicSetupWizard"; // ATUALIZADO

const Dashboard = () => {
  const { data: patients } = usePatients();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('month');
  
  const { clinic, isLoading: isClinicLoading } = useClinic();
  const { signOut } = useAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    document.title = "Dashboard • Syncro";
  }, []);

  useEffect(() => {
    if (!isClinicLoading && !clinic) {
      setShowSetupModal(true);
    }
  }, [isClinicLoading, clinic]);

  const kpis = useMemo(() => {
    // ... (lógica dos kpis permanece a mesma) ...
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthPatients = patients.filter(p => new Date(p.created_at!) >= monthStart);
    const ganhos = patients.filter(p => p.status === "Ganha").length;
    const perdidos = patients.filter(p => p.status === "Perdida").length;
    const ganhosMes = monthPatients.filter(p => p.status === "Ganha").reduce((sum, p) => sum + (p.treatment_value || 0), 0);
    const novosMes = monthPatients.length;
    const abertos = patients.filter(p => p.status === "Em aberto").length;
    const totalConclusoes = ganhos + perdidos;
    const convRate = totalConclusoes > 0 ? Math.round((ganhos / totalConclusoes) * 100) : 0;
    const treatmentCounts = monthPatients.reduce((acc, patient) => {
      const treatmentName = patient.treatments?.name;
      if (treatmentName) {
        acc[treatmentName] = (acc[treatmentName] || 0) + 1;
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

  const newPatientsData = useMemo(() => {
    // ... (lógica dos dados do gráfico permanece a mesma) ...
    const counts: Record<string, number> = {};
    patients.forEach(p => {
      const d = new Date(p.created_at!);
      if (!isValid(d)) return;
      let key = '';
      if (timeRange === 'month') {
        key = format(d, "yyyy-MM");
      } else {
        const week = getWeek(d, { weekStartsOn: 1 });
        const year = getYear(d);
        key = `${year}-S${String(week).padStart(2, '0')}`;
      }
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([period, total]) => ({ period, total }));
  }, [patients, timeRange]);

  return (
    <>
      <Dialog open={showSetupModal}>
        <DialogContent className="max-w-2xl" hideCloseButton>
          <ClinicSetupWizard
            onSuccess={() => setShowSetupModal(false)}
            onExit={signOut}
          />
        </DialogContent>
      </Dialog>
    
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        {/* ... (resto do conteúdo do dashboard) ... */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Panel>
            <PanelHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <PanelTitle className="text-sm font-medium">Receita Ganha (Mês)</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <p className="text-2xl font-bold">R$ {kpis.ganhosMes.toLocaleString("pt-BR")}</p>
            </PanelContent>
          </Panel>
          <Panel>
            <PanelHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <PanelTitle className="text-sm font-medium">Novos Pacientes (Mês)</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <p className="text-2xl font-bold">{kpis.novosMes}</p>
            </PanelContent>
          </Panel>
          <Panel>
            <PanelHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <PanelTitle className="text-sm font-medium">Taxa de Conversão</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <p className="text-2xl font-bold">{kpis.convRate}%</p>
            </PanelContent>
          </Panel>
          <Panel>
            <PanelHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <PanelTitle className="text-sm font-medium">Orçamentos em Aberto</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <p className="text-2xl font-bold">{kpis.abertos}</p>
            </PanelContent>
          </Panel>
          <Panel className="col-span-2 md:col-span-3 lg:col-span-1">
            <PanelHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <PanelTitle className="text-sm font-medium">Tratamento do Mês</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <p className="text-2xl font-bold truncate">{kpis.mostFrequentTreatment}</p>
            </PanelContent>
          </Panel>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <PanelHeader><PanelTitle>Receita por Status</PanelTitle></PanelHeader>
            <PanelContent className="h-80 pt-0">
              <RevenueByStatusChart data={receitaPorStatus} />
            </PanelContent>
          </Panel>
          <Panel>
            <PanelHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <PanelTitle>Fluxo de Novos Pacientes</PanelTitle>
              <ToggleGroup 
                type="single" 
                defaultValue="month"
                onValueChange={(value) => {
                  if (value) setTimeRange(value as 'week' | 'month');
                }}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="week" aria-label="Ver por semana">Semana</ToggleGroupItem>
                <ToggleGroupItem value="month" aria-label="Ver por mês">Mês</ToggleGroupItem>
              </ToggleGroup>
            </PanelHeader>
            <PanelContent className="h-80 pt-0">
              <NewPatientsFlowChart data={newPatientsData} />
            </PanelContent>
          </Panel>
        </div>
      </div>
    </>
  );
};

export default Dashboard;