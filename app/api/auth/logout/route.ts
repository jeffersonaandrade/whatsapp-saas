import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Remover cookie atual
  response.cookies.delete('user');
  
  // Limpar cookies antigos (legado) que podem estar sendo usados
  response.cookies.delete('user_info');
  response.cookies.delete('auth_token');
  
  return response;
}

