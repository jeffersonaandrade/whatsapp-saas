-- =====================================================
-- DADOS MOCK PARA DASHBOARD
-- WhatsApp SaaS - Dados para visualização no dashboard
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================
-- IMPORTANTE: Todos os dados são vinculados ao account_id de teste
-- account_id: '00000000-0000-0000-0000-000000000001'
-- =====================================================

-- IDs fixos para referência
-- account_id: 00000000-0000-0000-0000-000000000001
-- instance_id: 33333333-3333-3333-3333-333333333333

-- =====================================================
-- 0. ADICIONAR COLUNA account_id NA TABELA conversations (se não existir)
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'account_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN account_id UUID REFERENCES accounts(id) ON DELETE CASCADE;
    
    -- Preencher account_id existente baseado em instance_id
    UPDATE conversations c
    SET account_id = i.account_id
    FROM instances i
    WHERE c.instance_id = i.id AND c.account_id IS NULL;
    
    -- Criar índice
    CREATE INDEX IF NOT EXISTS idx_conversations_account_id ON conversations(account_id);
  END IF;
END $$;

-- Criar trigger para preencher account_id automaticamente quando uma conversa for criada
DROP TRIGGER IF EXISTS set_conversation_account_id ON conversations;
CREATE OR REPLACE FUNCTION set_conversation_account_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_id IS NULL AND NEW.instance_id IS NOT NULL THEN
    SELECT account_id INTO NEW.account_id
    FROM instances
    WHERE id = NEW.instance_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_conversation_account_id
  BEFORE INSERT OR UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION set_conversation_account_id();

-- =====================================================
-- 0.1. ADICIONAR COLUNA updated_at NA TABELA contacts (se não existir)
-- =====================================================
-- Garantir que a coluna updated_at existe antes de inserir dados
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'contacts' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE contacts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    RAISE NOTICE 'Coluna updated_at adicionada à tabela contacts';
  ELSE
    RAISE NOTICE 'Coluna updated_at já existe na tabela contacts';
  END IF;
END $$;

-- =====================================================
-- 1. LIMPAR DADOS EXISTENTES (se houver)
-- =====================================================
-- Usar instance_id para deletar conversas (mais seguro)
DELETE FROM messages WHERE conversation_id IN (
  SELECT id FROM conversations WHERE instance_id = '33333333-3333-3333-3333-333333333333'
);
DELETE FROM conversations WHERE instance_id = '33333333-3333-3333-3333-333333333333';
DELETE FROM contacts WHERE account_id = '00000000-0000-0000-0000-000000000001';

-- =====================================================
-- 2. CRIAR CONTATOS
-- =====================================================
-- Inserir contatos (a coluna updated_at já foi adicionada no bloco anterior)
INSERT INTO contacts (
  id,
  account_id,
  phone_number,
  name,
  created_at,
  updated_at
) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000001',
    '+5511987654321',
    'João Silva',
    now() - interval '2 hours',
    now() - interval '2 minutes'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000001',
    '+5511912345678',
    'Maria Santos',
    now() - interval '1 day',
    now() - interval '15 minutes'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '00000000-0000-0000-0000-000000000001',
    '+5511999998888',
    'Pedro Costa',
    now() - interval '3 days',
    now() - interval '1 hour'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '00000000-0000-0000-0000-000000000001',
    '+5511977776666',
    'Ana Oliveira',
    now() - interval '5 hours',
    now() - interval '5 minutes'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '00000000-0000-0000-0000-000000000001',
    '+5511955554444',
    'Carlos Mendes',
    now() - interval '30 minutes',
    now() - interval '10 minutes'
  )
ON CONFLICT (id) DO UPDATE SET
  account_id = EXCLUDED.account_id,
  phone_number = EXCLUDED.phone_number,
  name = EXCLUDED.name,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 3. CRIAR CONVERSAS
-- =====================================================
INSERT INTO conversations (
  id,
  account_id,
  instance_id,
  contact_id,
  status,
  last_message_at,
  created_at,
  updated_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'waiting_agent',
    now() - interval '2 minutes',
    now() - interval '2 hours',
    now() - interval '2 minutes'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'resolved',
    now() - interval '15 minutes',
    now() - interval '1 day',
    now() - interval '15 minutes'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'bot',
    now() - interval '1 hour',
    now() - interval '3 days',
    now() - interval '1 hour'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'waiting_agent',
    now() - interval '5 minutes',
    now() - interval '5 hours',
    now() - interval '5 minutes'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000001',
    '33333333-3333-3333-3333-333333333333',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'in_service',
    now() - interval '10 minutes',
    now() - interval '30 minutes',
    now() - interval '10 minutes'
  );

-- =====================================================
-- 4. CRIAR MENSAGENS
-- =====================================================

-- Mensagens da conversa 1 (João Silva - waiting_agent)
INSERT INTO messages (
  id,
  conversation_id,
  from_me,
  body,
  timestamp,
  status,
  sent_by,
  created_at
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    true,
    'Olá! Sou o assistente virtual. Como posso ajudar?',
    now() - interval '2 hours',
    'read',
    'bot',
    now() - interval '2 hours'
  ),
  (
    '11111112-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    false,
    'Oi, gostaria de saber mais sobre os produtos',
    now() - interval '1 hour 58 minutes',
    'read',
    'customer',
    now() - interval '1 hour 58 minutes'
  ),
  (
    '11111113-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    true,
    'Temos várias opções! Você está procurando algo específico?',
    now() - interval '1 hour 58 minutes',
    'read',
    'bot',
    now() - interval '1 hour 58 minutes'
  ),
  (
    '11111114-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    false,
    'Preciso falar com um atendente',
    now() - interval '2 minutes',
    'delivered',
    'customer',
    now() - interval '2 minutes'
  ),
  (
    '11111115-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    true,
    '🤖 Transferindo para um atendente humano...',
    now() - interval '2 minutes',
    'delivered',
    'bot',
    now() - interval '2 minutes'
  );

-- Mensagens da conversa 2 (Maria Santos - resolved)
INSERT INTO messages (
  id,
  conversation_id,
  from_me,
  body,
  timestamp,
  status,
  sent_by,
  created_at
) VALUES
  (
    '22222221-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    true,
    'Olá! Como posso ajudar?',
    now() - interval '1 day',
    'read',
    'bot',
    now() - interval '1 day'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    false,
    'Gostaria de fazer um pedido',
    now() - interval '23 hours 50 minutes',
    'read',
    'customer',
    now() - interval '23 hours 50 minutes'
  ),
  (
    '22222223-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    true,
    'Claro! Qual produto você deseja?',
    now() - interval '23 hours 45 minutes',
    'read',
    'agent',
    now() - interval '23 hours 45 minutes'
  ),
  (
    '22222224-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    false,
    'Um hambúrguer clássico, por favor',
    now() - interval '23 hours 40 minutes',
    'read',
    'customer',
    now() - interval '23 hours 40 minutes'
  ),
  (
    '22222225-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    true,
    'Perfeito! Seu pedido foi registrado. Obrigada pelo atendimento!',
    now() - interval '15 minutes',
    'read',
    'agent',
    now() - interval '15 minutes'
  );

-- Mensagens da conversa 3 (Pedro Costa - bot)
INSERT INTO messages (
  id,
  conversation_id,
  from_me,
  body,
  timestamp,
  status,
  sent_by,
  created_at
) VALUES
  (
    '33333331-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    true,
    'Olá! Bem-vindo! Como posso ajudar?',
    now() - interval '3 days',
    'read',
    'bot',
    now() - interval '3 days'
  ),
  (
    '33333332-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    false,
    'Qual o horário de funcionamento?',
    now() - interval '1 hour',
    'read',
    'customer',
    now() - interval '1 hour'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    true,
    'Funcionamos de segunda a sábado, das 10h às 22h.',
    now() - interval '1 hour',
    'read',
    'bot',
    now() - interval '1 hour'
  );

-- Mensagens da conversa 4 (Ana Oliveira - waiting_agent)
INSERT INTO messages (
  id,
  conversation_id,
  from_me,
  body,
  timestamp,
  status,
  sent_by,
  created_at
) VALUES
  (
    '44444441-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    true,
    'Olá! Como posso ajudar?',
    now() - interval '5 hours',
    'read',
    'bot',
    now() - interval '5 hours'
  ),
  (
    '44444442-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    false,
    'Estou com um problema urgente',
    now() - interval '5 minutes',
    'delivered',
    'customer',
    now() - interval '5 minutes'
  ),
  (
    '44444443-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    true,
    '🤖 Transferindo para um atendente humano...',
    now() - interval '5 minutes',
    'delivered',
    'bot',
    now() - interval '5 minutes'
  );

-- Mensagens da conversa 5 (Carlos Mendes - in_service)
INSERT INTO messages (
  id,
  conversation_id,
  from_me,
  body,
  timestamp,
  status,
  sent_by,
  created_at
) VALUES
  (
    '55555551-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    true,
    'Olá! Como posso ajudar?',
    now() - interval '30 minutes',
    'read',
    'bot',
    now() - interval '30 minutes'
  ),
  (
    '55555552-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    false,
    'Preciso de ajuda com meu pedido',
    now() - interval '25 minutes',
    'read',
    'customer',
    now() - interval '25 minutes'
  ),
  (
    '55555553-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    true,
    'Claro! Vou te ajudar. Qual é o número do seu pedido?',
    now() - interval '10 minutes',
    'read',
    'agent',
    now() - interval '10 minutes'
  );

-- =====================================================
-- RESUMO DOS DADOS CRIADOS
-- =====================================================
-- Contatos: 5
-- Conversas: 5
--   - waiting_agent: 2 (João, Ana)
--   - resolved: 1 (Maria)
--   - bot: 1 (Pedro)
--   - in_service: 1 (Carlos)
-- Mensagens: 18
-- =====================================================

