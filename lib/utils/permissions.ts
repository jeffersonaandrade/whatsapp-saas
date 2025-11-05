// Utilitário para verificar permissões de usuários

export type UserRole = 'admin' | 'agent';

export interface RoutePermissions {
  // Rotas que requerem autenticação
  requiresAuth?: boolean;
  // Roles permitidos (se undefined, todos os usuários autenticados podem acessar)
  allowedRoles?: UserRole[];
}

// Configuração de permissões por rota
export const routePermissions: Record<string, RoutePermissions> = {
  '/dashboard': {
    requiresAuth: true,
    // Todos os usuários autenticados podem acessar
  },
  '/conversations': {
    requiresAuth: true,
  },
  '/flow-builder': {
    requiresAuth: true,
    // Apenas admins podem criar/editar fluxos
    allowedRoles: ['admin'],
  },
  '/campaigns': {
    requiresAuth: true,
    allowedRoles: ['admin'],
  },
  '/groups': {
    requiresAuth: true,
    allowedRoles: ['admin'],
  },
  '/team': {
    requiresAuth: true,
    // Apenas admins podem gerenciar equipe
    allowedRoles: ['admin'],
  },
  '/settings': {
    requiresAuth: true,
    allowedRoles: ['admin'],
  },
};

/**
 * Verifica se o usuário tem permissão para acessar uma rota
 */
export function hasPermission(route: string, userRole: UserRole | null, isAuthenticated: boolean): boolean {
  const permissions = routePermissions[route];

  // Se não há configuração de permissão, permitir acesso
  if (!permissions) {
    return true;
  }

  // Se requer autenticação e usuário não está autenticado
  if (permissions.requiresAuth && !isAuthenticated) {
    return false;
  }

  // Se há roles específicos permitidos
  if (permissions.allowedRoles) {
    if (!userRole) {
      return false;
    }
    return permissions.allowedRoles.includes(userRole);
  }

  // Se requer autenticação mas não há roles específicos, qualquer usuário autenticado pode acessar
  return true;
}

/**
 * Verifica se o usuário é admin
 */
export function isAdmin(userRole: UserRole | null): boolean {
  return userRole === 'admin';
}

