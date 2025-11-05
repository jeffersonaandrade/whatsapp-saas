# 🤖 Capacidades da IA - O Que Ela Pode Responder

## ✅ O QUE A IA ESTÁ PREPARADA PARA RESPONDER AGORA

### 1. **Análise de Intenção** (Detecta o que o cliente quer)
- ✅ Detecta se cliente quer **COMPRAR** → Transfere para humano
- ✅ Detecta se cliente está **PROSPECtANDO** → Responde com IA
- ✅ Detecta outras situações → Responde adequadamente

### 2. **Respostas Contextuais** (Baseadas no contexto)
- ✅ **Informações sobre produtos** (preços, descrições, categorias)
- ✅ **Perguntas gerais** sobre o negócio
- ✅ **Saudações** e primeiras interações
- ✅ **Respostas amigáveis** e profissionais

### 3. **Contexto Atual** (O que a IA sabe)
- ✅ Nome da empresa (`companyName`)
- ✅ Tipo de negócio (`businessType`)
- ✅ Lista de produtos cadastrados (nome, preço, descrição, categoria)
- ✅ Histórico da conversa (últimas mensagens)

---

## 📋 EXEMPLOS DE O QUE A IA PODE RESPONDER

### Exemplo 1: Pizzaria
**Cliente:** "Quanto custa uma pizza grande?"
**IA:** "Temos pizzas grandes a partir de R$ 45,90. Qual sabor você prefere? Temos margherita, calabresa, portuguesa e muitos outros sabores!"

**Cliente:** "Quero fazer um pedido de 5 pizzas"
**IA:** "Perfeito! Vou transferir você para um atendente humano para finalizar seu pedido..."

### Exemplo 2: Hamburgueria
**Cliente:** "Vocês entregam?"
**IA:** "Sim! Fazemos entregas na região. Qual bairro você está? Nossos hambúrgueres custam a partir de R$ 25,90."

**Cliente:** "Quero comprar 10 hambúrgueres"
**IA:** "Ótimo! Vou transferir você para um atendente para organizar seu pedido..."

### Exemplo 3: Qualquer Negócio
**Cliente:** "Qual o horário de funcionamento?"
**IA:** "Funcionamos de segunda a sábado, das 18h às 23h. Estamos fechados aos domingos."

**Cliente:** "Vocês têm desconto?"
**IA:** "Temos promoções especiais! Um atendente pode te ajudar melhor com isso..."

---

## ⚠️ O QUE PRECISA SER MELHORADO PARA MULTI-CONTEXTO

### 1. **Configuração por Tipo de Negócio**
**Problema Atual:** 
- `companyName` e `businessType` estão hardcoded como "Nossa Empresa" e "Vendas"
- Não há campos específicos para cada tipo de negócio

**Solução Necessária:**
- Adicionar campos na tabela `accounts` no Supabase:
  - `company_name` (text)
  - `business_type` (text) - ex: "Pizzaria", "Hamburgueria", "Clínica", etc.
  - `business_description` (text) - descrição do negócio
  - `opening_hours` (text) - horário de funcionamento
  - `address` (text) - endereço
  - `phone` (text) - telefone
  - `delivery_available` (boolean) - se faz entregas
  - `delivery_fee` (decimal) - taxa de entrega

### 2. **Prompt da IA Mais Específico**
**Problema Atual:**
- Prompt genérico para todos os tipos de negócio
- Não diferencia entre pizzaria, hamburgueria, clínica, etc.

**Solução Necessária:**
- Personalizar o prompt baseado no `business_type`
- Adicionar instruções específicas por tipo de negócio
- Incluir informações específicas (horário, endereço, entrega, etc.)

### 3. **Produtos por Categoria**
**Já Implementado:**
- ✅ Campo `category` nos produtos
- ✅ Formatação de produtos por categoria

**Pode Melhorar:**
- Adicionar imagens dos produtos
- Adicionar variações (tamanhos, sabores, etc.)
- Adicionar estoque disponível

---

## 🔧 COMO ADAPTAR PARA DIFERENTES CONTEXTOS

### Exemplo: Pizzaria
```typescript
// Configuração no Supabase
{
  companyName: "Pizzaria do João",
  businessType: "Pizzaria",
  businessDescription: "Pizzaria artesanal com ingredientes frescos",
  openingHours: "18h às 23h (seg-sex), 17h às 00h (sáb-dom)",
  address: "Rua das Pizzas, 123",
  deliveryAvailable: true,
  deliveryFee: 5.00
}

// Produtos cadastrados
[
  { name: "Pizza Margherita", price: 35.90, category: "Pizzas Pequenas" },
  { name: "Pizza Calabresa", price: 38.90, category: "Pizzas Pequenas" },
  { name: "Pizza Grande", price: 45.90, category: "Pizzas Grandes" },
  { name: "Refrigerante 2L", price: 8.00, category: "Bebidas" }
]
```

### Exemplo: Hamburgueria
```typescript
// Configuração no Supabase
{
  companyName: "Burguer House",
  businessType: "Hamburgueria",
  businessDescription: "Hambúrgueres artesanais com carne premium",
  openingHours: "11h às 23h (seg-dom)",
  address: "Av. dos Hambúrgueres, 456",
  deliveryAvailable: true,
  deliveryFee: 6.00
}

// Produtos cadastrados
[
  { name: "Hambúrguer Clássico", price: 25.90, category: "Hambúrgueres" },
  { name: "Hambúrguer Bacon", price: 32.90, category: "Hambúrgueres" },
  { name: "Batata Frita", price: 12.00, category: "Acompanhamentos" },
  { name: "Refrigerante", price: 5.00, category: "Bebidas" }
]
```

### Exemplo: Clínica
```typescript
// Configuração no Supabase
{
  companyName: "Clínica Saúde Total",
  businessType: "Clínica Médica",
  businessDescription: "Atendimento médico de qualidade",
  openingHours: "8h às 18h (seg-sex)",
  address: "Rua da Saúde, 789",
  deliveryAvailable: false
}

// Produtos cadastrados (serviços)
[
  { name: "Consulta Geral", price: 150.00, category: "Consultas" },
  { name: "Consulta Pediatria", price: 180.00, category: "Consultas" },
  { name: "Exame de Sangue", price: 80.00, category: "Exames" }
]
```

---

## 🎯 PROMPT PERSONALIZADO POR TIPO DE NEGÓCIO

### Pizzaria
```
Você é o assistente virtual da ${companyName}, uma pizzaria artesanal.

Informações importantes:
- Horário: ${openingHours}
- Endereço: ${address}
- Fazemos entregas: ${deliveryAvailable ? 'Sim' : 'Não'}
- Taxa de entrega: R$ ${deliveryFee}

Produtos disponíveis:
${products}

Instruções:
- Seja amigável e descontraído
- Quando cliente perguntar sobre sabores, liste os disponíveis
- Se cliente quiser fazer pedido, transfira para atendente humano
- Informe sobre promoções e combos quando relevante
```

### Hamburgueria
```
Você é o assistente virtual da ${companyName}, uma hamburgueria artesanal.

Informações importantes:
- Horário: ${openingHours}
- Endereço: ${address}
- Fazemos entregas: ${deliveryAvailable ? 'Sim' : 'Não'}
- Taxa de entrega: R$ ${deliveryFee}

Produtos disponíveis:
${products}

Instruções:
- Seja amigável e descontraído
- Quando cliente perguntar sobre hambúrgueres, liste os disponíveis
- Se cliente quiser fazer pedido, transfira para atendente humano
- Informe sobre combos e promoções quando relevante
```

### Clínica
```
Você é o assistente virtual da ${companyName}, uma clínica médica.

Informações importantes:
- Horário: ${openingHours}
- Endereço: ${address}
- Não fazemos entregas (é um serviço presencial)

Serviços disponíveis:
${products}

Instruções:
- Seja profissional e empático
- Quando cliente perguntar sobre serviços, liste os disponíveis
- Se cliente quiser agendar consulta, transfira para atendente humano
- Informe sobre formas de pagamento e convênios quando relevante
```

---

## 🔒 RATE LIMITING - SEMPRE ATIVO

### ✅ Proteções Implementadas
1. **Delay mínimo de 350ms** entre requisições → ~171 RPM (85% do limite)
2. **Usa 90% dos limites** → 180 RPM e 180K TPM (margem de segurança)
3. **Verifica ANTES** de fazer requisição → evita exceder
4. **Monitora tokens** e requests → alertas em 90% e 100%
5. **Fallback automático** → se exceder, usa resposta padrão
6. **Não processa IA** quando transferido → economiza requisições

### 📊 Limites da Groq (Plano Gratuito)
- **200 RPM** (Requests Per Minute) → Usamos 180 RPM (90%)
- **200K TPM** (Tokens Per Minute) → Usamos 180K TPM (90%)
- **Delay mínimo:** 350ms entre requisições

### 🎯 Como Funciona na Prática

```
Cliente envia mensagem
  ↓
Verifica rate limit (90% dos limites)
  ↓
Se OK → Aguarda delay mínimo (350ms)
  ↓
Faz requisição para Groq AI
  ↓
Registra uso de tokens
  ↓
Responde ao cliente
  ↓
Se rate limit excedido → Resposta padrão (fallback)
```

---

## 📝 RESUMO

### ✅ O QUE FUNCIONA AGORA
- ✅ Detecta intenção (compra vs. prospecção)
- ✅ Responde sobre produtos cadastrados
- ✅ Responde perguntas gerais
- ✅ Transfere quando cliente quer comprar
- ✅ Rate limiting completo (90% dos limites)
- ✅ Suporta múltiplos produtos e categorias

### ⚠️ O QUE PRECISA MELHORAR
- ⚠️ Configuração por tipo de negócio (hardcoded)
- ⚠️ Prompt personalizado por tipo de negócio
- ⚠️ Campos específicos (horário, endereço, entrega)
- ⚠️ Integração com Supabase (ainda mockado)

### 🎯 PRÓXIMOS PASSOS
1. Adicionar campos na tabela `accounts` no Supabase
2. Carregar configuração do negócio no webhook
3. Personalizar prompt baseado no `business_type`
4. Adicionar campos específicos (horário, endereço, etc.)
5. Testar com diferentes tipos de negócio

---

## 🚀 CONCLUSÃO

**A IA está preparada para responder sobre produtos, preços e perguntas gerais, mas precisa de configurações específicas por tipo de negócio para funcionar perfeitamente em diferentes contextos (pizzaria, hamburgueria, clínica, etc.).**

**O rate limiting está sempre ativo e protege contra exceder os limites gratuitos da Groq.**

