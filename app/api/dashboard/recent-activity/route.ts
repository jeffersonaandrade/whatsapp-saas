import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Obter usuário autenticado
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const accountId = user.accountId;

    // Buscar conversas recentes com contatos
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        status,
        last_message_at,
        contact:contacts (
          id,
          name,
          phone_number
        )
      `)
      .eq('account_id', accountId)
      .order('last_message_at', { ascending: false })
      .limit(5);

    if (error) {
      throw error;
    }

    // Buscar última mensagem de cada conversa
    const activities = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        const { data: lastMessage } = await supabaseAdmin
          .from('messages')
          .select('body, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Calcular tempo relativo
        const lastMessageAt = new Date(conv.last_message_at);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastMessageAt.getTime()) / 1000 / 60);

        let timeAgo = '';
        if (diffMinutes < 1) {
          timeAgo = 'agora';
        } else if (diffMinutes < 60) {
          timeAgo = `há ${diffMinutes}min`;
        } else if (diffMinutes < 1440) {
          const hours = Math.floor(diffMinutes / 60);
          timeAgo = `há ${hours}h`;
        } else {
          const days = Math.floor(diffMinutes / 1440);
          timeAgo = `há ${days}d`;
        }

        return {
          id: conv.id,
          contactName: conv.contact?.name || 'Cliente',
          lastMessage: lastMessage?.body || 'Última mensagem recebida...',
          timeAgo,
        };
      })
    );

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error: any) {
    console.error('Erro ao buscar atividade recente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar atividade recente', details: error.message },
      { status: 500 }
    );
  }
}

