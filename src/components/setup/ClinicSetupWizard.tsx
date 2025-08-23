import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PanelDescription, PanelTitle } from "@/components/ui/panel";
import { useClinic } from "@/hooks/useClinic";
import { useTreatments } from "@/hooks/useTreatments";
import { useTeam } from "@/hooks/useTeam";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, HelpCircle, PartyPopper, UserPlus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { procedureTemplates } from "@/lib/procedure-templates";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface ClinicSetupWizardProps {
  onSuccess: () => void;
  onExit: () => void;
}

type ClinicType = keyof typeof procedureTemplates;

interface TeamMemberFormState {
    name: string;
    birthDate?: Date;
    role: 'doctor' | 'receptionist';
    can_view_all_patients: boolean; // Propriedade adicionada
}

export const ClinicSetupWizard = ({ onSuccess, onExit }: ClinicSetupWizardProps) => {
  const { toast } = useToast();
  const { createClinic } = useClinic();
  const { createTreatments } = useTreatments();
  const { createMember } = useTeam();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Dados do formulário
  const [ownerName, setOwnerName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicType, setClinicType] = useState<ClinicType | "">("");
  const [employeeCount, setEmployeeCount] = useState<number | string>("");
  const [procedures, setProcedures] = useState<string[]>([]);
  const [currentProcedure, setCurrentProcedure] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMemberFormState[]>([]);

  const handleAddProcedure = () => {
    if (currentProcedure.trim() && !procedures.includes(currentProcedure.trim())) {
        setProcedures(prev => [...prev, currentProcedure.trim()]);
        setCurrentProcedure("");
    }
  };

  const handleRemoveProcedure = (index: number) => {
    setProcedures(prev => prev.filter((_, i) => i !== index));
  };

  const loadTemplate = () => {
    if (!clinicType) return;
    const template = procedureTemplates[clinicType];
    const newProcedures = [...new Set([...procedures, ...template])]; 
    setProcedures(newProcedures);
  };
  
  const handlePreviousStep = () => setStep(step - 1);

  const handleNextStep = async () => {
    if (step === 1) {
        if (!clinicName || !clinicType || !ownerName.trim()) {
            toast({ title: "Atenção", description: "Todos os campos são obrigatórios.", variant: "destructive" });
            return;
        }
        setStep(2);
    } 
    else if (step === 2) {
        if (procedures.length === 0) {
            toast({ title: "Atenção", description: "Adicione pelo menos um procedimento.", variant: "destructive" });
            return;
        }
        
        setIsLoading(true);
        try {
            const { error: userError } = await supabase.auth.updateUser({ data: { full_name: ownerName } });
            if (userError) throw userError;

            const newClinic = await createClinic({ name: clinicName, clinic_type: clinicType, employee_count: Number(employeeCount) || 0 });
            const procedureList = procedures.map(name => ({ name, clinic_id: newClinic.id }));

            if (procedureList.length > 0) {
                await createTreatments(procedureList);
            }

            const count = Number(employeeCount) > 0 ? Number(employeeCount) : 0;
            if (count > 0) {
                setTeamMembers(Array(count).fill({ name: '', role: 'receptionist', can_view_all_patients: false }));
                setStep(3);
            } else {
                setStep(4);
            }
        } catch (error: any) {
            toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }
  };

  const handleSkipOrFinish = () => setStep(4);

  const handleTeamMemberChange = (index: number, field: keyof TeamMemberFormState, value: any) => {
      const updatedMembers = [...teamMembers];
      updatedMembers[index] = { ...updatedMembers[index], [field]: value };
      setTeamMembers(updatedMembers);
  };
  
  const handleSaveTeam = async () => {
    setIsLoading(true);
    const membersToCreate = teamMembers.filter(m => m.name && m.birthDate && m.role);

    try {
        await Promise.all(
            membersToCreate.map(member => createMember({
                member_name: member.name,
                birth_date: format(member.birthDate!, "yyyy-MM-dd"),
                role: member.role,
                can_view_all_patients: member.can_view_all_patients
            }))
        );
        if (membersToCreate.length > 0) {
            toast({ title: "Sucesso!", description: `${membersToCreate.length} membro(s) da equipe criado(s).`});
        }
        handleSkipOrFinish();
    } catch (error: any) {
        toast({ title: "Erro ao criar equipe", description: error.message, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-2">
        <Progress value={(step / 4) * 100} className="w-full" />

        {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50">
                <div className="text-center">
                    <PanelTitle className="text-2xl">Bem-vindo(a)!</PanelTitle>
                    <PanelDescription>Vamos começar com as informações básicas da sua clínica.</PanelDescription>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="ownerName">Seu Nome Completo</Label>
                        <Input id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Ex: Dra. Ana Silva" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="clinicName">Nome da Clínica</Label>
                        <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Ex: Sempre Beauty" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tipo da Clínica</Label>
                            <Select onValueChange={(v) => setClinicType(v as ClinicType)} value={clinicType}>
                                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="odontologica">Odontológica</SelectItem>
                                <SelectItem value="estetica">Estética</SelectItem>
                                <SelectItem value="medica">Médica (Outra)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employeeCount">Número de Funcionários (sem contar você)</Label>
                            <Input id="employeeCount" type="number" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="0" min={0} />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
             <div className="space-y-6 animate-in fade-in-50">
                <div className="text-center">
                    <PanelTitle className="text-2xl">Seus Procedimentos</PanelTitle>
                    <PanelDescription>Adicione os serviços que sua clínica oferece.</PanelDescription>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="procedures">Novo Procedimento</Label>
                            <Tooltip>
                                <TooltipTrigger asChild><HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger>
                                <TooltipContent><p>Adicione um procedimento e clique em "+" para incluí-lo.</p></TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex gap-2">
                            <Input id="procedures" value={currentProcedure} onChange={(e) => setCurrentProcedure(e.target.value)} placeholder="Ex: Clareamento Dental" />
                            <Button type="button" size="icon" onClick={handleAddProcedure}><Plus className="h-4 w-4"/></Button>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <Button variant="outline" size="sm" onClick={loadTemplate} disabled={!clinicType}>Carregar procedimentos comuns de {clinicType}</Button>
                        <div className="space-y-2 pt-2 max-h-32 overflow-y-auto pr-2">
                            {procedures.map((proc, index) => (
                                <div key={index} className="flex items-center justify-between p-2 text-sm rounded-md bg-muted">
                                <span>{proc}</span>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => handleRemoveProcedure(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {step === 3 && (
            <div className="space-y-6 animate-in fade-in-50">
                <div className="text-center">
                    <PanelTitle className="text-2xl">Configuração da Equipe</PanelTitle>
                    <PanelDescription>Opcional: Adicione os membros da sua equipe agora ou faça isso mais tarde.</PanelDescription>
                </div>
                <Accordion type="multiple" className="w-full max-h-[40vh] overflow-y-auto pr-2">
                    {teamMembers.map((member, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    <span>{member.name || `Funcionário ${index + 1}`}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input value={member.name} onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data de Aniversário (será a senha)</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !member.birthDate && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {member.birthDate ? format(member.birthDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={member.birthDate} onSelect={(date) => handleTeamMemberChange(index, 'birthDate', date)} initialFocus /></PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Função</Label>
                                    <Select value={member.role} onValueChange={(v) => handleTeamMemberChange(index, 'role', v as any)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="receptionist">Recepcionista</SelectItem>
                                            <SelectItem value="doctor">Especialista</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {member.role === 'doctor' && (
                                    <div className="flex items-center space-x-2 rounded-md border p-3">
                                        <Switch
                                            id={`view-all-${index}`}
                                            checked={member.can_view_all_patients}
                                            onCheckedChange={(checked) => handleTeamMemberChange(index, 'can_view_all_patients', checked)}
                                        />
                                        <Label htmlFor={`view-all-${index}`} className="flex flex-col gap-1 cursor-pointer">
                                            <span>Visualizar Todos os Pacientes</span>
                                            <span className="font-normal text-xs text-muted-foreground">
                                                Se ativado, este especialista poderá ver todos os pacientes da clínica.
                                            </span>
                                        </Label>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        )}

        {step === 4 && (
            <div className="space-y-6 text-center animate-in fade-in-50 p-8">
                <PartyPopper className="h-16 w-16 text-green-500 mx-auto" />
                <PanelTitle className="text-2xl">Tudo Pronto!</PanelTitle>
                <PanelDescription>Sua clínica foi configurada com sucesso. Agora pode começar a gerenciar seus pacientes.</PanelDescription>
                <Button onClick={onSuccess}>Ir para o Dashboard</Button>
            </div>
        )}

        {(step === 1 || step === 2) && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4">
                <Button variant="outline" onClick={step === 1 ? onExit : handlePreviousStep}>{step === 1 ? "Sair" : "Voltar"}</Button>
                <Button className="w-full sm:w-auto" onClick={handleNextStep} disabled={isLoading}>{isLoading ? "Salvando..." : "Continuar"}</Button>
            </div>
        )}
        
        {step === 3 && (
             <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4">
                <Button variant="outline" onClick={handleSkipOrFinish}>Pular Etapa</Button>
                <Button className="w-full sm:w-auto" onClick={handleSaveTeam} disabled={isLoading}>{isLoading ? "Salvando Equipe..." : "Salvar e Concluir"}</Button>
            </div>
        )}
      </div>
    </TooltipProvider>
  );
};