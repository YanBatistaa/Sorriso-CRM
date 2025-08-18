import { useState, useEffect } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { ALL_STATUSES, Patient, PatientStatus } from '@/types/patient';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Kanban } from '@/components/ui/kanban';
import { KanbanColumn } from '@/components/vendas/KanbanColumn';
import { PatientDetailsDialog } from '@/components/vendas/PatientDetailsDialog';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const Vendas = () => {
  const { data: serverPatients, updatePatient } = usePatients();
  const { toast } = useToast();
  
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    setPatientList(serverPatients);
  }, [serverPatients]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }

    const patientToMove = patientList.find(p => p.id === draggableId);
    if (!patientToMove) return;

    const newStatus = destination.droppableId as PatientStatus;
    const originalPatientList = [...patientList];

    setPatientList(currentList => {
      const listWithoutMovedPatient = currentList.filter(p => p.id !== draggableId);
      const updatedPatient = { ...patientToMove, status: newStatus };
      listWithoutMovedPatient.splice(destination.index, 0, updatedPatient);
      return listWithoutMovedPatient;
    });

    updatePatient({ id: draggableId, status: newStatus })
      .catch(() => {
        toast({ title: "Erro", description: "Não foi possível mover o paciente. Revertendo.", variant: "destructive" });
        setPatientList(originalPatientList);
      });
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
    if (!payload.id) return;
    try {
      await updatePatient({ ...payload, id: payload.id });
      toast({ title: "Sucesso", description: "Paciente atualizado." });
      setIsFormOpen(false);
      setSelectedPatient(null);
    } catch(e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    // Container principal que define o layout flexível
    <div className="flex flex-col h-full w-full">
      <h1 className="text-3xl font-semibold mb-6 shrink-0">Funil de Vendas</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Container que permite o scroll horizontal */}
        <div className="flex-1 overflow-x-auto pb-4">
          <Kanban.Board className="h-full items-stretch">
            {ALL_STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                patients={patientList.filter(p => p.status === status)}
                onClickPatient={setSelectedPatient}
              />
            ))}
          </Kanban.Board>
        </div>
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