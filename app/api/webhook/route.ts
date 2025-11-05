import { NextRequest, NextResponse } from 'next/server';
import { evolutionAPI } from '@/lib/evolution-api';
import { mockDataService } from '@/lib/services/mock-data';
import { analyzeIntention, generateBotResponse, GroqConfig } from '@/lib/services/groq-ai';
import { canSendMessage, recordMessageSent } from '@/lib/services/rate-limiter';
import { productsService, formatProductsForAI, findProductByName } from '@/lib/services/products';
import { businessConfigService } from '@/lib/services/business-config';
import { clearContextAfterClosing } from '@/lib/utils/conversation-context';
import { defaultBotConfig } from '@/lib/services/bot-logic';

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
  try {
    const body = await request.json();
    const { event, data } = body;

    console.log('Webhook recebido:', { event, data });

    // Processar diferentes tipos de eventos
    switch (event) {
      case 'messages.upsert':
        return await handleNewMessage(data);
      
      case 'connection.update':
        return await handleConnectionUpdate(data);
      
      case 'qrcode.update':
        return await handleQRCodeUpdate(data);
      
      default:
        console.log('Evento não tratado:', event);
        return NextResponse.json({ success: true, message: 'Evento recebido' });
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

/**
 * Processa uma nova mensagem recebida
 * Esta é a lógica principal do bot
 */
async function handleNewMessage(data: any) {
  try {
    const { instanceName, messages } = data;

    // Processar cada mensagem recebida
    for (const message of messages) {
      // Ignorar mensagens enviadas por nós mesmos
      if (message.key.fromMe) {
        continue;
      }

      const contactPhone = message.key.remoteJid?.replace('@s.whatsapp.net', '') || '';
      const messageText = message.message?.conversation || 
                         message.message?.extendedTextMessage?.text || 
                         '';
      
      if (!contactPhone || !messageText) {
        continue;
      }

      // Buscar ou criar conversa
      const conversation = await mockDataService.createOrUpdateConversation(
        '1', // instanceId mockado
        contactPhone,
        message.pushName || undefined
      );

      // Salvar mensagem recebida
      await mockDataService.addMessage({
        conversationId: conversation.id,
        fromMe: false,
        body: messageText,
        status: 'read',
        sentBy: 'customer',
      });

      // Verificar se a conversa está sendo atendida por um humano
      // Se sim, NÃO chamar IA (economiza rate limits)
      if (conversation.status === 'in_service' || conversation.status === 'waiting_agent') {
        console.log(`Conversa ${conversation.id} está com atendente humano. Pulando processamento por IA.`);
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
        console.warn(`Rate limit excedido. Retry após ${rateLimitCheck.retryAfter}s`);
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
        console.warn('GROQ_API_KEY não configurada, usando fallback');
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

      await sendMessage(instanceName, contactPhone, botResponse);
      recordMessageSent(instanceName);
    }

    return NextResponse.json({ success: true, message: 'Mensagens processadas' });
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}


/**
 * Envia mensagem via Evolution API
 */
async function sendMessage(instanceName: string, phoneNumber: string, text: string) {
  try {
    // Formatar número de telefone (remover caracteres especiais)
    const formattedNumber = phoneNumber.replace(/\D/g, '');

    const result = await evolutionAPI.sendTextMessage(instanceName, {
      number: `${formattedNumber}@s.whatsapp.net`,
      text,
    });

    if (result.success) {
      // Salvar mensagem enviada
      // TODO: Salvar no Supabase
      console.log('Mensagem enviada:', text);
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}

/**
 * Envia mídia (imagem, vídeo, documento) via Evolution API
 */
async function sendMedia(instanceName: string, phoneNumber: string, mediaUrl: string, caption?: string) {
  try {
    // Formatar número de telefone (remover caracteres especiais)
    const formattedNumber = phoneNumber.replace(/\D/g, '');

    const result = await evolutionAPI.sendMedia(instanceName, `${formattedNumber}@s.whatsapp.net`, mediaUrl, caption);

    if (result.success) {
      // Salvar mensagem enviada
      // TODO: Salvar no Supabase
      console.log('Mídia enviada:', mediaUrl);
    }

    return result;
  } catch (error) {
    console.error('Erro ao enviar mídia:', error);
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
async function handleConnectionUpdate(data: any) {
  const { instanceName, state } = data;
  console.log('Status da conexão atualizado:', { instanceName, state });
  
  // TODO: Atualizar status no Supabase
  // await mockDataService.updateInstanceStatus(instanceId, state === 'open' ? 'connected' : 'disconnected');
  
  return NextResponse.json({ success: true });
}

/**
 * Atualiza QR Code
 */
async function handleQRCodeUpdate(data: any) {
  const { instanceName, qrcode } = data;
  console.log('QR Code atualizado:', { instanceName });
  
  // TODO: Emitir evento via WebSocket ou Server-Sent Events para atualizar o frontend
  // Por enquanto, o frontend faz polling
  
  return NextResponse.json({ success: true });
}

