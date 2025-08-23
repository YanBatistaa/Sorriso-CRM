import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { format } from "https://deno.land/std@0.208.0/datetime/format.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Adicionar a nova propriedade ao extrair do body do pedido
    const { clinic_id, clinic_name, member_name, birth_date, role, can_view_all_patients } = await req.json();

    if (!clinic_id || !clinic_name || !member_name || !birth_date || !role) {
      throw new Error("Faltam campos obrigatórios.");
    }

    const normalizedClinicName = clinic_name.replace(/\s+/g, '').toLowerCase();
    const normalizedMemberName = member_name.split(' ')[0].toLowerCase();
    const email = `${normalizedMemberName}.${normalizedClinicName}@syncro.com`;
    const password = format(new Date(birth_date), "ddMMyyyy");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: creationError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: member_name }
    });

    if (creationError) {
      if (creationError.message.includes('unique constraint')) {
        throw new Error(`O e-mail gerado '${email}' já está em uso.`);
      }
      throw creationError;
    }

    if (!user) {
        throw new Error("Falha ao criar o utilizador.");
    }

    // Incluir o valor de 'can_view_all_patients' na inserção
    const { error: memberError } = await supabaseAdmin.from('clinic_members').insert({
      clinic_id: clinic_id,
      user_id: user.id,
      role: role,
      can_view_all_patients: role === 'doctor' ? can_view_all_patients : false // Apenas relevante para 'doctor'
    });

    if (memberError) throw memberError;

    return new Response(JSON.stringify({ message: "Membro da equipa criado com sucesso.", email, password }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});