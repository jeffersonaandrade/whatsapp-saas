import { NextRequest, NextResponse } from 'next/server';
import { evolutionAPIMock } from '@/lib/services/evolution-api-mock';

/**
 * API Route para conectar instância e obter QR Code
 * Em produção, isso chamaria a Evolution API real
 * Por enquanto, usa o mock
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

    // Usar mock por enquanto (depois substituir por evolutionAPI real)
    const result = await evolutionAPIMock.createInstance(instanceName);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Erro ao criar instância', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      qrCode: result.data?.base64 || result.data?.code,
      instanceName,
    });
  } catch (error) {
    console.error('Erro ao conectar instância:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

