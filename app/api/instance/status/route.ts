import { NextRequest, NextResponse } from 'next/server';
import { evolutionAPIMock } from '@/lib/services/evolution-api-mock';

/**
 * API Route para verificar status da conexão
 * Em produção, isso chamaria a Evolution API real
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const instanceName = searchParams.get('instanceName');

    if (!instanceName) {
      return NextResponse.json(
        { error: 'instanceName é obrigatório' },
        { status: 400 }
      );
    }

    // Usar mock por enquanto
    const result = await evolutionAPIMock.getInstanceStatus(instanceName);

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
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

