/**
 * Utilitários de Segurança
 * Headers de segurança, validação de webhook, etc
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Adiciona headers de segurança às respostas
 * Modifica o objeto response diretamente (não retorna novo objeto)
 */
export function addSecurityHeaders(response: NextResponse): void {
  // X-Content-Type-Options: Previne MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options: Previne clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection: Proteção XSS (legado, mas ainda útil)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy: Controla informações de referrer
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions-Policy: Controla features do navegador
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  // Content-Security-Policy: Previne XSS e injection attacks
  // Ajuste conforme necessário para seu domínio
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.netlify.app https://*.onrender.com;"
    );
  }
}

/**
 * Valida origem do webhook (Evolution API)
 * Verifica se a requisição vem de um IP/domínio confiável
 */
export function validateWebhookOrigin(request: Request | NextRequest | { headers: Headers }): { valid: boolean; error?: string } {
  // Em produção, você deve validar o IP ou usar assinatura HMAC
  // Por enquanto, validação básica
  
  // Verificar se request e headers existem
  if (!request || !('headers' in request) || !request.headers) {
    return { valid: false, error: 'Request ou headers inválidos' };
  }
  
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');
  
  // Se estiver em desenvolvimento, permitir
  if (process.env.NODE_ENV === 'development') {
    return { valid: true };
  }
  
  // Lista de origens permitidas (configure no .env)
  const allowedOrigins = process.env.WEBHOOK_ALLOWED_ORIGINS?.split(',') || [];
  
  // Se não há origem ou referer, pode ser requisição direta (permitir se configurado)
  if (!origin && !referer) {
    // Verificar se há token de autenticação no header
    const authToken = request.headers.get('x-webhook-token');
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN;
    
    if (expectedToken && authToken === expectedToken) {
      return { valid: true };
    }
    
    // Se não tem token mas está em produção, pode ser perigoso
    if (process.env.NODE_ENV === 'production' && !expectedToken) {
      return { 
        valid: false, 
        error: 'Webhook sem autenticação não permitido em produção' 
      };
    }
  }
  
  // Validar origem se fornecida
  if (origin && allowedOrigins.length > 0) {
    const isAllowed = allowedOrigins.some(allowed => origin.includes(allowed));
    if (!isAllowed) {
      return { 
        valid: false, 
        error: `Origem não permitida: ${origin}` 
      };
    }
  }
  
  return { valid: true };
}

/**
 * Valida assinatura HMAC do webhook (recomendado para produção)
 * Nota: Requer Node.js runtime (não funciona no Edge Runtime)
 */
export async function validateWebhookSignature(
  body: string,
  signature: string | null,
  secret: string
): Promise<{ valid: boolean; error?: string }> {
  if (!signature) {
    return { valid: false, error: 'Assinatura não fornecida' };
  }
  
  if (!secret) {
    return { valid: false, error: 'Secret não configurado' };
  }
  
  // Verificar se está no servidor Node.js (não Edge Runtime)
  if (typeof window !== 'undefined') {
    return { valid: false, error: 'Validação de assinatura só funciona no servidor' };
  }
  
  try {
    // Import estático do crypto (Node.js built-in)
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    // Comparação segura (timing-safe)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    
    if (!isValid) {
      return { valid: false, error: 'Assinatura inválida' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Erro ao validar assinatura' };
  }
}

/**
 * Extrai IP real do cliente (considerando proxies)
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (cfConnectingIP) return cfConnectingIP;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  if (realIP) return realIP;
  
  return 'unknown';
}

/**
 * Valida tamanho do body da requisição
 */
export function validateRequestSize(contentLength: string | null, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  if (!contentLength) return { valid: true }; // Sem tamanho especificado, deixar passar
  
  const sizeMB = parseInt(contentLength, 10) / (1024 * 1024);
  
  if (sizeMB > maxSizeMB) {
    return { 
      valid: false, 
      error: `Requisição muito grande: ${sizeMB.toFixed(2)}MB (máximo: ${maxSizeMB}MB)` 
    };
  }
  
  return { valid: true };
}

