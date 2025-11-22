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

    // 1. Conversas Hoje (conversas criadas hoje)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: conversationsToday } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .gte('created_at', today.toISOString());

    // 2. Mensagens na Fila (conversas com status waiting_agent)
    const { count: messagesInQueue } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('status', 'waiting_agent');

    // 3. Taxa de Resposta (conversas resolvidas / total de conversas)
    const { count: totalConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId);

    const { count: resolvedConversations } = await supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('account_id', accountId)
      .eq('status', 'resolved');

    const responseRate = totalConversations && totalConversations > 0
      ? ((resolvedConversations || 0) / totalConversations * 100).toFixed(1)
      : '0.0';

    // 4. Tempo Médio de Resposta (diferença entre última mensagem do cliente e primeira resposta)
    // Para simplificar, vamos calcular a média de tempo entre mensagens
    const { data: recentMessages } = await supabaseAdmin
      .from('messages')
      .select('conversation_id, created_at, from_me')
      .in('conversation_id', 
        (await supabaseAdmin
          .from('conversations')
          .select('id')
          .eq('account_id', accountId)
        ).data?.map(c => c.id) || []
      )
      .order('created_at', { ascending: true })
      .limit(100);

    // Calcular tempo médio (simplificado)
    let avgResponseTime = 0;
    if (recentMessages && recentMessages.length > 0) {
      // Agrupar por conversa e calcular tempos
      const conversationTimes: number[] = [];
      const conversationMap = new Map<string, { lastCustomer: Date | null; firstResponse: Date | null }>();

      recentMessages.forEach(msg => {
        if (!conversationMap.has(msg.conversation_id)) {
          conversationMap.set(msg.conversation_id, { lastCustomer: null, firstResponse: null });
        }
        const conv = conversationMap.get(msg.conversation_id)!;
        const msgDate = new Date(msg.created_at);

        if (!msg.from_me && !conv.lastCustomer) {
          conv.lastCustomer = msgDate;
        }
        if (msg.from_me && !conv.firstResponse && conv.lastCustomer) {
          conv.firstResponse = msgDate;
          const diff = (conv.firstResponse.getTime() - conv.lastCustomer.getTime()) / 1000 / 60; // minutos
          conversationTimes.push(diff);
        }
      });

      if (conversationTimes.length > 0) {
        avgResponseTime = conversationTimes.reduce((a, b) => a + b, 0) / conversationTimes.length;
      }
    }

    // Retornar estatísticas
    return NextResponse.json({
      success: true,
      stats: {
        conversationsToday: conversationsToday || 0,
        messagesInQueue: messagesInQueue || 0,
        responseRate: `${responseRate}%`,
        averageTime: avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)}min` : '0.0min',
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas do dashboard:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas', details: error.message },
      { status: 500 }
    );
  }
}

