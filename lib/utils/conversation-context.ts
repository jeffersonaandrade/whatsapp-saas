/**
 * Utilitários para gerenciar contexto de conversas
 * - Limpar contexto após fechamento da loja
 * - Verificar se a loja está aberta
 */

export interface BusinessHours {
  openingHours?: string; // Ex: "18h às 23h (seg-sáb)"
  timezone?: string; // Ex: "America/Sao_Paulo"
}

/**
 * Verifica se a loja está aberta baseado no horário de funcionamento
 * TODO: Implementar parsing completo do horário de funcionamento
 * Por enquanto, retorna sempre true (mockado)
 */
export function isBusinessOpen(openingHours?: string): boolean {
  if (!openingHours) {
    // Se não tem horário configurado, assume que está sempre aberto
    return true;
  }

  // TODO: Implementar parsing do horário de funcionamento
  // Exemplo: "18h às 23h (seg-sáb)" -> verificar dia da semana e hora atual
  
  // Por enquanto, retorna true (mockado)
  // Quando implementar, verificar:
  // 1. Dia da semana atual
  // 2. Hora atual
  // 3. Comparar com horário de funcionamento
  
  return true;
}

/**
 * Verifica se o contexto da conversa deve ser limpo
 * - Limpa contexto se a loja fechou desde a última mensagem
 * - Limpa contexto se passou mais de 24h desde a última mensagem
 */
export function shouldClearContext(
  lastMessageAt: string,
  openingHours?: string
): boolean {
  const lastMessageDate = new Date(lastMessageAt);
  const now = new Date();
  
  // Se passou mais de 24h desde a última mensagem, limpar contexto
  const hoursSinceLastMessage = (now.getTime() - lastMessageDate.getTime()) / (1000 * 60 * 60);
  if (hoursSinceLastMessage > 24) {
    return true;
  }

  // Verificar se a loja fechou desde a última mensagem
  // TODO: Implementar verificação completa
  // Por enquanto, sempre retorna false (mockado)
  
  return false;
}

/**
 * Filtra histórico de mensagens para remover contexto antigo
 * - Remove mensagens antes do último fechamento da loja
 * - Mantém apenas mensagens da sessão atual (últimas 24h)
 */
export function filterRecentMessages<T extends { timestamp: string }>(
  messages: T[],
  openingHours?: string
): T[] {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Filtrar mensagens das últimas 24h
  const recentMessages = messages.filter(msg => {
    const messageDate = new Date(msg.timestamp);
    return messageDate >= oneDayAgo;
  });

  // TODO: Implementar filtro mais inteligente baseado no horário de funcionamento
  // Exemplo: Se a loja fecha às 23h e abre às 18h, remover mensagens entre 23h e 18h

  return recentMessages;
}

/**
 * Limpa contexto da conversa após fechamento da loja
 * - Remove mensagens antigas
 * - Retorna mensagem de boas-vindas se necessário
 */
export function clearContextAfterClosing(
  messages: Array<{ timestamp: string; body: string }>,
  openingHours?: string,
  welcomeMessage?: string
): {
  shouldClear: boolean;
  clearedMessages: Array<{ timestamp: string; body: string }>;
  welcomeBackMessage?: string;
} {
  const shouldClear = shouldClearContext(
    messages[messages.length - 1]?.timestamp || new Date().toISOString(),
    openingHours
  );

  if (!shouldClear) {
    return {
      shouldClear: false,
      clearedMessages: messages,
    };
  }

  // Limpar mensagens antigas
  const clearedMessages = filterRecentMessages(messages, openingHours);

  // Se limpou todas as mensagens ou não há mensagens recentes, enviar boas-vindas
  const welcomeBackMessage = clearedMessages.length === 0 && welcomeMessage
    ? welcomeMessage
    : undefined;

  return {
    shouldClear: true,
    clearedMessages,
    welcomeBackMessage,
  };
}

