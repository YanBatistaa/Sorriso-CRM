import React, { useState } from 'react';
import { useTreatments } from '@/hooks/useTreatments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Check, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Treatment } from '@/types/patient';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'; // Importar o hook

export const ProceduresSettingsTab = () => {
    const { data: treatments, addTreatment, updateTreatment, deleteTreatment, isLoading: areTreatmentsLoading } = useTreatments();
    const { role } = useCurrentUserRole();
    const { toast } = useToast();
    
    const [newProcedure, setNewProcedure] = useState('');
    const [editingTreatment, setEditingTreatment] = useState<Partial<Treatment> | null>(null);
    const isAdmin = role === 'admin';

    // ... (funções de handle inalteradas)

    return (
        <Panel>
            <PanelHeader>
                <PanelTitle>Gerenciar Procedimentos</PanelTitle>
                <PanelDescription>Adicione ou edite os procedimentos oferecidos pela sua clínica.</PanelDescription>
            </PanelHeader>
            <PanelContent className="space-y-6">
                {/* Formulário para adicionar só aparece para admins */}
                {isAdmin && (
                    <div className='flex gap-2'>
                        <Input 
                            placeholder='Nome do novo procedimento' 
                            value={newProcedure} 
                            onChange={e => setNewProcedure(e.target.value)} 
                        />
                        <Button onClick={handleAddProcedure}>Adicionar</Button>
                    </div>
                )}
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
                                    {/* Ações de editar/apagar só aparecem para admins */}
                                    {isAdmin && (
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
                                                    <Button variant="ghost" size="icon" className='h-8 w-8 text-destructive hover:bg-destructive/10'><Trash2 className='h-4 w-4'/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    {/* ... (conteúdo do AlertDialog inalterado) ... */}
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PanelContent>
        </Panel>
    );
};