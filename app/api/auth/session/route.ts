import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      // Sessão expirada ou inválida - limpar cookie
      const response = NextResponse.json(
        { user: null, expired: true },
        { status: 200 }
      );
      response.cookies.delete('user');
      return response;
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    const response = NextResponse.json(
      { user: null, expired: true },
      { status: 200 }
    );
    response.cookies.delete('user');
    return response;
  }
}

