import { Draggable } from 'react-beautiful-dnd';
import { Patient } from '@/types/patient';
import { Kanban } from '@/components/ui/kanban';
import { SpecialistInfo } from '@/pages/Vendas';
import { cn } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
  index: number;
  onClick: () => void;
  specialistsMap: Map<string, SpecialistInfo>;
}

export function PatientCard({ patient, index, onClick, specialistsMap }: PatientCardProps) {
  const specialist = patient.assigned_specialist_id 
    ? specialistsMap.get(patient.assigned_specialist_id) 
    : null;

  return (
    <Draggable draggableId={patient.id!} index={index}>
      {(provided, snapshot) => (
        <Kanban.Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'flex flex-col gap-2', 
            snapshot.isDragging ? 'bg-accent shadow-lg cursor-grabbing' : 'cursor-pointer'
          )}
        >
          <div>
            <p className="font-semibold">{patient.name}</p>
            <p className="text-sm text-muted-foreground">{patient.treatments?.name || 'Sem tratamento'}</p>
          </div>
          
          <div className="flex justify-between items-end mt-1">
            <p className="text-sm font-medium">
              {patient.treatment_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>
            
            {specialist && (
              <div className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full truncate',
                  specialist.colorClass
              )}>
                {specialist.fullName}
              </div>
            )}
          </div>
        </Kanban.Card>
      )}
    </Draggable>
  );
}