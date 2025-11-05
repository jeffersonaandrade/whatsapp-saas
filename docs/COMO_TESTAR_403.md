# 🧪 Como Testar a Página de Acesso Negado (403)

## 📋 Formas de Testar

### 1. **Acessar Diretamente pela URL** (Mais Simples)

Acesse diretamente a URL da página:
```
http://localhost:3000/unauthorized
```

Isso mostrará a página de acesso negado diretamente.

---

### 2. **Testar com Permissões** (Real)

#### Cenário 1: Usuário Agente Tentando Acessar Rota de Admin

1. Faça login como **agente**:
   - Email: `agente@test.com`
   - Senha: `agente123`

2. Tente acessar uma rota que requer permissão de admin:
   - `/settings` (Configurações)
   - `/team` (Equipe)
   - `/campaigns` (Campanhas)
   - `/groups` (Grupos)

3. O sistema deve redirecionar para `/unauthorized` se a verificação de permissão estiver implementada.

#### Cenário 2: Usuário Não Autenticado

1. Faça logout (ou limpe o localStorage)
2. Tente acessar qualquer rota protegida:
   - `/dashboard`
   - `/conversations`
   - `/settings`

3. O sistema deve redirecionar para `/login` ou `/unauthorized` dependendo da implementação.

---

### 3. **Implementar Verificação de Permissão no Middleware**

Atualmente, o middleware está mockado e não verifica permissões. Para testar de forma real, você precisa:

1. **Atualizar o middleware** para verificar permissões
2. **Redirecionar para `/unauthorized`** quando não houver permissão

**Exemplo de implementação:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { hasPermission, routePermissions } from '@/lib/utils/permissions';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas (não precisam de autenticação)
  const publicRoutes = ['/login', '/signup', '/', '/privacy', '/terms', '/not-found', '/unauthorized'];
  
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Verificar se há token de autenticação
  const token = request.cookies.get('sb-access-token');
  const userRole = request.cookies.get('user-role')?.value as 'admin' | 'agent' | null;
  
  // Se não está autenticado e a rota requer autenticação
  const permissions = routePermissions[pathname];
  if (permissions?.requiresAuth && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se está autenticado mas não tem permissão para a rota
  if (permissions?.allowedRoles && userRole) {
    const hasAccess = hasPermission(pathname, userRole, !!token);
    if (!hasAccess) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}
```

---

### 4. **Testar com Componente de Proteção**

Você também pode criar um componente de proteção de rota que verifica permissões no client-side:

```typescript
// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/lib/utils/permissions';

export default function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'agent')[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user) {
    return null; // ou um loading spinner
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // será redirecionado
  }

  return <>{children}</>;
}
```

**Uso:**

```typescript
// app/settings/page.tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SettingsPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {/* Conteúdo da página */}
    </ProtectedRoute>
  );
}
```

---

## ✅ Teste Rápido (Agora)

### Opção 1: Acessar Diretamente
```
1. Inicie o servidor: npm run dev
2. Acesse: http://localhost:3000/unauthorized
3. Veja a página de acesso negado
```

### Opção 2: Criar Página de Teste
Crie uma página de teste que redireciona para `/unauthorized`:

```typescript
// app/test-unauthorized/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestUnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/unauthorized');
  }, [router]);

  return null;
}
```

Acesse: `http://localhost:3000/test-unauthorized`

---

## 📝 Nota

Atualmente, o middleware está mockado e não verifica permissões. Para testar de forma real, você precisa:

1. Implementar verificação de permissões no middleware
2. Ou implementar verificação no client-side com componentes de proteção
3. Ou acessar diretamente `/unauthorized` para ver a página

---

**Última atualização:** Agora
**Status:** ✅ Página criada, middleware precisa ser implementado para redirecionar automaticamente

