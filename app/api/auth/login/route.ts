import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { verifyPassword } from '@/lib/utils/password';
import { createSessionData, SESSION_DURATION_MS } from '@/lib/utils/auth';
import { logger, getRequestContext, logSupabaseError } from '@/lib/utils/logger';
import { isValidEmail } from '@/lib/utils/validation';
import { validateRequestSize, addSecurityHeaders } from '@/lib/utils/security';

import { checkLoginRateLimit } from '@/lib/utils/rate-limiter';

export async function POST(request: NextRequest) {
  const requestContext = getRequestContext(request);
  
  try {
    // Validar tamanho da requisição
    const contentLength = request.headers.get('content-length');
    const sizeValidation = validateRequestSize(contentLength, 1); // Máximo 1MB
    if (!sizeValidation.valid) {
      logger.warn('[Auth] Requisição muito grande', { error: sizeValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: sizeValidation.error },
        { status: 413 }
      );
      return addSecurityHeaders(response);
    }

    const { email, password } = await request.json();

    logger.info('[Auth] Tentativa de login iniciada', { email: email?.toLowerCase() }, requestContext);

    // Validação básica
    if (!email || !password) {
      logger.warn('[Auth] Login falhou: campos obrigatórios ausentes', { hasEmail: !!email, hasPassword: !!password }, requestContext);
      const response = NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      logger.warn('[Auth] Login falhou: email inválido', { email }, requestContext);
      const response = NextResponse.json(
        { error: 'Email ou senha incorretos' }, // Não revelar que é o email
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // Rate limiting por IP e email
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const identifier = `${ip}:${email}`;

    const rateLimitResult = await checkLoginRateLimit(identifier);
    if (!rateLimitResult.allowed) {
      logger.warn('[Auth] Login bloqueado: rate limit excedido', { 
        identifier, 
        ip,
        retryAfter: rateLimitResult.retryAfter,
        resetAt: new Date(rateLimitResult.resetAt).toISOString(),
      }, requestContext);
      const response = NextResponse.json(
        { 
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 900),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
      return addSecurityHeaders(response);
    }

    // Buscar usuário no Supabase (usando admin para bypass RLS na Opção 1)
    const emailLower = email.toLowerCase().trim();
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, account_id, name, email, role, status, password_hash')
      .eq('email', emailLower)
      .eq('status', 'active')
      .single();

    if (userError || !user) {
      // Não revelar se o usuário existe ou não (segurança)
      if (userError) {
        logSupabaseError('buscar usuário no login', userError, { email: emailLower }, requestContext);
      } else {
        logger.warn('[Auth] Login falhou: usuário não encontrado ou inativo', { email: emailLower }, requestContext);
      }
      const errorResponse = NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Verificar senha
    if (!user.password_hash) {
      logger.warn('[Auth] Login falhou: usuário sem senha hash', { userId: user.id, email: emailLower }, requestContext);
      const errorResponse = NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }

    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      logger.warn('[Auth] Login falhou: senha inválida', { userId: user.id, email: emailLower }, requestContext);
      const errorResponse = NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Buscar dados da conta (usando admin para bypass RLS)
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('id, company_name')
      .eq('id', user.account_id)
      .single();

    if (accountError) {
      logSupabaseError('buscar conta no login', accountError, { accountId: user.account_id, userId: user.id }, requestContext);
    }

    // Preparar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountId: user.account_id,
      companyName: account?.company_name || null,
    };

    // Criar dados de sessão com expiração (12 horas)
    const sessionData = createSessionData(userData);

    logger.info('[Auth] Login bem-sucedido', {
      userId: user.id,
      accountId: user.account_id,
      email: emailLower,
      role: user.role,
    }, { ...requestContext, userId: user.id, accountId: user.account_id });

    // Criar resposta com cookie httpOnly
    const response = NextResponse.json({
      success: true,
      user: userData,
    });

    // Definir cookie httpOnly (seguro, não acessível via JavaScript)
    // maxAge em segundos (12 horas = 43200 segundos)
    const maxAgeSeconds = Math.floor(SESSION_DURATION_MS / 1000);
    response.cookies.set('user', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Funciona para mesma origem (mesma porta)
      maxAge: maxAgeSeconds, // 12 horas
      path: '/',
    });

    // Adicionar headers de segurança
    addSecurityHeaders(response);

    return response;
  } catch (error) {
    logger.error('[Auth] Erro inesperado no login', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}

