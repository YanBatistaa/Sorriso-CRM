import { useEffect, useMemo, useState } from "react";
import type { Patient } from "@/types/patient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCPF, formatPhone } from "@/lib/formatters";
import { Textarea } from "@/components/ui/textarea";
import { useTreatments } from "@/hooks/useTreatments";
import { useKanbanStages } from "@/hooks/useKanbanStages";
import { useTeam } from "@/hooks/useTeam";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";

export const PatientForm = ({ patient, onSave, onClose }: { patient: Patient | null; onSave: (payload: any) => void; onClose: () => void; }) => {
  const { data: treatments, isLoading: isLoadingTreatments } = useTreatments();
  const { stages, isLoading: isLoadingStages } = useKanbanStages();
  const { members, isLoading: isLoadingTeam } = useTeam();
  const { role } = useCurrentUserRole();

  const [form, setForm] = useState({
    id: patient?.id,
    name: patient?.name ?? "",
    birth_date: patient?.birth_date ?? "",
    cpf: patient?.cpf ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    treatment_id: patient?.treatment_id ?? null,
    status: patient?.status ?? "",
    treatment_value: patient?.treatment_value ?? 0,
    description: patient?.description ?? "",
    assigned_specialist_id: patient?.assigned_specialist_id ?? null,
  });

  const specialists = useMemo(() => members.filter(m => m.role === 'doctor'), [members]);

  useEffect(() => {
    const initialStatus = (patient?.status) 
        ? patient.status 
        : (stages.length > 0 ? stages[0].name : "");

    setForm({
      id: patient?.id,
      name: patient?.name ?? "",
      birth_date: patient?.birth_date ?? "",
      cpf: patient?.cpf ? formatCPF(patient.cpf) : "",
      phone: patient?.phone ? formatPhone(patient.phone) : "",
      email: patient?.email ?? "",
      treatment_id: patient?.treatment_id ?? null,
      status: initialStatus,
      treatment_value: patient?.treatment_value ?? 0,
      description: patient?.description ?? "",
      assigned_specialist_id: patient?.assigned_specialist_id ?? null,
    });
  }, [patient, stages]);

  const canSave = useMemo(() => form.name && form.birth_date && form.cpf && form.phone && form.status, [form]);

  const handleMaskedInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'cpf' | 'phone') => {
    const formatter = field === 'cpf' ? formatCPF : formatPhone;
    setForm({ ...form, [field]: formatter(e.target.value) });
  };
  
  const selectedDate = form.birth_date ? new Date(form.birth_date + 'T00:00:00') : undefined;

  const handleFormSubmit = () => {
    const cleanedPhone = form.phone.replace(/\D/g, '');
    const payload = {
      ...form,
      cpf: form.cpf.replace(/\D/g, ''),
      phone: `+55${cleanedPhone}`,
      assigned_specialist_id: form.assigned_specialist_id === 'null' ? null : form.assigned_specialist_id
    };
    onSave(payload);
  };
  
  return (
    <div className="max-h-[80vh] overflow-y-auto p-1 pr-4">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label>Data de Nascimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !form.birth_date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.birth_date ? format(selectedDate || new Date(), "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => setForm({ ...form, birth_date: date ? format(date, "yyyy-MM-dd") : "" })} initialFocus/>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input value={form.cpf} onChange={(e) => handleMaskedInputChange(e, 'cpf')} maxLength={14} autoComplete="off" placeholder="000.000.000-00" />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => handleMaskedInputChange(e, 'phone')} maxLength={15} autoComplete="off" placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="off" />
          </div>
          <div className="space-y-2">
            <Label>Tratamento</Label>
            <Select value={form.treatment_id || ''} onValueChange={(v) => setForm({ ...form, treatment_id: v })}>
              <SelectTrigger><SelectValue placeholder={isLoadingTreatments ? "Carregando..." : "Selecione o tratamento"} /></SelectTrigger>
              <SelectContent>
                {treatments.map(treatment => (<SelectItem key={treatment.id} value={treatment.id}>{treatment.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
              <SelectTrigger><SelectValue placeholder={isLoadingStages ? "Carregando..." : "Selecione o status"} /></SelectTrigger>
              <SelectContent>
                {stages.map(stage => (<SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {(role === 'admin' || role === 'receptionist') && (
            <div className="space-y-2">
              <Label>Especialista Responsável</Label>
              <Select value={form.assigned_specialist_id || 'null'} onValueChange={(v) => setForm({ ...form, assigned_specialist_id: v })}>
                <SelectTrigger><SelectValue placeholder={isLoadingTeam ? "Carregando..." : "Nenhum especialista atribuído"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Nenhum</SelectItem>
                  {specialists.map(specialist => (
                    <SelectItem key={specialist.user_id} value={specialist.user_id}>{specialist.full_name || specialist.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Valor do Tratamento (R$)</Label>
            <Input type="number" step="0.01" value={form.treatment_value || ""} onChange={(e) => setForm({ ...form, treatment_value: Number(e.target.value) })} placeholder="0" autoComplete="off" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descrição / Anotações</Label>
            <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Anotações importantes sobre o paciente ou tratamento..." className="h-24" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!canSave}>Salvar</Button>
        </div>
      </form>
    </div>
  );
};