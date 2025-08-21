import { Patient } from '@/types/patient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';
import { formatCPF, formatPhone } from '@/lib/formatters';
import { useKanbanStages } from '@/hooks/useKanbanStages';

interface PatientDetailsDialogProps {
  patient: Patient | null;
  onClose: () => void;
  onStatusChange: (newStatus: string) => void;
  onEdit: () => void;
}

export function PatientDetailsDialog({ patient, onClose, onStatusChange, onEdit }: PatientDetailsDialogProps) {
  const { stages } = useKanbanStages();
  if (!patient) return null;

  return (
    <Dialog open={!!patient} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patient.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <p><span className="font-semibold">Tratamento:</span> {patient.treatments?.name || 'Nenhum'}</p>
          <p><span className="font-semibold">Valor:</span> {patient.treatment_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <p><span className="font-semibold">Telefone:</span> +55 {formatPhone(patient.phone)}</p>
          <p><span className="font-semibold">Email:</span> {patient.email}</p>
          <p><span className="font-semibold">CPF:</span> {formatCPF(patient.cpf)}</p>
          
          {patient.description && (
            <div className="border-t pt-4">
              <p className="font-semibold mb-2">Descrição:</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{patient.description}</p>
            </div>
          )}
          
          <div className="space-y-2 border-t pt-4">
            <Label>Mudar Status</Label>
            <Select value={patient.status} onValueChange={(v) => onStatusChange(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={onEdit}>Editar Paciente</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}