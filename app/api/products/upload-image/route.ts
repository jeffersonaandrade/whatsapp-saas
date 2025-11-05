import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route para upload de imagem de produto
 * TODO: Substituir por Supabase Storage quando conectar
 * 
 * Por enquanto, converte para base64 e retorna (mockado)
 * Quando conectar ao Supabase, usar:
 * 
 * const { data, error } = await supabase.storage
 *   .from('product-images')
 *   .upload(`${accountId}/${productId}/${fileName}`, file, {
 *     contentType: file.type,
 *     upsert: false
 *   });
 * 
 * const { data: { publicUrl } } = supabase.storage
 *   .from('product-images')
 *   .getPublicUrl(data.path);
 * 
 * return publicUrl;
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WEBP' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      );
    }

    // Por enquanto, converter para base64 (mockado)
    // TODO: Substituir por upload no Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl, // Por enquanto retorna base64, depois será URL do Supabase
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

