-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- WhatsApp SaaS - Políticas de Segurança
-- =====================================================
-- Execute este script APÓS criar as tabelas
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. FUNÇÃO AUXILIAR: Obter account_id do usuário atual
-- =====================================================

-- Função para obter o account_id do usuário autenticado
CREATE OR REPLACE FUNCTION get_user_account_id()
RETURNS UUID AS $$
  SELECT account_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- 3. POLÍTICAS: accounts
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own account" ON accounts;
DROP POLICY IF EXISTS "Users can update their own account" ON accounts;
DROP POLICY IF EXISTS "Allow account creation" ON accounts;

-- Usuários podem ver apenas sua própria conta
CREATE POLICY "Users can view their own account"
ON accounts FOR SELECT
USING (
  id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem atualizar apenas sua própria conta
CREATE POLICY "Users can update their own account"
ON accounts FOR UPDATE
USING (
  id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Permitir inserção de novas contas (para cadastro)
-- Nota: Em produção, você pode querer restringir isso
CREATE POLICY "Allow account creation"
ON accounts FOR INSERT
WITH CHECK (true);

-- =====================================================
-- 4. POLÍTICAS: users
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view users in their account" ON users;
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Users can update themselves or admins can update any user" ON users;

-- Usuários podem ver outros usuários da mesma conta
CREATE POLICY "Users can view users in their account"
ON users FOR SELECT
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Apenas admins podem inserir novos usuários
CREATE POLICY "Admins can insert users"
ON users FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
    AND account_id = users.account_id
  )
);

-- Usuários podem atualizar a si mesmos
-- Admins podem atualizar qualquer usuário da conta
CREATE POLICY "Users can update themselves or admins can update any user"
ON users FOR UPDATE
USING (
  id = auth.uid() OR
  (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND account_id = (SELECT account_id FROM users WHERE users.id = users.id)
    )
  )
);

-- =====================================================
-- 5. POLÍTICAS: instances
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view instances in their account" ON instances;
DROP POLICY IF EXISTS "Users can insert instances in their account" ON instances;
DROP POLICY IF EXISTS "Users can update instances in their account" ON instances;
DROP POLICY IF EXISTS "Users can delete instances in their account" ON instances;

-- Usuários podem ver instâncias da sua conta
CREATE POLICY "Users can view instances in their account"
ON instances FOR SELECT
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem inserir instâncias na sua conta
CREATE POLICY "Users can insert instances in their account"
ON instances FOR INSERT
WITH CHECK (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem atualizar instâncias da sua conta
CREATE POLICY "Users can update instances in their account"
ON instances FOR UPDATE
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem deletar instâncias da sua conta
CREATE POLICY "Users can delete instances in their account"
ON instances FOR DELETE
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- =====================================================
-- 6. POLÍTICAS: contacts
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view contacts in their account" ON contacts;
DROP POLICY IF EXISTS "Users can insert contacts in their account" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts in their account" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts in their account" ON contacts;

-- Usuários podem ver contatos da sua conta
CREATE POLICY "Users can view contacts in their account"
ON contacts FOR SELECT
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem inserir contatos na sua conta
CREATE POLICY "Users can insert contacts in their account"
ON contacts FOR INSERT
WITH CHECK (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem atualizar contatos da sua conta
CREATE POLICY "Users can update contacts in their account"
ON contacts FOR UPDATE
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem deletar contatos da sua conta
CREATE POLICY "Users can delete contacts in their account"
ON contacts FOR DELETE
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- =====================================================
-- 7. POLÍTICAS: conversations
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view conversations in their account" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations in their account" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations in their account" ON conversations;

-- Usuários podem ver conversas das instâncias da sua conta
CREATE POLICY "Users can view conversations in their account"
ON conversations FOR SELECT
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Sistema pode inserir conversas (via webhook)
-- Usuários também podem criar conversas manualmente
CREATE POLICY "Users can insert conversations in their account"
ON conversations FOR INSERT
WITH CHECK (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Usuários podem atualizar conversas das instâncias da sua conta
CREATE POLICY "Users can update conversations in their account"
ON conversations FOR UPDATE
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- =====================================================
-- 8. POLÍTICAS: messages
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view messages in their account" ON messages;
DROP POLICY IF EXISTS "Users can insert messages in their account" ON messages;

-- Usuários podem ver mensagens das conversas da sua conta
CREATE POLICY "Users can view messages in their account"
ON messages FOR SELECT
USING (
  conversation_id IN (
    SELECT c.id FROM conversations c
    INNER JOIN instances i ON i.id = c.instance_id
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Sistema pode inserir mensagens (via webhook)
-- Usuários também podem inserir mensagens
CREATE POLICY "Users can insert messages in their account"
ON messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT c.id FROM conversations c
    INNER JOIN instances i ON i.id = c.instance_id
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- =====================================================
-- 9. POLÍTICAS: products
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view products in their account" ON products;
DROP POLICY IF EXISTS "Users can insert products in their account" ON products;
DROP POLICY IF EXISTS "Users can update products in their account" ON products;
DROP POLICY IF EXISTS "Users can delete products in their account" ON products;

-- Usuários podem ver produtos da sua conta
CREATE POLICY "Users can view products in their account"
ON products FOR SELECT
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem inserir produtos na sua conta
CREATE POLICY "Users can insert products in their account"
ON products FOR INSERT
WITH CHECK (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem atualizar produtos da sua conta
CREATE POLICY "Users can update products in their account"
ON products FOR UPDATE
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- Usuários podem deletar produtos da sua conta
CREATE POLICY "Users can delete products in their account"
ON products FOR DELETE
USING (
  account_id IN (
    SELECT account_id FROM users WHERE id = auth.uid()
  )
);

-- =====================================================
-- 10. POLÍTICAS: groups
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view groups in their account" ON groups;
DROP POLICY IF EXISTS "Users can insert groups in their account" ON groups;
DROP POLICY IF EXISTS "Users can update groups in their account" ON groups;
DROP POLICY IF EXISTS "Users can delete groups in their account" ON groups;

-- Usuários podem ver grupos das instâncias da sua conta
CREATE POLICY "Users can view groups in their account"
ON groups FOR SELECT
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Usuários podem inserir grupos nas instâncias da sua conta
CREATE POLICY "Users can insert groups in their account"
ON groups FOR INSERT
WITH CHECK (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Usuários podem atualizar grupos das instâncias da sua conta
CREATE POLICY "Users can update groups in their account"
ON groups FOR UPDATE
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Usuários podem deletar grupos das instâncias da sua conta
CREATE POLICY "Users can delete groups in their account"
ON groups FOR DELETE
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- =====================================================
-- 11. POLÍTICAS: campaigns
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view campaigns in their account" ON campaigns;
DROP POLICY IF EXISTS "Users can insert campaigns in their account" ON campaigns;
DROP POLICY IF EXISTS "Users can update campaigns in their account" ON campaigns;
DROP POLICY IF EXISTS "Users can delete campaigns in their account" ON campaigns;

-- Usuários podem ver campanhas das instâncias da sua conta
CREATE POLICY "Users can view campaigns in their account"
ON campaigns FOR SELECT
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Usuários podem inserir campanhas nas instâncias da sua conta
CREATE POLICY "Users can insert campaigns in their account"
ON campaigns FOR INSERT
WITH CHECK (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Usuários podem atualizar campanhas das instâncias da sua conta
CREATE POLICY "Users can update campaigns in their account"
ON campaigns FOR UPDATE
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- Usuários podem deletar campanhas das instâncias da sua conta
CREATE POLICY "Users can delete campaigns in their account"
ON campaigns FOR DELETE
USING (
  instance_id IN (
    SELECT i.id FROM instances i
    INNER JOIN users u ON u.account_id = i.account_id
    WHERE u.id = auth.uid()
  )
);

-- =====================================================
-- NOTA IMPORTANTE: Webhook e Service Role
-- =====================================================
-- O webhook precisa usar a service_role key (não a anon key)
-- para poder inserir dados sem passar pelas políticas RLS.
-- 
-- No código do webhook, use:
-- const supabaseAdmin = createClient(
--   process.env.NEXT_PUBLIC_SUPABASE_URL!,
--   process.env.SUPABASE_SERVICE_ROLE_KEY! // Chave de serviço (não anon)
-- );
-- =====================================================

