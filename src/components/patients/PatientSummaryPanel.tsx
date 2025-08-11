import type { Patient } from "@/types/patient";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";

export const PatientSummaryPanel = ({ patients }: { patients: Patient[] }) => {
  const pre = patients.filter(p => p.status === 'Pré-orçamento');
  const abertos = patients.filter(p => p.status === 'Em aberto');
  const andamento = patients.filter(p => p.status === 'Em andamento');
  const ganhos = patients.filter(p => p.status === 'Ganha');
  const perdidos = patients.filter(p => p.status === 'Perdida');

  const sumValues = (patientList: Patient[]) => patientList.reduce((sum, p) => sum + (p.treatment_value || 0), 0);

  const blocks = [
    { label: 'Total', value: patients.length, amount: sumValues(patients) },
    { label: 'Pré-orçamento', value: pre.length, amount: sumValues(pre) },
    { label: 'Em aberto', value: abertos.length, amount: sumValues(abertos) },
    { label: 'Em andamento', value: andamento.length, amount: sumValues(andamento) },
    { label: 'Ganha', value: ganhos.length, amount: sumValues(ganhos) },
    { label: 'Perdida', value: perdidos.length, amount: sumValues(perdidos) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {blocks.map((b) => (
        <Panel key={b.label}>
          <PanelHeader className="p-4 pb-2">
            <PanelTitle className="text-sm font-medium">{b.label}</PanelTitle>
          </PanelHeader>
          <PanelContent className="p-4 pt-0">
            <p className="text-xl font-bold">{b.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            <p className="text-xs text-muted-foreground">{b.value} paciente(s)</p>
          </PanelContent>
        </Panel>
      ))}
    </div>
  );
};