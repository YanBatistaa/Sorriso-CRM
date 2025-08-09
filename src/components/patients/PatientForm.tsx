import { useEffect, useMemo, useState } from "react";
import type { Patient } from "@/types/patient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const PatientForm = ({ patient, onSave, onClose }: { patient: Patient | null; onSave: (payload: any) => void; onClose: () => void; }) => {
  const [form, setForm] = useState({
    id: patient?.id,
    name: patient?.name ?? "",
    birth_date: patient?.birth_date ?? "",
    cpf: patient?.cpf ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    source: patient?.source ?? "",
    status: patient?.status ?? "Em aberto",
    treatment_value: patient?.treatment_value ?? 0,
  });

  useEffect(() => setForm(prev => ({ ...prev, id: patient?.id, name: patient?.name ?? "", birth_date: patient?.birth_date ?? "", cpf: patient?.cpf ?? "", phone: patient?.phone ?? "", email: patient?.email ?? "", source: patient?.source ?? "", status: patient?.status ?? "Em aberto", treatment_value: patient?.treatment_value ?? 0 })), [patient]);

  const canSave = useMemo(() => form.name && form.birth_date && form.cpf && form.phone && form.status, [form]);

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Data de Nascimento</Label>
          <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>CPF</Label>
          <Input value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>E-mail</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Origem</Label>
          <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pré-orçamento">Pré-orçamento</SelectItem>
              <SelectItem value="Em aberto">Em aberto</SelectItem>
              <SelectItem value="Em andamento">Em andamento</SelectItem>
              <SelectItem value="Ganha">Ganha</SelectItem>
              <SelectItem value="Perdida">Perdida</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Valor do Tratamento (R$)</Label>
          <Input type="number" step="0.01" value={form.treatment_value} onChange={(e) => setForm({ ...form, treatment_value: Number(e.target.value) })} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={!canSave}>Salvar</Button>
      </div>
    </form>
  );
};
