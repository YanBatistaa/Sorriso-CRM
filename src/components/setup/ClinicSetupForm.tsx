import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PanelDescription, PanelTitle } from "@/components/ui/panel";
import { useClinic } from "@/hooks/useClinic";
import { useTreatments } from "@/hooks/useTreatments";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ClinicSetupFormProps {
  onSuccess: () => void;
  onExit: () => void;
}

export const ClinicSetupForm = ({ onSuccess, onExit }: ClinicSetupFormProps) => {
  const { toast } = useToast();
  const { createClinic } = useClinic();
  const { createTreatments } = useTreatments();

  const [clinicName, setClinicName] = useState("");
  const [clinicType, setClinicType] = useState("");
  const [employeeCount, setEmployeeCount] = useState<number | string>("");
  const [procedures, setProcedures] = useState<string[]>([]);
  const [currentProcedure, setCurrentProcedure] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProcedure = () => {
    if (currentProcedure.trim()) {
      setProcedures(prev => [...prev, currentProcedure.trim()]);
      setCurrentProcedure("");
    }
  };

  const handleRemoveProcedure = (index: number) => {
    setProcedures(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!clinicName || !clinicType || procedures.length === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome, tipo e adicione pelo menos um procedimento.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newClinic = await createClinic({ name: clinicName, clinic_type: clinicType, employee_count: Number(employeeCount) || 0 });
      const procedureList = procedures.map(name => ({ name, clinic_id: newClinic.id }));

      if (procedureList.length > 0) {
        await createTreatments(procedureList);
      }
      
      toast({ title: "Bem-vindo(a)!", description: "Sua clínica foi configurada com sucesso." });
      onSuccess(); // Chama a função de sucesso para fechar o modal
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="text-center">
          <PanelTitle className="text-2xl">Configure sua Clínica</PanelTitle>
          <PanelDescription>
            Primeiro, vamos personalizar o CRM para atender às suas necessidades.
          </PanelDescription>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicName">Nome da Clínica</Label>
            <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="Ex: Sorriso Feliz Odontologia" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Número de Funcionários</Label>
              <Input id="employeeCount" type="number" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="0" min={0} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="procedures">Procedimentos Realizados</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicione um procedimento e clique em "+" para incluí-lo na lista.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Input id="procedures" value={currentProcedure} onChange={(e) => setCurrentProcedure(e.target.value)} placeholder="Ex: Clareamento Dental" />
              <Button type="button" size="icon" onClick={handleAddProcedure}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2 pt-2 max-h-32 overflow-y-auto">
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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 pt-4">
            <Button variant="outline" onClick={onExit}>Sair</Button>
            <Button className="w-full sm:w-auto" onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar e Continuar"}
            </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};