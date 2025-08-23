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

// Função auxiliar para determinar se o texto da etiqueta deve ser branco ou preto
// para garantir um bom contraste com a cor de fundo.
const getContrastYIQ = (hexcolor: string) => {
    hexcolor = hexcolor.replace("#", "");
	const r = parseInt(hexcolor.substr(0,2),16);
	const g = parseInt(hexcolor.substr(2,2),16);
	const b = parseInt(hexcolor.substr(4,2),16);
	const yiq = ((r*299)+(g*587)+(b*114))/1000;
	return (yiq >= 128) ? 'black' : 'white';
}

export function PatientCard({ patient, index, onClick, specialistsMap }: PatientCardProps) {
  // Obter os detalhes do especialista a partir do mapa, se houver um atribuído
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
            
            {/* A nova etiqueta (tag/pin) do especialista */}
            {specialist && (
              <div 
                  className={'text-xs font-semibold px-2 py-0.5 rounded-full truncate'}
                  style={{ 
                      backgroundColor: specialist.tagColor, 
                      color: getContrastYIQ(specialist.tagColor)
                  }}
              >
                {specialist.fullName}
              </div>
            )}
          </div>
        </Kanban.Card>
      )}
    </Draggable>
  );
}