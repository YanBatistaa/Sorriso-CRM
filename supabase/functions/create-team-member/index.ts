import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { format } from "https://deno.land/std@0.208.0/datetime/format.ts";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { clinic_id, clinic_name, member_name, birth_date, role } = await req.json();

    // Validar dados de entrada
    if (!clinic_id || !clinic_name || !member_name || !birth_date || !role) {
      throw new Error("Todos os campos são obrigatórios: clinic_id, clinic_name, member_name, birth_date, role");
    }

    // 1. Gerar o e-mail e a palavra-passe conforme a lógica definida
    const normalizedClinicName = clinic_name.replace(/\s+/g, '').toLowerCase();
    const normalizedMemberName = member_name.split(' ')[0].toLowerCase();
    const email = `${normalizedMemberName}.${normalizedClinicName}@syncro.com`;
    
    const password = format(new Date(birth_date), "ddMMyyyy");

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 2. Criar o utilizador no Supabase Auth
    const { data: { user }, error: creationError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Marcar o e-mail como confirmado, pois o admin está a criá-lo
      user_metadata: {
        full_name: member_name
      }
    });

    if (creationError) {
      // Tratar erro comum de e-mail já existente
      if (creationError.message.includes('unique constraint')) {
        throw new Error(`O e-mail gerado '${email}' já está em uso.`);
      }
      throw creationError;
    }

    if (!user) {
        throw new Error("Falha ao criar o utilizador.");
    }

    // 3. Associar o novo utilizador à clínica na tabela clinic_members
    const { error: memberError } = await supabaseAdmin.from('clinic_members').insert({
      clinic_id: clinic_id,
      user_id: user.id,
      role: role
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