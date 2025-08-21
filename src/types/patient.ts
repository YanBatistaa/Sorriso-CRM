export type PatientStatus = 'Pré-orçamento' | 'Em aberto' | 'Em andamento' | 'Ganha' | 'Perdida';
export const ALL_STATUSES: PatientStatus[] = ['Pré-orçamento', 'Em aberto', 'Em andamento', 'Ganha', 'Perdida'];

export interface Patient {
  id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  clinic_id?: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  cpf: string;
  phone: string;
  email: string | null;
  status: string;
  treatment_value: number;
  treatment_id: string | null;
  description?: string | null;
  // Adicionado para receber o nome do tratamento da tabela relacionada
  treatments: {
    name: string;
  } | null;
}

export interface Clinic {
    id: string;
    name: string;
    clinic_type: string | null;
    employee_count: number | null;
    owner_id: string;
    logo_url?: string | null; 
}

export interface Treatment {
    id: string;
    clinic_id: string;
    name: string;
    is_active: boolean;
}

export interface KanbanStage {
  id: string;
  clinic_id: string;
  name: string;
  order: number;
}