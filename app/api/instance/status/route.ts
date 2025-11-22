import { NextRequest, NextResponse } from 'next/server';
import { motorClientAPI } from '@/lib/motor-client';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import { logger, getRequestContext } from '@/lib/utils/logger';
import { isValidInstanceName } from '@/lib/utils/validation';
import { addSecurityHeaders } from '@/lib/utils/security';

/**
 * API Route para verificar status da conexão
 * Faz proxy para o Motor (Serviço Externo)
 */
export async function GET(request: NextRequest) {
  const requestContext = getRequestContext(request);
  
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      logger.warn('[Instance Status] Tentativa sem autenticação', {}, requestContext);
      const response = NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const requestContextWithUser = { ...requestContext, userId: user.id, accountId: user.accountId };

    const searchParams = request.nextUrl.searchParams;
    const instanceName = searchParams.get('instanceName') || undefined;

    // Validar formato do instanceName se fornecido
    if (instanceName && !isValidInstanceName(instanceName)) {
      logger.warn('[Instance Status] instanceName inválido', { instanceName }, requestContextWithUser);
      const response = NextResponse.json(
        { error: 'Nome da instância inválido' },
        { status: 400 }
      );
      addSecurityHeaders(response);
      return response;
    }

    logger.debug('[Instance Status] Fazendo proxy para o Motor', {
      instanceName,
      accountId: user.accountId,
    }, requestContextWithUser);

    // Fazer proxy para o Motor
    const result = await motorClientAPI.getInstanceStatus(instanceName);

    if (!result.success) {
      logger.error('[Instance Status] Erro no Motor', result.error, {
        instanceName,
        statusCode: result.statusCode,
      }, requestContextWithUser);
      
      const errorResponse = NextResponse.json(
        { 
          error: result.error || 'Erro ao verificar status',
          details: result.statusCode ? `Status: ${result.statusCode}` : undefined,
        },
        { status: result.statusCode || 500 }
      );
      addSecurityHeaders(errorResponse);
      return errorResponse;
    }

    logger.debug('[Instance Status] Proxy bem-sucedido', {
      instanceName,
      status: result.data?.status,
    }, requestContextWithUser);

    // Retornar resposta do Motor
    const response = NextResponse.json(result.data || { status: 'disconnected' });
    addSecurityHeaders(response);
    return response;
  } catch (error: any) {
    logger.error('[Instance Status] Erro inesperado', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
    addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
