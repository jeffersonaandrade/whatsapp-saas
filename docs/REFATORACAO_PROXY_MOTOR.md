# ✅ Refatoração: Cérebro como Proxy para o Motor

## 📋 Resumo da Refatoração

Esta refatoração transformou o projeto **CÉREBRO** (Next.js) em um **proxy seguro** para o **MOTOR** (Serviço Externo), eliminando toda a lógica de conexão direta com a Evolution API.

---

## 🎯 Objetivos Alcançados

### ✅ 1. Eliminação de Código Morto
- **Removido**: `lib/evolution-api.ts` (446 linhas de código morto)
- **Razão**: Este arquivo continha lógica de conexão direta com Evolution API que não pertence ao Cérebro

### ✅ 2. Criação do Cliente do Motor
- **Criado**: `lib/motor-client.ts`
- **Função**: Cliente HTTP para uso nas API Routes (servidor) que faz proxy para o Motor
- **URL Base**: `NEXT_PUBLIC_MOTOR_API_URL` (padrão: `https://whatsapp-evolution-api-fa3y.onrender.com`)

### ✅ 3. Refatoração das Rotas de API

Todas as rotas foram refatoradas para fazer proxy para o Motor:

#### `app/api/instance/connect/route.ts`
- **Antes**: Chamava `evolutionAPI.connectInstance()` diretamente
- **Depois**: Faz proxy via `motorClientAPI.connectInstance()`
- **Simplificação**: Removida toda lógica de Supabase e Evolution API

#### `app/api/instance/status/route.ts`
- **Antes**: Chamava `evolutionAPI.getInstanceStatus()` diretamente
- **Depois**: Faz proxy via `motorClientAPI.getInstanceStatus()`
- **Simplificação**: Removida lógica de busca no Supabase

#### `app/api/instance/disconnect/route.ts`
- **Antes**: Chamava `evolutionAPI.logoutInstance()` diretamente
- **Depois**: Faz proxy via `motorClientAPI.disconnectInstance()`
- **Simplificação**: Removida lógica de atualização no Supabase

#### `app/api/campaigns/route.ts`
- **Antes**: Chamava `evolutionAPI.sendGroupMessage()` e `evolutionAPI.sendGroupMedia()` diretamente
- **Depois**: Faz proxy via `motorClientAPI.sendGroupMessage()` e `motorClientAPI.sendGroupMedia()`

#### `app/api/campaigns/process-due/route.ts`
- **Antes**: Chamava `evolutionAPI.sendGroupMessage()` e `evolutionAPI.sendGroupMedia()` diretamente
- **Depois**: Faz proxy via `motorClientAPI.sendGroupMessage()` e `motorClientAPI.sendGroupMedia()`

#### `app/api/webhook/route.ts`
- **Antes**: Chamava `evolutionAPI.sendTextMessage()` e `evolutionAPI.sendMedia()` diretamente
- **Depois**: Faz proxy via `motorClientAPI.sendMessage()` e `motorClientAPI.sendMedia()`

---

## 📁 Arquivos Criados

### `lib/motor-client.ts`
Cliente HTTP para comunicação com o Motor nas API Routes do servidor.

**Características:**
- Usa `axios` com timeout de 30 segundos
- Logging estruturado com `logger`
- Tratamento de erros robusto
- Métodos disponíveis:
  - `connectInstance()`
  - `getInstanceStatus()`
  - `disconnectInstance()`
  - `sendMessage()`
  - `sendMedia()`
  - `sendGroupMessage()`
  - `sendGroupMedia()`
  - `fetchGroups()`

---

## 🔄 Fluxo de Dados Atual

### Antes (❌ Incorreto)
```
Frontend → API Route → evolution-api.ts → Evolution API (porta 8080)
```

### Depois (✅ Correto)
```
Frontend → API Route → motor-client.ts → Motor (Render) → Evolution API (porta 8080)
```

---

## 🎨 Arquitetura Final

```
┌─────────────────────────────────────────────────────────┐
│                    CÉREBRO (Netlify)                     │
│                                                          │
│  ┌──────────────┐         ┌──────────────────┐          │
│  │   Frontend   │────────▶│   API Routes     │          │
│  │  (Browser)   │         │  (Serverless)    │          │
│  └──────────────┘         └──────────────────┘          │
│         │                          │                    │
│         │                          │                    │
│         │                          ▼                    │
│         │                  ┌──────────────┐             │
│         │                  │motor-client.ts│             │
│         │                  └──────────────┘             │
│         │                          │                    │
│         │                          │                    │
│         └──────────────────────────┘                    │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    MOTOR (Render)                        │
│         https://whatsapp-evolution-api-fa3y.onrender.com │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   API Routes     │────────▶│  evolution-api.ts │     │
│  │  (Next.js API)   │         │  (Cliente HTTP)   │     │
│  └──────────────────┘         └──────────────────┘     │
│                                   │                      │
└───────────────────────────────────┼──────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────┐
│              Evolution API (Docker)                      │
│                    Porta 8080                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Variáveis de Ambiente

### No CÉREBRO (Netlify)
```env
# URL do Motor (Serviço Externo)
NEXT_PUBLIC_MOTOR_API_URL=https://whatsapp-evolution-api-fa3y.onrender.com

# NÃO configurar estas (removidas):
# NEXT_PUBLIC_EVOLUTION_API_URL (não usar mais)
# EVOLUTION_API_KEY (não usar mais)
```

### No MOTOR (Render)
```env
# Evolution API (apenas no Motor)
NEXT_PUBLIC_EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-api-key
```

---

## ✅ Checklist de Validação

- [x] `lib/evolution-api.ts` removido
- [x] `lib/motor-client.ts` criado
- [x] Todas as rotas refatoradas para usar `motor-client`
- [x] Build passando sem erros
- [x] Logs mostrando configuração correta do Motor Client
- [x] Imports de `evolution-api` removidos de todas as rotas

---

## 📝 Próximos Passos (Opcional)

1. **Atualizar documentação**: Atualizar referências a `evolution-api.ts` em docs
2. **Testes**: Testar todas as rotas refatoradas em ambiente de desenvolvimento
3. **Monitoramento**: Verificar logs do Motor para garantir que as requisições estão chegando corretamente

---

## 🎉 Resultado

O projeto **CÉREBRO** agora atua exclusivamente como um **proxy seguro** para o **MOTOR**, sem nenhuma lógica de conexão direta com a Evolution API. Toda a lógica pesada fica no Motor, conforme a arquitetura desejada.

