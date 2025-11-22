-- =====================================================
-- SCRIPT COMPLETO DE MIGRAÇÃO PARA SUPABASE
-- WhatsApp SaaS - Estrutura Completa do Banco de Dados
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. TABELA: accounts (Contas Multi-tenant)
-- =====================================================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_email TEXT NOT NULL UNIQUE,
  company_name TEXT,
  
  -- Configurações do negócio
  business_type TEXT, -- ex: "Pizzaria", "Hamburgueria", "Clínica", etc.
  business_description TEXT, -- Descrição do negócio
  opening_hours TEXT, -- Horário de funcionamento (ex: "18h às 23h")
  address TEXT, -- Endereço do negócio
  phone TEXT, -- Telefone de contato
  delivery_available BOOLEAN DEFAULT false, -- Se faz entregas
  delivery_fee DECIMAL(10,2), -- Taxa de entrega
  
  -- Configurações do bot
  welcome_message TEXT,
  default_message TEXT,
  transfer_keywords TEXT[],
  transfer_message TEXT,
  bot_personality TEXT,
  
  -- Groq AI
  groq_api_key TEXT, -- API Key do Groq (será armazenada criptografada em produção)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para accounts
CREATE INDEX IF NOT EXISTS idx_accounts_owner_email ON accounts(owner_email);
CREATE INDEX IF NOT EXISTS idx_accounts_business_type ON accounts(business_type);

-- =====================================================
-- 2. TABELA: users (Usuários - complementar ao auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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
  name TEXT NOT NULL UNIQUE, -- Nome da instância na Evolution API
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'connecting')),
  phone_number TEXT,
  profile_pic_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para instances
CREATE INDEX IF NOT EXISTS idx_instances_account_id ON instances(account_id);
CREATE INDEX IF NOT EXISTS idx_instances_name ON instances(name);
CREATE INDEX IF NOT EXISTS idx_instances_status ON instances(status);

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
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Garantir que não haja duplicatas de telefone por conta
  UNIQUE(account_id, phone_number)
);

-- Índices para contacts
CREATE INDEX IF NOT EXISTS idx_contacts_account_id ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number);

-- =====================================================
-- 5. TABELA: conversations (Conversas)
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  contact_phone TEXT NOT NULL, -- Mantido para compatibilidade
  status TEXT DEFAULT 'bot' CHECK (status IN ('bot', 'waiting_agent', 'in_service', 'resolved')),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  transferred_at TIMESTAMPTZ,
  transfer_reason TEXT,
  bot_handoff_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para conversations
CREATE INDEX IF NOT EXISTS idx_conversations_instance_id ON conversations(instance_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_phone ON conversations(contact_phone);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_to ON conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at);

-- =====================================================
-- 6. TABELA: messages (Mensagens)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  from_me BOOLEAN NOT NULL,
  body TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  sent_by TEXT CHECK (sent_by IN ('bot', 'agent', 'customer')),
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  media_url TEXT,
  media_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_from_me ON messages(from_me);

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
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para products
CREATE INDEX IF NOT EXISTS idx_products_account_id ON products(account_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- =====================================================
-- 8. TABELA: groups (Grupos WhatsApp)
-- =====================================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL UNIQUE, -- ID do grupo no WhatsApp
  name TEXT NOT NULL,
  description TEXT,
  auto_subscribe BOOLEAN DEFAULT false,
  keywords TEXT[],
  welcome_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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
  media_url TEXT,
  media_type TEXT,
  target_groups JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_instance_id ON campaigns(instance_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled_for ON campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);

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
CREATE TRIGGER update_accounts_updated_at 
BEFORE UPDATE ON accounts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instances_updated_at 
BEFORE UPDATE ON instances 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
BEFORE UPDATE ON contacts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
BEFORE UPDATE ON conversations 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at 
BEFORE UPDATE ON groups 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

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
-- Próximos passos:
-- 1. Execute o script de RLS (supabase_rls_policies.sql)
-- 2. Configure as variáveis de ambiente no .env.local
-- 3. Teste a conexão com o Supabase
-- =====================================================

