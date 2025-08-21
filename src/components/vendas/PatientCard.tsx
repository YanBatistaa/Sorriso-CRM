import { Draggable } from 'react-beautiful-dnd';
import { Patient } from '@/types/patient';
import { Kanban } from '@/components/ui/kanban';

interface PatientCardProps {
  patient: Patient;
  index: number;
  onClick: () => void;
}

export function PatientCard({ patient, index, onClick }: PatientCardProps) {
  return (
    <Draggable draggableId={patient.id!} index={index}>
      {(provided, snapshot) => (
        <Kanban.Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={snapshot.isDragging ? 'bg-accent shadow-lg' : ''}
        >
          <p className="font-semibold">{patient.name}</p>
          {/* NOME DO TRATAMENTO ADICIONADO AQUI */}
          <p className="text-sm text-muted-foreground">{patient.treatments?.name || 'Sem tratamento'}</p>
          <p className="text-sm font-medium mt-2">
            {patient.treatment_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        </Kanban.Card>
      )}
    </Draggable>
  );
}