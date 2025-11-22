# 🚀 Guia de Migração para Supabase

Este guia contém todos os passos necessários para migrar o projeto para o Supabase.

## 📋 Pré-requisitos

- ✅ Conta no Supabase criada
- ✅ Projeto no Supabase criado
- ✅ Acesso ao SQL Editor do Supabase
- ✅ Acesso ao Dashboard do Supabase

## 🔧 Passo 1: Executar Scripts SQL

### 1.1. Criar Tabelas e Estrutura

1. Acesse o **SQL Editor** no Dashboard do Supabase
2. Execute o script: `database/supabase_migration_completo.sql`
   - Este script cria todas as tabelas necessárias
   - Cria índices para performance
   - Cria triggers para atualização automática de `updated_at`

### 1.2. Configurar Row Level Security (RLS)

1. No **SQL Editor**, execute o script: `database/supabase_rls_policies.sql`
   - Este script habilita RLS em todas as tabelas
   - Cria políticas de segurança para isolar dados por conta
   - Garante que usuários só vejam dados da sua própria conta

### 1.3. Configurar Storage (Opcional - para imagens de produtos)

1. No **Dashboard do Supabase**, vá em **Storage**
2. Clique em **New bucket**
3. Configure:
   - **Name**: `product-images`
   - **Public bucket**: ✅ (marcado)
   - **File size limit**: `5242880` (5MB em bytes)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Clique em **Create bucket**
5. No **SQL Editor**, execute o script: `database/supabase_storage_setup.sql`
   - Este script cria as políticas RLS para o bucket

## 🔑 Passo 2: Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie um arquivo `.env.local` (se não existir)
2. Adicione as seguintes variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Evolution API
NEXT_PUBLIC_EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua-chave-evolution-api

# Groq AI (opcional - pode ser configurado por conta)
GROQ_API_KEY=sua-chave-groq-aqui
```

### Como obter as chaves do Supabase:

1. No **Dashboard do Supabase**, vá em **Project Settings** > **API**
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **NUNCA** exponha esta chave no frontend!)

## 📝 Passo 3: Atualizar Código

### 3.1. Cliente Supabase Admin (para webhook)

O webhook precisa usar a `service_role` key para poder inserir dados sem passar pelas políticas RLS.

Crie um arquivo `lib/supabase-admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Cliente admin (bypass RLS) - usar apenas no backend
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
```

### 3.2. Próximos Passos de Implementação

Consulte o arquivo `docs/TODOS_SUPABASE.md` para ver todos os arquivos que precisam ser atualizados:

1. **Autenticação** (`contexts/AuthContext.tsx`)
2. **Configurações do Negócio** (`lib/services/business-config.ts`)
3. **Produtos** (`lib/services/products.ts`)
4. **Webhook** (`app/api/webhook/route.ts`)
5. **Upload de Imagens** (`app/api/products/upload-image/route.ts`)
6. **Conversas** (`app/conversations/page.tsx`)
7. **Dashboard** (`app/dashboard/page.tsx`)

## ✅ Checklist de Verificação

Após executar os scripts SQL, verifique:

- [ ] Todas as tabelas foram criadas:
  - [ ] `accounts`
  - [ ] `users`
  - [ ] `instances`
  - [ ] `contacts`
  - [ ] `conversations`
  - [ ] `messages`
  - [ ] `products`
  - [ ] `groups`
  - [ ] `campaigns`

- [ ] RLS está habilitado em todas as tabelas
- [ ] Políticas RLS foram criadas
- [ ] Bucket `product-images` foi criado (se necessário)
- [ ] Políticas RLS do Storage foram criadas (se necessário)
- [ ] Variáveis de ambiente foram configuradas
- [ ] Cliente Supabase Admin foi criado

## 🧪 Testar Conexão

Para testar se a conexão está funcionando, você pode executar no console do navegador (após implementar a autenticação):

```typescript
import { supabase } from '@/lib/supabase';

// Testar conexão
const { data, error } = await supabase.from('accounts').select('count');
console.log('Conexão:', error ? 'Erro' : 'OK', data);
```

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage](https://supabase.com/docs/guides/storage)

## ⚠️ Notas Importantes

1. **Service Role Key**: Nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` no frontend. Use apenas no backend (API Routes, Server Components).

2. **RLS**: As políticas RLS garantem que cada conta só veja seus próprios dados. Isso é essencial para multi-tenancy.

3. **Webhook**: O webhook precisa usar `supabaseAdmin` (com service_role) para poder inserir dados sem passar pelas políticas RLS.

4. **Storage**: O bucket `product-images` deve ser público para que as URLs das imagens funcionem no frontend.

---

**Última atualização**: Agora  
**Status**: Pronto para migração

