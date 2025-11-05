/**
 * Rate Limiter específico para Groq API
 * Production Systems gratuitos (Developer Plan):
 * - 200K TPM (Tokens Per Minute)
 * - 200 RPM (Requests Per Minute)
 */

interface GroqRateLimit {
  tokens: { count: number; resetAt: number };
  requests: { count: number; resetAt: number };
}

// Armazenar contadores (em produção, usar Redis ou banco de dados)
const groqCounters: Map<string, GroqRateLimit> = new Map();

// Limites do Groq (Developer Plan - Production Systems gratuitos)
const GROQ_LIMITS = {
  tokensPerMinute: 200_000, // 200K TPM
  requestsPerMinute: 200, // 200 RPM
};

// Delay mínimo entre requisições (gordura de segurança)
// 200 RPM = 1 requisição a cada 300ms (60.000ms / 200 = 300ms)
// Usamos 350ms para ter margem de segurança (garante ~171 RPM, bem abaixo de 200)
const MIN_DELAY_BETWEEN_REQUESTS = 350; // milissegundos

// Armazenar último timestamp de requisição por API key
const lastRequestTime: Map<string, number> = new Map();

/**
 * Verifica se pode fazer requisição para Groq respeitando rate limits
 * Com delay mínimo entre requisições (gordura de segurança)
 */
export async function canMakeGroqRequest(apiKey: string): Promise<{
  allowed: boolean;
  retryAfter?: number; // segundos até poder fazer requisição
  reason?: string;
  delayNeeded?: number; // milissegundos de delay necessário
}> {
  const now = Date.now();
  const key = `groq-${apiKey.substring(0, 10)}`; // Usar parte da API key como identificador
  
  // Verificar delay mínimo desde última requisição (gordura de segurança)
  const lastRequest = lastRequestTime.get(key) || 0;
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < MIN_DELAY_BETWEEN_REQUESTS) {
    const delayNeeded = MIN_DELAY_BETWEEN_REQUESTS - timeSinceLastRequest;
    return {
      allowed: false,
      retryAfter: Math.ceil(delayNeeded / 1000),
      reason: `Delay mínimo entre requisições: aguarde ${delayNeeded}ms`,
      delayNeeded,
    };
  }
  
  const counters = groqCounters.get(key) || {
    tokens: { count: 0, resetAt: now + 60000 },
    requests: { count: 0, resetAt: now + 60000 },
  };

  // Resetar contadores se necessário (a cada minuto)
  if (now >= counters.requests.resetAt) {
    counters.requests = { count: 0, resetAt: now + 60000 };
    counters.tokens = { count: 0, resetAt: now + 60000 };
  }

  // Verificar limite de requests (usando 90% do limite para ter margem)
  const safeRequestLimit = Math.floor(GROQ_LIMITS.requestsPerMinute * 0.9); // 180 RPM (90% de 200)
  if (counters.requests.count >= safeRequestLimit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((counters.requests.resetAt - now) / 1000),
      reason: `Rate limit de requests próximo (90%): ${counters.requests.count}/${safeRequestLimit} RPM`,
    };
  }

  // Verificar limite de tokens ANTES da requisição (estimativa conservadora)
  // Estimativa: ~500 tokens por requisição (prompt + resposta média)
  // Usando 90% do limite para ter margem
  const safeTokenLimit = Math.floor(GROQ_LIMITS.tokensPerMinute * 0.9); // 180K TPM (90% de 200K)
  const estimatedTokens = 500;
  if ((counters.tokens.count + estimatedTokens) > safeTokenLimit) {
    return {
      allowed: false,
      retryAfter: Math.ceil((counters.tokens.resetAt - now) / 1000),
      reason: `Rate limit de tokens próximo (90%): ${counters.tokens.count}/${safeTokenLimit} TPM (estimativa excederia limite)`,
    };
  }

  groqCounters.set(key, counters);
  lastRequestTime.set(key, now); // Registrar timestamp atual

  return { allowed: true };
}

/**
 * Aguarda delay mínimo se necessário
 */
export async function waitForGroqDelay(apiKey: string): Promise<void> {
  const check = await canMakeGroqRequest(apiKey);
  if (!check.allowed && check.delayNeeded) {
    await new Promise(resolve => setTimeout(resolve, check.delayNeeded));
  }
}

/**
 * Registra uso de tokens após uma requisição
 */
export function recordGroqUsage(apiKey: string, tokensUsed: number) {
  const now = Date.now();
  const key = `groq-${apiKey.substring(0, 10)}`;
  
  const counters = groqCounters.get(key) || {
    tokens: { count: 0, resetAt: now + 60000 },
    requests: { count: 0, resetAt: now + 60000 },
  };

  // Resetar contadores se necessário
  if (now >= counters.tokens.resetAt) {
    counters.tokens = { count: 0, resetAt: now + 60000 };
    counters.requests = { count: 0, resetAt: now + 60000 };
  }

  // Incrementar contadores
  counters.tokens.count += tokensUsed;
  counters.requests.count += 1;

  groqCounters.set(key, counters);
  lastRequestTime.set(key, Date.now()); // Atualizar timestamp da última requisição

  // Verificar se excedeu limite de tokens
  if (counters.tokens.count >= GROQ_LIMITS.tokensPerMinute) {
    console.error(`❌ LIMITE DE TOKENS EXCEDIDO: ${counters.tokens.count}/${GROQ_LIMITS.tokensPerMinute} TPM`);
  } else if (counters.tokens.count >= GROQ_LIMITS.tokensPerMinute * 0.9) {
    console.warn(`⚠️ Limite de tokens do Groq próximo (90%): ${counters.tokens.count}/${GROQ_LIMITS.tokensPerMinute} TPM`);
  }

  if (counters.requests.count >= GROQ_LIMITS.requestsPerMinute) {
    console.error(`❌ LIMITE DE REQUESTS EXCEDIDO: ${counters.requests.count}/${GROQ_LIMITS.requestsPerMinute} RPM`);
  } else if (counters.requests.count >= GROQ_LIMITS.requestsPerMinute * 0.9) {
    console.warn(`⚠️ Limite de requests do Groq próximo (90%): ${counters.requests.count}/${GROQ_LIMITS.requestsPerMinute} RPM`);
  }
}

/**
 * Verifica se tem tokens disponíveis antes de fazer requisição
 */
export function hasAvailableTokens(apiKey: string, estimatedTokens: number): boolean {
  const now = Date.now();
  const key = `groq-${apiKey.substring(0, 10)}`;
  
  const counters = groqCounters.get(key) || {
    tokens: { count: 0, resetAt: now + 60000 },
    requests: { count: 0, resetAt: now + 60000 },
  };

  // Resetar contadores se necessário
  if (now >= counters.tokens.resetAt) {
    return true; // Resetou, tem tokens disponíveis
  }

  // Verificar se tem tokens suficientes
  return (counters.tokens.count + estimatedTokens) <= GROQ_LIMITS.tokensPerMinute;
}

/**
 * Obtém estatísticas de uso atual
 */
export function getGroqUsageStats(apiKey: string): {
  tokensUsed: number;
  tokensLimit: number;
  requestsUsed: number;
  requestsLimit: number;
  resetIn: number; // segundos
} {
  const now = Date.now();
  const key = `groq-${apiKey.substring(0, 10)}`;
  
  const counters = groqCounters.get(key) || {
    tokens: { count: 0, resetAt: now + 60000 },
    requests: { count: 0, resetAt: now + 60000 },
  };

  return {
    tokensUsed: counters.tokens.count,
    tokensLimit: GROQ_LIMITS.tokensPerMinute,
    requestsUsed: counters.requests.count,
    requestsLimit: GROQ_LIMITS.requestsPerMinute,
    resetIn: Math.max(0, Math.ceil((counters.tokens.resetAt - now) / 1000)),
  };
}

