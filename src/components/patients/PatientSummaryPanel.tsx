import type { Patient } from "@/types/patient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PatientSummaryPanel = ({ patients }: { patients: Patient[] }) => {
  const total = patients.length;
  const pre = patients.filter(p => p.status === 'Pré-orçamento').length;
  const abertos = patients.filter(p => p.status === 'Em aberto').length;
  const andamento = patients.filter(p => p.status === 'Em andamento').length;
  const ganhos = patients.filter(p => p.status === 'Ganha').length;
  const perdidos = patients.filter(p => p.status === 'Perdida').length;

  const blocks = [
    { label: 'Total', value: total },
    { label: 'Pré-orçamento', value: pre },
    { label: 'Em aberto', value: abertos },
    { label: 'Em andamento', value: andamento },
    { label: 'Ganha', value: ganhos },
    { label: 'Perdida', value: perdidos },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {blocks.map((b) => (
        <Card key={b.label}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{b.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{b.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
