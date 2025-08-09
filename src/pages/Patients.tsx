import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import type { Patient, PatientStatus } from "@/types/patient";
import { PatientSummaryPanel } from "@/components/patients/PatientSummaryPanel";
import { PatientForm } from "@/components/patients/PatientForm";
import { useToast } from "@/hooks/use-toast";

const STATUS_SEVERITY: Record<PatientStatus, "default" | "secondary" | "destructive" | "outline"> = {
  "Pré-orçamento": "secondary",
  "Em aberto": "outline",
  "Em andamento": "default",
  "Ganha": "secondary",
  "Perdida": "destructive",
};

const PatientsPage = () => {
  const { data: patients, addPatient, updatePatient, deletePatient } = usePatients();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<"Todos" | PatientStatus>("Todos");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [toDelete, setToDelete] = useState<Patient | null>(null);

  useEffect(() => { document.title = "Pacientes • SmileTrack"; }, []);

  const filtered = useMemo(() => {
    return selectedStatus === "Todos" ? patients : patients.filter(p => p.status === selectedStatus);
  }, [patients, selectedStatus]);

  const onCreate = () => { setEditing(null); setFormOpen(true); };
  const onEdit = (p: Patient) => { setEditing(p); setFormOpen(true); };
  const onDelete = async () => {
    if (!toDelete?.id) return;
    try {
      await deletePatient(toDelete.id);
      toast({ title: "Excluído", description: "Paciente removido com sucesso." });
    } catch (e: any) {
      toast({ title: "Erro", description: e.message });
    } finally {
      setToDelete(null);
    }
  };

  const handleSave = async (payload: Omit<Patient, "id" | "created_at" | "updated_at" | "user_id"> & { id?: string }) => {
    try {
      if (payload.id) {
        const { id, ...rest } = payload as any;
        await updatePatient({ id, ...rest });
        toast({ title: "Atualizado", description: "Paciente atualizado com sucesso." });
      } else {
        const { id, ...rest } = payload as any;
        await addPatient(rest);
        toast({ title: "Criado", description: "Paciente criado com sucesso." });
      }
      setFormOpen(false);
      setEditing(null);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Gestão de Pacientes</h1>

      <PatientSummaryPanel patients={patients} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pacientes</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as any)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos</SelectItem>
                <SelectItem value="Pré-orçamento">Pré-orçamento</SelectItem>
                <SelectItem value="Em aberto">Em aberto</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Ganha">Ganha</SelectItem>
                <SelectItem value="Perdida">Perdida</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" /> Novo Paciente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nascimento</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{new Date(p.birth_date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{p.cpf}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.source}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_SEVERITY[p.status]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{p.treatment_value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" size="icon" onClick={() => onEdit(p)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => setToDelete(p)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Paciente" : "Novo Paciente"}</DialogTitle>
          </DialogHeader>
          <PatientForm patient={editing} onClose={() => setFormOpen(false)} onSave={handleSave} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja excluir este paciente?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PatientsPage;
