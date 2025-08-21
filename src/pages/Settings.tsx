import React, { useState, useEffect } from 'react';
import { useClinic } from '@/hooks/useClinic';
import { useTreatments } from '@/hooks/useTreatments';
import { useKanbanStages } from '@/hooks/useKanbanStages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Check, X, AlertTriangle, GripVertical } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Treatment, KanbanStage } from '@/types/patient';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const ClinicSettingsPage = () => {
    const { clinic, updateClinic, isLoading: isClinicLoading } = useClinic();
    const { toast } = useToast();
    
    // States para abas
    const [name, setName] = useState('');
    const [clinicType, setClinicType] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // States da Aba de Procedimentos
    const { data: treatments, addTreatment, updateTreatment, deleteTreatment, isLoading: areTreatmentsLoading } = useTreatments();
    const [newProcedure, setNewProcedure] = useState('');
    const [editingTreatment, setEditingTreatment] = useState<Partial<Treatment> | null>(null);

    // States da Aba de Personalização
    const { stages, addStage, updateStage, deleteStage, updateStageOrder } = useKanbanStages();
    const [newStage, setNewStage] = useState('');
    const [editingStage, setEditingStage] = useState<Partial<KanbanStage> | null>(null);

    useEffect(() => {
        if (clinic) {
            setName(clinic.name);
            setClinicType(clinic.clinic_type || '');
        }
    }, [clinic]);
    
    // Funções da aba Geral
    const handleSaveGeneral = async () => {
        if (!clinic) return;
        setIsSaving(true);
        try {
            await updateClinic({ id: clinic.id, name, clinic_type: clinicType });
            toast({ title: "Sucesso", description: "Informações da clínica atualizadas." });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };
    
    // Funções da aba Procedimentos
    const handleAddProcedure = async () => {
        if (!newProcedure.trim()) return;
        try {
            await addTreatment({ name: newProcedure });
            setNewProcedure('');
            toast({ title: "Sucesso", description: "Procedimento adicionado." });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };
    const handleUpdateProcedure = async () => {
        if (!editingTreatment || !editingTreatment.id || !editingTreatment.name?.trim()) return;
        try {
            await updateTreatment({ id: editingTreatment.id, name: editingTreatment.name });
            setEditingTreatment(null);
            toast({ title: "Sucesso", description: "Procedimento atualizado." });
        } catch (error: any) {
            toast({ title: "Erro", description: error.message, variant: "destructive" });
        }
    };
    const handleDeleteProcedure = async (id: string) => {
        try {
            await deleteTreatment(id);
            toast({ title: "Sucesso", description: "Procedimento removido." });
        } catch (error: any) {
            toast({ title: "Erro", description: `Falha ao remover o procedimento. ${error.message}`, variant: "destructive" });
        }
    };

    // Funções da aba Personalização
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

    if (isClinicLoading) return <div className="text-center p-8">Carregando configurações...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold">Configurações da Clínica</h1>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-3 max-w-lg">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="treatments">Procedimentos</TabsTrigger>
                    <TabsTrigger value="personalization">Personalização</TabsTrigger>
                </TabsList>

                {/* ABA GERAL */}
                <TabsContent value="general">
                    <div className="space-y-6">
                        <Panel>
                            <PanelHeader>
                                <PanelTitle>Informações Gerais</PanelTitle>
                                <PanelDescription>Atualize os dados da sua clínica.</PanelDescription>
                            </PanelHeader>
                            <PanelContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="clinicName">Nome da Clínica</Label>
                                    <Input id="clinicName" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo da Clínica</Label>
                                    <Select onValueChange={setClinicType} value={clinicType}>
                                        <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="odontologica">Odontológica</SelectItem>
                                            <SelectItem value="estetica">Estética</SelectItem>
                                            <SelectItem value="medica">Médica (Outra)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleSaveGeneral} disabled={isSaving}>
                                    {isSaving ? "Salvando..." : "Salvar Alterações"}
                                </Button>
                            </PanelContent>
                        </Panel>

                        <Panel className="border-destructive">
                            <PanelHeader>
                                <PanelTitle className="text-destructive flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Zona de Perigo
                                </PanelTitle>
                                <PanelDescription>
                                    Ações nesta área são permanentes e não podem ser desfeitas.
                                </PanelDescription>
                            </PanelHeader>
                            <PanelContent className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold">Excluir Clínica</h4>
                                    <p className="text-sm text-muted-foreground">Isso removerá permanentemente todos os dados da clínica, incluindo pacientes e agendamentos.</p>
                                </div>
                                <Button variant="destructive" disabled>Excluir Clínica</Button>
                            </PanelContent>
                        </Panel>
                    </div>
                </TabsContent>

                {/* ABA PROCEDIMENTOS */}
                <TabsContent value="treatments">
                    <Panel>
                        <PanelHeader>
                            <PanelTitle>Gerenciar Procedimentos</PanelTitle>
                            <PanelDescription>Adicione ou edite os procedimentos oferecidos pela sua clínica.</PanelDescription>
                        </PanelHeader>
                        <PanelContent className="space-y-6">
                            <div className='flex gap-2'>
                                <Input 
                                    placeholder='Nome do novo procedimento' 
                                    value={newProcedure} 
                                    onChange={e => setNewProcedure(e.target.value)} 
                                />
                                <Button onClick={handleAddProcedure}>Adicionar</Button>
                            </div>
                            <div className='space-y-2'>
                                <Label>Procedimentos Atuais</Label>
                                {areTreatmentsLoading ? <p>Carregando...</p> : (
                                    <ul className='space-y-2'>
                                        {treatments.map(t => (
                                            <li key={t.id} className='flex items-center justify-between p-2 rounded-md bg-muted/60'>
                                                {editingTreatment?.id === t.id ? (
                                                    <Input 
                                                        value={editingTreatment.name || ''}
                                                        onChange={e => setEditingTreatment({...editingTreatment, name: e.target.value})}
                                                        className="h-8"
                                                    />
                                                ) : (
                                                    <span>{t.name}</span>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    {editingTreatment?.id === t.id ? (
                                                        <>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:bg-green-100" onClick={handleUpdateProcedure}><Check className='h-4 w-4'/></Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-100" onClick={() => setEditingTreatment(null)}><X className='h-4 w-4'/></Button>
                                                        </>
                                                    ) : (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingTreatment(t)}><Edit className='h-4 w-4'/></Button>
                                                    )}
                                                    
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className='h-8 w-8 text-destructive hover:bg-destructive/10'>
                                                                <Trash2 className='h-4 w-4'/>
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta ação não pode ser desfeita. Pacientes com este procedimento serão desvinculados, mas não excluídos.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteProcedure(t.id)}>Excluir</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </PanelContent>
                    </Panel>
                </TabsContent>

                {/* ABA PERSONALIZAÇÃO */}
                <TabsContent value="personalization">
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
                        </PanelContent>
                    </Panel>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ClinicSettingsPage;