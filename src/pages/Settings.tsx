import React, { useState, useEffect, useRef } from 'react';
import { useClinic } from '@/hooks/useClinic';
import { useTreatments } from '@/hooks/useTreatments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Treatment } from '@/types/patient';

const ClinicSettingsPage = () => {
    const { clinic, updateClinic, isLoading: isClinicLoading } = useClinic();
    const { data: treatments, addTreatment, updateTreatment, deleteTreatment, isLoading: areTreatmentsLoading } = useTreatments();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [clinicType, setClinicType] = useState('');
    const [newProcedure, setNewProcedure] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // Estados para edição inline de procedimentos
    const [editingTreatment, setEditingTreatment] = useState<Partial<Treatment> | null>(null);

    useEffect(() => {
        if (clinic) {
            setName(clinic.name);
            setClinicType(clinic.clinic_type || '');
        }
    }, [clinic]);

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

    if (isClinicLoading) {
        return <div className="text-center p-8">Carregando configurações...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-semibold">Configurações da Clínica</h1>
            <Tabs defaultValue="general">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="general">Geral</TabsTrigger>
                    <TabsTrigger value="treatments">Procedimentos</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
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
                </TabsContent>

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
            </Tabs>
        </div>
    );
};

export default ClinicSettingsPage;