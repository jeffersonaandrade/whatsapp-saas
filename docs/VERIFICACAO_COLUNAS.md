# ✅ Verificação de Colunas - Script de Migração

Este documento lista todas as colunas que o script `database/supabase_migration_segura.sql` verifica e adiciona.

## 📋 Resumo por Tabela

### 1. **accounts** (Contas)
✅ **Todas as colunas sendo adicionadas:**
- `owner_email` (TEXT)
- `company_name` (TEXT)
- `business_type` (TEXT)
- `business_description` (TEXT)
- `opening_hours` (TEXT)
- `address` (TEXT)
- `phone` (TEXT)
- `delivery_available` (BOOLEAN)
- `delivery_fee` (DECIMAL)
- `welcome_message` (TEXT)
- `default_message` (TEXT)
- `transfer_keywords` (TEXT[])
- `transfer_message` (TEXT)
- `bot_personality` (TEXT)
- `groq_api_key` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Total: 17 colunas**

---

### 2. **users** (Usuários)
✅ **Todas as colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `account_id` (UUID, FK)
- `name` (TEXT)
- `email` (TEXT)
- `role` (TEXT)
- `status` (TEXT)
- `last_login` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Total: 9 colunas**

---

### 3. **instances** (Instâncias WhatsApp)
✅ **Todas as colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `account_id` (UUID, FK)
- `name` (TEXT)
- `status` (TEXT)
- `phone_number` (TEXT)
- `profile_pic_url` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Total: 8 colunas**

---

### 4. **contacts** (Contatos)
✅ **Todas as colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `account_id` (UUID, FK)
- `phone_number` (TEXT)
- `name` (TEXT)
- `profile_pic_url` (TEXT)
- `tags` (TEXT[])
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Total: 8 colunas**

---

### 5. **conversations** (Conversas)
✅ **Colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `instance_id` (UUID, FK)
- `status` (TEXT)
- `assigned_to` (UUID, FK)
- `last_message_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

✅ **Colunas adicionadas pelo script:**
- `contact_phone` (TEXT) ⚠️ **Essencial - adicionada se não existir**
- `contact_id` (UUID, FK)
- `transferred_at` (TIMESTAMPTZ)
- `transfer_reason` (TEXT)
- `bot_handoff_count` (INTEGER)

**Total: 12 colunas**

---

### 6. **messages** (Mensagens)
✅ **Colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `conversation_id` (UUID, FK)
- `from_me` (BOOLEAN)
- `body` (TEXT)
- `timestamp` (TIMESTAMPTZ)
- `status` (TEXT)
- `sent_by` (TEXT)
- `agent_id` (UUID, FK)
- `created_at` (TIMESTAMPTZ)

✅ **Colunas adicionadas pelo script:**
- `media_url` (TEXT)
- `media_type` (TEXT)

**Total: 11 colunas**

---

### 7. **products** (Produtos)
✅ **Colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `account_id` (UUID, FK)
- `name` (TEXT)
- `description` (TEXT)
- `price` (DECIMAL)
- `created_at` (TIMESTAMPTZ)

✅ **Colunas adicionadas pelo script:**
- `currency` (TEXT) ⚠️ **Adicionada se não existir**
- `category` (TEXT) ⚠️ **Adicionada se não existir**
- `is_active` (BOOLEAN) ⚠️ **Adicionada se não existir**
- `image_url` (TEXT)
- `updated_at` (TIMESTAMPTZ)

**Total: 11 colunas**

---

### 8. **groups** (Grupos WhatsApp)
✅ **Colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `instance_id` (UUID, FK)
- `group_id` (TEXT)
- `name` (TEXT)
- `auto_subscribe` (BOOLEAN)
- `keywords` (TEXT[])
- `welcome_message` (TEXT)
- `created_at` (TIMESTAMPTZ)

✅ **Colunas adicionadas pelo script:**
- `description` (TEXT)
- `updated_at` (TIMESTAMPTZ)

**Total: 10 colunas**

---

### 9. **campaigns** (Campanhas)
✅ **Colunas no CREATE TABLE:**
- `id` (UUID, PK)
- `instance_id` (UUID, FK)
- `name` (TEXT)
- `message` (TEXT)
- `target_groups` (JSONB)
- `status` (TEXT)
- `scheduled_for` (TIMESTAMPTZ)
- `created_by` (UUID, FK)
- `created_at` (TIMESTAMPTZ)

✅ **Colunas adicionadas pelo script:**
- `media_url` (TEXT)
- `media_type` (TEXT)
- `sent_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Total: 13 colunas**

---

## ✅ Garantias do Script

O script `database/supabase_migration_segura.sql` garante que:

1. ✅ **Verifica cada coluna antes de criar** - Usa a função `column_exists()`
2. ✅ **Adiciona todas as colunas faltantes** - Para cada tabela, verifica e adiciona todas as colunas necessárias
3. ✅ **Cria índices apenas se as colunas existirem** - Protege contra erros de colunas faltantes
4. ✅ **É idempotente** - Pode ser executado múltiplas vezes sem problemas
5. ✅ **Funciona com tabelas existentes** - Não recria tabelas, apenas adiciona o que falta

## 🔍 Como Verificar

Após executar o script, você pode verificar se todas as colunas foram criadas:

```sql
-- Verificar colunas de uma tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'accounts'
ORDER BY ordinal_position;
```

## 📝 Notas Importantes

- ⚠️ Se uma tabela já existir com uma estrutura diferente, o script **adiciona apenas as colunas faltantes**
- ⚠️ O script **não remove** colunas existentes que não estão na especificação
- ⚠️ O script **não altera** tipos de dados de colunas existentes
- ✅ O script **garante** que todas as colunas necessárias estarão presentes

---

**Última atualização**: Agora  
**Status**: ✅ Todas as colunas necessárias estão sendo verificadas e adicionadas

