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

export const PersonalizationSettingsTab = () => {
    const { stages, addStage, updateStage, deleteStage, updateStageOrder, isLoading } = useKanbanStages();
    const { toast } = useToast();
    
    const [newStage, setNewStage] = useState('');
    const [editingStage, setEditingStage] = useState<Partial<KanbanStage> | null>(null);

    const handleAddStage = async () => {
        if (!newStage.trim()) return;
        try {
            await addStage({ name: newStage, order: stages.length });
            setNewStage('');
            toast({ title: "Sucesso", description: "Novo estágio do funil adicionado." });
        } catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    };
    
    const handleUpdateStage = async () => {
        if (!editingStage || !editingStage.id || !editingStage.name?.trim()) return;
        try {
            await updateStage({ id: editingStage.id, name: editingStage.name });
            setEditingStage(null);
            toast({ title: "Sucesso", description: "Estágio atualizado." });
        } catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    };

    const handleDeleteStage = async (id: string) => {
        if (stages.length <= 2) {
            toast({ title: "Atenção", description: "O funil deve ter no mínimo 2 estágios.", variant: "destructive" });
            return;
        }
        try {
            await deleteStage(id);
            toast({ title: "Sucesso", description: "Estágio removido." });
        } catch (error: any) { toast({ title: "Erro", description: error.message, variant: "destructive" }); }
    };

    const onDragEndStages = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(stages);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedOrder = items.map((item, index) => ({ id: item.id, order: index }));
        updateStageOrder(updatedOrder);
    };

    return (
        <Panel>
            <PanelHeader>
                <PanelTitle>Funil de Vendas</PanelTitle>
                <PanelDescription>Personalize os estágios do seu funil de vendas. Arraste para reordenar.</PanelDescription>
            </PanelHeader>
            <PanelContent className="space-y-6">
                <div className='flex gap-2'>
                    <Input placeholder='Nome do novo estágio' value={newStage} onChange={e => setNewStage(e.target.value)} />
                    <Button onClick={handleAddStage}>Adicionar Estágio</Button>
                </div>
                {isLoading ? <p>Carregando estágios...</p> : (
                    <DragDropContext onDragEnd={onDragEndStages}>
                        <Droppable droppableId="stages">
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className='space-y-2'>
                                    {stages.map((stage, index) => (
                                        <Draggable key={stage.id} draggableId={stage.id} index={index}>
                                            {(provided) => (
                                                <li ref={provided.innerRef} {...provided.draggableProps} className='flex items-center justify-between p-2 rounded-md bg-muted/60'>
                                                    <div className="flex items-center gap-2">
                                                        <span {...provided.dragHandleProps} className="cursor-grab"><GripVertical className="h-5 w-5 text-muted-foreground" /></span>
                                                        {editingStage?.id === stage.id ? (
                                                            <Input value={editingStage.name || ''} onChange={e => setEditingStage({...editingStage, name: e.target.value})} className="h-8" />
                                                        ) : (
                                                            <span>{stage.name}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {editingStage?.id === stage.id ? (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100" onClick={handleUpdateStage}><Check className='h-4 w-4'/></Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-100" onClick={() => setEditingStage(null)}><X className='h-4 w-4'/></Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingStage(stage)}><Edit className='h-4 w-4'/></Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className='h-8 w-8 text-destructive hover:bg-destructive/10'><Trash2 className='h-4 w-4'/></Button></AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader><AlertDialogTitle>Tem certeza?</AlertDialogTitle><AlertDialogDescription>Excluir um estágio pode desassociar pacientes. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                            <AlertDialogAction onClick={() => handleDeleteStage(stage.id)}>Excluir</AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </>
                                                        )}
                                                    </div>
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