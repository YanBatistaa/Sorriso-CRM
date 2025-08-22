import React, { useState } from 'react';
import { useKanbanStages } from '@/hooks/useKanbanStages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Check, X, GripVertical } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { KanbanStage } from '@/types/patient';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'; // Importar o hook

export const PersonalizationSettingsTab = () => {
    const { stages, addStage, updateStage, deleteStage, updateStageOrder, isLoading } = useKanbanStages();
    const { role } = useCurrentUserRole();
    const { toast } = useToast();
    
    const [newStage, setNewStage] = useState('');
    const [editingStage, setEditingStage] = useState<Partial<KanbanStage> | null>(null);
    const isAdmin = role === 'admin';

    // ... (funções de handle inalteradas)

    const onDragEndStages = (result: DropResult) => {
        if (!result.destination || !isAdmin) return; // Desativa o drag-and-drop para não-admins
        // ... (resto da função inalterada)
    };

    return (
        <Panel>
            <PanelHeader>
                <PanelTitle>Funil de Vendas</PanelTitle>
                <PanelDescription>Personalize os estágios do seu funil de vendas. Arraste para reordenar.</PanelDescription>
            </PanelHeader>
            <PanelContent className="space-y-6">
                {isAdmin && (
                    <div className='flex gap-2'>
                        <Input placeholder='Nome do novo estágio' value={newStage} onChange={e => setNewStage(e.target.value)} />
                        <Button onClick={handleAddStage}>Adicionar Estágio</Button>
                    </div>
                )}
                {isLoading ? <p>Carregando estágios...</p> : (
                    <DragDropContext onDragEnd={onDragEndStages}>
                        <Droppable droppableId="stages">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className='space-y-2'>
                                    {stages.map((stage, index) => (
                                        <Draggable key={stage.id} draggableId={stage.id} index={index} isDragDisabled={!isAdmin}>
                                            {(provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} className='flex items-center justify-between p-2 rounded-md bg-muted/60'>
                                                    <div className="flex items-center gap-2">
                                                        <span {...provided.dragHandleProps} className={isAdmin ? "cursor-grab" : "cursor-default"}>
                                                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                                                        </span>
                                                        {editingStage?.id === stage.id ? (
                                                            <Input value={editingStage.name || ''} onChange={e => setEditingStage({...editingStage, name: e.target.value})} className="h-8" />
                                                        ) : (
                                                            <span>{stage.name}</span>
                                                        )}
                                                    </div>
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-1">
                                                            {/* ... (JSX dos botões de editar/apagar inalterado) ... */}
                                                        </div>
                                                    )}
                                                </li>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </PanelContent>
        </Panel>
    );
};