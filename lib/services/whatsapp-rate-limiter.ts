/**
 * Rate Limiter para respeitar limites do WhatsApp
 * Evita spam e bloqueios
 */

interface RateLimitConfig {
  maxMessagesPerMinute: number;
  maxMessagesPerHour: number;
  maxMessagesPerDay: number;
}

const defaultConfig: RateLimitConfig = {
  maxMessagesPerMinute: 20, // WhatsApp permite ~20 mensagens/minuto
  maxMessagesPerHour: 1000, // Limite por hora
  maxMessagesPerDay: 10000, // Limite por dia
};

// Armazenar contadores (em produção, usar Redis ou banco de dados)
const messageCounters: Map<string, {
  minute: { count: number; resetAt: number };
  hour: { count: number; resetAt: number };
  day: { count: number; resetAt: number };
}> = new Map();

/**
 * Verifica se pode enviar mensagem respeitando rate limits
 */
export function canSendMessage(
  instanceName: string,
  config: RateLimitConfig = defaultConfig
): {
  allowed: boolean;
  retryAfter?: number; // segundos até poder enviar
} {
  const now = Date.now();
  const counters = messageCounters.get(instanceName) || {
    minute: { count: 0, resetAt: now + 60000 },
    hour: { count: 0, resetAt: now + 3600000 },
    day: { count: 0, resetAt: now + 86400000 },
  };

  // Resetar contadores se necessário
  if (now >= counters.minute.resetAt) {
    counters.minute = { count: 0, resetAt: now + 60000 };
  }
  if (now >= counters.hour.resetAt) {
    counters.hour = { count: 0, resetAt: now + 3600000 };
  }
  if (now >= counters.day.resetAt) {
    counters.day = { count: 0, resetAt: now + 86400000 };
  }

  // Verificar limites
  if (counters.minute.count >= config.maxMessagesPerMinute) {
    return {
      allowed: false,
      retryAfter: Math.ceil((counters.minute.resetAt - now) / 1000),
    };
  }

  if (counters.hour.count >= config.maxMessagesPerHour) {
    return {
      allowed: false,
      retryAfter: Math.ceil((counters.hour.resetAt - now) / 1000),
    };
  }

  if (counters.day.count >= config.maxMessagesPerDay) {
    return {
      allowed: false,
      retryAfter: Math.ceil((counters.day.resetAt - now) / 1000),
    };
  }

  // Incrementar contadores
  counters.minute.count++;
  counters.hour.count++;
  counters.day.count++;
  messageCounters.set(instanceName, counters);

  return { allowed: true };
}

/**
 * Registra que uma mensagem foi enviada
 */
export function recordMessageSent(instanceName: string) {
  const now = Date.now();
  const counters = messageCounters.get(instanceName) || {
    minute: { count: 0, resetAt: now + 60000 },
    hour: { count: 0, resetAt: now + 3600000 },
    day: { count: 0, resetAt: now + 86400000 },
  };

  // Resetar contadores se necessário
  if (now >= counters.minute.resetAt) {
    counters.minute = { count: 0, resetAt: now + 60000 };
  }
  if (now >= counters.hour.resetAt) {
    counters.hour = { count: 0, resetAt: now + 3600000 };
  }
  if (now >= counters.day.resetAt) {
    counters.day = { count: 0, resetAt: now + 86400000 };
  }

  counters.minute.count++;
  counters.hour.count++;
  counters.day.count++;
  messageCounters.set(instanceName, counters);
}

