export type PatientStatus = 'Pré-orçamento' | 'Em aberto' | 'Em andamento' | 'Ganha' | 'Perdida';
export const ALL_STATUSES: PatientStatus[] = ['Pré-orçamento', 'Em aberto', 'Em andamento', 'Ganha', 'Perdida'];

export interface Patient {
  id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  cpf: string;
  phone: string;
  email: string;
  source: string;
  status: PatientStatus;
  treatment_value: number;
}
