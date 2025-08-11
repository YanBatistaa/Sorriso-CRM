import { Droppable } from 'react-beautiful-dnd';
import { Patient, PatientStatus } from '@/types/patient';
import { PatientCard } from './PatientCard';
import { Kanban } from '@/components/ui/kanban'; // Importa a nossa nova UI
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface KanbanColumnProps {
  status: PatientStatus;
  patients: Patient[];
  onClickPatient: (patient: Patient) => void;
}

export function KanbanColumn({ status, patients, onClickPatient }: KanbanColumnProps) {
  const totalValue = patients.reduce((sum, p) => sum + p.treatment_value, 0);

  return (
    <Kanban.Column>
      <Kanban.ColumnHeader>
        <Kanban.ColumnTitle>
          <h2 className="text-base font-semibold">{status}</h2>
          <Badge variant="secondary">{patients.length}</Badge>
        </Kanban.ColumnTitle>
        <p className="text-sm font-bold text-primary">
          {totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </Kanban.ColumnHeader>
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex flex-col h-full rounded-md p-1 transition-colors",
              snapshot.isDraggingOver && "bg-accent"
            )}
          >
            <div className="overflow-y-auto pr-1">
              {patients.map((patient, index) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  index={index} 
                  onClick={() => onClickPatient(patient)} 
                />
              ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Kanban.Column>
  );
}