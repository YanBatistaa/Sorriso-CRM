import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import type { Patient } from "@/types/patient";
import { PatientSummaryPanel } from "@/components/patients/PatientSummaryPanel";
import { PatientForm } from "@/components/patients/PatientForm";
import { useToast } from "@/hooks/use-toast";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { formatCPF, formatPhone } from "@/lib/formatters";
import { useKanbanStages } from "@/hooks/useKanbanStages";

const STATUS_SEVERITY: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "Pré-orçamento": "secondary",
  "Em aberto": "outline",
  "Em andamento": "default",
  "Ganha": "secondary",
  "Perdida": "destructive",
};

const PatientsPage = () => {
  const { data: patients, addPatient, updatePatient, deletePatient } = usePatients();
  const { stages } = useKanbanStages();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("Todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  useEffect(() => { document.title = "Pacientes • Syncro"; }, []);

  const filtered = useMemo(() => {
    if (selectedStatus === "Todos") return patients;
    return patients.filter(p => p.status === selectedStatus);
  }, [patients, selectedStatus]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const onCreate = () => { setEditing(null); setFormOpen(true); };
  const onEdit = (p: Patient) => { setEditing(p); setFormOpen(true); };
  
  const handleDeleteConfirm = async () => {
    if (!toDelete?.id) return;
    try {
      await deletePatient(toDelete.id);
      toast({ title: "Excluído", description: "Paciente removido com sucesso." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setToDelete(null);
    }
  };

  const handleSave = async (payload: Patient) => {
    try {
      if (payload.id) {
        await updatePatient({ ...payload, id: payload.id });
        toast({ title: "Atualizado", description: "Paciente atualizado com sucesso." });
      } else {
        await addPatient(payload);
        toast({ title: "Criado", description: "Paciente criado com sucesso." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Gestão de Pacientes</h1>

      <PatientSummaryPanel patients={patients} />

      <Panel>
        <PanelHeader className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6">
          <PanelTitle className="text-lg md:text-2xl">Pacientes</PanelTitle>
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v)}>
              <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                {stages.map(stage => (
                    <SelectItem key={stage.id} value={stage.name}>{stage.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onCreate} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Novo Paciente
            </Button>
          </div>
        </PanelHeader>
        <PanelContent>
          {/* VISUALIZAÇÃO EM TABELA PARA DESKTOP - CORRIGIDA */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24 text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    {/* CÉLULAS DE EMAIL E CPF ADICIONADAS */}
                    <TableCell className="text-muted-foreground">{p.email || 'Não informado'}</TableCell>
                    <TableCell className="text-muted-foreground">{formatCPF(p.cpf) || 'Não informado'}</TableCell>
                    <TableCell>+55 {formatPhone(p.phone)}</TableCell>
                    <TableCell><Badge variant={STATUS_SEVERITY[p.status] || 'default'}>{p.status}</Badge></TableCell>
                    <TableCell className="text-right">{p.treatment_value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="secondary" size="icon" onClick={() => onEdit(p)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* VISUALIZAÇÃO EM CARDS PARA MOBILE */}
          <div className="md:hidden space-y-4">
            {filtered.map((p) => (
              <Panel key={p.id} className="p-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.treatments?.name || 'Tratamento não especificado'}</p>
                  </div>
                  <Badge variant={STATUS_SEVERITY[p.status] || 'default'}>{p.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t pt-4">
                  <div className="font-medium">Idade:</div>
                  <div>{calculateAge(p.birth_date)} anos</div>
                  
                  <div className="font-medium">Telefone:</div>
                  <div>+55 {formatPhone(p.phone)}</div>

                  <div className="font-medium">Email:</div>
                  <div className="truncate">{p.email || 'Não informado'}</div>
                  
                  <div className="font-medium">CPF:</div>
                  <div>{formatCPF(p.cpf) || 'Não informado'}</div>
                  
                  <div className="font-medium">Valor:</div>
                  <div className="font-semibold">{p.treatment_value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button variant="secondary" size="icon" onClick={() => onEdit(p)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="destructive" size="icon" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Panel>
            ))}
          </div>
        </PanelContent>
      </Panel>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar Paciente" : "Novo Paciente"}</DialogTitle></DialogHeader>
          <PatientForm patient={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Deseja excluir este paciente?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientsPage;