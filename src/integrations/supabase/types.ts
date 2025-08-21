export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Este trecho é gerado automaticamente, mas o adaptamos para o nosso novo esquema
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string
          created_at: string
          name: string
          clinic_type: string | null
          employee_count: number | null
          owner_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          clinic_type?: string | null
          employee_count?: number | null
          owner_id: string
        }
        Update: {
          id?: string
          name?: string
          clinic_type?: string | null
          employee_count?: number | null
        }
      }
      treatments: {
        Row: {
          id: string
          created_at: string
          clinic_id: string
          name: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          clinic_id: string
          name: string
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          is_active?: boolean
        }
      }
      patients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          birth_date: string
          cpf: string
          phone: string
          email: string | null
          status: string
          treatment_value: number
          user_id: string
          clinic_id: string
          treatment_id: string | null
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          birth_date: string
          cpf: string
          phone: string
          email?: string | null
          status: string
          treatment_value?: number
          user_id: string
          clinic_id: string
          treatment_id?: string | null
          description?: string | null
        }
        Update: {
          id?: string
          name?: string
          birth_date?: string
          cpf?: string
          phone?: string
          email?: string | null
          status?: string
          treatment_value?: number
          treatment_id?: string | null
          description?: string | null
        }
      }
    }
    // O restante do arquivo (Views, Functions, etc.) pode permanecer o mesmo
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}