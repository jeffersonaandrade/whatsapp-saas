import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/utils/auth';
import { logger, getRequestContext } from '@/lib/utils/logger';
import { addSecurityHeaders } from '@/lib/utils/security';

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
  const requestContext = getRequestContext(request);
  
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      logger.warn('[Upload Image] Tentativa sem autenticação', {}, requestContext);
      const response = NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    const requestContextWithUser = { ...requestContext, userId: user.id, accountId: user.accountId };

    // Validar tamanho do Content-Length
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
      if (sizeMB > 10) { // Máximo 10MB para upload
        logger.warn('[Upload Image] Requisição muito grande', { sizeMB }, requestContextWithUser);
        const response = NextResponse.json(
          { error: 'Requisição muito grande. Máximo 10MB' },
          { status: 413 }
        );
        return addSecurityHeaders(response);
      }
    }

    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      logger.warn('[Upload Image] Nenhum arquivo enviado', {}, requestContextWithUser);
      const response = NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar tipo de arquivo (verificar extensão e MIME type)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExtension)) {
      logger.warn('[Upload Image] Tipo de arquivo não permitido', { 
        fileType: file.type, 
        fileName: file.name 
      }, requestContextWithUser);
      const response = NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WEBP' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      logger.warn('[Upload Image] Arquivo muito grande', { 
        fileSize: file.size, 
        maxSize 
      }, requestContextWithUser);
      const response = NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar nome do arquivo (sanitizar)
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
    if (sanitizedFileName !== file.name) {
      logger.warn('[Upload Image] Nome de arquivo sanitizado', { 
        original: file.name, 
        sanitized: sanitizedFileName 
      }, requestContextWithUser);
    }

    logger.info('[Upload Image] Processando upload', {
      fileName: sanitizedFileName,
      fileSize: file.size,
      fileType: file.type,
    }, requestContextWithUser);

    // Por enquanto, converter para base64 (mockado)
    // TODO: Substituir por upload no Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 500));

    logger.info('[Upload Image] Upload concluído com sucesso', {
      fileName: sanitizedFileName,
    }, requestContextWithUser);

    const response = NextResponse.json({
      success: true,
      imageUrl: dataUrl, // Por enquanto retorna base64, depois será URL do Supabase
      fileName: sanitizedFileName,
      fileSize: file.size,
      fileType: file.type,
    });
    return addSecurityHeaders(response);
  } catch (error) {
    logger.error('[Upload Image] Erro ao fazer upload', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro ao fazer upload de imagem' },
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}

