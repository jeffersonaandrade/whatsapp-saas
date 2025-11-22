import { NextRequest, NextResponse } from 'next/server';
import { motorClientAPI } from '@/lib/motor-client';
import { mockDataService } from '@/lib/services/mock-data';
import { analyzeIntention, generateBotResponse, GroqConfig } from '@/lib/services/groq-ai';
import { canSendMessage, recordMessageSent } from '@/lib/services/whatsapp-rate-limiter';
import { productsService, formatProductsForAI, findProductByName } from '@/lib/services/products';
import { businessConfigService } from '@/lib/services/business-config';
import { clearContextAfterClosing } from '@/lib/utils/conversation-context';
import { defaultBotConfig } from '@/lib/services/bot-logic';
import { logger, getRequestContext } from '@/lib/utils/logger';
import { validateWebhookOrigin, validateRequestSize, addSecurityHeaders } from '@/lib/utils/security';
import { sanitizeMessage, isValidInstanceName, validatePayloadSize } from '@/lib/utils/validation';

/**
 * Webhook que recebe eventos da Evolution API
 * Este é o "backend serverless" - a lógica do bot roda aqui
 * 
 * Eventos que recebemos:
 * - messages.upsert: quando uma nova mensagem chega
 * - connection.update: quando o status da conexão muda
 * - qrcode.update: quando o QR Code é atualizado
 */
export async function POST(request: NextRequest) {
  const requestContext = getRequestContext(request);
  
  try {
    // Validar origem do webhook (segurança)
    const originValidation = validateWebhookOrigin(request);
    if (!originValidation.valid) {
      logger.warn('[Webhook] Origem não autorizada', { error: originValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
      addSecurityHeaders(response);
      return response;
    }

    // Validar tamanho da requisição
    const contentLength = request.headers.get('content-length');
    const sizeValidation = validateRequestSize(contentLength, 5); // Máximo 5MB para webhook
    if (!sizeValidation.valid) {
      logger.warn('[Webhook] Requisição muito grande', { error: sizeValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: sizeValidation.error },
        { status: 413 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const body = await request.json();
    
    // Validar tamanho do payload
    const payloadValidation = validatePayloadSize(body, 5000); // 5MB
    if (!payloadValidation.valid) {
      logger.warn('[Webhook] Payload muito grande', { error: payloadValidation.error }, requestContext);
      const response = NextResponse.json(
        { error: payloadValidation.error },
        { status: 413 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const { event, data } = body;

    logger.info('[Webhook] Evento recebido', {
      event,
      hasData: !!data,
      instanceName: data?.instanceName,
      messageCount: data?.messages?.length,
    }, requestContext);

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'messages.upsert':
        return await handleNewMessage(data, requestContext);
      
      case 'connection.update':
        return await handleConnectionUpdate(data, requestContext);
      
      case 'qrcode.update':
        return await handleQRCodeUpdate(data, requestContext);
      
      default:
        logger.warn('[Webhook] Evento não tratado', { event }, requestContext);
        const response = NextResponse.json({ success: true, message: 'Evento recebido' });
        addSecurityHeaders(response);
      return response;
    }
  } catch (error) {
    logger.error('[Webhook] Erro ao processar webhook', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
    addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}

/**
 * Processa uma nova mensagem recebida
 * Esta é a lógica principal do bot
 */
async function handleNewMessage(data: any, requestContext: any) {
  try {
    const { instanceName, messages } = data;

    if (!instanceName) {
      logger.error('[Webhook] handleNewMessage: instanceName ausente', undefined, { data }, requestContext);
      const response = NextResponse.json({ success: false, error: 'instanceName é obrigatório' }, { status: 400 });
      addSecurityHeaders(response);
      return response;
    }

    // Validar formato do instanceName
    if (!isValidInstanceName(instanceName)) {
      logger.error('[Webhook] handleNewMessage: instanceName inválido', { instanceName }, requestContext);
      const response = NextResponse.json({ success: false, error: 'instanceName inválido' }, { status: 400 });
      addSecurityHeaders(response);
      return response;
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      logger.warn('[Webhook] handleNewMessage: nenhuma mensagem no array', { instanceName }, requestContext);
      const response = NextResponse.json({ success: true, message: 'Nenhuma mensagem para processar' });
      addSecurityHeaders(response);
      return response;
    }

    logger.info('[Webhook] Processando mensagens', {
      instanceName,
      messageCount: messages.length,
    }, requestContext);

    // Processar cada mensagem recebida
    for (const message of messages) {
      // Ignorar mensagens enviadas por nós mesmos
      if (message.key.fromMe) {
        continue;
      }

      const contactPhone = message.key.remoteJid?.replace('@s.whatsapp.net', '') || '';
      const rawMessageText = message.message?.conversation ||
                         message.message?.extendedTextMessage?.text ||
                         '';

      if (!contactPhone) {
        continue;
      }

      // Buscar ou criar conversa
      const conversation = await mockDataService.createOrUpdateConversation(
        '1', // instanceId mockado
        contactPhone,
        message.pushName || undefined
      );

      // Sanitizar mensagem recebida (proteção XSS)
      const sanitizedIncomingMessage = sanitizeMessage(rawMessageText.trim());
      const incomingBody = sanitizedIncomingMessage || '[mensagem não textual]';

      // Salvar mensagem recebida
      await mockDataService.addMessage({
        conversationId: conversation.id,
        fromMe: false,
        body: incomingBody,
        status: 'read',
        sentBy: 'customer',
      });

      if (!sanitizedIncomingMessage) {
        const textOnlyNotice = 'No momento só consigo responder mensagens de texto. Envie sua pergunta por escrito.';

        await mockDataService.addMessage({
          conversationId: conversation.id,
          fromMe: true,
          body: textOnlyNotice,
          status: 'sent',
          sentBy: 'bot',
        });

        await sendMessage(instanceName, contactPhone, textOnlyNotice);
        recordMessageSent(instanceName);
        continue;
      }

      const messageText = sanitizedIncomingMessage;

      // Verificar se a conversa está sendo atendida por um humano
      // Se sim, NÃO chamar IA (economiza rate limits)
      if (conversation.status === 'in_service' || conversation.status === 'waiting_agent') {
        logger.info('[Webhook] Conversa com atendente humano, pulando IA', {
          conversationId: conversation.id,
          status: conversation.status,
          contactPhone,
        }, requestContext);
        // Não processar pelo bot, está com atendente humano
        // Apenas salvar a mensagem recebida, sem processar
        continue;
      }

      // Buscar histórico de mensagens
      const messages = await mockDataService.getMessages(conversation.id);
      const messageCount = messages.filter(m => !m.fromMe).length;

      // Verificar rate limit antes de enviar qualquer mensagem
      const rateLimitCheck = canSendMessage(instanceName);
      if (!rateLimitCheck.allowed) {
        logger.warn('[Webhook] Rate limit excedido', {
          instanceName,
          retryAfter: rateLimitCheck.retryAfter,
          contactPhone,
        }, requestContext);
        // Salvar mensagem para processar depois
        // TODO: Implementar fila de mensagens
        continue;
      }

      // TODO: Buscar accountId via instanceName no Supabase
      // 1. Buscar instance pelo name:
      //    const { data: instance } = await supabase
      //      .from('instances')
      //      .select('account_id')
      //      .eq('name', instanceName)
      //      .single();
      // 2. Usar instance.account_id como accountId
      const accountId = 'account-1'; // Mockado por enquanto

      // Buscar configuração do negócio (mockado por enquanto)
      // TODO: Substituir por chamada ao Supabase quando conectar
      const businessConfig = await businessConfigService.getBusinessConfigByInstanceName(instanceName);

      // Se é a primeira mensagem, enviar boas-vindas (usar configuração do bot ou IA)
      if (messageCount === 1) {
        // Se tem mensagem de boas-vindas configurada, usar ela
        // Se não, deixar IA gerar automaticamente
        if (businessConfig?.welcomeMessage) {
          await mockDataService.addMessage({
            conversationId: conversation.id,
            fromMe: true,
            body: businessConfig.welcomeMessage,
            status: 'sent',
            sentBy: 'bot',
          });

          await sendMessage(instanceName, contactPhone, businessConfig.welcomeMessage);
          recordMessageSent(instanceName);
          continue;
        }
        // Se não tem mensagem configurada, continuar para IA gerar
      }

      // Configurar Groq (usar variável de ambiente ou configuração do negócio)
      // Usando Production Systems gratuitos: groq/compound ou groq/compound-mini
      // Rate limits: 200K TPM (Tokens Per Minute) e 200 RPM (Requests Per Minute)
      const groqConfig: GroqConfig = {
        apiKey: businessConfig?.groqApiKey || process.env.GROQ_API_KEY || '',
        model: 'groq/compound', // Production System gratuito (alternativa: 'groq/compound-mini')
      };

      // Se não tem API key do Groq, usar mensagem padrão do bot (fallback)
      if (!groqConfig.apiKey) {
        logger.warn('[Webhook] GROQ_API_KEY não configurada, usando fallback', {
          instanceName,
          contactPhone,
        }, requestContext);
        const fallbackMessage = defaultBotConfig.defaultMessage || 'Obrigado por sua mensagem. Nossa equipe entrará em contato em breve.';
        
        await mockDataService.addMessage({
          conversationId: conversation.id,
          fromMe: true,
          body: fallbackMessage,
          status: 'sent',
          sentBy: 'bot',
        });

        await sendMessage(instanceName, contactPhone, fallbackMessage);
        continue;
      }

      // Verificar se deve limpar contexto após fechamento da loja
      const contextCheck = clearContextAfterClosing(
        messages.map(msg => ({ timestamp: msg.timestamp, body: msg.body })),
        businessConfig?.openingHours,
        defaultBotConfig.welcomeMessage
      );

      // Se deve limpar contexto, usar apenas mensagens recentes
      const messagesToUse = contextCheck.shouldClear
        ? contextCheck.clearedMessages.map(msg => ({
            timestamp: msg.timestamp,
            body: msg.body,
            fromMe: messages.find(m => m.body === msg.body && m.timestamp === msg.timestamp)?.fromMe || false,
          }))
        : messages;

      // Se limpou contexto e há mensagem de boas-vindas, enviar primeiro
      if (contextCheck.shouldClear && contextCheck.welcomeBackMessage) {
        await mockDataService.addMessage({
          conversationId: conversation.id,
          fromMe: true,
          body: contextCheck.welcomeBackMessage,
          status: 'sent',
          sentBy: 'bot',
        });

        await sendMessage(instanceName, contactPhone, contextCheck.welcomeBackMessage);
        recordMessageSent(instanceName);
      }

      // Preparar histórico de conversa para o Groq (apenas mensagens recentes)
      const conversationHistory = messagesToUse.slice(-10).map(msg => ({
        role: msg.fromMe ? ('assistant' as const) : ('user' as const),
        content: msg.body,
      }));

      // Verificar se cliente solicita transferência explicitamente (palavras-chave)
      const transferKeywords = businessConfig?.transferKeywords || defaultBotConfig.transferKeywords || ['atendente', 'atendimento humano', 'falar com alguém', 'humano', 'pessoa'];
      const hasTransferKeyword = transferKeywords.some(keyword =>
        messageText.toLowerCase().includes(keyword.toLowerCase())
      );

      // Analisar intenção do cliente usando Groq AI
      const intentionAnalysis = await analyzeIntention(
        messageText,
        conversationHistory,
        groqConfig
      );

      console.log('Intenção detectada:', intentionAnalysis);

      // Transferir para humano APENAS se:
      // 1. Cliente quer comprar (intention === 'purchase')
      // 2. Cliente solicita explicitamente (palavras-chave)
      const shouldTransfer = 
        (intentionAnalysis.shouldTransfer || intentionAnalysis.intention === 'purchase') ||
        hasTransferKeyword;

      if (shouldTransfer) {
        let transferMessage = '';
        let transferReason = '';

        if (hasTransferKeyword) {
          // Cliente solicitou explicitamente
          transferMessage = businessConfig?.transferMessage || '🤖 Transferindo para um atendente humano... Aguarde um momento.';
          transferReason = `Cliente solicitou atendimento humano (palavra-chave detectada)`;
        } else if (intentionAnalysis.intention === 'purchase') {
          // Cliente quer comprar
          transferMessage = businessConfig?.transferMessage || '🤖 Identifiquei que você deseja realizar uma compra. Vou transferir você para um de nossos atendentes que poderá ajudar melhor. Aguarde um momento...';
          transferReason = intentionAnalysis.reason || 'Cliente quer realizar uma compra';
        }

        await mockDataService.addMessage({
          conversationId: conversation.id,
          fromMe: true,
          body: transferMessage,
          status: 'sent',
          sentBy: 'bot',
        });

        await sendMessage(instanceName, contactPhone, transferMessage);
        recordMessageSent(instanceName);

        // TODO: Atualizar conversation.status = 'waiting_agent' no Supabase
        // TODO: Atualizar conversation.transferReason = transferReason

        continue;
      }

      // Buscar produtos cadastrados para passar como contexto para a IA
      const products = await productsService.getAllProducts(accountId); // TODO: usar accountId real do Supabase
      const productsContext = formatProductsForAI(products);

      // Gerar resposta do bot usando Groq AI
      const botResponse = await generateBotResponse(
        messageText,
        conversationHistory,
        groqConfig,
        {
          welcomeMessage: businessConfig?.welcomeMessage, // Opcional - se não preenchido, IA gera
          defaultMessage: businessConfig?.defaultMessage, // Opcional - se não preenchido, IA gera
          companyName: businessConfig?.companyName || 'Nossa Empresa',
          businessType: businessConfig?.businessType || 'Vendas',
          businessDescription: businessConfig?.businessDescription,
          openingHours: businessConfig?.openingHours,
          address: businessConfig?.address,
          phone: businessConfig?.phone,
          deliveryAvailable: businessConfig?.deliveryAvailable,
          deliveryFee: businessConfig?.deliveryFee,
          botPersonality: businessConfig?.botPersonality, // Personalidade do bot
          products: productsContext, // Passar produtos como contexto
        }
      );

      // Verificar se a IA mencionou algum produto e enviar imagem se disponível
      const mentionedProduct = findProductByName(products, messageText);
      if (mentionedProduct && mentionedProduct.imageUrl) {
        // Enviar imagem do produto primeiro
        await sendMedia(instanceName, contactPhone, mentionedProduct.imageUrl, 
          `${mentionedProduct.name}${mentionedProduct.description ? ` - ${mentionedProduct.description}` : ''}`);
      }

      // Enviar resposta do bot
      await mockDataService.addMessage({
        conversationId: conversation.id,
        fromMe: true,
        body: botResponse,
        status: 'sent',
        sentBy: 'bot',
      });

      logger.info('[Webhook] Resposta gerada pelo bot', {
        instanceName,
        contactPhone,
        responseLength: botResponse.length,
        conversationId: conversation.id,
      }, requestContext);

      await sendMessage(instanceName, contactPhone, botResponse);
      recordMessageSent(instanceName);
    }

    logger.info('[Webhook] Mensagens processadas com sucesso', {
      instanceName,
      processedCount: messages.length,
    }, requestContext);

    const response = NextResponse.json({ success: true, message: 'Mensagens processadas' });
    addSecurityHeaders(response);
    return response;
  } catch (error) {
    logger.error('[Webhook] Erro ao processar mensagem', error, {
      instanceName: data?.instanceName,
    }, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
    addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}


/**
 * Envia mensagem via Motor
 */
async function sendMessage(instanceName: string, phoneNumber: string, text: string) {
  try {
    // Formatar número de telefone (remover caracteres especiais)
    const formattedNumber = phoneNumber.replace(/\D/g, '');

    logger.debug('[Webhook] Enviando mensagem via Motor', {
      instanceName,
      phoneNumber: formattedNumber,
      textLength: text.length,
    });

    const result = await motorClientAPI.sendMessage(instanceName, {
      number: `${formattedNumber}@s.whatsapp.net`,
      text,
    });

    if (result.success) {
      logger.info('[Webhook] Mensagem enviada com sucesso', {
        instanceName,
        phoneNumber: formattedNumber,
      });
    } else {
      logger.error('[Webhook] Erro ao enviar mensagem via Motor', result.error, {
        instanceName,
        phoneNumber: formattedNumber,
        statusCode: result.statusCode,
      });
    }

    return result;
  } catch (error) {
    logger.error('[Webhook] Erro ao enviar mensagem', error, {
      instanceName,
      phoneNumber,
    });
    throw error;
  }
}

/**
 * Envia mídia (imagem, vídeo, documento) via Motor
 */
async function sendMedia(instanceName: string, phoneNumber: string, mediaUrl: string, caption?: string) {
  try {
    // Formatar número de telefone (remover caracteres especiais)
    const formattedNumber = phoneNumber.replace(/\D/g, '');

    const result = await motorClientAPI.sendMedia(instanceName, {
      number: `${formattedNumber}@s.whatsapp.net`,
      mediaUrl,
      caption,
    });

    if (result.success) {
      logger.info('[Webhook] Mídia enviada com sucesso', {
        instanceName,
        phoneNumber: formattedNumber,
        mediaUrl,
      });
    } else {
      logger.error('[Webhook] Erro ao enviar mídia via Motor', result.error, {
        instanceName,
        phoneNumber: formattedNumber,
        statusCode: result.statusCode,
      });
    }

    return result;
  } catch (error) {
    logger.error('[Webhook] Erro ao enviar mídia', error, {
      instanceName,
      phoneNumber,
      mediaUrl,
    });
    throw error;
  }
}

/**
 * Envia mensagem padrão quando não há fluxo
 */
async function sendDefaultMessage(instanceName: string, phoneNumber: string) {
  const defaultMessage = 'Olá! Obrigado por entrar em contato. Nossa equipe entrará em contato em breve.';
  return await sendMessage(instanceName, phoneNumber, defaultMessage);
}

/**
 * Atualiza status da conexão
 */
async function handleConnectionUpdate(data: any, requestContext: any) {
  const { instanceName, state } = data;
  
  logger.info('[Webhook] Status da conexão atualizado', {
    instanceName,
    state,
    isConnected: state === 'open' || state === 'connected',
  }, requestContext);
  
  // TODO: Atualizar status no Supabase
  // await mockDataService.updateInstanceStatus(instanceId, state === 'open' ? 'connected' : 'disconnected');
  
  return NextResponse.json({ success: true });
}

/**
 * Atualiza QR Code
 */
async function handleQRCodeUpdate(data: any, requestContext: any) {
  const { instanceName, qrcode } = data;
  
  logger.info('[Webhook] QR Code atualizado', {
    instanceName,
    hasQrCode: !!qrcode,
  }, requestContext);
  
  // TODO: Emitir evento via WebSocket ou Server-Sent Events para atualizar o frontend
  // Por enquanto, o frontend faz polling
  
  return NextResponse.json({ success: true });
}


