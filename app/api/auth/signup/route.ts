import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hashPassword } from '@/lib/utils/password';
import { createSessionData, SESSION_DURATION_MS } from '@/lib/utils/auth';
import { logger, getRequestContext, logSupabaseError } from '@/lib/utils/logger';
import { isValidEmail, isValidPassword, sanitizeName, validateStringLength } from '@/lib/utils/validation';
import { validateRequestSize, addSecurityHeaders } from '@/lib/utils/security';

import { checkSignupRateLimit } from '@/lib/utils/rate-limiter';

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

    const body = await request.json();
    const { name, email, password, companyName } = body;

    logger.info('[Auth] Tentativa de cadastro iniciada', { email: email?.toLowerCase() }, requestContext);

    // Validação básica
    if (!name || !email || !password || !companyName) {
      logger.warn('[Auth] Cadastro falhou: campos obrigatórios ausentes', {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasCompanyName: !!companyName,
      }, requestContext);
      const response = NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar e sanitizar email
    if (!isValidEmail(email)) {
      logger.warn('[Auth] Cadastro falhou: email inválido', { email }, requestContext);
      const response = NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar senha
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      logger.warn('[Auth] Cadastro falhou: senha inválida', { error: passwordValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar e sanitizar nome
    const nameValidation = validateStringLength(name, 2, 100);
    if (!nameValidation.valid) {
      logger.warn('[Auth] Cadastro falhou: nome inválido', { error: nameValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validar nome da empresa
    const companyValidation = validateStringLength(companyName, 2, 200);
    if (!companyValidation.valid) {
      logger.warn('[Auth] Cadastro falhou: nome da empresa inválido', { error: companyValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: companyValidation.error },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Sanitizar inputs
    const sanitizedName = sanitizeName(name);
    const emailLower = email.toLowerCase().trim();
    const sanitizedCompanyName = sanitizeName(companyName, 200);

    // Rate limiting por IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkSignupRateLimit(ip);
    if (!rateLimitResult.allowed) {
      logger.warn('[Auth] Cadastro bloqueado: rate limit excedido', { 
        ip,
        retryAfter: rateLimitResult.retryAfter,
        resetAt: new Date(rateLimitResult.resetAt).toISOString(),
      }, requestContext);
      const response = NextResponse.json(
        { 
          error: 'Muitas tentativas de cadastro. Tente novamente em 1 hora.',
          retryAfter: rateLimitResult.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 3600),
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
          },
        }
      );
      return addSecurityHeaders(response);
    }

    // Verificar se o email já existe (usando admin para bypass RLS)
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', emailLower)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      logSupabaseError('verificar usuário existente no cadastro', existingUserError, { email: emailLower }, requestContext);
    }

    if (existingUser) {
      logger.warn('[Auth] Cadastro falhou: email já cadastrado como usuário', { email: emailLower }, requestContext);
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Verificar se já existe uma conta com este email
    const { data: existingAccount, error: existingAccountError } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('owner_email', emailLower)
      .single();

    if (existingAccountError && existingAccountError.code !== 'PGRST116') {
      logSupabaseError('verificar conta existente no cadastro', existingAccountError, { email: emailLower }, requestContext);
    }

    if (existingAccount) {
      logger.warn('[Auth] Cadastro falhou: conta já existe com este email', { email: emailLower }, requestContext);
      return NextResponse.json(
        { error: 'Já existe uma conta com este email' },
        { status: 409 }
      );
    }

    // 1. Criar a conta (account) - usando admin para bypass RLS
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .insert({
        owner_email: emailLower,
        company_name: sanitizedCompanyName,
      })
      .select()
      .single();

    if (accountError || !account) {
      logSupabaseError('criar conta no cadastro', accountError, { email: emailLower, companyName: sanitizedCompanyName }, requestContext);
      const response = NextResponse.json(
        { error: 'Erro ao criar conta. Tente novamente.' },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }

    // 2. Hashear a senha
    const passwordHash = await hashPassword(password);

    // 3. Criar o primeiro usuário (admin) na tabela users
    // Nota: Geramos um UUID temporário. Quando migrar para Supabase Auth,
    // este id será substituído pelo id do auth.users
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: randomUUID(), // UUID temporário (Opção 1)
        account_id: account.id,
        name: sanitizedName,
        email: emailLower,
        role: 'admin', // Primeiro usuário sempre é admin
        status: 'active',
        password_hash: passwordHash, // Senha hasheada
      })
      .select()
      .single();

    if (userError || !user) {
      logSupabaseError('criar usuário no cadastro', userError, { accountId: account.id, email: emailLower }, requestContext);
      
      // Se falhar ao criar usuário, tentar remover a conta criada
      logger.warn('[Auth] Tentando remover conta criada após falha ao criar usuário', { accountId: account.id }, requestContext);
      const { error: deleteError } = await supabaseAdmin.from('accounts').delete().eq('id', account.id);
      
      if (deleteError) {
        logger.error('[Auth] Erro ao remover conta após falha no cadastro', deleteError, { accountId: account.id }, requestContext);
      }
      
      const errorResponse = NextResponse.json(
        { error: 'Erro ao criar usuário. Tente novamente.' },
        { status: 500 }
      );
      return addSecurityHeaders(errorResponse);
    }

    // Preparar dados do usuário (sem senha)
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accountId: user.account_id,
      companyName: account.company_name,
    };

    // Criar dados de sessão com expiração (12 horas)
    const sessionData = createSessionData(userData);

    // Criar resposta com cookie httpOnly
    let response = NextResponse.json({
      success: true,
      user: userData,
    }, { status: 201 });

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

    logger.info('[Auth] Cadastro bem-sucedido', {
      userId: user.id,
      accountId: account.id,
      email: emailLower,
      companyName: sanitizedCompanyName,
    }, { ...requestContext, userId: user.id, accountId: account.id });

    // Adicionar headers de segurança
    addSecurityHeaders(response);

    return response;
  } catch (error) {
    logger.error('[Auth] Erro inesperado no cadastro', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
    return addSecurityHeaders(errorResponse);
  }
}

