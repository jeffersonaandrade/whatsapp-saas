# 🧠 Arquitetura do CÉREBRO (Frontend/Client)

## 📍 Identidade do Projeto

**Este é o projeto CÉREBRO** - Frontend/Client que roda no **Netlify** (`https://jarespondi.netlify.app`).

### Responsabilidades

1. **Interface do Usuário**: Exibir dados, formulários, dashboards
2. **Lógica de IA (Groq)**: Processar mensagens com IA quando necessário
3. **Comando do Sistema**: Orquestrar ações através do Motor

---

## 🚫 REGRAS CRÍTICAS DE COMUNICAÇÃO

### ❌ NUNCA FAZER

1. **NUNCA chamar Evolution API diretamente**
   - ❌ Não fazer chamadas para porta `8080`
   - ❌ Não usar `NEXT_PUBLIC_EVOLUTION_API_URL` para chamadas diretas
   - ❌ Não tentar acessar `http://localhost:8080` ou URLs da Evolution API

2. **NUNCA executar lógica de backend de WhatsApp no cliente**
   - ❌ Não criar instâncias diretamente
   - ❌ Não enviar mensagens diretamente
   - ❌ Não gerenciar conexões WhatsApp

### ✅ SEMPRE FAZER

1. **SEMPRE chamar o MOTOR para ações de WhatsApp**
   - ✅ Usar `motor-service.ts` para todas as operações de WhatsApp
   - ✅ URL do Motor: `NEXT_PUBLIC_MOTOR_API_URL` (padrão: `https://whatsapp-evolution-api-fa3y.onrender.com`)
   - ✅ Todas as ações passam pelo Motor

---

## 🔄 Fluxo de Dados Correto

### 1. Conectar WhatsApp

```
Frontend (Cérebro)
  ↓ fetch() usando motor-service.ts
Motor (Render: https://whatsapp-evolution-api-fa3y.onrender.com)
  ↓ POST /api/instance/connect
Evolution API (porta 8080)
  ↓ Retorna QR Code
Motor
  ↓ Retorna resposta
Frontend (Cérebro)
  ↓ Exibe QR Code
```

### 2. Verificar Status

```
Frontend (Cérebro)
  ↓ GET usando motor-service.getInstanceStatus()
Motor (Render)
  ↓ GET /api/instance/status
Evolution API
  ↓ Retorna status
Motor
  ↓ Retorna resposta
Frontend (Cérebro)
  ↓ Atualiza UI
```

### 3. Enviar Mensagem

```
Frontend (Cérebro)
  ↓ POST usando motor-service.sendMessage()
Motor (Render)
  ↓ POST /api/messages/send
Evolution API
  ↓ Envia mensagem
Motor
  ↓ Retorna confirmação
Frontend (Cérebro)
  ↓ Atualiza UI
```

---

## 📁 Estrutura de Arquivos

### ✅ Arquivos Corretos (Usar)

- **`lib/services/motor-service.ts`**: Cliente para comunicação com o Motor
  - `connectInstance()`: Conectar WhatsApp
  - `getInstanceStatus()`: Verificar status
  - `disconnectInstance()`: Desconectar
  - `sendMessage()`: Enviar mensagem (se implementado)

### ⚠️ Arquivos que NÃO devem ser usados no Frontend

- **`lib/evolution-api.ts`**: ❌ NÃO usar no frontend/cliente
  - Este arquivo é para uso apenas no servidor (se necessário)
  - O frontend NUNCA deve importar este arquivo

### 🔧 Rotas de API do Next.js

As rotas em `app/api/instance/*` são **serverless functions** do Netlify.

**Opção 1**: Remover essas rotas se o frontend chama o Motor diretamente
**Opção 2**: Se mantidas, devem fazer proxy para o Motor, não chamar Evolution API diretamente

---

## 🔐 Variáveis de Ambiente

### No Netlify (Cérebro)

```env
# URL do Motor (Serviço Externo)
NEXT_PUBLIC_MOTOR_API_URL=https://whatsapp-evolution-api-fa3y.onrender.com

# NÃO configurar estas no Cérebro:
# NEXT_PUBLIC_EVOLUTION_API_URL (não usar)
# EVOLUTION_API_KEY (não usar)
```

### No Motor (Render)

```env
# Evolution API (apenas no Motor)
NEXT_PUBLIC_EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key
```

---

## 📝 Exemplo de Uso Correto

### ✅ Correto: Frontend chamando Motor

```typescript
// app/dashboard/page.tsx
import { connectInstance, getInstanceStatus } from '@/lib/services/motor-service';

async function handleConnect() {
  const result = await connectInstance();
  if (result.success) {
    // Exibir QR Code
    setQrCode(result.data.qrCode);
  }
}
```

### ❌ Incorreto: Frontend chamando Evolution API

```typescript
// ❌ NUNCA FAZER ISSO
import { evolutionAPI } from '@/lib/evolution-api';

async function handleConnect() {
  // ❌ ERRADO: Tentando chamar Evolution API diretamente
  const result = await evolutionAPI.createInstance();
}
```

---

## 🎯 Checklist de Implementação

Ao implementar uma funcionalidade de WhatsApp:

- [ ] Verificar se o frontend está usando `motor-service.ts`
- [ ] Confirmar que `NEXT_PUBLIC_MOTOR_API_URL` está configurado
- [ ] Garantir que NÃO há chamadas diretas para Evolution API
- [ ] Testar que as requisições passam pelo Motor
- [ ] Verificar que os cookies de autenticação são enviados (`withCredentials: true`)

---

## 🔍 Debugging

### Verificar se está chamando o Motor

1. Abrir DevTools → Network
2. Filtrar por "motor" ou URL do Motor
3. Verificar que as requisições vão para `NEXT_PUBLIC_MOTOR_API_URL`
4. Verificar que os cookies são enviados

### Erros Comuns

#### "CORS Error"
- ✅ Verificar que o Motor está configurado para aceitar requisições do Netlify
- ✅ Verificar `withCredentials: true` no `motor-service.ts`

#### "401 Unauthorized"
- ✅ Verificar que os cookies de autenticação estão sendo enviados
- ✅ Verificar que o usuário está autenticado no Cérebro

#### "Cannot connect to Evolution API"
- ❌ Se você vê este erro no frontend, significa que está tentando chamar Evolution API diretamente
- ✅ Corrigir para chamar o Motor

---

## 📚 Referências

- Motor Service: `lib/services/motor-service.ts`
- Frontend Dashboard: `app/dashboard/page.tsx`
- Documentação do Motor: (criar se necessário)

