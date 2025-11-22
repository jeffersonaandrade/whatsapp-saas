import { NextRequest, NextResponse } from 'next/server';
import { motorClientAPI } from '@/lib/motor-client';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import { logger, getRequestContext } from '@/lib/utils/logger';
import { validatePayloadSize } from '@/lib/utils/validation';
import { validateRequestSize, addSecurityHeaders } from '@/lib/utils/security';

/**
 * API Route para conectar instância e obter QR Code
 * Faz proxy para o Motor (Serviço Externo)
 */
export async function POST(request: NextRequest) {
  const requestContext = getRequestContext(request);
  
  try {
    // Validar tamanho da requisição
    const contentLength = request.headers.get('content-length');
    const sizeValidation = validateRequestSize(contentLength, 1);
    if (!sizeValidation.valid) {
      logger.warn('[Instance Connect] Requisição muito grande', { error: sizeValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: sizeValidation.error },
        { status: 413 }
      );
      addSecurityHeaders(response);
      return response;
    }

    // Verificar autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      logger.warn('[Instance Connect] Tentativa sem autenticação', {}, requestContext);
      const response = NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const requestContextWithUser = { ...requestContext, userId: user.id, accountId: user.accountId };

    const body = await request.json();
    
    // Validar payload
    const payloadValidation = validatePayloadSize(body, 100);
    if (!payloadValidation.valid) {
      logger.warn('[Instance Connect] Payload muito grande', { error: payloadValidation.error }, requestContextWithUser);
      const response = NextResponse.json(
        { error: payloadValidation.error },
        { status: 413 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const { instanceName } = body;

    logger.info('[Instance Connect] Fazendo proxy para o Motor', {
      accountId: user.accountId,
      instanceName,
    }, requestContextWithUser);

    // Fazer proxy para o Motor
    const result = await motorClientAPI.connectInstance({ instanceName });

    if (!result.success) {
      logger.error('[Instance Connect] Erro no Motor', result.error, {
        instanceName,
        statusCode: result.statusCode,
      }, requestContextWithUser);
      
      const errorResponse = NextResponse.json(
        { 
          error: result.error || 'Erro ao conectar instância',
          details: result.statusCode ? `Status: ${result.statusCode}` : undefined,
        },
        { status: result.statusCode || 500 }
      );
      addSecurityHeaders(errorResponse);
      return errorResponse;
    }

    logger.info('[Instance Connect] Proxy bem-sucedido', {
      instanceName,
      hasQrCode: !!result.data?.qrCode,
      status: result.data?.status,
    }, requestContextWithUser);

    // Retornar resposta do Motor
    const response = NextResponse.json(result.data || { success: true });
    addSecurityHeaders(response);
    return response;
  } catch (error: any) {
    logger.error('[Instance Connect] Erro inesperado', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
    addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
