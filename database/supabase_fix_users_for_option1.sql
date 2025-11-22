-- =====================================================
-- AJUSTE TEMPORÁRIO PARA OPÇÃO 1 (Sem Supabase Auth)
-- =====================================================
-- Este script remove temporariamente a constraint de auth.users
-- para permitir inserir usuários diretamente na tabela users
-- =====================================================
-- ATENÇÃO: Quando migrar para Supabase Auth (Opção 3),
-- será necessário restaurar esta constraint
-- =====================================================

-- Remover a constraint de foreign key para auth.users
-- (Isso permite inserir usuários sem precisar do Supabase Auth)
DO $$
BEGIN
  -- Verificar se a constraint existe e remover
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_id_fkey'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_id_fkey;
  END IF;
  
  -- Não precisamos mexer no NOT NULL porque PRIMARY KEY sempre é NOT NULL
  -- Apenas removemos a foreign key constraint, isso já é suficiente
END $$;

-- Agora a tabela users pode receber UUIDs sem precisar do auth.users
-- Quando migrar para Supabase Auth, você precisará:
-- 1. Criar usuário no Supabase Auth primeiro
-- 2. Usar o id do auth.users como id na tabela users
-- 3. Restaurar a constraint: ALTER TABLE users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

