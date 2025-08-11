import { Patient, PatientStatus, ALL_STATUSES } from '@/types/patient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '../ui/label';

interface PatientDetailsDialogProps {
  patient: Patient | null;
  onClose: () => void;
  onStatusChange: (newStatus: PatientStatus) => void;
  onEdit: () => void;
}

export function PatientDetailsDialog({ patient, onClose, onStatusChange, onEdit }: PatientDetailsDialogProps) {
  if (!patient) return null;

  return (
    <Dialog open={!!patient} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patient.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p><span className="font-semibold">Tratamento:</span> {patient.treatment}</p>
          <p><span className="font-semibold">Valor:</span> {patient.treatment_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
          <p><span className="font-semibold">Telefone:</span> {patient.phone}</p>
          <p><span className="font-semibold">Email:</span> {patient.email}</p>
          <p><span className="font-semibold">CPF:</span> {patient.cpf}</p>
          
          <div className="space-y-2">
            <Label>Mudar Status</Label>
            <Select value={patient.status} onValueChange={(v) => onStatusChange(v as PatientStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
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