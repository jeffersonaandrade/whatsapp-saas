# 📚 Documentação Backend - WhatsApp SaaS

## 🎯 Visão Geral

Esta documentação fornece todas as informações necessárias para implementar o backend do WhatsApp SaaS, incluindo integração com Evolution API, Supabase e Groq AI.

---

## 📋 Documentos Disponíveis

### 1. **RESUMO_BACKEND.md** ⭐ (Comece Aqui)
Resumo executivo rápido com os pontos principais:
- Arquitetura simplificada
- Componentes principais
- Fluxos principais
- Endpoints principais
- Checklist de implementação

**Ideal para:** Entender rapidamente o que precisa ser feito

### 2. **GUIA_RAPIDO_BACKEND.md** 🚀
Guia rápido para começar a trabalhar:
- O que precisa ser feito
- Status atual de cada componente
- Checklist de implementação
- Como começar agora

**Ideal para:** Desenvolvedor backend que vai começar a trabalhar

### 3. **ARQUITETURA_BACKEND.md** 🏗️
Arquitetura completa e detalhada:
- Visão geral da arquitetura
- Arquitetura atual vs. proposta
- Integração com Evolution API
- Estrutura de APIs
- Fluxo de dados
- Banco de dados
- Autenticação e segurança
- Estrutura do projeto

**Ideal para:** Entender a arquitetura completa do sistema

### 4. **ESPECIFICACAO_TECNICA_BACKEND.md** 🔧
Especificação técnica detalhada:
- Resumo executivo
- Arquitetura de integração
- Endpoints da Evolution API
- Endpoints do backend
- Fluxos de integração
- Estrutura de dados
- Implementação passo a passo

**Ideal para:** Implementação técnica detalhada

### 5. **STATUS_ATUAL.md** 📊
Status atual do projeto:
- O que está completo
- O que está mockado
- Próximos passos
- Checklist

**Ideal para:** Entender o que já está feito

### 6. **TODOS_SUPABASE.md** 🗄️
Scripts SQL e integração Supabase:
- Scripts SQL para criar tabelas
- Configuração de RLS
- Integração com Supabase

**Ideal para:** Configurar banco de dados

---

## 🚀 Por Onde Começar?

### Para o Desenvolvedor Backend

1. **Leia primeiro:** `RESUMO_BACKEND.md`
   - Entenda rapidamente o que precisa ser feito

2. **Depois leia:** `GUIA_RAPIDO_BACKEND.md`
   - Veja o status atual e o que precisa ser implementado

3. **Para implementação:** `ESPECIFICACAO_TECNICA_BACKEND.md`
   - Veja os detalhes técnicos de cada endpoint

4. **Para arquitetura:** `ARQUITETURA_BACKEND.md`
   - Entenda a arquitetura completa do sistema

5. **Para banco de dados:** `TODOS_SUPABASE.md`
   - Configure o Supabase e crie as tabelas

---

## 📊 Resumo Rápido

### O Que Está Pronto ✅

- ✅ Frontend completo (todas as telas)
- ✅ Webhook com lógica do bot (parcialmente mockado)
- ✅ Integração Groq AI (completa)
- ✅ Rate limiting (completo)
- ✅ Sistema de produtos (mockado)
- ✅ Configurações do negócio (mockado)
- ✅ Análise de intenção (completa)
- ✅ Transbordo automático (completo)

### O Que Precisa Ser Feito ⏳

- ⏳ Configurar Evolution API (Docker)
- ⏳ Criar tabelas no Supabase
- ⏳ Substituir mocks por chamadas reais ao Supabase
- ⏳ Implementar autenticação real
- ⏳ Implementar APIs do frontend:
  - `/api/instance/*` (parcialmente implementado)
  - `/api/conversations/*` (precisa implementar)
  - `/api/products/*` (precisa implementar)
  - `/api/campaigns/*` (precisa implementar)
  - `/api/groups/*` (precisa implementar)

---

## 🏗️ Arquitetura

```
Frontend (Next.js) 
    ↓
Backend (Next.js API Routes)
    ↓
Evolution API (Docker) ← Webhook → Backend
    ↓
Supabase (PostgreSQL)
```

---

## 🔑 Componentes Principais

1. **Frontend (Next.js)**: Interface do usuário completa
2. **Backend (Next.js API Routes)**: Lógica de negócio e integrações
3. **Evolution API (Docker)**: Comunicação com WhatsApp
4. **Supabase (PostgreSQL)**: Banco de dados e autenticação
5. **Groq AI**: Processamento de IA

---

## 🔄 Fluxos Principais

### 1. Conectar WhatsApp
Usuário → Frontend → Backend → Evolution API → QR Code → Usuário escaneia → Conectado

### 2. Mensagem Recebida
Cliente envia → Evolution API → Webhook → Backend processa com Groq AI → Resposta → Evolution API → Cliente recebe

### 3. Atendente Envia Mensagem
Atendente digita → Frontend → Backend → Evolution API → Cliente recebe

### 4. Transbordo (Bot → Humano)
Cliente envia → Webhook detecta compra → Transfere para humano → Atendente assume

---

## 📡 Endpoints Principais

### Evolution API → Backend (Webhook)
- `POST /api/webhook` (recebe eventos da Evolution API)

### Frontend → Backend
- `POST /api/instance/connect` (conectar WhatsApp)
- `DELETE /api/instance/disconnect` (desconectar)
- `GET /api/instance/status` (status da conexão)
- `GET /api/conversations` (listar conversas)
- `POST /api/conversations/:id/messages` (enviar mensagem)
- `PUT /api/conversations/:id/takeover` (assumir conversa)
- `PUT /api/conversations/:id/resolve` (resolver conversa)
- `GET /api/products` (listar produtos)
- `POST /api/products` (criar produto)
- `GET /api/campaigns` (listar campanhas)
- `POST /api/campaigns` (criar campanha)
- `GET /api/groups` (listar grupos)
- `POST /api/groups` (criar grupo)

### Backend → Evolution API
- `POST /instance/create` (criar instância)
- `GET /instance/connect/{instanceName}` (obter QR Code)
- `GET /instance/connectionState/{instanceName}` (status)
- `POST /message/sendText/{instanceName}` (enviar mensagem)
- `POST /message/sendMedia/{instanceName}` (enviar mídia)
- `GET /group/fetchAllGroups/{instanceName}` (listar grupos)
- `DELETE /instance/logout/{instanceName}` (desconectar)
- `DELETE /instance/delete/{instanceName}` (deletar)

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

- `accounts` - Contas (multi-tenancy)
- `users` - Usuários (Supabase Auth)
- `instances` - Instâncias WhatsApp
- `contacts` - Contatos
- `conversations` - Conversas
- `messages` - Mensagens
- `products` - Produtos
- `groups` - Grupos
- `campaigns` - Campanhas

### Relacionamentos

```
accounts (1) ──→ (N) instances
accounts (1) ──→ (N) contacts
accounts (1) ──→ (N) products

instances (1) ──→ (N) conversations
instances (1) ──→ (N) groups
instances (1) ──→ (N) campaigns

contacts (1) ──→ (N) conversations
conversations (1) ──→ (N) messages
```

---

## 🔐 Autenticação e Segurança

- **Supabase Auth**: Gerenciamento de usuários e sessões
- **JWT Tokens**: Tokens de acesso para API
- **RLS (Row Level Security)**: Isolamento de dados por conta
- **API Keys**: Evolution API e Groq AI
- **Webhook Validation**: Validar origem dos webhooks
- **Rate Limiting**: Limitar requisições por instância

---

## 📦 Stack Tecnológica

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **Evolution API**: Docker container
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **IA**: Groq AI

---

## ✅ Checklist de Implementação

### Fase 1: Configuração Inicial
- [ ] Configurar Evolution API (Docker)
- [ ] Configurar variáveis de ambiente
- [ ] Configurar webhook URL na Evolution API
- [ ] Testar conexão com Evolution API

### Fase 2: Integração Supabase
- [ ] Criar tabelas no Supabase
- [ ] Configurar RLS (Row Level Security)
- [ ] Substituir mocks por chamadas reais ao Supabase
- [ ] Implementar autenticação real

### Fase 3: Webhook
- [ ] Implementar validação de webhook
- [ ] Processar eventos `messages.upsert`
- [ ] Processar eventos `connection.update`
- [ ] Processar eventos `qrcode.update`
- [ ] Integrar com Groq AI
- [ ] Salvar mensagens no Supabase

### Fase 4: APIs do Frontend
- [ ] Implementar `/api/instance/connect`
- [ ] Implementar `/api/instance/disconnect`
- [ ] Implementar `/api/instance/status`
- [ ] Implementar `/api/conversations`
- [ ] Implementar `/api/conversations/:id/messages`
- [ ] Implementar `/api/conversations/:id/takeover`
- [ ] Implementar `/api/products`
- [ ] Implementar `/api/campaigns`
- [ ] Implementar `/api/groups`

### Fase 5: Funcionalidades Avançadas
- [ ] Sistema de transbordo (bot → humano)
- [ ] Rate limiting
- [ ] Upload de imagens (produtos)
- [ ] Campanhas em grupos
- [ ] Gerenciamento de grupos com opt-in

---

## 📚 Referências

- [Evolution API Documentation](https://doc.evolution-api.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Groq AI Documentation](https://console.groq.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🆘 Suporte

Se tiver dúvidas ou precisar de ajuda:

1. Consulte a documentação específica em `docs/`
2. Verifique o código existente em `app/api/` e `lib/`
3. Veja os TODOs no código (marcados com `// TODO`)

---

**Última atualização:** 2024
**Versão:** 1.0



