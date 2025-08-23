import { useState, useEffect, useMemo } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { Patient } from '@/types/patient';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Kanban } from '@/components/ui/kanban';
import { KanbanColumn } from '@/components/vendas/KanbanColumn';
import { PatientDetailsDialog } from '@/components/vendas/PatientDetailsDialog';
import { PatientForm } from '@/components/patients/PatientForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useKanbanStages } from '@/hooks/useKanbanStages';
import { useTeam } from '@/hooks/useTeam';
import { getSpecialistColorClass } from '@/lib/color-utils';

export interface SpecialistInfo {
    fullName: string;
    colorClass: string;
}

const Vendas = () => {
  const { data: serverPatients, updatePatient } = usePatients();
  const { stages, isLoading: areStagesLoading } = useKanbanStages();
  const { members } = useTeam();
  const { toast } = useToast();
  
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const specialistsMap = useMemo(() => {
    const map = new Map<string, SpecialistInfo>();
    const specialists = members.filter(m => m.role === 'doctor');
    specialists.forEach(s => {
        map.set(s.user_id, {
            fullName: s.full_name || s.email,
            colorClass: getSpecialistColorClass(s.user_id)
        });
    });
    return map;
  }, [members]);

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

    const newStatus = destination.droppableId;
    
    const originalPatientList = [...patientList];
    
    const updatedPatient = { ...patientToMove, status: newStatus };
    const newList = patientList.filter(p => p.id !== draggableId);
    newList.splice(destination.index, 0, updatedPatient);
    setPatientList(newList);

    updatePatient({ id: draggableId, status: newStatus })
      .catch(() => {
        toast({ title: "Erro", description: "Não foi possível mover o paciente.", variant: "destructive" });
        setPatientList(originalPatientList);
      });
  };

  const handleOpenEdit = () => { if (selectedPatient) setIsFormOpen(true); };
  
  const handleStatusChangeInDialog = (newStatus: string) => {
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
    <div className="flex flex-col h-full w-full">
      <h1 className="text-3xl font-semibold mb-6 shrink-0">Funil de Vendas</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <Kanban.Board className="h-full items-stretch">
            {areStagesLoading ? <p>Carregando funil...</p> : stages.map(stage => (
              <KanbanColumn
                key={stage.id}
                status={stage.name}
                patients={patientList.filter(p => p.status === stage.name)}
                onClickPatient={setSelectedPatient}
                specialistsMap={specialistsMap}
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