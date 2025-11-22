-- =====================================================
-- SUPABASE STORAGE SETUP
-- WhatsApp SaaS - Configuração do Storage para Imagens
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. CRIAR BUCKET: product-images
-- =====================================================
-- Nota: O bucket deve ser criado manualmente no Dashboard do Supabase
-- Vá em: Storage > New bucket
-- Nome: product-images
-- Public: true (para URLs públicas)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- =====================================================

-- =====================================================
-- 2. POLÍTICAS RLS PARA O BUCKET product-images
-- =====================================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images to their own account folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update images in their own account folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete images from their own account folder" ON storage.objects;

-- Política: Permitir leitura pública das imagens
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Política: Permitir upload apenas para o próprio account
-- Estrutura do path: {account_id}/products/{filename}
CREATE POLICY "Users can upload images to their own account folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] IN (
    SELECT account_id::text FROM users WHERE id = auth.uid()
  )
);

-- Política: Permitir atualização apenas para o próprio account
CREATE POLICY "Users can update images in their own account folder"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] IN (
    SELECT account_id::text FROM users WHERE id = auth.uid()
  )
);

-- Política: Permitir remoção apenas para o próprio account
CREATE POLICY "Users can delete images from their own account folder"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] IN (
    SELECT account_id::text FROM users WHERE id = auth.uid()
  )
);

-- =====================================================
-- NOTA: Criação do Bucket via Dashboard
-- =====================================================
-- 1. Acesse o Dashboard do Supabase
-- 2. Vá em: Storage > New bucket
-- 3. Configure:
--    - Name: product-images
--    - Public bucket: ✅ (marcado)
--    - File size limit: 5242880 (5MB em bytes)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
-- 4. Clique em "Create bucket"
-- =====================================================

-- =====================================================
-- ESTRUTURA DE PASTAS RECOMENDADA
-- =====================================================
-- product-images/
--   └── {account_id}/
--       └── products/
--           └── {timestamp}-{filename}
-- 
-- Exemplo: product-images/550e8400-e29b-41d4-a716-446655440000/products/1234567890-pizza.jpg
-- =====================================================

