# Scripts de Banco de Dados

Esta pasta contém todos os scripts SQL para configuração e migração do banco de dados Supabase.

## 📋 Arquivos

### Migrações Principais

- **`supabase_migration_completo.sql`** - Migração completa do banco de dados (tabelas, RLS, etc.)
- **`supabase_migration_segura.sql`** - Migração segura (com verificações)

### Configuração de Tabelas

- **`supabase_products_table.sql`** - Criação da tabela de produtos
- **`supabase_accounts_business_fields.sql`** - Campos de negócio na tabela accounts

### Políticas de Segurança (RLS)

- **`supabase_rls_policies.sql`** - Políticas Row Level Security (RLS)

### Storage

- **`supabase_storage_setup.sql`** - Configuração do Supabase Storage

### Dados de Teste

- **`supabase_test_data.sql`** - Dados de teste para desenvolvimento
- **`supabase_dashboard_mock_data.sql`** - Dados mockados para o dashboard

### Correções

- **`supabase_fix_users_for_option1.sql`** - Correção para usuários (Opção 1 de autenticação)

## 🚀 Como Usar

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Execute os scripts na ordem:
   - Primeiro: `supabase_migration_completo.sql` ou `supabase_migration_segura.sql`
   - Depois: Os outros scripts conforme necessário

## ⚠️ Atenção

- **Nunca execute scripts de migração em produção sem backup**
- **Teste sempre em ambiente de desenvolvimento primeiro**
- **Verifique as políticas RLS antes de aplicar em produção**

