# 🏢 Multi-Tenancy no Webhook - Como Funciona

## 📋 O PROBLEMA

Se você perguntar **"quanto é o hamburguer real x"** pelo WhatsApp da **Hamburgueria A**, o bot precisa saber que está respondendo para a **Hamburgueria A** e não para a **Hamburgueria B**.

O sistema precisa identificar qual conta/hamburgueria está sendo usada quando uma mensagem chega.

---

## ✅ COMO FUNCIONA ATUALMENTE (MOCKADO)

### 1. **Webhook Recebe Mensagem**
```
Evolution API → Webhook (/api/webhook)
  ↓
Evento: messages.upsert
  ↓
Data: { instanceName: "hamburgueria-a-instance", messages: [...] }
```

### 2. **Sistema Identifica Instância**
```typescript
const { instanceName, messages } = data;
// instanceName = "hamburgueria-a-instance"
```

### 3. **Busca Configuração do Negócio**
```typescript
const businessConfig = await businessConfigService.getBusinessConfigByInstanceName(instanceName);
// Busca via instanceName → accountId → account
```

### 4. **Busca Produtos**
```typescript
const accountId = 'account-1'; // TODO: Buscar via instanceName no Supabase
const products = await productsService.getAllProducts(accountId);
// Busca produtos do accountId correto
```

### 5. **Bot Responde com Contexto Correto**
```typescript
const botResponse = await generateBotResponse(..., {
  companyName: businessConfig?.companyName, // "Hamburgueria A"
  products: productsContext, // Produtos da Hamburgueria A
});
```

---

## ⚠️ PROBLEMA ATUAL (MOCKADO)

Atualmente, o sistema está **mockado** e sempre retorna a primeira configuração:

```typescript
// lib/services/business-config.ts
async getBusinessConfigByInstanceName(instanceName: string): Promise<BusinessConfig | null> {
  // Por enquanto, retorna a primeira configuração mockada
  // TODO: Implementar busca real via instanceName -> accountId -> account
  return mockBusinessConfigs[0] || null; // ❌ SEMPRE RETORNA A PRIMEIRA!
}
```

```typescript
// app/api/webhook/route.ts
const accountId = 'account-1'; // ❌ HARDCODED!
const products = await productsService.getAllProducts(accountId);
```

---

## ✅ COMO DEVE FUNCIONAR (QUANDO CONECTAR AO SUPABASE)

### 1. **Webhook Recebe Mensagem com instanceName**
```
Evolution API → Webhook
  ↓
instanceName: "hamburgueria-a-instance"
```

### 2. **Buscar Instância no Supabase**
```sql
SELECT * FROM instances 
WHERE name = 'hamburgueria-a-instance';
```

**Resultado:**
```json
{
  "id": "instance-uuid-a",
  "account_id": "account-uuid-a",  // ← ID da Hamburgueria A
  "name": "hamburgueria-a-instance",
  "status": "connected"
}
```

### 3. **Buscar Conta (Account) no Supabase**
```sql
SELECT * FROM accounts 
WHERE id = 'account-uuid-a';
```

**Resultado:**
```json
{
  "id": "account-uuid-a",
  "company_name": "Hamburgueria A",
  "business_type": "Hamburgueria",
  "business_description": "...",
  "opening_hours": "18h às 23h",
  // ... outras configurações
}
```

### 4. **Buscar Produtos da Conta**
```sql
SELECT * FROM products 
WHERE account_id = 'account-uuid-a' 
AND is_active = true;
```

**Resultado:**
```json
[
  {
    "id": "product-1",
    "account_id": "account-uuid-a",
    "name": "Hamburguer Real X",
    "price": 35.90,
    "description": "...",
    // ... outros campos
  },
  // ... outros produtos da Hamburgueria A
]
```

### 5. **Bot Responde com Contexto Correto**
```typescript
const botResponse = await generateBotResponse(..., {
  companyName: 'Hamburgueria A', // ✅ Correto
  products: 'Hamburgueria A:\n- Hamburguer Real X: R$ 35,90\n...', // ✅ Produtos corretos
});
```

---

## 🔄 FLUXO COMPLETO (MOCKADO → REAL)

### MOCKADO (Atual):
```
1. Webhook recebe instanceName
   ↓
2. getBusinessConfigByInstanceName(instanceName)
   → Retorna mockBusinessConfigs[0] (❌ SEMPRE A PRIMEIRA)
   ↓
3. getAllProducts('account-1') (❌ HARDCODED)
   → Retorna produtos mockados
   ↓
4. Bot responde com contexto errado se houver múltiplas hamburguerias
```

### REAL (Quando conectar ao Supabase):
```
1. Webhook recebe instanceName
   ↓
2. Buscar instance no Supabase:
   SELECT account_id FROM instances WHERE name = instanceName
   ↓
3. Buscar account no Supabase:
   SELECT * FROM accounts WHERE id = account_id
   ↓
4. Buscar produtos no Supabase:
   SELECT * FROM products WHERE account_id = account_id AND is_active = true
   ↓
5. Bot responde com contexto correto da hamburgueria correta
```

---

## 📝 IMPLEMENTAÇÃO NECESSÁRIA

### 1. **Atualizar `getBusinessConfigByInstanceName`**

```typescript
// lib/services/business-config.ts
async getBusinessConfigByInstanceName(instanceName: string): Promise<BusinessConfig | null> {
  // 1. Buscar instance pelo name
  const { data: instance, error: instanceError } = await supabase
    .from('instances')
    .select('account_id')
    .eq('name', instanceName)
    .single();

  if (instanceError || !instance) {
    console.error('Erro ao buscar instância:', instanceError);
    return null;
  }

  // 2. Buscar account pelo account_id
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', instance.account_id)
    .single();

  if (accountError || !account) {
    console.error('Erro ao buscar conta:', accountError);
    return null;
  }

  // 3. Mapear campos do Supabase para BusinessConfig
  return {
    id: account.id,
    accountId: account.id,
    companyName: account.company_name,
    businessType: account.business_type,
    businessDescription: account.business_description,
    openingHours: account.opening_hours,
    address: account.address,
    phone: account.phone,
    deliveryAvailable: account.delivery_available,
    deliveryFee: account.delivery_fee,
    groqApiKey: account.groq_api_key,
    // Configurações do Bot
    welcomeMessage: account.welcome_message,
    defaultMessage: account.default_message,
    transferMessage: account.transfer_message,
    transferKeywords: account.transfer_keywords || [],
    botPersonality: account.bot_personality,
    createdAt: account.created_at,
    updatedAt: account.updated_at,
  };
}
```

### 2. **Atualizar `handleNewMessage` no Webhook**

```typescript
// app/api/webhook/route.ts
async function handleNewMessage(data: any) {
  const { instanceName, messages } = data;

  // Buscar instance no Supabase para obter accountId
  const { data: instance, error: instanceError } = await supabase
    .from('instances')
    .select('account_id')
    .eq('name', instanceName)
    .single();

  if (instanceError || !instance) {
    console.error('Erro ao buscar instância:', instanceError);
    return NextResponse.json({ error: 'Instância não encontrada' }, { status: 404 });
  }

  const accountId = instance.account_id; // ✅ AccountId correto da instância

  // Buscar configuração do negócio
  const businessConfig = await businessConfigService.getBusinessConfig(accountId);

  // Buscar produtos do accountId correto
  const products = await productsService.getAllProducts(accountId);

  // ... resto do código
}
```

---

## ✅ GARANTIAS DE MULTI-TENANCY

### 1. **Isolamento por Instância**
- Cada `instanceName` está vinculado a um `account_id` único
- Cada `account_id` tem suas próprias configurações e produtos

### 2. **Isolamento por Produtos**
- Produtos são filtrados por `account_id`
- Produtos inativos (`is_active = false`) não aparecem

### 3. **Isolamento por Configurações**
- Cada `account_id` tem suas próprias configurações do negócio
- Cada `account_id` tem suas próprias configurações do bot
- Cada `account_id` pode ter sua própria API Key do Groq

---

## 🧪 CENÁRIO DE TESTE

### Cenário:
- **Hamburgueria A**: `instanceName = "hamburgueria-a-instance"`, `accountId = "account-a"`
- **Hamburgueria B**: `instanceName = "hamburgueria-b-instance"`, `accountId = "account-b"`

### Teste:
1. Cliente envia mensagem para **Hamburgueria A**: "Quanto é o hamburguer real x?"
2. Webhook recebe: `instanceName = "hamburgueria-a-instance"`
3. Sistema busca: `instance.account_id = "account-a"`
4. Sistema busca produtos: `products WHERE account_id = "account-a"`
5. Bot responde: **"Hamburgueria A: Hamburguer Real X custa R$ 35,90"** ✅

### Teste:
1. Cliente envia mensagem para **Hamburgueria B**: "Quanto é o hamburguer real x?"
2. Webhook recebe: `instanceName = "hamburgueria-b-instance"`
3. Sistema busca: `instance.account_id = "account-b"`
4. Sistema busca produtos: `products WHERE account_id = "account-b"`
5. Bot responde: **"Hamburgueria B: Hamburguer Real X custa R$ 42,90"** ✅

---

## 📊 RESUMO

### ✅ Funcionando Agora (Mockado):
- Sistema identifica `instanceName` do webhook
- Busca configuração do negócio (mockado - sempre retorna primeira)
- Busca produtos (mockado - sempre retorna `account-1`)

### ⚠️ Problema Atual:
- **Sempre retorna primeira configuração** (não diferencia hamburguerias)
- **AccountId hardcoded** (não busca via `instanceName`)

### ✅ Quando Conectar ao Supabase:
- Sistema busca `instance` via `instanceName`
- Sistema obtém `account_id` correto da `instance`
- Sistema busca configuração do negócio do `account_id` correto
- Sistema busca produtos do `account_id` correto
- Bot responde com contexto correto da hamburgueria correta

---

**Última atualização:** Agora
**Status:** ⚠️ Mockado - Precisa implementar busca real via Supabase

