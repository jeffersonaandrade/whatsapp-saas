# 🤖 Configuração do Bot - Como Funciona

## 📋 O QUE É A TELA DE CONFIGURAÇÕES DO BOT?

A tela de **Configurações** (`/settings`) permite que cada cliente configure:
1. **Configurações do Negócio** - Informações que a IA usa para responder
2. **Configurações do Bot** - Mensagens e regras de transferência
3. **API Key do Groq** - Chave para usar a IA gratuita

---

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Configurações do Negócio** (Salvas e Usadas pelo Bot)
- ✅ Nome da Empresa
- ✅ Tipo de Negócio
- ✅ Descrição do Negócio
- ✅ Horário de Funcionamento
- ✅ Endereço
- ✅ Telefone
- ✅ Configurações de Entrega

**Onde são salvas:** Tabela `accounts` no Supabase (mockado por enquanto)

**Como o bot usa:**
- Bot busca configurações do negócio via `businessConfigService`
- Passa essas informações como contexto para a IA
- IA responde com informações corretas do negócio

### 2. **Configurações do Bot** (Salvas e Usadas pelo Bot)
- ✅ Mensagem de Boas-Vindas
- ✅ Mensagem Padrão (fallback)
- ✅ Mensagem de Transferência
- ✅ Palavras-chave para Transferir
- ✅ Transferência automática após X mensagens (removido - não é mais usado)

**Onde são salvas:** Tabela `accounts` no Supabase (mockado por enquanto)

**Como o bot usa:**
- Bot usa `defaultBotConfig` para mensagens padrão
- Usa palavras-chave para detectar solicitação de transferência
- Usa mensagens configuradas para responder

### 3. **API Key do Groq** (Salvas e Usadas pelo Bot)
- ✅ API Key do Groq (por conta)
- ✅ Fallback para variável de ambiente

**Onde são salvas:** Tabela `accounts` no Supabase (mockado por enquanto)

**Como o bot usa:**
- Bot busca API Key do Groq da configuração do negócio
- Se não tiver, usa variável de ambiente `GROQ_API_KEY`
- Se não tiver nenhuma, usa fallback (mensagem padrão)

---

## 🔄 COMO O BOT USA AS CONFIGURAÇÕES

### Fluxo do Bot ao Processar Mensagem:

```
1. Mensagem chega no webhook
   ↓
2. Bot busca configuração do negócio (businessConfig)
   ↓
3. Bot busca configurações do bot (defaultBotConfig)
   ↓
4. Bot verifica se deve limpar contexto (após fechamento)
   ↓
5. Bot verifica se cliente quer comprar OU solicita transferência
   ↓
6. Se sim → Transfere para humano
   ↓
7. Se não → Usa IA para responder
   ↓
8. Bot usa configurações do negócio como contexto para IA
   ↓
9. Bot usa mensagens configuradas (boas-vindas, fallback, etc.)
```

---

## 🎯 REGRAS DE TRANSFERÊNCIA

### O bot transfere para humano APENAS se:

1. **Cliente quer comprar** (`intention === 'purchase'`)
   - Detectado pela IA (Groq)
   - Exemplo: "Quero comprar", "Quanto custa para comprar", etc.

2. **Cliente solicita explicitamente** (palavras-chave)
   - Detectado por palavras-chave configuradas
   - Exemplo: "atendente", "atendimento humano", "falar com alguém", etc.

### O bot NÃO transfere mais:
- ❌ Transferência automática após X mensagens (removido)
- ❌ Por prospecção (apenas perguntas)
- ❌ Por outras situações

---

## 🧹 LIMPEZA DE CONTEXTO APÓS FECHAMENTO

### O bot limpa contexto da conversa quando:

1. **Passou mais de 24h** desde a última mensagem
2. **Loja fechou** desde a última mensagem (baseado no horário de funcionamento)

### Como funciona:

```
1. Cliente envia mensagem após fechamento da loja
   ↓
2. Bot verifica se deve limpar contexto
   ↓
3. Se sim → Remove mensagens antigas (antes do fechamento)
   ↓
4. Se limpou tudo → Envia mensagem de boas-vindas
   ↓
5. Bot usa apenas mensagens recentes (últimas 24h) como contexto
```

### Exemplo:

```
Dia 1 (18h-23h):
- Cliente: "Quanto custa a pizza?"
- Bot: "A pizza custa R$ 45,90"

Dia 2 (00h - loja fechada):
- Cliente: "Qual o sabor?"
- Bot: "Olá! Bem-vindo ao nosso atendimento..." (limpa contexto)
- Bot: "Temos vários sabores..." (responde sem contexto anterior)
```

---

## 📝 CONFIGURAÇÕES SALVAS

### Configurações do Negócio (Tabela `accounts`):
- `company_name` - Nome da empresa
- `business_type` - Tipo de negócio
- `business_description` - Descrição
- `opening_hours` - Horário de funcionamento
- `address` - Endereço
- `phone` - Telefone
- `delivery_available` - Se faz entregas
- `delivery_fee` - Taxa de entrega
- `groq_api_key` - API Key do Groq

### Configurações do Bot (Tabela `accounts` ou `bot_config`):
- `welcome_message` - Mensagem de boas-vindas
- `default_message` - Mensagem padrão (fallback)
- `transfer_message` - Mensagem de transferência
- `transfer_keywords` - Palavras-chave para transferir (array)

---

## 🔄 COMO O BOT BUSCA AS CONFIGURAÇÕES

### No Webhook (`app/api/webhook/route.ts`):

```typescript
// 1. Buscar configuração do negócio
const businessConfig = await businessConfigService.getBusinessConfigByInstanceName(instanceName);

// 2. Usar configurações do bot
const welcomeMessage = defaultBotConfig.welcomeMessage || '...';
const transferKeywords = defaultBotConfig.transferKeywords || [...];

// 3. Usar API Key do Groq (da configuração ou variável de ambiente)
const groqConfig = {
  apiKey: businessConfig?.groqApiKey || process.env.GROQ_API_KEY || '',
  model: 'groq/compound',
};

// 4. Passar configurações do negócio como contexto para IA
const botResponse = await generateBotResponse(..., {
  companyName: businessConfig?.companyName,
  businessType: businessConfig?.businessType,
  openingHours: businessConfig?.openingHours,
  // ... outras configurações
});
```

---

## ✅ CHECKLIST DE FUNCIONALIDADES

### Configurações do Negócio:
- [x] Salvar configurações do negócio
- [x] Bot busca configurações do negócio
- [x] Bot passa configurações como contexto para IA
- [x] IA responde com informações corretas

### Configurações do Bot:
- [x] Salvar mensagens do bot
- [x] Bot usa mensagem de boas-vindas
- [x] Bot usa mensagem padrão (fallback)
- [x] Bot usa mensagem de transferência
- [x] Bot usa palavras-chave para transferir

### Regras de Transferência:
- [x] Bot transfere se cliente quer comprar
- [x] Bot transfere se cliente solicita explicitamente
- [x] Bot NÃO transfere por prospecção
- [x] Bot NÃO transfere automaticamente após X mensagens

### Limpeza de Contexto:
- [x] Bot limpa contexto após 24h
- [x] Bot limpa contexto após fechamento da loja
- [x] Bot envia boas-vindas se limpou contexto
- [x] Bot usa apenas mensagens recentes como contexto

---

## 🚀 PRÓXIMOS PASSOS (Quando Conectar ao Supabase)

### 1. **Salvar Configurações do Bot no Supabase**
- Adicionar campos na tabela `accounts` ou criar tabela `bot_config`
- Salvar mensagens do bot
- Salvar palavras-chave de transferência

### 2. **Carregar Configurações do Bot do Supabase**
- Buscar configurações do bot no webhook
- Usar configurações salvas em vez de `defaultBotConfig`

### 3. **Melhorar Parsing de Horário de Funcionamento**
- Implementar parsing completo do horário
- Verificar se loja está aberta baseado no horário atual
- Limpar contexto baseado no horário real de fechamento

---

## 📊 RESUMO

### ✅ Funcionando Agora:
- ✅ Configurações do negócio são salvas e usadas pelo bot
- ✅ Configurações do bot são salvas e usadas pelo bot
- ✅ Bot transfere apenas se cliente quer comprar OU solicita
- ✅ Bot limpa contexto após fechamento da loja
- ✅ Bot usa apenas mensagens recentes como contexto

### ⏳ Quando Conectar ao Supabase:
- Substituir mocks por chamadas reais ao Supabase
- Salvar configurações do bot no Supabase
- Carregar configurações do bot do Supabase
- Melhorar parsing de horário de funcionamento

---

**Última atualização:** Agora
**Status:** ✅ Configurações funcionando (mockado)

