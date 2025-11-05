# 🧪 Guia de Teste - WhatsApp SaaS

## 📋 Telas e Funcionalidades para Testar

### 🆕 TELAS NOVAS CRIADAS

#### 1. **Tela de Produtos** (`/products`) - ✨ NOVO!
- **Funcionalidade:** Cadastro de produtos para a IA responder
- **O que testar:**
  - Cadastrar produtos (nome, descrição, preço, categoria)
  - Editar produtos
  - Excluir produtos
  - Listar produtos em cards
  - Verificar se produtos aparecem na listagem

#### 2. **Tela de Configurações Melhorada** (`/settings`) - ✨ ATUALIZADA!
- **Funcionalidade:** Configurações do negócio para a IA responder
- **O que testar:**
  - **Configurações do Negócio (NOVO!):**
    - Nome da Empresa
    - Tipo de Negócio (Pizzaria, Hamburgueria, Clínica, etc.)
    - Descrição do Negócio
    - Horário de Funcionamento
    - Endereço
    - Telefone
    - Configurações de Entrega (checkbox + taxa)
  - **Configuração da IA (Groq):**
    - API Key do Groq
    - Informações sobre o plano gratuito
  - **Mensagens do Bot:**
    - Mensagem de Boas-Vindas
    - Mensagem Padrão (fallback)
    - Mensagem de Transferência
  - **Regras de Transferência:**
    - Palavras-chave para transferir
    - Transferência automática após X mensagens

---

### 🔧 FUNCIONALIDADES NOVAS CRIADAS

#### 1. **Sistema de Produtos** (`lib/services/products.ts`) - ✨ NOVO!
- **Funcionalidade:** CRUD de produtos (mockado)
- **O que testar:**
  - Cadastrar produto
  - Editar produto
  - Excluir produto
  - Listar produtos
  - Produtos aparecem formatados para a IA

#### 2. **Configurações do Negócio** (`lib/services/business-config.ts`) - ✨ NOVO!
- **Funcionalidade:** Configurações do negócio (mockado)
- **O que testar:**
  - Salvar configurações do negócio
  - Carregar configurações do negócio
  - Configurações passam como contexto para a IA

#### 3. **Webhook com Contexto Completo** (`app/api/webhook/route.ts`) - ✨ MELHORADO!
- **Funcionalidade:** Webhook recebe configurações do negócio e produtos
- **O que testar:**
  - Webhook recebe mensagens
  - Webhook busca configurações do negócio
  - Webhook busca produtos
  - IA recebe contexto completo (empresa, tipo, horário, endereço, entrega, produtos)
  - IA responde com informações corretas

#### 4. **IA com Contexto Completo** (`lib/services/groq-ai.ts`) - ✨ MELHORADO!
- **Funcionalidade:** IA recebe contexto completo do negócio
- **O que testar:**
  - IA recebe nome da empresa
  - IA recebe tipo de negócio
  - IA recebe horário de funcionamento
  - IA recebe endereço
  - IA recebe telefone
  - IA recebe informações de entrega
  - IA recebe produtos cadastrados
  - IA responde com informações corretas

---

### 📱 TELAS EXISTENTES (Para Testar)

#### 1. **Login** (`/login`)
- **Funcionalidade:** Autenticação (mockada)
- **O que testar:**
  - Login com credenciais mockadas
  - Redirecionamento para dashboard

#### 2. **Dashboard** (`/dashboard`)
- **Funcionalidade:** Visão geral do sistema
- **O que testar:**
  - Status da conexão
  - Métricas básicas
  - QR Code para conectar (mockado)

#### 3. **Conversas** (`/conversations`)
- **Funcionalidade:** Chat com transbordo
- **O que testar:**
  - Lista de conversas
  - Chat com mensagens
  - Transbordo (assumir conversa)
  - Resolver conversa

#### 4. **Campanhas** (`/campaigns`)
- **Funcionalidade:** Criar campanhas
- **O que testar:**
  - Lista de campanhas
  - Criar nova campanha
  - Editar campanha
  - Excluir campanha

#### 5. **Grupos** (`/groups`)
- **Funcionalidade:** Gerenciar grupos
- **O que testar:**
  - Lista de grupos
  - Criar grupo
  - Editar grupo
  - Excluir grupo

#### 6. **Equipe** (`/team`)
- **Funcionalidade:** Gerenciar equipe
- **O que testar:**
  - Lista de membros
  - Adicionar membro
  - Editar membro
  - Remover membro

---

## 🧪 ORDEM DE TESTE RECOMENDADA

### 1️⃣ **Autenticação**
- [ ] Testar login (`/login`)
- [ ] Testar cadastro (`/signup`)
- [ ] Verificar redirecionamento para dashboard

### 2️⃣ **Configurações do Negócio** (NOVO!)
- [ ] Acessar `/settings`
- [ ] Preencher configurações do negócio:
  - Nome da Empresa
  - Tipo de Negócio (ex: Pizzaria)
  - Descrição do Negócio
  - Horário de Funcionamento
  - Endereço
  - Telefone
  - Configurações de Entrega
- [ ] Salvar configurações
- [ ] Verificar se salvou (mockado)

### 3️⃣ **Produtos** (NOVO!)
- [ ] Acessar `/products`
- [ ] Cadastrar produto:
  - Nome: "Pizza Margherita"
  - Descrição: "Pizza artesanal com molho de tomate e mussarela"
  - Preço: 35.90
  - Categoria: "Pizzas Pequenas"
- [ ] Cadastrar mais produtos (ex: Pizza Calabresa, Refrigerante)
- [ ] Editar produto
- [ ] Excluir produto
- [ ] Verificar se produtos aparecem na listagem

### 4️⃣ **Dashboard**
- [ ] Acessar `/dashboard`
- [ ] Verificar status da conexão
- [ ] Verificar métricas
- [ ] Testar conectar/desconectar (mockado)

### 5️⃣ **Conversas**
- [ ] Acessar `/conversations`
- [ ] Verificar lista de conversas (mockadas)
- [ ] Selecionar conversa
- [ ] Verificar mensagens
- [ ] Testar transbordo (assumir conversa)
- [ ] Testar resolver conversa

### 6️⃣ **Configuração da IA (Groq)**
- [ ] Acessar `/settings`
- [ ] Preencher API Key do Groq (se tiver)
- [ ] Salvar configurações
- [ ] Verificar informações sobre o plano gratuito

### 7️⃣ **Webhook** (Testar via API)
- [ ] Testar webhook recebendo mensagem
- [ ] Verificar se webhook busca configurações do negócio
- [ ] Verificar se webhook busca produtos
- [ ] Verificar se IA recebe contexto completo
- [ ] Verificar se IA responde com informações corretas

---

## 🔧 COMO TESTAR

### 1. **Iniciar o Servidor**
```bash
npm run dev
```

### 2. **Acessar no Navegador**
- Abra: `http://localhost:3000`
- Você será redirecionado para `/login`

### 3. **Fazer Login**
- **Email:** `admin@test.com` (ou qualquer email)
- **Senha:** `admin123` (ou qualquer senha)
- Isso é mockado, então qualquer credencial funciona

### 4. **Testar Telas**
- Siga a ordem de teste recomendada acima
- Teste cada funcionalidade
- Verifique se tudo está funcionando

---

## 📝 CHECKLIST DE TESTE

### ✅ Configurações do Negócio
- [ ] Salvar nome da empresa
- [ ] Salvar tipo de negócio
- [ ] Salvar descrição do negócio
- [ ] Salvar horário de funcionamento
- [ ] Salvar endereço
- [ ] Salvar telefone
- [ ] Salvar configurações de entrega
- [ ] Carregar configurações salvas

### ✅ Produtos
- [ ] Cadastrar produto
- [ ] Editar produto
- [ ] Excluir produto
- [ ] Listar produtos
- [ ] Produtos aparecem formatados para a IA

### ✅ Webhook
- [ ] Webhook recebe mensagem
- [ ] Webhook busca configurações do negócio
- [ ] Webhook busca produtos
- [ ] IA recebe contexto completo
- [ ] IA responde com informações corretas

### ✅ IA
- [ ] IA recebe nome da empresa
- [ ] IA recebe tipo de negócio
- [ ] IA recebe horário de funcionamento
- [ ] IA recebe endereço
- [ ] IA recebe telefone
- [ ] IA recebe informações de entrega
- [ ] IA recebe produtos cadastrados
- [ ] IA responde com informações corretas

---

## 🚀 PRÓXIMOS PASSOS

Depois de testar tudo:
1. ✅ Verificar se tudo está funcionando
2. ✅ Documentar problemas encontrados
3. ✅ Ajustar o que for necessário
4. ✅ Começar desenvolvimento da Evolution API

---

**Última atualização:** Agora
**Status:** ✅ Pronto para testar

