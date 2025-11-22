import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    // Usar supabaseAdmin para bypass RLS (Opção 1 - sem Supabase Auth)
    // Teste 1: Verificar conexão básica
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('accounts')
      .select('id, owner_email, company_name')
      .limit(1);

    if (accountsError) {
      return NextResponse.json({
        success: false,
        error: 'Erro ao conectar com Supabase',
        details: accountsError.message,
      }, { status: 500 });
    }

    // Teste 2: Verificar usuários
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role')
      .limit(2);

    if (usersError) {
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar usuários',
        details: usersError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase funcionando!',
      data: {
        accounts: accounts?.length || 0,
        users: users?.length || 0,
        sampleUsers: users || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Erro inesperado',
      details: error.message,
    }, { status: 500 });
  }
}

