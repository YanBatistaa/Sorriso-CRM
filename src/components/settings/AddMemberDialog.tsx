import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTeam } from '@/hooks/useTeam';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

export const AddMemberDialog = () => {
    const { createMember } = useTeam();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [birthDate, setBirthDate] = useState<Date | undefined>();
    const [role, setRole] = useState<'doctor' | 'receptionist'>('receptionist');
    const [canViewAll, setCanViewAll] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newCredentials, setNewCredentials] = useState<{ email: string, password: string} | null>(null);

    const handleCreate = async () => {
        if (!name || !birthDate || !role) {
            toast({ title: "Erro", description: "Todos os campos são obrigatórios.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            const result = await createMember({
                member_name: name,
                birth_date: format(birthDate, "yyyy-MM-dd"),
                role: role,
                can_view_all_patients: canViewAll
            });
            setNewCredentials(result);
        } catch (error: any) {
            toast({ title: "Erro ao criar membro", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const resetAndClose = () => {
        setOpen(false);
        setTimeout(() => {
            setName('');
            setBirthDate(undefined);
            setRole('receptionist');
            setCanViewAll(false);
            setNewCredentials(null);
        }, 300);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Adicionar Membro</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Membro da Equipe</DialogTitle>
                    {!newCredentials && <DialogDescription>Preencha os dados abaixo para criar um novo login.</DialogDescription>}
                </DialogHeader>

                {newCredentials ? (
                    <div className='space-y-4 py-4'>
                        <Alert>
                            <AlertTitle>Membro Criado com Sucesso!</AlertTitle>
                            <AlertDescription>
                                Anote e partilhe as credenciais abaixo com o novo membro da equipe. A palavra-passe não poderá ser recuperada.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label>Email de Acesso</Label>
                            <Input value={newCredentials.email} readOnly />
                        </div>
                        <div className="space-y-2">
                            <Label>Palavra-passe Inicial</Label>
                            <Input value={newCredentials.password} readOnly />
                        </div>
                        <DialogFooter>
                            <Button onClick={resetAndClose}>Concluído</Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Aniversário (será a palavra-passe)</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !birthDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {birthDate ? format(birthDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={birthDate} onSelect={setBirthDate} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
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
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                                <Switch
                                    id="view-all-patients"
                                    checked={canViewAll}
                                    onCheckedChange={setCanViewAll}
                                />
                                <Label htmlFor="view-all-patients" className="flex flex-col gap-1 cursor-pointer">
                                    <span>Visualizar Todos os Pacientes</span>
                                    <span className="font-normal text-xs text-muted-foreground">
                                        Se ativado, este especialista poderá ver todos os pacientes da clínica.
                                    </span>
                                </Label>
                            </div>
                        )}

                        <DialogFooter>
                            <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
                            <Button onClick={handleCreate} disabled={isLoading}>{isLoading ? "A criar..." : "Criar Membro"}</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};