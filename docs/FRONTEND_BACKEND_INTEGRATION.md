# Integração Frontend → Motor

## Arquitetura

```
Frontend (porta 3000) ← ESTE PROJETO
    ↓ Rotas locais: /api/auth/*, /api/dashboard/* (porta 3000)
    ↓ Rotas do Motor: /api/instance/* (porta 3001)
Motor/Backend (porta 3001)
    ↓ POST http://localhost:8080/instance/create (com apikey)
Evolution API (porta 8080) - Docker externo
```

## Separação de Escopo

### Rotas Locais (Porta 3000)
- ✅ `/api/auth/*` - Autenticação (login, signup, session, logout)
- ✅ `/api/dashboard/*` - Estatísticas e atividades
- ✅ `/api/users/*` - Gerenciamento de usuários
- ✅ Outras rotas internas do Next.js

**Usam**: `fetch()` padrão com URL relativa ou `credentials: 'include'`

### Rotas do Motor (Porta 3001)
- ✅ `/api/instance/connect` - Conectar instância WhatsApp
- ✅ `/api/instance/status` - Verificar status da instância
- ✅ `/api/instance/disconnect` - Desconectar instância

**Usam**: `motor-service.ts` que aponta para `NEXT_PUBLIC_MOTOR_API_URL`

## Implementação

### 1. Serviço do Motor (`lib/services/motor-service.ts`)

Serviço específico para comunicação com o Motor:

```typescript
const motorApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_MOTOR_API_URL, // http://localhost:3001
  withCredentials: true, // OBRIGATÓRIO: envia cookies
});

export const connectInstance = (data) => motorApi.post('/api/instance/connect', data);
export const getInstanceStatus = () => motorApi.get('/api/instance/status');
export const disconnectInstance = (data) => motorApi.post('/api/instance/disconnect', data);
```

### 2. Chamadas Atualizadas

- ✅ `app/dashboard/page.tsx`:
  - `handleConnect()` → `motorService.connectInstance()`
  - `checkConnectionStatus()` → `motorService.getInstanceStatus()`
  - `handleDisconnect()` → `motorService.disconnectInstance()`
  - `fetchDashboardData()` → `fetch('/api/dashboard/stats')` (local)

- ✅ `contexts/AuthContext.tsx`:
  - Todas as chamadas usam `fetch()` local (porta 3000)

## Configuração

### Variável de Ambiente

No arquivo `.env` do frontend:

```env
# URL do Motor (Backend na porta 3001) - APENAS para instâncias WhatsApp
NEXT_PUBLIC_MOTOR_API_URL=http://localhost:3001
```

### Como Funciona

1. **Frontend chama**: `post('/api/instance/connect')`
2. **Cliente HTTP**: Converte para `http://localhost:3001/api/instance/connect`
3. **Cookies enviados**: `credentials: 'include'` garante que cookies (`auth_token`, `user`, etc.) sejam enviados
4. **Backend recebe**: Cookies no header `Cookie`
5. **Backend processa**: Extrai `accountId` dos cookies e chama Evolution API

## Verificação

### 1. Verificar se os cookies estão sendo enviados

No DevTools do navegador (Network tab):
- Abra uma requisição para `/api/instance/connect`
- Verifique o header `Cookie` na aba Headers
- Deve conter: `auth_token=...; user=...; user_info=...`

### 2. Verificar URL do Backend

No console do navegador, você deve ver:
```
[Frontend → Backend] { method: 'POST', url: 'http://localhost:3001/api/instance/connect', hasCredentials: true }
```

### 3. Teste com curl (referência)

```bash
curl --location 'http://localhost:3001/api/instance/connect' \
  --header 'Content-Type: application/json' \
  --header 'Cookie: auth_token=eyJhb...; user=...; user_info=...' \
  --data '{
    "instanceName": "teste-instance-1",
    "accountId": "00000000-0000-0000-0000-000000000001"
  }'
```

O frontend agora deve funcionar exatamente como este curl.

## Resumo

- ✅ Frontend chama Backend (porta 3001)
- ✅ Cookies são enviados automaticamente (`credentials: 'include'`)
- ✅ Backend recebe cookies e extrai `accountId`
- ✅ Backend chama Evolution API (porta 8080) com `apikey`
- ❌ Frontend NUNCA chama Evolution API diretamente

