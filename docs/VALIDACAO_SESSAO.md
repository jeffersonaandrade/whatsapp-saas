# Validação de Sessão - Expiração em 12 horas

## 📋 Implementação

O sistema agora valida automaticamente a expiração de sessão após **12 horas** de login.

## 🔧 Como Funciona

### 1. **Criação da Sessão**
- Ao fazer login, o sistema cria uma sessão com timestamp de expiração
- Cookie armazena: `{ user: {...}, expiresAt: timestamp }`
- Expiração: **12 horas** após o login

### 2. **Validação no Backend**
- Todas as APIs verificam a expiração antes de processar requisições
- Se expirado, retorna `null` e remove o cookie
- Middleware verifica expiração em todas as rotas protegidas

### 3. **Validação no Frontend**
- `AuthContext` verifica sessão a cada 5 minutos
- Se expirado, redireciona automaticamente para `/login`
- Limpa estado local do usuário

## 🔒 Segurança

### Validações Implementadas:

1. **Backend (APIs)**
   - `getAuthenticatedUser()` verifica `expiresAt` antes de retornar usuário
   - Se `Date.now() > expiresAt`, retorna `null`
   - Cookie é removido automaticamente

2. **Middleware**
   - Verifica autenticação e expiração em todas as rotas protegidas
   - Redireciona para `/login` se sessão expirada

3. **Frontend**
   - Verificação periódica a cada 5 minutos
   - Redirecionamento automático quando expirado

## 📝 Estrutura da Sessão

```typescript
interface SessionData {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'agent';
    accountId: string;
  };
  expiresAt: number; // Timestamp em milissegundos
}
```

## ⏰ Tempo de Expiração

- **Duração**: 12 horas (43200 segundos)
- **Constante**: `SESSION_DURATION_MS = 12 * 60 * 60 * 1000`

## 🧪 Como Testar

### 1. Teste Manual

1. Faça login
2. Aguarde 12 horas (ou modifique temporariamente `SESSION_DURATION_MS` para testar)
3. Tente acessar qualquer rota protegida
4. Deve redirecionar para `/login`

### 2. Teste Rápido (Desenvolvimento)

Para testar rapidamente, modifique temporariamente:

```typescript
// lib/utils/auth.ts
export const SESSION_DURATION_MS = 1 * 60 * 1000; // 1 minuto (apenas para teste)
```

Depois:
1. Faça login
2. Aguarde 1 minuto
3. Tente acessar `/dashboard`
4. Deve redirecionar para `/login`

**⚠️ Lembre-se de reverter para 12 horas após o teste!**

### 3. Verificar Logs

Quando a sessão expira, você verá nos logs:
```
[Auth] Sessão expirada
```

## 🔄 Fluxo de Expiração

1. **Usuário faz login**
   - Sessão criada com `expiresAt = now + 12h`

2. **Usuário navega pelo sistema**
   - Cada requisição verifica `expiresAt`
   - Se válido, processa normalmente

3. **Sessão expira (após 12h)**
   - Próxima requisição detecta expiração
   - Cookie é removido
   - Usuário é redirecionado para `/login`

4. **Frontend detecta expiração**
   - Verificação periódica (5 min) detecta expiração
   - Estado local é limpo
   - Redirecionamento para `/login`

## 📊 Verificação Periódica

- **Frontend**: A cada 5 minutos
- **Backend**: A cada requisição
- **Middleware**: A cada acesso a rota protegida

## ✅ Comportamento Esperado

- ✅ Sessão válida: Usuário continua logado
- ✅ Sessão expirada: Redirecionamento automático para `/login`
- ✅ Cookie removido automaticamente quando expirado
- ✅ Estado local limpo quando expirado
- ✅ Mensagens de erro não expõem detalhes da expiração

## 🔐 Segurança Adicional

- Cookie `httpOnly`: Não acessível via JavaScript (proteção XSS)
- Cookie `secure`: Apenas HTTPS em produção
- Cookie `sameSite: 'lax'`: Proteção CSRF
- Validação no servidor: Não confia apenas no cliente

