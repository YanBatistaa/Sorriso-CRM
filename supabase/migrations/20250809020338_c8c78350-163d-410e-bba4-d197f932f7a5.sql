-- Patients table and RLS for a dental clinic MVP
-- Create extension for gen_random_uuid if not present
create extension if not exists pgcrypto;

-- Table: patients
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  birth_date date not null,
  cpf text not null,
  phone text not null,
  email text,
  source text,
  status text not null,
  treatment_value numeric not null default 0
);

-- Indexes for performance
create index if not exists idx_patients_user_id on public.patients(user_id);
create index if not exists idx_patients_status on public.patients(status);
create index if not exists idx_patients_created_at on public.patients(created_at);

-- Trigger function to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Attach trigger
create trigger trg_patients_updated_at
before update on public.patients
for each row
execute function public.set_updated_at();

-- Enable RLS
alter table public.patients enable row level security;

-- Policies: owner-based access using auth.uid()
create policy "Users can select their patients" on public.patients
for select using (auth.uid() = user_id);

create policy "Users can insert their patients" on public.patients
for insert with check (auth.uid() = user_id);

create policy "Users can update their patients" on public.patients
for update using (auth.uid() = user_id);

create policy "Users can delete their patients" on public.patients
for delete using (auth.uid() = user_id);
