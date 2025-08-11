import { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { ALL_STATUSES, Patient, PatientStatus } from '@/types/patient';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Kanban } from '@/components/ui/kanban';

// Importações dos componentes
import { KanbanColumn } from '@/components/vendas/KanbanColumn';
import { PatientDetailsDialog } from '@/components/vendas/PatientDetailsDialog';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Vendas = () => {
  const { data: patients, updatePatient } = usePatients();
  const { toast } = useToast();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    const patient = patients.find(p => p.id === draggableId);
    const newStatus = destination.droppableId as PatientStatus;

    if (patient && patient.status !== newStatus) {
      updatePatient({ id: draggableId, status: newStatus })
        .catch(() => {
          toast({ title: "Erro", description: "Não foi possível mover o paciente.", variant: "destructive" });
        });
    }
  };

  const handleOpenEdit = () => {
    if (selectedPatient) setIsFormOpen(true);
  };

  const handleStatusChangeInDialog = (newStatus: PatientStatus) => {
    if (selectedPatient && selectedPatient.status !== newStatus) {
        updatePatient({ id: selectedPatient.id!, status: newStatus });
        setSelectedPatient(null);
    }
  };

  const handleSave = async (payload: Patient) => {
    // Esta verificação garante que temos um ID
    if (!payload.id) {
      toast({ title: "Erro", description: "ID do paciente não encontrado.", variant: "destructive" });
      return;
    }

    try {
      // CORREÇÃO: Passamos um objeto que satisfaz a tipagem exigida.
      // A verificação acima garante que `payload.id` é uma string.
      await updatePatient({ ...payload, id: payload.id });
      
      toast({ title: "Sucesso", description: "Paciente atualizado com sucesso." });
      setIsFormOpen(false);
      setSelectedPatient(null);
    } catch (e: any) {
      toast({ title: "Erro ao Salvar", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.24))] w-full flex flex-col">
      <h1 className="text-3xl font-semibold mb-6">Funil de Vendas</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <Kanban.Board>
          {ALL_STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              patients={patients.filter(p => p.status === status)}
              onClickPatient={setSelectedPatient}
            />
          ))}
        </Kanban.Board>
      </DragDropContext>

      <PatientDetailsDialog
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onEdit={handleOpenEdit}
        onStatusChange={handleStatusChangeInDialog}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          <PatientForm patient={selectedPatient} onClose={() => setIsFormOpen(false)} onSave={handleSave} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendas;