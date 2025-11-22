-- =====================================================
-- DADOS DE TESTE PARA SUPABASE
-- WhatsApp SaaS - Dados iniciais para testes
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================
-- IMPORTANTE: As senhas são hasheadas com bcrypt
-- Senha padrão para todos: "teste123"
-- Hash bcrypt gerado: $2b$10$tkJSoWsHohRwPC78g3n6HeZs4jHPhQ.XLsUFzAnezz46I2FZy5hvq
-- =====================================================

-- Adicionar coluna password_hash na tabela users se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash TEXT;
  END IF;
END $$;

-- =====================================================
-- 1. CRIAR CONTA DE TESTE
-- =====================================================
-- Primeiro, verificar se a conta já existe e deletar se necessário
DELETE FROM accounts WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verificar se a coluna 'name' existe e inserir com ou sem ela
DO $$
BEGIN
  -- Se a coluna 'name' existir, inserir com ela
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' AND column_name = 'name'
  ) THEN
    INSERT INTO accounts (id, name, owner_email, company_name, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'Empresa Teste Ltda', -- Usar company_name como name se a coluna existir
      'admin@test.com',
      'Empresa Teste Ltda',
      now()
    );
  ELSE
    -- Se não existir, inserir sem ela
    INSERT INTO accounts (id, owner_email, company_name, created_at)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'admin@test.com',
      'Empresa Teste Ltda',
      now()
    );
  END IF;
END $$;

-- =====================================================
-- 2. CRIAR USUÁRIOS DE TESTE
-- =====================================================
-- IMPORTANTE: As senhas são hasheadas com bcrypt
-- Senha: "teste123"
-- Hash gerado com bcrypt (10 rounds): $2b$10$tkJSoWsHohRwPC78g3n6HeZs4jHPhQ.XLsUFzAnezz46I2FZy5hvq

-- Adicionar coluna status se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'status'
  ) THEN
    ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Deletar usuários existentes (se houver)
DELETE FROM users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

-- Usuário Admin
INSERT INTO users (
  id,
  account_id,
  name,
  email,
  role,
  status,
  password_hash,
  created_at
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000001',
  'Administrador Teste',
  'admin@test.com',
  'admin',
  'active',
  '$2b$10$tkJSoWsHohRwPC78g3n6HeZs4jHPhQ.XLsUFzAnezz46I2FZy5hvq', -- teste123
  now()
);

-- Usuário Agente
INSERT INTO users (
  id,
  account_id,
  name,
  email,
  role,
  status,
  password_hash,
  created_at
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000001',
  'Agente Teste',
  'agente@test.com',
  'agent',
  'active',
  '$2b$10$tkJSoWsHohRwPC78g3n6HeZs4jHPhQ.XLsUFzAnezz46I2FZy5hvq', -- teste123
  now()
);

-- =====================================================
-- 3. CRIAR INSTÂNCIA DE TESTE
-- =====================================================
DELETE FROM instances WHERE id = '33333333-3333-3333-3333-333333333333';

INSERT INTO instances (
  id,
  account_id,
  name,
  status,
  created_at
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000001',
  'instancia-teste',
  'disconnected',
  now()
);

-- =====================================================
-- CREDENCIAIS DE TESTE
-- =====================================================
-- Admin:
--   Email: admin@test.com
--   Senha: teste123
--
-- Agente:
--   Email: agente@test.com
--   Senha: teste123
-- =====================================================

