# 🏢 Configuração do Negócio - Tela de Configurações

## 📋 O QUE É A TELA DE CONFIGURAÇÕES DO NEGÓCIO?

A tela de **Configurações** (`/settings`) permite que cada cliente do seu SaaS configure informações do seu negócio, que serão usadas pela IA para responder aos clientes com contexto correto.

---

## 🎯 COMO FUNCIONA

### 1. **Cliente Acessa a Tela**
- Cliente faz login no painel
- Acessa `/settings`
- Preenche informações do negócio

### 2. **Cliente Preenche Informações**
- Nome da Empresa
- Tipo de Negócio (Pizzaria, Hamburgueria, Clínica, etc.)
- Descrição do Negócio
- Horário de Funcionamento
- Endereço
- Telefone
- Configurações de Entrega (se faz entregas, taxa de entrega)

### 3. **Sistema Salva no Supabase**
- Informações são salvas na tabela `accounts`
- Cada conta (cliente) tem suas próprias configurações
- Configurações são isoladas por `account_id`

### 4. **IA Usa as Informações**
- Quando uma mensagem chega, o webhook identifica o `account_id`
- Sistema busca configurações do negócio no Supabase
- IA recebe contexto específico do cliente
- IA responde com informações corretas

---

## 📊 CAMPOS DA TELA

### Campos Obrigatórios:
- ✅ **Nome da Empresa** - Nome do negócio
- ✅ **Tipo de Negócio** - Pizzaria, Hamburgueria, Clínica, etc.

### Campos Opcionais:
- **Descrição do Negócio** - Descrição breve
- **Horário de Funcionamento** - Ex: "18h às 23h (seg-sáb)"
- **Endereço** - Endereço físico do negócio
- **Telefone** - Telefone de contato
- **Fazemos Entregas** - Checkbox (sim/não)
- **Taxa de Entrega** - Valor em R$ (se faz entregas)

---

## 🔄 FLUXO DE DADOS

```
1. Cliente preenche formulário na tela /settings
   ↓
2. Cliente clica em "Salvar Configurações"
   ↓
3. Sistema salva no Supabase:
   UPDATE accounts SET
     company_name = 'Pizzaria do João',
     business_type = 'Pizzaria',
     business_description = 'Pizzaria artesanal...',
     opening_hours = '18h às 23h',
     address = 'Rua das Pizzas, 123',
     phone = '(11) 98765-4321',
     delivery_available = true,
     delivery_fee = 5.00
   WHERE id = account_id
   ↓
4. Quando mensagem chega no WhatsApp:
   - Webhook identifica account_id via instanceName
   - Sistema busca configurações do negócio no Supabase
   - IA recebe contexto específico do cliente
   - IA responde com informações corretas
```

---

## 🎯 EXEMPLO PRÁTICO

### Hamburgueria A (Account ID: `account-1`)

**Configurações preenchidas:**
- Nome: "Burguer House"
- Tipo: "Hamburgueria"
- Descrição: "Hambúrgueres artesanais com carne premium"
- Horário: "11h às 23h (seg-dom)"
- Endereço: "Av. dos Hambúrgueres, 456"
- Telefone: "(11) 91234-5678"
- Fazemos Entregas: ✅ Sim
- Taxa de Entrega: R$ 6,00

**Quando cliente pergunta:**
```
Cliente: "Vocês entregam?"
IA: "Sim! Fazemos entregas na região. A taxa de entrega é R$ 6,00. 
     Qual bairro você está? Nossos hambúrgueres custam a partir de R$ 25,90."
```

### Hamburgueria B (Account ID: `account-2`)

**Configurações preenchidas:**
- Nome: "Super Burger"
- Tipo: "Hamburgueria"
- Descrição: "Hambúrgueres gourmet com ingredientes premium"
- Horário: "18h às 23h (seg-sáb)"
- Endereço: "Rua dos Burgers, 789"
- Telefone: "(11) 99876-5432"
- Fazemos Entregas: ✅ Sim
- Taxa de Entrega: R$ 8,00

**Quando cliente pergunta:**
```
Cliente: "Vocês entregam?"
IA: "Sim! Fazemos entregas na região. A taxa de entrega é R$ 8,00. 
     Qual bairro você está? Nossos hambúrgueres custam a partir de R$ 35,90."
```

**Cada hamburgueria recebe respostas com SUAS próprias informações!**

---

## 🔍 COMO O SISTEMA IDENTIFICA O CLIENTE

### Quando uma Mensagem Chega:

```
1. Evolution API recebe mensagem
   ↓
2. Evolution API envia webhook para /api/webhook
   Body: { instanceName: "hamburgueria-a-instance", ... }
   ↓
3. Webhook busca instance no Supabase:
   SELECT account_id FROM instances 
   WHERE name = 'hamburgueria-a-instance'
   ↓
4. Sistema identifica: account_id = 'account-1'
   ↓
5. Sistema busca configurações do account-1:
   SELECT * FROM accounts WHERE id = 'account-1'
   ↓
6. Sistema busca produtos do account-1:
   SELECT * FROM products WHERE account_id = 'account-1'
   ↓
7. Sistema passa contexto para IA:
   {
     companyName: "Burguer House",
     businessType: "Hamburgueria",
     openingHours: "11h às 23h (seg-dom)",
     address: "Av. dos Hambúrgueres, 456",
     deliveryAvailable: true,
     deliveryFee: 6.00,
     products: [...produtos da Hamburgueria A]
   }
   ↓
8. IA responde com contexto correto
```

---

## 📝 ESTRUTURA DA TELA

### Seção 1: Configurações do Negócio
- Nome da Empresa
- Tipo de Negócio (select com opções)
- Descrição do Negócio
- Horário de Funcionamento
- Endereço
- Telefone
- Configurações de Entrega (checkbox + taxa)

### Seção 2: Configuração da IA (Groq)
- API Key do Groq
- Informações sobre o plano gratuito

### Seção 3: Mensagens do Bot
- Mensagem de Boas-Vindas
- Mensagem Padrão (fallback)
- Mensagem de Transferência

### Seção 4: Regras de Transferência
- Palavras-chave para transferir
- Transferência automática após X mensagens

---

## 🔒 SEGURANÇA

### Row Level Security (RLS):
- Cada cliente só pode ver/editar suas próprias configurações
- Sistema usa `account_id` para isolar dados
- Políticas do Supabase garantem isolamento

---

## 📊 RESUMO

### ✅ O QUE A TELA FAZ:
1. ✅ Permite cliente configurar informações do negócio
2. ✅ Salva configurações no Supabase (tabela `accounts`)
3. ✅ Isola configurações por `account_id` (multi-tenancy)
4. ✅ IA usa essas informações para responder aos clientes
5. ✅ Cada cliente tem suas próprias configurações

### ✅ BENEFÍCIOS:
- ✅ IA responde com contexto correto para cada cliente
- ✅ Cada cliente pode ter tipo de negócio diferente
- ✅ Configurações são isoladas e seguras
- ✅ Fácil de configurar (tela simples e intuitiva)

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar script SQL** (`database/supabase_accounts_business_fields.sql`)
2. **Conectar tela ao Supabase** (substituir mocks)
3. **Melhorar webhook** para usar configurações do negócio
4. **Personalizar prompt da IA** baseado no `business_type`
5. **Testar** com múltiplos clientes

