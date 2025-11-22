-- =====================================================
-- SCRIPT DE MIGRAÇÃO SEGURA PARA SUPABASE
-- WhatsApp SaaS - Compatível com tabelas existentes
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- Este script verifica e adiciona todas as colunas necessárias
-- =====================================================

-- =====================================================
-- FUNÇÃO AUXILIAR: Verificar se coluna existe
-- =====================================================
CREATE OR REPLACE FUNCTION column_exists(table_name_param TEXT, column_name_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = table_name_param 
    AND column_name = column_name_param
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 1. TABELA: accounts (Contas Multi-tenant)
-- =====================================================

-- Criar tabela básica se não existir
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar todas as colunas que faltam
DO $$ 
BEGIN
  -- Colunas básicas
  IF NOT column_exists('accounts', 'owner_email') THEN
    ALTER TABLE accounts ADD COLUMN owner_email TEXT;
  END IF;
  
  -- Configurações do negócio
  IF NOT column_exists('accounts', 'business_type') THEN
    ALTER TABLE accounts ADD COLUMN business_type TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'business_description') THEN
    ALTER TABLE accounts ADD COLUMN business_description TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'opening_hours') THEN
    ALTER TABLE accounts ADD COLUMN opening_hours TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'address') THEN
    ALTER TABLE accounts ADD COLUMN address TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'phone') THEN
    ALTER TABLE accounts ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'delivery_available') THEN
    ALTER TABLE accounts ADD COLUMN delivery_available BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT column_exists('accounts', 'delivery_fee') THEN
    ALTER TABLE accounts ADD COLUMN delivery_fee DECIMAL(10,2);
  END IF;
  
  -- Configurações do bot
  IF NOT column_exists('accounts', 'welcome_message') THEN
    ALTER TABLE accounts ADD COLUMN welcome_message TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'default_message') THEN
    ALTER TABLE accounts ADD COLUMN default_message TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'transfer_keywords') THEN
    ALTER TABLE accounts ADD COLUMN transfer_keywords TEXT[];
  END IF;
  
  IF NOT column_exists('accounts', 'transfer_message') THEN
    ALTER TABLE accounts ADD COLUMN transfer_message TEXT;
  END IF;
  
  IF NOT column_exists('accounts', 'bot_personality') THEN
    ALTER TABLE accounts ADD COLUMN bot_personality TEXT;
  END IF;
  
  -- Groq AI
  IF NOT column_exists('accounts', 'groq_api_key') THEN
    ALTER TABLE accounts ADD COLUMN groq_api_key TEXT;
  END IF;
  
  -- Timestamps
  IF NOT column_exists('accounts', 'updated_at') THEN
    ALTER TABLE accounts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  
  -- Ajustar constraints
  -- Preencher owner_email se estiver NULL
  UPDATE accounts SET owner_email = 'migrated_' || id::text WHERE owner_email IS NULL;
  
  -- Tentar adicionar UNIQUE constraint se não existir
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint 
      WHERE conname = 'accounts_owner_email_key'
    ) THEN
      CREATE UNIQUE INDEX accounts_owner_email_key ON accounts(owner_email) WHERE owner_email IS NOT NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint unique em owner_email já existe ou não pode ser criada';
  END;
END $$;

-- Índices para accounts
DO $$
BEGIN
  IF column_exists('accounts', 'owner_email') THEN
    CREATE INDEX IF NOT EXISTS idx_accounts_owner_email ON accounts(owner_email) WHERE owner_email IS NOT NULL;
  END IF;
  
  IF column_exists('accounts', 'business_type') THEN
    CREATE INDEX IF NOT EXISTS idx_accounts_business_type ON accounts(business_type);
  END IF;
END $$;

-- =====================================================
-- 2. TABELA: users (Usuários - complementar ao auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'agent',
  status TEXT DEFAULT 'active',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ajustar constraints de role e status
DO $$
BEGIN
  -- Remover constraint antiga se existir
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
  ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
  
  -- Adicionar novas constraints
  ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'agent'));
  ALTER TABLE users ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Constraints de users já existem ou não podem ser criadas';
END $$;

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_account_id ON users(account_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- 3. TABELA: instances (Instâncias WhatsApp)
-- =====================================================
CREATE TABLE IF NOT EXISTS instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'disconnected',
  phone_number TEXT,
  profile_pic_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ajustar constraint de status
DO $$
BEGIN
  ALTER TABLE instances DROP CONSTRAINT IF EXISTS instances_status_check;
  ALTER TABLE instances ADD CONSTRAINT instances_status_check 
    CHECK (status IN ('connected', 'disconnected', 'connecting'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Constraint de status em instances já existe';
END $$;

-- Índices para instances
CREATE INDEX IF NOT EXISTS idx_instances_account_id ON instances(account_id);
CREATE INDEX IF NOT EXISTS idx_instances_name ON instances(name);

DO $$
BEGIN
  IF column_exists('instances', 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_instances_status ON instances(status);
  END IF;
END $$;

-- =====================================================
-- 4. TABELA: contacts (Contatos)
-- =====================================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  name TEXT,
  profile_pic_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar constraint UNIQUE se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_account_id_phone_number_key'
  ) THEN
    ALTER TABLE contacts ADD CONSTRAINT contacts_account_id_phone_number_key 
    UNIQUE(account_id, phone_number);
  END IF;
END $$;

-- Índices para contacts
CREATE INDEX IF NOT EXISTS idx_contacts_account_id ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);

-- =====================================================
-- 5. TABELA: conversations (Conversas)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'bot',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar TODAS as colunas necessárias
DO $$ 
BEGIN
  -- Coluna essencial: contact_phone
  IF NOT column_exists('conversations', 'contact_phone') THEN
    ALTER TABLE conversations ADD COLUMN contact_phone TEXT;
  END IF;
  
  -- Colunas adicionais
  IF NOT column_exists('conversations', 'contact_id') THEN
    ALTER TABLE conversations ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT column_exists('conversations', 'transferred_at') THEN
    ALTER TABLE conversations ADD COLUMN transferred_at TIMESTAMPTZ;
  END IF;
  
  IF NOT column_exists('conversations', 'transfer_reason') THEN
    ALTER TABLE conversations ADD COLUMN transfer_reason TEXT;
  END IF;
  
  IF NOT column_exists('conversations', 'bot_handoff_count') THEN
    ALTER TABLE conversations ADD COLUMN bot_handoff_count INTEGER DEFAULT 0;
  END IF;
  
  -- Adicionar account_id para facilitar queries multi-tenancy
  IF NOT column_exists('conversations', 'account_id') THEN
    ALTER TABLE conversations ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
    
    -- Preencher account_id existente baseado em instance_id
    UPDATE conversations c
    SET account_id = i.account_id
    FROM instances i
    WHERE c.instance_id = i.id AND c.account_id IS NULL;
  END IF;
  
  -- Ajustar constraint de status
  ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_status_check;
  ALTER TABLE conversations ADD CONSTRAINT conversations_status_check 
    CHECK (status IN ('bot', 'waiting_agent', 'in_service', 'resolved'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao ajustar constraints de conversations: %', SQLERRM;
END $$;

-- Índices para conversations (apenas se as colunas existirem)
CREATE INDEX IF NOT EXISTS idx_conversations_instance_id ON conversations(instance_id);

DO $$
BEGIN
  IF column_exists('conversations', 'account_id') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_account_id ON conversations(account_id);
  END IF;
  
  IF column_exists('conversations', 'contact_id') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
  END IF;
  
  IF column_exists('conversations', 'contact_phone') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_contact_phone ON conversations(contact_phone);
  END IF;
  
  IF column_exists('conversations', 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
  END IF;
  
  IF column_exists('conversations', 'assigned_to') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
  END IF;
  
  IF column_exists('conversations', 'last_message_at') THEN
    CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);
  END IF;
END $$;

-- =====================================================
-- 6. TABELA: messages (Mensagens)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  from_me BOOLEAN NOT NULL,
  body TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'sent',
  sent_by TEXT,
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas que faltam
DO $$ 
BEGIN
  IF NOT column_exists('messages', 'media_url') THEN
    ALTER TABLE messages ADD COLUMN media_url TEXT;
  END IF;
  
  IF NOT column_exists('messages', 'media_type') THEN
    ALTER TABLE messages ADD COLUMN media_type TEXT;
  END IF;
  
  -- Ajustar constraints
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_status_check;
  ALTER TABLE messages ADD CONSTRAINT messages_status_check 
    CHECK (status IN ('sent', 'delivered', 'read', 'failed'));
  
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sent_by_check;
  ALTER TABLE messages ADD CONSTRAINT messages_sent_by_check 
    CHECK (sent_by IN ('bot', 'agent', 'customer'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao ajustar constraints de messages: %', SQLERRM;
END $$;

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);

DO $$
BEGIN
  IF column_exists('messages', 'agent_id') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
  END IF;
  
  IF column_exists('messages', 'from_me') THEN
    CREATE INDEX IF NOT EXISTS idx_messages_from_me ON messages(from_me);
  END IF;
END $$;

-- =====================================================
-- 7. TABELA: products (Produtos)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar TODAS as colunas que faltam
DO $$ 
BEGIN
  IF NOT column_exists('products', 'currency') THEN
    ALTER TABLE products ADD COLUMN currency TEXT DEFAULT 'BRL';
  END IF;
  
  IF NOT column_exists('products', 'category') THEN
    ALTER TABLE products ADD COLUMN category TEXT;
  END IF;
  
  IF NOT column_exists('products', 'is_active') THEN
    ALTER TABLE products ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  IF NOT column_exists('products', 'image_url') THEN
    ALTER TABLE products ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT column_exists('products', 'updated_at') THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Índices para products (apenas se as colunas existirem)
CREATE INDEX IF NOT EXISTS idx_products_account_id ON products(account_id);

DO $$
BEGIN
  IF column_exists('products', 'is_active') THEN
    CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
  END IF;
  
  IF column_exists('products', 'category') THEN
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  END IF;
END $$;

-- =====================================================
-- 8. TABELA: groups (Grupos WhatsApp)
-- =====================================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  auto_subscribe BOOLEAN DEFAULT false,
  keywords TEXT[],
  welcome_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas que faltam
DO $$ 
BEGIN
  IF NOT column_exists('groups', 'description') THEN
    ALTER TABLE groups ADD COLUMN description TEXT;
  END IF;
  
  IF NOT column_exists('groups', 'updated_at') THEN
    ALTER TABLE groups ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Índices para groups
CREATE INDEX IF NOT EXISTS idx_groups_instance_id ON groups(instance_id);
CREATE INDEX IF NOT EXISTS idx_groups_group_id ON groups(group_id);

-- =====================================================
-- 9. TABELA: campaigns (Campanhas)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  target_groups JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Adicionar colunas que faltam
DO $$ 
BEGIN
  IF NOT column_exists('campaigns', 'media_url') THEN
    ALTER TABLE campaigns ADD COLUMN media_url TEXT;
  END IF;
  
  IF NOT column_exists('campaigns', 'media_type') THEN
    ALTER TABLE campaigns ADD COLUMN media_type TEXT;
  END IF;
  
  IF NOT column_exists('campaigns', 'sent_at') THEN
    ALTER TABLE campaigns ADD COLUMN sent_at TIMESTAMPTZ;
  END IF;
  
  IF NOT column_exists('campaigns', 'updated_at') THEN
    ALTER TABLE campaigns ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
  
  -- Ajustar constraint de status
  ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
  ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
    CHECK (status IN ('draft', 'scheduled', 'sent', 'failed'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao ajustar constraints de campaigns: %', SQLERRM;
END $$;

-- Índices para campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_instance_id ON campaigns(instance_id);

DO $$
BEGIN
  IF column_exists('campaigns', 'status') THEN
    CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
  END IF;
  
  IF column_exists('campaigns', 'scheduled_for') THEN
    CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_for ON campaigns(scheduled_for);
  END IF;
  
  IF column_exists('campaigns', 'created_by') THEN
    CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
  END IF;
END $$;

-- =====================================================
-- 10. TRIGGERS: Atualização automática de updated_at
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at 
BEFORE UPDATE ON accounts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instances_updated_at ON instances;
CREATE TRIGGER update_instances_updated_at 
BEFORE UPDATE ON instances 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at 
BEFORE UPDATE ON contacts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at 
BEFORE UPDATE ON conversations 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
BEFORE UPDATE ON groups 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at 
BEFORE UPDATE ON campaigns 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE accounts IS 'Contas dos clientes (multi-tenancy)';
COMMENT ON COLUMN accounts.business_type IS 'Tipo de negócio (ex: Pizzaria, Hamburgueria, Clínica)';
COMMENT ON COLUMN accounts.business_description IS 'Descrição do negócio para contexto da IA';
COMMENT ON COLUMN accounts.opening_hours IS 'Horário de funcionamento formatado (ex: "18h às 23h")';
COMMENT ON COLUMN accounts.groq_api_key IS 'API Key do Groq para IA (armazenar criptografada em produção)';

COMMENT ON TABLE users IS 'Usuários do sistema (complementar ao auth.users do Supabase)';
COMMENT ON TABLE instances IS 'Instâncias do WhatsApp conectadas à Evolution API';
COMMENT ON TABLE contacts IS 'Contatos dos clientes';
COMMENT ON TABLE conversations IS 'Conversas entre clientes e atendentes/bot';
COMMENT ON TABLE messages IS 'Mensagens das conversas';
COMMENT ON TABLE products IS 'Produtos dos clientes';
COMMENT ON TABLE groups IS 'Grupos do WhatsApp';
COMMENT ON TABLE campaigns IS 'Campanhas de mensagens em massa';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
-- Este script:
-- 1. Verifica se cada coluna existe antes de criar
-- 2. Adiciona todas as colunas necessárias
-- 3. Cria índices apenas se as colunas existirem
-- 4. É seguro para executar múltiplas vezes
-- =====================================================
