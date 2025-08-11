import { useState, useEffect } from 'react';
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
  const { data: serverPatients, updatePatient } = usePatients();
  const { toast } = useToast();
  
  // Estado local para a atualização otimista
  const [patientList, setPatientList] = useState<Patient[]>([]);
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Sincroniza o estado local com os dados do servidor quando eles chegam
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

    // --- LÓGICA DA ATUALIZAÇÃO OTIMISTA ---
    
    // 1. Guarda o estado original para reverter em caso de erro
    const originalPatientList = [...patientList];

    // 2. Atualiza a interface INSTANTANEAMENTE
    setPatientList(currentList => {
      const newList = currentList.filter(p => p.id !== draggableId);
      const updatedPatient = { ...patientToMove, status: newStatus };
      
      // Encontra a lista da coluna de destino e insere o paciente na nova posição
      const destColumnPatients = newList.filter(p => p.status === newStatus);
      destColumnPatients.splice(destination.index, 0, updatedPatient);

      // Reagrupa a lista de pacientes
      const otherPatients = newList.filter(p => p.status !== newStatus);
      return [...otherPatients, ...destColumnPatients];
    });

    // 3. Envia a atualização para o banco de dados em segundo plano
    updatePatient({ id: draggableId, status: newStatus })
      .catch(() => {
        toast({ title: "Erro", description: "Não foi possível mover o paciente. Revertendo.", variant: "destructive" });
        // 4. Em caso de erro, reverte a interface para o estado original
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
    <div className="h-[calc(100vh-theme(spacing.24))] w-full flex flex-col">
      <h1 className="text-3xl font-semibold mb-6">Funil de Vendas</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <Kanban.Board>
          {ALL_STATUSES.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              // O componente agora renderiza a partir da nossa lista local
              patients={patientList.filter(p => p.status === status)}
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