# 📋 TODOs para Conectar ao Supabase

Este documento lista todos os TODOs que precisam ser implementados quando conectar ao Supabase.

---

## 🔴 CRÍTICO (Para MVP Funcionar)

### 1. **Autenticação** (`contexts/AuthContext.tsx`)
- [ ] Remover autenticação mockada
- [ ] Implementar `signIn` com Supabase Auth
- [ ] Implementar `signUp` com Supabase Auth
- [ ] Implementar `signOut` com Supabase Auth
- [ ] Implementar `checkSession` com Supabase Auth
- [ ] Criar registro na tabela `accounts` no cadastro
- [ ] Criar primeiro usuário admin na tabela `users` no cadastro

**Arquivo:** `contexts/AuthContext.tsx`

---

### 2. **Configurações do Negócio** (`lib/services/business-config.ts`)
- [ ] Substituir `getBusinessConfig` por chamada ao Supabase:
  ```typescript
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single();
  ```

- [ ] Substituir `getBusinessConfigByInstanceName` por chamada ao Supabase:
  ```typescript
  // 1. Buscar instance pelo name
  const { data: instance } = await supabase
    .from('instances')
    .select('account_id')
    .eq('name', instanceName)
    .single();
  
  // 2. Buscar account pelo account_id
  const { data: account } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', instance.account_id)
    .single();
  ```

- [ ] Substituir `updateBusinessConfig` por chamada ao Supabase:
  ```typescript
  const { data, error } = await supabase
    .from('accounts')
    .update({
      company_name: config.companyName,
      business_type: config.businessType,
      business_description: config.businessDescription,
      opening_hours: config.openingHours,
      address: config.address,
      phone: config.phone,
      delivery_available: config.deliveryAvailable,
      delivery_fee: config.deliveryFee,
      groq_api_key: config.groqApiKey,
      updated_at: new Date().toISOString(),
    })
    .eq('id', accountId);
  ```

**Arquivo:** `lib/services/business-config.ts`

---

### 3. **Webhook** (`app/api/webhook/route.ts`)
- [ ] Buscar `accountId` via `instanceName` no Supabase:
  ```typescript
  const { data: instance } = await supabase
    .from('instances')
    .select('account_id')
    .eq('name', instanceName)
    .single();
  
  const accountId = instance.account_id;
  ```

- [ ] Substituir `businessConfigService.getBusinessConfigByInstanceName` por chamada real ao Supabase
- [ ] Substituir `productsService.getAllProducts` por chamada real ao Supabase
- [ ] Salvar conversas no Supabase quando mensagens chegam
- [ ] Salvar mensagens no Supabase
- [ ] Atualizar status de conversas (transferência) no Supabase

**Arquivo:** `app/api/webhook/route.ts` (linhas 189-204)

---

### 4. **Tela de Configurações** (`app/settings/page.tsx`)
- [ ] Substituir `loadConfig` por chamada ao Supabase:
  ```typescript
  const { data: user } = useAuth();
  const businessConfig = await businessConfigService.getBusinessConfig(user.accountId);
  ```

- [ ] Substituir `handleSave` por chamada ao Supabase:
  ```typescript
  const { data: user } = useAuth();
  await businessConfigService.updateBusinessConfig(user.accountId, {
    companyName: businessConfig.companyName,
    businessType: businessConfig.businessType,
    // ... outros campos
  });
  ```

**Arquivo:** `app/settings/page.tsx` (linhas 41-107)

---

### 5. **Produtos** (`lib/services/products.ts`)
- [ ] Substituir `getAllProducts` por chamada ao Supabase:
  ```typescript
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('account_id', accountId)
    .eq('is_active', true);
  ```

- [ ] Substituir `getProductById` por chamada ao Supabase
- [ ] Substituir `createProduct` por chamada ao Supabase
- [ ] Substituir `updateProduct` por chamada ao Supabase
- [ ] Substituir `deleteProduct` por chamada ao Supabase

**Arquivo:** `lib/services/products.ts`

---

### 5.1. **Upload de Imagem de Produtos** (`app/api/products/upload-image/route.ts`)
- [ ] Criar bucket no Supabase Storage: `product-images`
- [ ] Configurar políticas RLS para o bucket `product-images`
- [ ] Substituir upload mockado (base64) por Supabase Storage:
  ```typescript
  import { supabase } from '@/lib/supabase';
  
  // Gerar nome único para o arquivo
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = `${accountId}/products/${fileName}`;
  
  // Upload para Supabase Storage
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
  
  if (error) {
    return NextResponse.json({ error: 'Erro ao fazer upload' }, { status: 500 });
  }
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(data.path);
  
  return NextResponse.json({ success: true, imageUrl: publicUrl });
  ```

- [ ] Adicionar `accountId` no request (do header ou body)
- [ ] Configurar políticas de acesso:
  - Upload apenas para o próprio `account_id`
  - Leitura pública para URLs das imagens
- [ ] Implementar remoção de imagem quando produto é excluído:
  ```typescript
  // Ao excluir produto, remover imagem do Storage
  const { error } = await supabase.storage
    .from('product-images')
    .remove([`${accountId}/products/${product.imageFileName}`]);
  ```

**Arquivo:** `app/api/products/upload-image/route.ts`

**Configuração no Supabase:**
1. Criar bucket: `product-images`
2. Configurar: **Public** = `true` (para URLs públicas)
3. Configurar: **File size limit** = `5MB`
4. Configurar: **Allowed MIME types** = `image/jpeg, image/png, image/webp`

---

### 6. **Conversas** (`app/conversations/page.tsx`)
- [ ] Carregar conversas do Supabase
- [ ] Carregar mensagens do Supabase
- [ ] Implementar envio de mensagens pelo atendente
- [ ] Implementar transbordo (assumir conversa)
- [ ] Implementar resolução de conversa

**Arquivo:** `app/conversations/page.tsx`

---

### 7. **Dashboard** (`app/dashboard/page.tsx`)
- [ ] Carregar status real da Evolution API
- [ ] Carregar métricas reais do Supabase
- [ ] Atualizar QR Code em tempo real

**Arquivo:** `app/dashboard/page.tsx`

---

## 🟡 IMPORTANTE (Melhorias)

### 8. **Row Level Security (RLS)**
- [ ] Criar políticas RLS para tabela `accounts`
- [ ] Criar políticas RLS para tabela `instances`
- [ ] Criar políticas RLS para tabela `products`
- [ ] Criar políticas RLS para tabela `conversations`
- [ ] Criar políticas RLS para tabela `messages`
- [ ] Criar políticas RLS para tabela `users`

**Local:** Supabase Dashboard → Authentication → Policies

---

### 9. **Scripts SQL**
- [ ] Executar `database/supabase_accounts_business_fields.sql` no Supabase
- [ ] Executar `database/supabase_products_table.sql` no Supabase
- [ ] Verificar se todas as tabelas foram criadas corretamente

**Arquivos:**
- `database/supabase_accounts_business_fields.sql`
- `database/supabase_products_table.sql`

---

### 9.1. **Configuração do Supabase Storage**
- [ ] Criar bucket `product-images` no Supabase Storage
- [ ] Configurar bucket como público (para URLs públicas)
- [ ] Configurar limite de tamanho: 5MB
- [ ] Configurar tipos MIME permitidos: `image/jpeg, image/png, image/webp`
- [ ] Criar políticas RLS para o bucket:
  ```sql
  -- Política para permitir upload apenas para o próprio account
  CREATE POLICY "Users can upload images to their own account"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
  
  -- Política para permitir leitura pública
  CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');
  
  -- Política para permitir remoção apenas para o próprio account
  CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
  ```

**Local:** Supabase Dashboard → Storage → Buckets

---

### 10. **Variáveis de Ambiente**
- [ ] Criar arquivo `.env.local` com:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=...
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  GROQ_API_KEY=...
  ```

**Arquivo:** `.env.local`

---

## 🟢 OPCIONAL (Melhorias Futuras)

### 11. **WebSocket para Updates em Tempo Real**
- [ ] Implementar WebSocket para atualizar QR Code em tempo real
- [ ] Implementar WebSocket para atualizar conversas em tempo real
- [ ] Implementar notificações de novas mensagens

---

### 12. **Fila de Mensagens**
- [ ] Implementar fila quando rate limit exceder
- [ ] Processar mensagens em background

---

## 📝 RESUMO

### Arquivos que Precisam ser Atualizados:
1. ✅ `contexts/AuthContext.tsx` - Autenticação
2. ✅ `lib/services/business-config.ts` - Configurações do negócio
3. ✅ `app/api/webhook/route.ts` - Webhook
4. ✅ `app/settings/page.tsx` - Tela de configurações
5. ✅ `lib/services/products.ts` - Produtos
6. ✅ `app/api/products/upload-image/route.ts` - Upload de imagens de produtos
7. ✅ `app/conversations/page.tsx` - Conversas
8. ✅ `app/dashboard/page.tsx` - Dashboard

### Scripts SQL que Precisam ser Executados:
1. ✅ `database/supabase_accounts_business_fields.sql` - Campos adicionais na tabela accounts
2. ✅ `database/supabase_products_table.sql` - Tabela de produtos

### Configurações Necessárias:
1. ✅ Variáveis de ambiente (`.env.local`)
2. ✅ Row Level Security (RLS) no Supabase
3. ✅ Políticas de segurança para cada tabela
4. ✅ Supabase Storage (bucket `product-images`)
5. ✅ Políticas RLS para o bucket `product-images`

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Executar scripts SQL** no Supabase
2. **Configurar variáveis de ambiente** (`.env.local`)
3. **Criar bucket no Supabase Storage** (`product-images`)
4. **Configurar políticas RLS** para o bucket `product-images`
5. **Implementar autenticação** (`AuthContext.tsx`)
6. **Implementar configurações do negócio** (`business-config.ts`)
7. **Implementar produtos** (`products.ts`)
8. **Implementar upload de imagens** (`upload-image/route.ts`)
9. **Implementar webhook** (`webhook/route.ts`)
10. **Implementar conversas** (`conversations/page.tsx`)
11. **Configurar RLS** no Supabase
12. **Testar fluxo completo** end-to-end

---

## ✅ CHECKLIST FINAL

Antes de considerar "conectado ao Supabase", verificar:

- [ ] Autenticação funcionando (login/logout/cadastro)
- [ ] Configurações do negócio salvando e carregando
- [ ] Produtos salvando e carregando
- [ ] Upload de imagens funcionando (Supabase Storage)
- [ ] Imagens dos produtos sendo exibidas corretamente
- [ ] Webhook identificando accountId corretamente
- [ ] Conversas salvando no Supabase
- [ ] Mensagens salvando no Supabase
- [ ] RLS configurado e funcionando
- [ ] Políticas RLS do Storage configuradas
- [ ] Testado com múltiplos clientes (multi-tenancy)
- [ ] Todos os mocks removidos

---

**Última atualização:** Agora
**Status:** Pronto para conectar ao Supabase quando necessário

