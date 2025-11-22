-- Script SQL para adicionar campos de configuração do negócio na tabela accounts
-- Execute este script no Supabase SQL Editor

-- Adicionar campos na tabela accounts para configuração do negócio
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS business_type TEXT, -- ex: "Pizzaria", "Hamburgueria", "Clínica", etc.
ADD COLUMN IF NOT EXISTS business_description TEXT, -- Descrição do negócio
ADD COLUMN IF NOT EXISTS opening_hours TEXT, -- Horário de funcionamento (ex: "18h às 23h")
ADD COLUMN IF NOT EXISTS address TEXT, -- Endereço do negócio
ADD COLUMN IF NOT EXISTS phone TEXT, -- Telefone de contato
ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false, -- Se faz entregas
ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2), -- Taxa de entrega
ADD COLUMN IF NOT EXISTS groq_api_key TEXT, -- API Key do Groq (será armazenada criptografada em produção)
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Criar índice para busca por business_type
CREATE INDEX IF NOT EXISTS idx_accounts_business_type ON accounts(business_type);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_updated_at 
BEFORE UPDATE ON accounts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON COLUMN accounts.business_type IS 'Tipo de negócio (ex: Pizzaria, Hamburgueria, Clínica)';
COMMENT ON COLUMN accounts.business_description IS 'Descrição do negócio para contexto da IA';
COMMENT ON COLUMN accounts.opening_hours IS 'Horário de funcionamento formatado (ex: "18h às 23h")';
COMMENT ON COLUMN accounts.address IS 'Endereço físico do negócio';
COMMENT ON COLUMN accounts.phone IS 'Telefone de contato do negócio';
COMMENT ON COLUMN accounts.delivery_available IS 'Se o negócio faz entregas';
COMMENT ON COLUMN accounts.delivery_fee IS 'Taxa de entrega (se aplicável)';
COMMENT ON COLUMN accounts.groq_api_key IS 'API Key do Groq para IA (armazenar criptografada em produção)';

