import { NextRequest, NextResponse } from 'next/server';
import { evolutionAPI } from '@/lib/evolution-api';
import { evolutionAPIMock } from '@/lib/services/evolution-api-mock';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/utils/auth';

/**
 * API Route para verificar status da conexão
 * Usa Evolution API real se configurada, senão usa mock
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let instanceName = searchParams.get('instanceName');

    // Se não forneceu instanceName, buscar no Supabase ou gerar baseado no accountId
    if (!instanceName) {
      // Buscar instância existente no Supabase
      const { data: existingInstance } = await supabaseAdmin
        .from('instances')
        .select('name')
        .eq('account_id', user.accountId)
        .maybeSingle();

      if (existingInstance) {
        instanceName = existingInstance.name;
      } else {
        // Se não existe, gerar o nome padrão (sem hífens)
        const accountIdWithoutHyphens = user.accountId.replace(/-/g, '');
        instanceName = `instance${accountIdWithoutHyphens}`;
      }
    }

    // Verificar se Evolution API está configurada
    const useRealAPI = !!process.env.NEXT_PUBLIC_EVOLUTION_API_URL && !!process.env.EVOLUTION_API_KEY;
    
    console.log('[Instance Status] Configuração:', {
      useRealAPI,
      evolutionApiUrl: process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'não configurado',
      hasApiKey: !!process.env.EVOLUTION_API_KEY,
      instanceName,
    });
    
    let result;
    if (useRealAPI) {
      // Evolution API só precisa do header 'apikey' (já configurado no interceptor)
      result = await evolutionAPI.getInstanceStatus(instanceName);

      if (!result.success) {
        console.error('[Evolution API] Erro ao verificar status:', result);
        return NextResponse.json(
          { 
            error: 'Erro ao verificar status', 
            details: result.error,
            statusCode: result.statusCode,
            url: result.url,
          },
          { status: 500 }
        );
      }

      // Evolution API retorna o estado da conexão
      const responseData = result.data;
      const state = responseData?.state || responseData?.status || 'close';
      const status = state === 'open' || state === 'connected' ? 'connected' : 'disconnected';

      return NextResponse.json({
        status,
        isConnected: status === 'connected',
        phoneNumber: responseData?.phoneNumber || responseData?.user?.id?.split('@')[0] || null,
        profilePicUrl: responseData?.profilePicUrl || responseData?.user?.profilePictureUrl || null,
      });
    } else {
      // Usar mock
      result = await evolutionAPIMock.getInstanceStatus(instanceName);

      if (!result.success) {
        return NextResponse.json(
          { error: 'Erro ao verificar status', details: result.error },
          { status: 500 }
        );
      }

      const status = result.data?.state === 'open' ? 'connected' : 'disconnected';

      return NextResponse.json({
        status,
        isConnected: status === 'connected',
        phoneNumber: result.data?.phoneNumber || null,
        profilePicUrl: result.data?.profilePicUrl || null,
      });
    }
  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

