import React, { useState, useEffect } from 'react';
import { useClinic } from '@/hooks/useClinic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Panel, PanelContent, PanelHeader, PanelTitle, PanelDescription } from '@/components/ui/panel';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle } from 'lucide-react';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole'; // Importar o hook

export const GeneralSettingsTab = () => {
    const { clinic, updateClinic, isLoading: isClinicLoading } = useClinic();
    const { role } = useCurrentUserRole(); // Usar o hook de função
    const { toast } = useToast();
    
    const [name, setName] = useState('');
    const [clinicType, setClinicType] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const isAdmin = role === 'admin';

    useEffect(() => {
        if (clinic) {
            setName(clinic.name);
            setClinicType(clinic.clinic_type || '');
        }
    }, [clinic]);

    const handleSaveGeneral = async () => {
        // ... (função inalterada)
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
                        <Input id="clinicName" value={name} onChange={(e) => setName(e.target.value)} disabled={!isAdmin} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tipo da Clínica</Label>
                        <Select onValueChange={setClinicType} value={clinicType} disabled={!isAdmin}>
                            <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="odontologica">Odontológica</SelectItem>
                                <SelectItem value="estetica">Estética</SelectItem>
                                <SelectItem value="medica">Médica (Outra)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Botão de salvar só aparece para admins */}
                    {isAdmin && (
                        <Button onClick={handleSaveGeneral} disabled={isSaving}>
                            {isSaving ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    )}
                </PanelContent>
            </Panel>

            {/* Zona de Perigo só aparece para admins */}
            {isAdmin && (
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
            )}
        </div>
    );
};