# 🏢 Multi-Tenancy - Como Funciona

## 📋 O QUE É MULTI-TENANCY?

**Multi-tenancy** significa que o sistema pode atender **múltiplos clientes** (contas) separadamente, cada um com seus próprios dados e configurações.

### Exemplo Prático:
- **Hamburgueria A** → Tem seus produtos, configurações, conversas
- **Hamburgueria B** → Tem seus produtos, configurações, conversas
- **Pizzaria C** → Tem seus produtos, configurações, conversas

Cada uma funciona **independentemente**, sem ver os dados das outras.

---

## 🏗️ ARQUITETURA MULTI-TENANT

### Como Funciona no Código:

```
┌─────────────────────────────────────────┐
│         Evolution API (Render)          │
│  ┌────────────┐  ┌────────────┐         │
│  │ Instance A │  │ Instance B │  ...    │
│  │ (Hamb A)   │  │ (Hamb B)   │         │
│  └────────────┘  └────────────┘         │
│         │              │                │
│         └──────┬───────┘                │
│                │                         │
│         Webhook (Next.js)                │
│                │                         │
└────────────────┼─────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Supabase (PostgreSQL)            │
│  ┌────────────┐  ┌────────────┐         │
│  │ Account A  │  │ Account B  │  ...    │
│  │ (Hamb A)   │  │ (Hamb B)   │         │
│  └────────────┘  └────────────┘         │
│       │              │                   │
│       ├─ Instances   ├─ Instances        │
│       ├─ Products    ├─ Products         │
│       ├─ Conversations├─ Conversations   │
│       └─ Config      └─ Config           │
└─────────────────────────────────────────┘
```

---

## 🔑 IDENTIFICAÇÃO DOS CLIENTES

### 1. **Account ID** (Conta do Cliente)
- Cada cliente do seu SaaS tem um `account_id` único
- Exemplo: `account-1` (Hamburgueria A), `account-2` (Hamburgueria B)

### 2. **Instance ID** (Instância do WhatsApp)
- Cada cliente pode ter uma ou mais instâncias do WhatsApp
- Cada instância está vinculada a um `account_id`
- Exemplo: `instance-1` (número do WhatsApp da Hamburgueria A)

### 3. **Instance Name** (Nome da Instância)
- A Evolution API usa `instanceName` para identificar a instância
- O `instanceName` é único e está vinculado a um `account_id`

---

## 🔄 FLUXO DE IDENTIFICAÇÃO

### Quando uma Mensagem Chega:

```
1. Evolution API recebe mensagem
   ↓
2. Evolution API envia webhook para /api/webhook
   ↓
3. Webhook recebe: { instanceName: "hamburgueria-a-instance" }
   ↓
4. Sistema busca no Supabase:
   SELECT account_id FROM instances WHERE name = 'hamburgueria-a-instance'
   ↓
5. Sistema identifica: account_id = 'account-1'
   ↓
6. Sistema busca configurações do account-1:
   SELECT * FROM accounts WHERE id = 'account-1'
   ↓
7. Sistema busca produtos do account-1:
   SELECT * FROM products WHERE account_id = 'account-1'
   ↓
8. Sistema passa contexto para IA:
   {
     companyName: "Hamburgueria A",
     businessType: "Hamburgueria",
     products: [...produtos da Hamburgueria A]
   }
   ↓
9. IA responde com contexto correto
```

---

## 📊 ESTRUTURA DE DADOS

### Tabela `accounts` (Contas dos Clientes)
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  owner_email TEXT,
  company_name TEXT,
  business_type TEXT,        -- "Pizzaria", "Hamburgueria", etc.
  business_description TEXT,
  opening_hours TEXT,
  address TEXT,
  phone TEXT,
  delivery_available BOOLEAN,
  delivery_fee DECIMAL,
  groq_api_key TEXT,
  created_at TIMESTAMPTZ
);
```

### Tabela `instances` (Instâncias do WhatsApp)
```sql
CREATE TABLE instances (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),  -- Vincula à conta
  name TEXT NOT NULL UNIQUE,                 -- Nome único (usado no webhook)
  status TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ
);
```

### Tabela `products` (Produtos)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  account_id UUID REFERENCES accounts(id),  -- Vincula à conta
  name TEXT,
  price DECIMAL,
  category TEXT,
  created_at TIMESTAMPTZ
);
```

### Tabela `conversations` (Conversas)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  instance_id UUID REFERENCES instances(id),  -- Vincula à instância
  contact_phone TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
);
```

---

## 🔍 COMO O WEBHOOK IDENTIFICA O CLIENTE

### Código no Webhook (`app/api/webhook/route.ts`):

```typescript
async function handleNewMessage(data: any) {
  const { instanceName, messages } = data;
  
  // 1. Buscar instance no Supabase pelo instanceName
  const instance = await supabase
    .from('instances')
    .select('id, account_id')
    .eq('name', instanceName)
    .single();
  
  if (!instance) {
    console.error(`Instance ${instanceName} não encontrada`);
    return;
  }
  
  const accountId = instance.account_id;
  
  // 2. Buscar configuração do negócio pelo accountId
  const account = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single();
  
  // 3. Buscar produtos do accountId
  const products = await supabase
    .from('products')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true);
  
  // 4. Passar contexto para IA
  const botResponse = await generateBotResponse(
    messageText,
    conversationHistory,
    groqConfig,
    {
      companyName: account.company_name,
      businessType: account.business_type,
      businessDescription: account.business_description,
      openingHours: account.opening_hours,
      address: account.address,
      deliveryAvailable: account.delivery_available,
      deliveryFee: account.delivery_fee,
      products: formatProductsForAI(products.data),
    }
  );
  
  // 5. Resposta específica para o cliente correto
  return botResponse;
}
```

---

## 🎯 EXEMPLO PRÁTICO

### Cenário: Duas Hamburguerias

#### Hamburgueria A (Account ID: `account-1`)
- **Instance Name:** `hamburgueria-a-instance`
- **Company Name:** "Burguer House"
- **Business Type:** "Hamburgueria"
- **Products:**
  - Hambúrguer Clássico - R$ 25,90
  - Hambúrguer Bacon - R$ 32,90
  - Batata Frita - R$ 12,00

#### Hamburgueria B (Account ID: `account-2`)
- **Instance Name:** `hamburgueria-b-instance`
- **Company Name:** "Super Burger"
- **Business Type:** "Hamburgueria"
- **Products:**
  - Mega Burger - R$ 35,90
  - Double Burger - R$ 45,90
  - Onion Rings - R$ 15,00

### Quando Cliente A pergunta:
```
Cliente: "Quanto custa um hambúrguer?"
```

**Sistema identifica:**
- Webhook recebe: `instanceName = "hamburgueria-a-instance"`
- Busca no Supabase: `account_id = "account-1"`
- Busca produtos: `account_id = "account-1"`
- IA responde: "Temos hambúrgueres a partir de R$ 25,90. Qual você prefere? Clássico (R$ 25,90) ou Bacon (R$ 32,90)?"

### Quando Cliente B pergunta:
```
Cliente: "Quanto custa um hambúrguer?"
```

**Sistema identifica:**
- Webhook recebe: `instanceName = "hamburgueria-b-instance"`
- Busca no Supabase: `account_id = "account-2"`
- Busca produtos: `account_id = "account-2"`
- IA responde: "Temos hambúrgueres a partir de R$ 35,90. Qual você prefere? Mega Burger (R$ 35,90) ou Double Burger (R$ 45,90)?"

**Cada hamburgueria recebe respostas com SEUS próprios produtos!**

---

## 🔒 SEGURANÇA (Row Level Security - RLS)

### Políticas do Supabase:

```sql
-- Usuários só podem ver dados da sua própria conta
CREATE POLICY "Users can only see their own account data"
ON accounts FOR SELECT
USING (id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Usuários só podem editar dados da sua própria conta
CREATE POLICY "Users can only edit their own account data"
ON accounts FOR UPDATE
USING (id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));

-- Produtos só podem ser vistos/editados pela própria conta
CREATE POLICY "Users can only see their own products"
ON products FOR SELECT
USING (account_id IN (
  SELECT account_id FROM users WHERE id = auth.uid()
));
```

---

## 📝 RESUMO

### ✅ Como Funciona:
1. **Cada cliente** tem um `account_id` único
2. **Cada instância** está vinculada a um `account_id`
3. **Webhook identifica** o cliente pelo `instanceName`
4. **Sistema busca** configurações e produtos do `account_id` correto
5. **IA responde** com contexto específico do cliente

### ✅ Garantias:
- ✅ Cada cliente vê apenas seus próprios dados
- ✅ Configurações são específicas por cliente
- ✅ Produtos são específicos por cliente
- ✅ IA responde com contexto correto para cada cliente
- ✅ Segurança através de RLS no Supabase

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar script SQL** (`supabase_accounts_business_fields.sql`)
2. **Melhorar webhook** para identificar `accountId` via `instanceName`
3. **Criar serviço** para buscar configuração do negócio
4. **Implementar RLS** no Supabase
5. **Testar** com múltiplos clientes

