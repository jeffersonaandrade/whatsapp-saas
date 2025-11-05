/**
 * Lógica do Bot - Fixa no código (V1)
 * O cliente não pode criar fluxos visuais, apenas configurar mensagens básicas
 */

export interface BotConfig {
  welcomeMessage?: string; // Opcional - se não preenchido, IA gera automaticamente
  defaultMessage?: string; // Opcional - se não preenchido, IA gera automaticamente
  transferKeywords: string[]; // Palavras-chave que fazem o bot transferir para humano
  transferMessage?: string; // Opcional - se não preenchido, usa mensagem padrão
  botPersonality?: string; // Personalidade do bot (ex: "despojado", "totalmente social", "profissional", "amigável")
}

// Configuração padrão do bot
export const defaultBotConfig: BotConfig = {
  welcomeMessage: undefined, // Deixa IA gerar automaticamente
  defaultMessage: undefined, // Deixa IA gerar automaticamente
  transferKeywords: ['atendente', 'atendimento humano', 'falar com alguém', 'humano', 'pessoa'],
  transferMessage: undefined, // Deixa IA gerar automaticamente
  botPersonality: undefined, // Deixa IA usar comportamento padrão
};

/**
 * Processa uma mensagem recebida e decide o que responder
 * Esta é a lógica fixa do bot (sem fluxo visual)
 */
export function processBotMessage(
  messageText: string,
  messageCount: number,
  config: BotConfig = defaultBotConfig
): {
  action: 'respond' | 'transfer';
  response?: string;
  reason?: string;
} {
  const text = messageText.toLowerCase().trim();

  // 1. Verificar se é a primeira mensagem (enviar boas-vindas)
  if (messageCount === 1) {
    return {
      action: 'respond',
      response: config.welcomeMessage,
    };
  }

  // 2. Verificar palavras-chave de transferência
  const hasTransferKeyword = config.transferKeywords.some(keyword =>
    text.includes(keyword.toLowerCase())
  );

  if (hasTransferKeyword) {
    return {
      action: 'transfer',
      response: config.transferMessage || '🤖 Transferindo para um atendente humano... Aguarde um momento.',
      reason: `Cliente solicitou atendimento humano (palavra-chave: ${config.transferKeywords.find(k => text.includes(k.toLowerCase()))})`,
    };
  }

  // 3. Resposta padrão para outras mensagens (se configurada, senão IA gera)
  return {
    action: 'respond',
    response: config.defaultMessage, // Pode ser undefined - IA gera automaticamente
  };
}

/**
 * Verifica se a mensagem deve ser transferida para humano
 */
export function shouldTransferToHuman(
  messageText: string,
  messageCount: number,
  config: BotConfig = defaultBotConfig
): boolean {
  const result = processBotMessage(messageText, messageCount, config);
  return result.action === 'transfer';
}

