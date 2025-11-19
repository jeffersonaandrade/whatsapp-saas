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
    let instanceName: string | null = searchParams.get('instanceName');

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

    // Garantir que instanceName não seja null (TypeScript)
    if (!instanceName) {
      return NextResponse.json(
        { error: 'Erro ao determinar nome da instância' },
        { status: 500 }
      );
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
        const errorDetails: Record<string, any> = {
          error: 'Erro ao verificar status',
          details: result.error || 'Erro desconhecido',
        };
        
        // Adicionar statusCode e url apenas se existirem
        if ('statusCode' in result && result.statusCode) {
          errorDetails.statusCode = result.statusCode;
        }
        if ('url' in result && result.url) {
          errorDetails.url = result.url;
        }
        
        return NextResponse.json(errorDetails, { status: 500 });
      }

      // Evolution API retorna o estado da conexão
      // Usar 'as any' para permitir acesso a propriedades que podem variar na resposta da Evolution API
      const responseData = result.data as any;
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
        const mockErrorDetails: Record<string, any> = {
          error: 'Erro ao verificar status',
          details: 'Erro desconhecido',
        };
        
        // Adicionar details se existir
        if ('error' in result && result.error) {
          mockErrorDetails.details = result.error;
        }
        
        return NextResponse.json(mockErrorDetails, { status: 500 });
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

