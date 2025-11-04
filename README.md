'''
# WhatsApp SaaS - Boilerplate Final (v5)

Bem-vindo ao boilerplate final para o seu SaaS de atendimento via WhatsApp. Este projeto foi construído com uma arquitetura moderna e escalável, incluindo funcionalidades avançadas de atendimento, campanhas, gerenciamento de grupos, controle de equipe e um sistema de autenticação completo.

Este documento serve como um guia completo para configurar, rodar e entender o projeto.

## ✨ Funcionalidades Entregues

1.  **Telas de Autenticação:**
    *   **Login:** Página inicial moderna com formulário e seção de marketing.
    *   **Cadastro (Sign Up):** Página para novos clientes se registrarem, com formulário e prova social.

2.  **Dashboard Principal:** Visão geral do status da conexão e métricas de atendimento.
3.  **Live Chat com Transbordo:** Caixa de entrada para atendimento humano com um fluxo completo de transferência do bot para o atendente.
4.  **Campanhas em Grupos:** Tela dedicada para criar, agendar e enviar promoções e novidades para múltiplos grupos do WhatsApp de forma segura.
5.  **Gerenciamento de Grupos com Opt-in:** Funcionalidade para criar grupos e permitir que clientes se inscrevam automaticamente através de palavras-chave.
6.  **Gerenciamento de Equipe:** Tela para o administrador adicionar, editar e remover usuários, definindo permissões (Administrador vs. Vendedor/Atendente).

## 🏛️ Arquitetura

O projeto segue uma arquitetura desacoplada, otimizada para escalabilidade e baixo custo inicial:

- **Frontend (Painel do Cliente):** **Next.js** com **Tailwind CSS** e **TypeScript**. Hospedado na **Vercel**.
- **Backend (Motor WhatsApp):** **Evolution API** (Docker). Hospedado no **Render.com** (plano pago recomendado).
- **Banco de Dados e Autenticação:** **Supabase** (PostgreSQL) para gerenciar usuários, autenticação, contas (multi-tenancy), instâncias, conversas, campanhas e grupos.
- **Uptime Service:** **UptimeRobot** (ou similar) para manter o serviço do Render ativo 24/7.

---

## 🚀 Como Rodar o Projeto (Desenvolvimento Local)

### Pré-requisitos

- Node.js (v18+)
- npm (ou yarn)
- Docker e Docker Compose (opcional, apenas se quiser rodar a Evolution API localmente)

### 🏃 Início Rápido (Apenas Frontend)

Para rodar apenas o frontend e testar a interface do projeto:

1. **Clone o repositório** (se ainda não tiver):
   ```bash
   git clone <url-do-repositorio>
   cd whatsapp-saas
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Acesse o projeto**:
   - Abra [http://localhost:3000](http://localhost:3000) no seu navegador
   - Você será redirecionado para a página de login
   - Use as credenciais de teste para fazer login (veja a seção "Credenciais de Teste" abaixo)

### 📦 Comandos Disponíveis

- `npm install` - Instala todas as dependências do projeto
- `npm run dev` - Inicia o servidor de desenvolvimento na porta 3000
- `npm run build` - Gera o build de produção
- `npm run start` - Inicia o servidor de produção (após fazer build)
- `npm run lint` - Executa o linter para verificar erros de código

### Passo 1: Configurar a Evolution API (Localmente - Opcional)

1.  Crie um arquivo `docker-compose.yml` na raiz do seu projeto com o seguinte conteúdo:

    ```yaml
    version: '3.8'
    services:
      evolution-api:
        image: atende/evolution-api
        container_name: evolution_api
        ports:
          - "8080:8080"
        environment:
          - "API_KEY=your_secret_api_key" # Defina sua chave secreta aqui
          - "DATABASE_ENABLED=false" # Vamos usar o Supabase, não o DB interno
        volumes:
          - ./evolution_api_data:/evolution/data
    ```

2.  No terminal, na raiz do projeto, rode o comando:

    ```bash
    docker-compose up -d
    ```

3.  A Evolution API estará rodando em `http://localhost:8080`.

### Passo 2: Configurar o Supabase

1.  Vá para [supabase.com](https://supabase.com), crie uma conta e um novo projeto.
2.  No seu projeto Supabase, vá para **SQL Editor** e rode o script abaixo para criar as tabelas iniciais:

    ```sql
    -- Tabela de Contas (para o seu SaaS multi-tenant)
    CREATE TABLE accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_email TEXT NOT NULL UNIQUE,
      company_name TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabela de Usuários (membros da equipe)
    -- Note que esta tabela é complementar à tabela `auth.users` do Supabase
    CREATE TABLE users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT DEFAULT 'agent', -- 'admin' ou 'agent'
      status TEXT DEFAULT 'active',
      last_login TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabela de Instâncias (uma para cada cliente do seu SaaS)
    CREATE TABLE instances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
      name TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'disconnected',
      phone_number TEXT,
      profile_pic_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabela de Conversas
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
      contact_phone TEXT NOT NULL,
      status TEXT DEFAULT 'bot',
      assigned_to UUID REFERENCES users(id),
      last_message_at TIMESTAMPTZ DEFAULT now(),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabela de Campanhas
    CREATE TABLE campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        message TEXT NOT NULL,
        target_groups JSONB NOT NULL,
        status TEXT DEFAULT 'draft',
        scheduled_for TIMESTAMPTZ,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Tabela de Grupos
    CREATE TABLE groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
        group_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        auto_subscribe BOOLEAN DEFAULT false,
        keywords TEXT[],
        welcome_message TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
    );
    ```

3.  Vá para **Project Settings -> API** e copie a **URL do Projeto** e a **Chave Anônima Pública (`anon key`)**.

### Passo 3: Configurar Variáveis de Ambiente (Opcional)

> **Nota:** Para testar apenas o frontend, você não precisa configurar as variáveis de ambiente. O projeto funciona com dados mockados.

Se quiser conectar ao Supabase e Evolution API:

1.  Na raiz do projeto `whatsapp-saas`, crie um arquivo chamado `.env.local`.
2.  Copie o conteúdo do `.env.example` para o `.env.local` e preencha as variáveis:

    ```env
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=a_sua_url_do_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=a_sua_chave_anon_do_supabase

    # Evolution API
    NEXT_PUBLIC_EVOLUTION_API_URL=http://localhost:8080
    EVOLUTION_API_KEY=your_secret_api_key # A mesma chave que você definiu no docker-compose.yml
    ```

3.  Instale as dependências e rode o servidor de desenvolvimento:

    ```bash
    npm install
    npm run dev
    ```

4.  Abra [http://localhost:3000](http://localhost:3000) no seu navegador. Você será redirecionado para a página de login.

### 🔐 Credenciais de Teste (Login Mockado)

O projeto está configurado com um sistema de autenticação mockado para facilitar o desenvolvimento e testes. Você pode usar as seguintes credenciais:

#### Credenciais Específicas:

**Administrador:**
- **Email:** `admin@test.com`
- **Senha:** `admin123`
- **Perfil:** Administrador (acesso total ao sistema)

**Agente/Vendedor:**
- **Email:** `agente@test.com`
- **Senha:** `agente123`
- **Perfil:** Agente (acesso limitado)

#### Modo de Desenvolvimento:

Qualquer outro email/senha também funciona no modo de desenvolvimento. O sistema aceita qualquer combinação de email e senha para facilitar os testes.

**Nota:** Quando conectar ao Supabase, remova a lógica mockada em `contexts/AuthContext.tsx` e implemente a autenticação real com Supabase Auth.

---

## 🛠️ Próximos Passos (Sua Missão)

O boilerplate está com o frontend pronto e a arquitetura definida. Agora, a próxima fase é implementar a "inteligência" do seu SaaS.

### 1. Conectar a Autenticação

- No arquivo `contexts/AuthContext.tsx`, remova a lógica de simulação (marcada com `// Simulação`) e descomente/implemente as chamadas reais ao Supabase Auth (marcadas com `// TODO`).
- Crie um middleware no Next.js (`middleware.ts`) para proteger as rotas do painel, redirecionando usuários não logados para `/login`.

### 2. Implementar a Lógica do Webhook

- Crie uma nova API Route no Next.js (ex: `app/api/webhook/route.ts`).
- Esta rota receberá os eventos da Evolution API (principalmente `messages.upsert`).
- Quando uma mensagem chegar, você precisa:
  - Verificar se a mensagem é uma palavra-chave de inscrição em grupo (ex: "PROMOÇÕES").
  - Se for, usar a `evolutionAPI.addParticipantToGroup` para adicionar o cliente ao grupo e enviar a mensagem de boas-vindas.
  - Se não for, implementar a lógica do seu bot de atendimento e o sistema de transbordo.

### 3. Integração Real com a API

- Nos componentes React, substitua os dados mockados por chamadas reais ao Supabase e à Evolution API.
- Use a biblioteca `@tanstack/react-query` (já instalada) para gerenciar o estado do servidor.

### 4. Implementar Multi-tenancy (Row Level Security)

- No Supabase, vá para **Authentication -> Policies** e crie políticas de segurança (RLS) para cada tabela, garantindo que um usuário só possa ver/editar dados da sua própria conta (`account_id`).

### 5. Deploy

- **Frontend (Next.js):** Faça o deploy do seu projeto para a **Vercel**.
- **Backend (Evolution API):** Siga o guia de deploy da Evolution API para o **Render.com**.
- **UptimeRobot:** Crie um monitor para manter sua API no Render ativa.

---

Este é um ponto de partida sólido e completo. Bom desenvolvimento!
'''
