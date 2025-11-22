import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { motorClientAPI } from '@/lib/motor-client';
import { logger, getRequestContext } from '@/lib/utils/logger';
import { addSecurityHeaders } from '@/lib/utils/security';
import { extractRequestHeaders } from '@/lib/utils/request-headers';

type CreateCampaignBody = {
  name: string;
  message: string;
  groups: string[]; // array de groupJid (ex: '12345-67890@g.us')
  scheduledFor?: string; // ISO string
  instanceName?: string; // nome da instância na Evolution API
  mediaUrl?: string | null;
  mediaType?: 'image' | 'video' | 'document' | null;
};

export async function POST(request: NextRequest) {
  const requestContext = getRequestContext(request);
  
  try {
    const body = (await request.json()) as CreateCampaignBody;
    const {
      name,
      message,
      groups,
      scheduledFor,
      instanceName,
      mediaUrl,
      mediaType,
    } = body;

    if (!name || !message || !groups?.length) {
      const response = NextResponse.json(
        { error: 'Campos obrigatórios: name, message, groups' },
        { status: 400 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const usedInstanceName =
      instanceName ||
      process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE ||
      'default-instance';

    const status = scheduledFor ? 'scheduled' : 'sent';

    // Criar campanha no Supabase
    const { data: campaign, error: insertError } = await supabase
      .from('campaigns')
      .insert([
        {
          name,
          message,
          target_groups: groups,
          status,
          scheduled_for: scheduledFor ? new Date(scheduledFor).toISOString() : null,
          instance_name: usedInstanceName,
          media_url: mediaUrl || null,
          media_type: mediaType || null,
        },
      ])
      .select('*')
      .single();

    if (insertError || !campaign) {
      logger.error('[Campaigns] Erro ao criar campanha no Supabase', insertError, { name }, requestContext);
      const response = NextResponse.json(
        { error: 'Erro ao criar campanha', details: insertError?.message },
        { status: 500 }
      );
      addSecurityHeaders(response);
      return response;
    }

    // Criar deliveries pendentes
    const deliveriesToInsert = groups.map((groupId) => ({
      campaign_id: campaign.id,
      group_id: groupId,
      status: scheduledFor ? 'pending' : 'sent',
      sent_at: scheduledFor ? null : new Date().toISOString(),
    }));

    const { error: deliveryError } = await supabase
      .from('campaign_deliveries')
      .insert(deliveriesToInsert);

    if (deliveryError) {
      logger.error('[Campaigns] Erro ao criar deliveries', deliveryError, { campaignId: campaign.id }, requestContext);
      const response = NextResponse.json(
        { error: 'Erro ao criar entregas', details: deliveryError.message },
        { status: 500 }
      );
      addSecurityHeaders(response);
      return response;
    }

    // Se não foi agendada, enviar imediatamente via Motor
    if (!scheduledFor) {
      logger.info('[Campaigns] Enviando mensagens imediatamente via Motor', {
        campaignId: campaign.id,
        groupsCount: groups.length,
        instanceName: usedInstanceName,
      }, requestContext);

      // Extrair headers (cookies, authorization) para repassar ao Motor
      const requestHeaders = extractRequestHeaders(request);

      for (const groupId of groups) {
        try {
          if (mediaUrl && mediaType) {
            // Enviar mídia via Motor (repassando cookies/headers)
            const result = await motorClientAPI.sendGroupMedia(usedInstanceName, groupId, mediaUrl, message, requestHeaders);
            if (!result.success) {
              logger.error('[Campaigns] Erro ao enviar mídia via Motor', result.error, {
                groupId,
                instanceName: usedInstanceName,
              }, requestContext);
            }
          } else {
            // Enviar mensagem de texto via Motor (repassando cookies/headers)
            const result = await motorClientAPI.sendGroupMessage(usedInstanceName, {
              groupId,
              text: message,
            }, requestHeaders);
            if (!result.success) {
              logger.error('[Campaigns] Erro ao enviar mensagem via Motor', result.error, {
                groupId,
                instanceName: usedInstanceName,
              }, requestContext);
            }
          }
        } catch (error: any) {
          logger.error('[Campaigns] Erro ao enviar para grupo', error, {
            groupId,
            instanceName: usedInstanceName,
          }, requestContext);
        }
      }
    }

    const response = NextResponse.json({ success: true, campaignId: campaign.id });
    addSecurityHeaders(response);
    return response;
  } catch (error: any) {
    logger.error('[Campaigns] Erro inesperado', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
    addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
