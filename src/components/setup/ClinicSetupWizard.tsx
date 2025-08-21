import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PanelDescription, PanelTitle } from "@/components/ui/panel";
import { useClinic } from "@/hooks/useClinic";
import { useTreatments } from "@/hooks/useTreatments";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, HelpCircle, PartyPopper } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { procedureTemplates } from "@/lib/procedure-templates";

interface ClinicSetupWizardProps {
  onSuccess: () => void;
  onExit: () => void;
}

type ClinicType = keyof typeof procedureTemplates;

export const ClinicSetupWizard = ({ onSuccess, onExit }: ClinicSetupWizardProps) => {
  const { toast } = useToast();
  const { createClinic } = useClinic();
  const { createTreatments } = useTreatments();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Dados do formulário
  const [clinicName, setClinicName] = useState("");
  const [clinicType, setClinicType] = useState<ClinicType | "">("");
  const [employeeCount, setEmployeeCount] = useState<number | string>("");
  const [procedures, setProcedures] = useState<string[]>([]);
  const [currentProcedure, setCurrentProcedure] = useState("");

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
    const newProcedures = [...new Set([...procedures, ...template])]; // Evita duplicados
    setProcedures(newProcedures);
  };

  const handleNextStep = () => {
    if (step === 1 && (!clinicName || !clinicType)) {
        toast({ title: "Atenção", description: "Nome e tipo da clínica são obrigatórios.", variant: "destructive" });
        return;
    }
    setStep(step + 1);
  };
  
  const handlePreviousStep = () => setStep(step - 1);

  const handleSave = async () => {
    if (procedures.length === 0) {
        toast({ title: "Atenção", description: "Adicione pelo menos um procedimento.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
      const newClinic = await createClinic({ name: clinicName, clinic_type: clinicType, employee_count: Number(employeeCount) || 0 });
      const procedureList = procedures.map(name => ({ name, clinic_id: newClinic.id }));

      if (procedureList.length > 0) {
        await createTreatments(procedureList);
      }
      
      setStep(3); // Vai para a tela de sucesso
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-4 p-2">
        <Progress value={(step / 3) * 100} className="w-full" />

        {step === 1 && (
            <div className="space-y-6 animate-in fade-in-50">
                <div className="text-center">
                    <PanelTitle className="text-2xl">Bem-vindo(a)!</PanelTitle>
                    <PanelDescription>Vamos começar com as informações básicas da sua clínica.</PanelDescription>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="clinicName">Nome da Clínica</Label>
                        <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Ex: Sorriso Feliz Odontologia" />
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
                            <Label htmlFor="employeeCount">Número de Funcionários</Label>
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
            <div className="space-y-6 text-center animate-in fade-in-50 p-8">
                <PartyPopper className="h-16 w-16 text-green-500 mx-auto" />
                <PanelTitle className="text-2xl">Tudo Pronto!</PanelTitle>
                <PanelDescription>Sua clínica foi configurada com sucesso. Agora você pode começar a gerenciar seus pacientes.</PanelDescription>
                <Button onClick={onSuccess}>Ir para o Dashboard</Button>
            </div>
        )}

        {step < 3 && (
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4">
                <Button variant="outline" onClick={step === 1 ? onExit : handlePreviousStep}>
                    {step === 1 ? "Sair" : "Voltar"}
                </Button>
                <Button className="w-full sm:w-auto" onClick={step === 1 ? handleNextStep : handleSave} disabled={isLoading}>
                    {step === 1 ? "Continuar" : (isLoading ? "Salvando..." : "Salvar e Concluir")}
                </Button>
            </div>
        )}
      </div>
    </TooltipProvider>
  );
};