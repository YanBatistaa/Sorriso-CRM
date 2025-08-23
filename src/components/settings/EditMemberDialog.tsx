import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeam } from '@/hooks/useTeam';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Edit } from 'lucide-react';
import type { ClinicMember } from '@/types/patient';
import { ColorPicker } from '../ui/color-picker'; // Importar o novo componente

interface EditMemberDialogProps {
  member: ClinicMember;
}

export const EditMemberDialog = ({ member }: EditMemberDialogProps) => {
    const { updateMember } = useTeam();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    
    // Estados do formulário
    const [role, setRole] = useState(member.role);
    const [canViewAll, setCanViewAll] = useState(member.can_view_all_patients);
    const [tagColor, setTagColor] = useState(member.tag_color);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setRole(member.role);
        setCanViewAll(member.can_view_all_patients);
        setTagColor(member.tag_color);
    }, [member]);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            await updateMember({
                memberId: member.id,
                role: role,
                can_view_all_patients: canViewAll,
                tag_color: tagColor
            });
            toast({ title: "Sucesso", description: "As permissões do membro foram atualizadas." });
            setOpen(false);
        } catch (error: any) {
            toast({ title: "Erro ao atualizar membro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Membro da Equipe</DialogTitle>
                    <DialogDescription>Altere as permissões para <span className="font-semibold">{member.full_name || member.email}</span>.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Função</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as any)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="receptionist">Recepcionista</SelectItem>
                                <SelectItem value="doctor">Especialista</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {role === 'doctor' && (
                        <>
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                                <Switch id="edit-view-all-patients" checked={canViewAll} onCheckedChange={setCanViewAll}/>
                                <Label htmlFor="edit-view-all-patients" className="flex flex-col gap-1 cursor-pointer">
                                    <span>Visualizar Todos os Pacientes</span>
                                    <span className="font-normal text-xs text-muted-foreground">Se ativado, este especialista poderá ver todos os pacientes da clínica.</span>
                                </Label>
                            </div>
                            <div className="space-y-2 rounded-md border p-3">
                                <Label>Cor da Etiqueta</Label>
                                <ColorPicker value={tagColor} onChange={setTagColor} />
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                    <Button onClick={handleUpdate} disabled={isLoading}>{isLoading ? "Salvando..." : "Salvar Alterações"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};