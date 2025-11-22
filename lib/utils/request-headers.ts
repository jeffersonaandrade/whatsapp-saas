/**
 * Utilitários para extrair headers de requisições Next.js
 */

import { NextRequest } from 'next/server';

/**
 * Extrai headers importantes de uma requisição NextRequest para repassar ao Motor
 * Inclui cookies e authorization headers
 */
export function extractRequestHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  // Extrair cookie header (contém todos os cookies)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader;
  }

  // Extrair authorization header (se houver)
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers['Authorization'] = authorization;
  }

  return headers;
}

