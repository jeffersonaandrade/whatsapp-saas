# 📸 Upload de Imagem - Produtos

## ✅ O QUE FOI IMPLEMENTADO

### 1. **API Route de Upload** (`/api/products/upload-image`)
- Recebe arquivo de imagem
- Valida tipo (JPG, PNG, WEBP)
- Valida tamanho (máx. 5MB)
- Por enquanto, converte para base64 (mockado)
- TODO: Substituir por Supabase Storage quando conectar

### 2. **Formulário de Upload** (`/products`)
- Campo de upload de arquivo
- Preview da imagem selecionada
- Botão para remover imagem
- Loading durante upload
- Opção alternativa: URL da imagem

### 3. **Funcionalidades**
- Upload de imagem local
- Preview antes de salvar
- Validação de tipo e tamanho
- Remoção de imagem
- Opção de usar URL (fallback)

---

## 🔄 COMO FUNCIONA AGORA (Mockado)

### Upload de Imagem:
```
1. Usuário seleciona arquivo
   ↓
2. Arquivo é enviado para /api/products/upload-image
   ↓
3. API valida tipo e tamanho
   ↓
4. API converte para base64
   ↓
5. Retorna data URL (base64)
   ↓
6. Preview da imagem é exibido
   ↓
7. Ao salvar produto, imageUrl (base64) é salvo
```

---

## 📋 QUANDO CONECTAR AO SUPABASE

### Substituir em `app/api/products/upload-image/route.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const accountId = formData.get('accountId') as string; // Do header ou body

    if (!file || !accountId) {
      return NextResponse.json(
        { error: 'Arquivo e accountId são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar tipo e tamanho (mesmo código atual)

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
      console.error('Erro ao fazer upload:', error);
      return NextResponse.json(
        { error: 'Erro ao fazer upload da imagem' },
        { status: 500 }
      );
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('Erro ao fazer upload de imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload de imagem' },
      { status: 500 }
    );
  }
}
```

### Criar bucket no Supabase:
1. Acessar Supabase Dashboard
2. Ir em **Storage**
3. Criar bucket: `product-images`
4. Configurar políticas:
   - **Public**: `true` (para URLs públicas)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`

### Adicionar RLS (Row Level Security):
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
```

---

## 📝 VALIDAÇÕES IMPLEMENTADAS

### Tipo de Arquivo:
- ✅ JPG/JPEG
- ✅ PNG
- ✅ WEBP
- ❌ Outros formatos são rejeitados

### Tamanho:
- ✅ Máximo: 5MB
- ❌ Arquivos maiores são rejeitados

### Erros:
- ✅ Mensagem clara para tipo inválido
- ✅ Mensagem clara para tamanho excessivo
- ✅ Mensagem clara para erros gerais

---

## 🎯 FUNCIONALIDADES

### Upload:
- ✅ Seleção de arquivo
- ✅ Preview antes de salvar
- ✅ Loading durante upload
- ✅ Validação de tipo e tamanho
- ✅ Remoção de imagem
- ✅ Opção alternativa: URL

### Visualização:
- ✅ Preview no formulário
- ✅ Preview nos cards de produtos
- ✅ Imagem é enviada ao cliente quando mencionada

---

## 🚀 PRÓXIMOS PASSOS

1. **Criar bucket no Supabase** (`product-images`)
2. **Configurar políticas RLS** no Supabase
3. **Substituir código mockado** por Supabase Storage
4. **Testar upload** com Supabase
5. **Otimizar imagens** (redimensionar, compressão)

---

## 📊 RESUMO

### ✅ Funcionando Agora:
- Upload de imagem local (base64)
- Preview da imagem
- Validação de tipo e tamanho
- Remoção de imagem
- Opção de URL (fallback)

### ⏳ Quando Conectar ao Supabase:
- Substituir base64 por Supabase Storage
- URLs públicas das imagens
- RLS configurado
- Otimização de imagens

---

**Última atualização:** Agora
**Status:** ✅ Upload funcionando (mockado com base64)

