import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import { addSecurityHeaders } from '@/lib/utils/security';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas (não precisam de autenticação)
  const publicRoutes = ['/login', '/signup', '/', '/privacy', '/terms', '/not-found'];
  
  // Se for rota pública, permitir acesso
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Verificar autenticação e expiração da sessão
  const user = await getAuthenticatedUser(request);
  
  if (!user) {
    // Sessão expirada ou não autenticado - redirecionar para login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(response);
  }

  // Usuário autenticado - permitir acesso
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

