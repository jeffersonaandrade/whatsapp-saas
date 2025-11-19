import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  accountId: string;
}

export interface SessionData {
  user: User;
  expiresAt: number; // Timestamp em milissegundos
}

// Tempo de expiração da sessão: 12 horas
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 horas

/**
 * Obtém o usuário autenticado a partir do cookie
 * Retorna null se não houver usuário, se o cookie for inválido ou se a sessão expirou
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<User | null> {
  try {
    let userCookie: string | undefined;

    if (request) {
      // Server-side (API routes)
      userCookie = request.cookies.get('user')?.value;
      
      // Log para debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        const allCookies = request.cookies.getAll();
        console.log('[Auth Debug] Cookies disponíveis:', allCookies.map(c => c.name));
      }
    } else {
      // Server Components
      const cookieStore = await cookies();
      userCookie = cookieStore.get('user')?.value;
    }

    if (!userCookie) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Cookie "user" não encontrado');
      }
      return null;
    }

    // Tentar parsear como SessionData (com expiração) ou User (legado)
    let sessionData: SessionData | User;
    try {
      sessionData = JSON.parse(userCookie);
    } catch (error) {
      console.error('[Auth] Erro ao parsear cookie:', error);
      return null;
    }

    // Verificar se é formato antigo (sem expiração) ou novo (com expiração)
    if ('expiresAt' in sessionData) {
      // Formato novo: validar expiração
      const now = Date.now();
      
      if (now > sessionData.expiresAt) {
        // Sessão expirada
        console.log('[Auth] Sessão expirada');
        return null;
      }

      // Validação básica - aceitar accountId ou account_id (compatibilidade)
      const user = sessionData.user;
      if (!user?.id) {
        console.error('[Auth] Cookie sem id do usuário');
        return null;
      }

      // Aceitar accountId ou account_id (compatibilidade)
      const accountId = user.accountId || (user as any).account_id;
      if (!accountId) {
        console.error('[Auth] Cookie sem accountId/account_id. Dados recebidos:', {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasAccountId: !!user.accountId,
          hasAccount_id: !!(user as any).account_id,
        });
        return null;
      }

      // Normalizar para accountId
      return {
        ...user,
        accountId: accountId,
      };
    } else {
      // Formato antigo (legado): validar estrutura básica
      const user = sessionData as User;
      if (!user.id) {
        console.error('[Auth] Cookie legado sem id do usuário');
        return null;
      }

      // Aceitar accountId ou account_id (compatibilidade)
      const accountId = user.accountId || (user as any).account_id;
      if (!accountId) {
        console.error('[Auth] Cookie legado sem accountId/account_id. Dados recebidos:', {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hasAccountId: !!user.accountId,
          hasAccount_id: !!(user as any).account_id,
        });
        return null;
      }

      // Normalizar para accountId
      return {
        ...user,
        accountId: accountId,
      };
    }
  } catch (error) {
    console.error('Erro ao obter usuário autenticado:', error);
    return null;
  }
}

/**
 * Cria dados de sessão com expiração
 */
export function createSessionData(user: User): SessionData {
  return {
    user,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
}

/**
 * Define o cookie do usuário
 */
export function setUserCookie(user: User): string {
  return JSON.stringify(user);
}

