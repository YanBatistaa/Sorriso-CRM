import React, { useState, useEffect } from 'react';
import { useClinic } from '@/hooks/useClinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';

export const GeneralSettingsTab = () => {
    const { clinic, updateClinic, isLoading: isClinicLoading } = useClinic();
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [clinicType, setClinicType] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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
    
    if (isClinicLoading) {
        return <div className="p-4 text-center">Carregando...</div>
    }

    return (
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
                        <p className="text-sm text-muted-foreground">Isso removerá permanentemente todos os dados da clínica.</p>
                    </div>
                    <Button variant="destructive" disabled>Excluir Clínica</Button>
                </PanelContent>
            </Panel>
        </div>
    );
};