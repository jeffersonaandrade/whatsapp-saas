/**
 * Serviço de IA usando Groq (gratuito - Production Systems)
 * Detecta intenção do cliente: compra vs. prospecção
 * 
 * Modelos gratuitos (Developer Plan):
 * - groq/compound (Production System)
 * - groq/compound-mini (Production System)
 * 
 * Rate Limits:
 * - 200K TPM (Tokens Per Minute)
 * - 200 RPM (Requests Per Minute)
 */

import { canMakeGroqRequest, recordGroqUsage } from './groq-rate-limiter';

export interface GroqConfig {
  apiKey: string;
  model?: string; // Modelo a usar (recomendado: 'groq/compound' ou 'groq/compound-mini' para Production Systems gratuitos)
}

export type CustomerIntention = 'purchase' | 'prospect' | 'other';

export interface IntentionAnalysis {
  intention: CustomerIntention;
  confidence: number; // 0-1
  reason: string;
  shouldTransfer: boolean;
}

/**
 * Analisa a intenção do cliente usando Groq AI
 */
export async function analyzeIntention(
  messageText: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  config: GroqConfig
): Promise<IntentionAnalysis> {
  try {
    // Verificar rate limit antes de fazer requisição (com delay mínimo)
    const rateLimitCheck = await canMakeGroqRequest(config.apiKey);
    
    if (!rateLimitCheck.allowed) {
      // Se precisa de delay, aguardar
      if (rateLimitCheck.delayNeeded) {
        await new Promise(resolve => setTimeout(resolve, rateLimitCheck.delayNeeded));
        // Verificar novamente após delay
        const retryCheck = await canMakeGroqRequest(config.apiKey);
        if (!retryCheck.allowed) {
          console.warn(`Groq rate limit excedido após delay: ${retryCheck.reason}`);
          return fallbackIntentionAnalysis(messageText);
        }
      } else {
        console.warn(`Groq rate limit excedido: ${rateLimitCheck.reason}. Retry após ${rateLimitCheck.retryAfter}s`);
        // Fallback: análise simples
        return fallbackIntentionAnalysis(messageText);
      }
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'groq/compound', // Production System gratuito (alternativa: 'groq/compound-mini')
        messages: [
          {
            role: 'system',
            content: `Você é um assistente especializado em analisar a intenção de clientes em conversas de WhatsApp.

Analise a mensagem do cliente e determine:
1. Se o cliente quer COMPRAR/FECHAR NEGÓCIO (intention: "purchase")
2. Se o cliente está apenas PROSPECTANDO/BUSCANDO INFORMAÇÕES (intention: "prospect")
3. Outras situações (intention: "other")

Responda APENAS em JSON no formato:
{
  "intention": "purchase" | "prospect" | "other",
  "confidence": 0.0-1.0,
  "reason": "explicação breve",
  "shouldTransfer": true/false
}

Regras:
- Se cliente quer comprar/fechar negócio → shouldTransfer: true
- Se está apenas prospectando → shouldTransfer: false
- Seja conservador: só transfira se houver sinais claros de compra`,
          },
          ...conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: messageText,
          },
        ],
        temperature: 0.3, // Mais determinístico
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Groq API');
    }

    // Registrar uso de tokens
    const tokensUsed = data.usage?.total_tokens || 0;
    recordGroqUsage(config.apiKey, tokensUsed);

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Resposta da Groq não está em JSON válido');
    }

    const analysis = JSON.parse(jsonMatch[0]) as IntentionAnalysis;

    return analysis;
  } catch (error) {
    console.error('Erro ao analisar intenção com Groq:', error);
    
    // Fallback: análise simples baseada em palavras-chave
    return fallbackIntentionAnalysis(messageText);
  }
}

/**
 * Gera resposta do bot usando Groq AI
 */
export async function generateBotResponse(
  messageText: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  config: GroqConfig,
  context?: {
    welcomeMessage?: string;
    defaultMessage?: string;
    companyName?: string;
    businessType?: string;
    businessDescription?: string;
    openingHours?: string;
    address?: string;
    phone?: string;
    deliveryAvailable?: boolean;
    deliveryFee?: number;
    products?: string; // Lista formatada de produtos
    botPersonality?: string; // Personalidade do bot (ex: "despojado", "totalmente social")
  }
): Promise<string> {
  try {
    // Verificar rate limit antes de fazer requisição (com delay mínimo)
    const rateLimitCheck = await canMakeGroqRequest(config.apiKey);
    
    if (!rateLimitCheck.allowed) {
      // Se precisa de delay, aguardar
      if (rateLimitCheck.delayNeeded) {
        await new Promise(resolve => setTimeout(resolve, rateLimitCheck.delayNeeded));
        // Verificar novamente após delay
        const retryCheck = await canMakeGroqRequest(config.apiKey);
        if (!retryCheck.allowed) {
          console.warn(`Groq rate limit excedido após delay: ${retryCheck.reason}`);
          return 'Obrigado por sua mensagem. Nossa equipe entrará em contato em breve.';
        }
      } else {
        console.warn(`Groq rate limit excedido: ${rateLimitCheck.reason}. Retry após ${rateLimitCheck.retryAfter}s`);
        // Fallback: resposta padrão
        return 'Obrigado por sua mensagem. Nossa equipe entrará em contato em breve.';
      }
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model || 'groq/compound', // Production System gratuito (alternativa: 'groq/compound-mini')
        messages: [
          {
            role: 'system',
            content: `Você é um assistente virtual de atendimento ao cliente via WhatsApp.

${context?.companyName ? `Empresa: ${context.companyName}` : ''}
${context?.businessType ? `Tipo de negócio: ${context.businessType}` : ''}
${context?.businessDescription ? `Descrição: ${context.businessDescription}` : ''}
${context?.openingHours ? `Horário de funcionamento: ${context.openingHours}` : ''}
${context?.address ? `Endereço: ${context.address}` : ''}
${context?.phone ? `Telefone: ${context.phone}` : ''}
${context?.deliveryAvailable ? `Fazemos entregas: ${context.deliveryAvailable ? 'Sim' : 'Não'}` : ''}
${context?.deliveryFee ? `Taxa de entrega: R$ ${context.deliveryFee.toFixed(2)}` : ''}

${context?.products ? `\n${context.products}\n` : ''}

${context?.botPersonality ? `Personalidade do bot: ${context.botPersonality}\n` : ''}

Instruções:
${context?.botPersonality 
  ? `- Siga a personalidade definida: ${context.botPersonality}
- Seja ${context.botPersonality} em suas respostas`
  : '- Seja amigável, profissional e conciso'
}
- Responda em português brasileiro
- Se não souber algo, seja honesto
- Cada resposta deve ter no máximo 3 frases curtas (≈120 palavras)
- Se o cliente perguntar sobre produtos ou preços, use as informações de produtos acima
- Se o cliente perguntar sobre horário, endereço ou entrega, use as informações acima
- Se o cliente quiser comprar, informe que um atendente humano irá ajudar
- Se estiver apenas prospectando, forneça informações úteis sobre produtos`,
          },
          ...conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          {
            role: 'user',
            content: messageText,
          },
        ],
        temperature: 0.7,
        max_tokens: 150, // Limitar geração para economizar tokens (aprox. 100-120 palavras)
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from Groq API');
    }

    // Registrar uso de tokens
    const tokensUsed = data.usage?.total_tokens || 0;
    recordGroqUsage(config.apiKey, tokensUsed);

    return content.trim();
  } catch (error) {
    console.error('Erro ao gerar resposta com Groq:', error);
    
    // Fallback: resposta padrão
    return 'Obrigado por sua mensagem. Nossa equipe entrará em contato em breve.';
  }
}

/**
 * Análise de intenção simples (fallback quando Groq falhar)
 */
function fallbackIntentionAnalysis(messageText: string): IntentionAnalysis {
  const text = messageText.toLowerCase();

  // Palavras-chave de compra
  const purchaseKeywords = [
    'comprar', 'quero comprar', 'quero fechar', 'fazer pedido', 'realizar compra',
    'quanto custa', 'preço', 'valor', 'pagamento', 'cartão', 'pix', 'boleto',
    'finalizar', 'confirmar', 'aceito', 'vou comprar', 'fechar negócio'
  ];

  // Palavras-chave de prospecção
  const prospectKeywords = [
    'informação', 'informações', 'saber mais', 'conhecer', 'detalhes',
    'como funciona', 'o que é', 'explicar', 'entender', 'dúvida',
    'pergunta', 'curioso', 'interessado', 'pesquisando'
  ];

  const hasPurchaseIntent = purchaseKeywords.some(keyword => text.includes(keyword));
  const hasProspectIntent = prospectKeywords.some(keyword => text.includes(keyword));

  if (hasPurchaseIntent && !hasProspectIntent) {
    return {
      intention: 'purchase',
      confidence: 0.7,
      reason: 'Detectado interesse em compra',
      shouldTransfer: true,
    };
  }

  if (hasProspectIntent) {
    return {
      intention: 'prospect',
      confidence: 0.6,
      reason: 'Cliente está prospectando',
      shouldTransfer: false,
    };
  }

  return {
    intention: 'other',
    confidence: 0.5,
    reason: 'Não foi possível determinar intenção clara',
    shouldTransfer: false,
  };
}

