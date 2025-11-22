# 📁 Estrutura do Projeto

Este documento descreve a organização das pastas e arquivos do projeto.

## 📂 Estrutura de Diretórios

```
whatsapp-saas/
├── app/                    # Next.js App Router (páginas e rotas API)
│   ├── api/               # Rotas API (backend)
│   ├── dashboard/         # Páginas do dashboard
│   ├── conversations/     # Páginas de conversas
│   └── ...
├── components/            # Componentes React reutilizáveis
│   ├── ui/               # Componentes de UI (botões, inputs, etc.)
│   └── layout/           # Componentes de layout
├── contexts/             # React Contexts (AuthContext, etc.)
├── database/             # Scripts SQL do Supabase
│   ├── README.md         # Documentação dos scripts SQL
│   └── *.sql             # Scripts de migração e configuração
├── docs/                 # Documentação do projeto
│   ├── README.md         # (se existir)
│   └── *.md             # Documentação técnica
├── lib/                  # Bibliotecas e utilitários
│   ├── services/        # Serviços (bot, groq, products, etc.)
│   └── utils/           # Utilitários (auth, logger, validation, etc.)
├── public/               # Arquivos estáticos
├── scripts/              # Scripts utilitários
│   ├── README.md        # Documentação dos scripts
│   └── *.js             # Scripts Node.js
├── types/                # Definições TypeScript
├── middleware.ts         # Next.js middleware
├── next.config.ts        # Configuração do Next.js
├── package.json          # Dependências do projeto
└── README.md            # Documentação principal
```

## 📋 Descrição das Pastas

### `app/`
Contém todas as páginas e rotas API do Next.js usando App Router.

- **`app/api/`** - Rotas API (backend)
  - `auth/` - Autenticação (login, signup, logout, session)
  - `instance/` - Gerenciamento de instâncias WhatsApp
  - `webhook/` - Webhook da Evolution API
  - `products/` - Gerenciamento de produtos
  - `campaigns/` - Campanhas
  - etc.

- **`app/dashboard/`** - Página principal do dashboard
- **`app/conversations/`** - Página de conversas
- **`app/products/`** - Página de produtos
- etc.

### `components/`
Componentes React reutilizáveis.

- **`ui/`** - Componentes de UI básicos (inputs, botões, etc.)
- **`layout/`** - Componentes de layout (MainLayout, etc.)

### `contexts/`
React Contexts para gerenciamento de estado global.

- `AuthContext.tsx` - Contexto de autenticação

### `database/`
Scripts SQL para configuração do banco de dados Supabase.

- Scripts de migração
- Scripts de configuração de tabelas
- Scripts de políticas RLS
- Scripts de dados de teste

**Ver:** `database/README.md` para mais detalhes.

### `docs/`
Documentação técnica do projeto.

- Arquitetura
- Guias de configuração
- Especificações técnicas
- Guias de teste

### `lib/`
Bibliotecas e utilitários compartilhados.

- **`services/`** - Serviços de negócio
  - `bot-logic.ts` - Lógica do bot
  - `groq-ai.ts` - Integração com Groq AI
  - `products.ts` - Serviço de produtos
  - etc.

- **`utils/`** - Utilitários
  - `auth.ts` - Autenticação
  - `logger.ts` - Sistema de logging
  - `validation.ts` - Validação de dados
  - `security.ts` - Utilitários de segurança
  - etc.

### `scripts/`
Scripts utilitários para desenvolvimento e manutenção.

- `generate-password-hash.js` - Gerar hash de senha

**Ver:** `scripts/README.md` para mais detalhes.

### `types/`
Definições TypeScript compartilhadas.

- `index.ts` - Tipos principais

## 🔄 Convenções

### Nomenclatura de Arquivos

- **Componentes React:** PascalCase (ex: `MainLayout.tsx`)
- **Utilitários:** camelCase (ex: `auth.ts`, `logger.ts`)
- **Rotas API:** kebab-case (ex: `route.ts` em pastas)
- **Scripts SQL:** snake_case com prefixo (ex: `supabase_migration.sql`)

### Organização de Código

- Cada funcionalidade deve ter sua própria pasta quando possível
- Utilitários compartilhados vão em `lib/utils/`
- Serviços de negócio vão em `lib/services/`
- Componentes reutilizáveis vão em `components/`

## 📝 Notas

- **Não coloque arquivos na raiz** a menos que sejam de configuração do projeto (package.json, next.config.ts, etc.)
- **Scripts SQL** devem estar em `database/`
- **Documentação** deve estar em `docs/`
- **Scripts utilitários** devem estar em `scripts/`

