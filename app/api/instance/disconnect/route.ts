import { NextRequest, NextResponse } from 'next/server';
import { evolutionAPIMock } from '@/lib/services/evolution-api-mock';

/**
 * API Route para desconectar instância
 * Em produção, isso chamaria a Evolution API real
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceName } = body;

    if (!instanceName) {
      return NextResponse.json(
        { error: 'instanceName é obrigatório' },
        { status: 400 }
      );
    }

    // Usar mock por enquanto
    const result = await evolutionAPIMock.logoutInstance(instanceName);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Erro ao desconectar instância' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Instância desconectada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao desconectar instância:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

