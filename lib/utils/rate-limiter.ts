/**
 * Rate Limiter Melhorado
 * Suporta Redis (produção) ou memória (desenvolvimento)
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  identifier: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

// Cache em memória (fallback quando Redis não está disponível)
const memoryCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Limpa entradas expiradas do cache em memória
 */
function cleanupMemoryCache() {
  const now = Date.now();
  for (const [key, value] of memoryCache.entries()) {
    if (now > value.resetAt) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Verifica rate limit (com suporte a Redis opcional)
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { maxAttempts, windowMs, identifier } = config;
  const now = Date.now();

  // Limpar cache expirado periodicamente
  if (Math.random() < 0.1) { // 10% das vezes
    cleanupMemoryCache();
  }

  // Tentar usar Redis se disponível (produção)
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl && process.env.NODE_ENV === 'production') {
    try {
      // TODO: Implementar com Redis quando necessário
      // Por enquanto, usar memória mesmo em produção
      // Em produção real, usar: @upstash/redis ou similar
    } catch (error) {
      // Fallback para memória se Redis falhar
    }
  }

  // Usar cache em memória (desenvolvimento ou fallback)
  const cached = memoryCache.get(identifier);
  
  if (!cached || now > cached.resetAt) {
    // Nova janela de tempo
    const resetAt = now + windowMs;
    memoryCache.set(identifier, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt,
    };
  }

  if (cached.count >= maxAttempts) {
    // Rate limit excedido
    const retryAfter = Math.ceil((cached.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: cached.resetAt,
      retryAfter,
    };
  }

  // Incrementar contador
  cached.count++;
  memoryCache.set(identifier, cached);

  return {
    allowed: true,
    remaining: maxAttempts - cached.count,
    resetAt: cached.resetAt,
  };
}

/**
 * Helper para rate limit de login
 */
export async function checkLoginRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    identifier,
  });
}

/**
 * Helper para rate limit de signup
 */
export async function checkSignupRateLimit(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit({
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
    identifier,
  });
}

/**
 * Helper para rate limit de API geral
 */
export async function checkAPIRateLimit(identifier: string, maxAttempts: number = 100, windowMs: number = 60000): Promise<RateLimitResult> {
  return checkRateLimit({
    maxAttempts,
    windowMs,
    identifier,
  });
}

