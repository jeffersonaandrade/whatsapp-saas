# 🚀 Guia Passo a Passo - Setup Supabase

## 📋 Scripts SQL na Ordem Correta

Execute os scripts no **SQL Editor do Supabase** nesta ordem exata:

---

## ✅ PASSO 1: Criar Estrutura do Banco (Tabelas)

**Arquivo:** `database/supabase_migration_segura.sql`

**O que faz:**
- Cria todas as tabelas (accounts, users, instances, contacts, conversations, messages, products, groups, campaigns)
- Adiciona índices
- Cria triggers para `updated_at`
- Verifica e adiciona colunas que faltam (seguro para tabelas existentes)

**Como executar:**
1. Abra o **SQL Editor** no Dashboard do Supabase
2. Copie TODO o conteúdo de `database/supabase_migration_segura.sql`
3. Cole no editor
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Aguarde a execução (pode levar alguns segundos)

**✅ Verificação:** Vá em **Table Editor** e confira se as tabelas foram criadas.

---

## ✅ PASSO 2: Ajustar Tabela Users (Para Opção 1)

**Arquivo:** `database/supabase_fix_users_for_option1.sql`

**O que faz:**
- Remove a constraint que exige `auth.users` (já que não estamos usando Supabase Auth ainda)
- Permite inserir usuários diretamente na tabela `users`

**Como executar:**
1. No **SQL Editor**, copie TODO o conteúdo de `database/supabase_fix_users_for_option1.sql`
2. Cole no editor
3. Clique em **Run**

**⚠️ IMPORTANTE:** Este ajuste é temporário. Quando migrar para Supabase Auth (Opção 3), será necessário restaurar a constraint.

---

## ✅ PASSO 3: Configurar Row Level Security (RLS)

**Arquivo:** `database/supabase_rls_policies.sql`

**O que faz:**
- Habilita RLS em todas as tabelas
- Cria políticas de segurança para isolar dados por conta (multi-tenancy)
- Garante que usuários só vejam dados da sua própria conta

**Como executar:**
1. No **SQL Editor**, copie TODO o conteúdo de `database/supabase_rls_policies.sql`
2. Cole no editor
3. Clique em **Run**

**✅ Verificação:** Vá em **Authentication > Policies** e confira se as políticas foram criadas.

---

## ✅ PASSO 4: Criar Dados de Teste

**Arquivo:** `database/supabase_test_data.sql`

**O que faz:**
- Adiciona coluna `password_hash` na tabela `users`
- Cria 1 conta de teste
- Cria 2 usuários de teste (admin e agente)
- Cria 1 instância de teste

**Credenciais de teste:**
- **Admin:** `admin@test.com` / `teste123`
- **Agente:** `agente@test.com` / `teste123`

**Como executar:**
1. No **SQL Editor**, copie TODO o conteúdo de `database/supabase_test_data.sql`
2. Cole no editor
3. Clique em **Run**

**✅ Verificação:** Vá em **Table Editor > users** e confira se os usuários foram criados.

---

## ✅ PASSO 5: Configurar Storage (Opcional - Para Imagens de Produtos)

**Arquivo:** `database/supabase_storage_setup.sql`

**O que faz:**
- Cria políticas RLS para o bucket `product-images`
- Permite upload apenas para o próprio account

**⚠️ IMPORTANTE:** Antes de executar o script SQL, você precisa criar o bucket manualmente:

1. Vá em **Storage** no Dashboard do Supabase
2. Clique em **New bucket**
3. Configure:
   - **Name:** `product-images`
   - **Public bucket:** ✅ (marcado)
   - **File size limit:** `5242880` (5MB em bytes)
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`
4. Clique em **Create bucket**

**Depois, execute o script SQL:**
1. No **SQL Editor**, copie TODO o conteúdo de `database/supabase_storage_setup.sql`
2. Cole no editor
3. Clique em **Run**

---

## 📝 Resumo da Ordem

```
1. `database/supabase_migration_segura.sql`      → Cria estrutura do banco
2. `database/supabase_fix_users_for_option1.sql` → Ajusta tabela users
3. `database/supabase_rls_policies.sql`          → Configura segurança
4. `database/supabase_test_data.sql`             → Cria dados de teste
5. `database/supabase_storage_setup.sql`         → Configura storage (opcional)
```

---

## ✅ Verificação Final

Após executar todos os scripts, verifique:

- [ ] Todas as tabelas foram criadas (Table Editor)
- [ ] RLS está habilitado (Authentication > Policies)
- [ ] Usuários de teste foram criados (Table Editor > users)
- [ ] Bucket `product-images` foi criado (Storage) - se aplicável

---

## 🧪 Testar Login

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:3000/login`
3. Tente fazer login com:
   - Email: `admin@test.com`
   - Senha: `teste123`

Se funcionar, está tudo certo! ✅

---

## 🆘 Problemas Comuns

### Erro: "column does not exist"
- **Solução:** Execute o `database/supabase_migration_segura.sql` novamente (é idempotente)

### Erro: "foreign key constraint"
- **Solução:** Execute o `database/supabase_fix_users_for_option1.sql`

### Erro: "permission denied"
- **Solução:** Verifique se o RLS está configurado corretamente

---

**Última atualização:** Agora

