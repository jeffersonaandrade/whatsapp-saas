import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { motorClientAPI } from '@/lib/motor-client';
import { logger, getRequestContext } from '@/lib/utils/logger';
import { addSecurityHeaders } from '@/lib/utils/security';

export async function POST() {
  const requestContext = getRequestContext(undefined as any);
  
  try {
    // Buscar campanhas agendadas que já venceram
    const { data: dueCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, message, target_groups, instance_name, media_url, media_type, scheduled_for, status')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString());

    if (campaignsError) {
      logger.error('[Campaigns Process Due] Erro ao buscar campanhas', campaignsError, {}, requestContext);
      const response = NextResponse.json(
        { error: 'Erro ao buscar campanhas vencidas', details: campaignsError.message },
        { status: 500 }
      );
      addSecurityHeaders(response);
      return response;
    }

    const processed: string[] = [];

    for (const campaign of dueCampaigns || []) {
      const instanceName = campaign.instance_name || 'default-instance';
      const groups: string[] = Array.isArray(campaign.target_groups) ? campaign.target_groups : [];

      // Buscar deliveries pendentes desta campanha
      const { data: pendingDeliveries, error: pendingErr } = await supabase
        .from('campaign_deliveries')
        .select('id, group_id')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending');

      if (pendingErr) {
        logger.error('[Campaigns Process Due] Erro ao buscar deliveries', pendingErr, { campaignId: campaign.id }, requestContext);
        continue;
      }

      for (const delivery of pendingDeliveries || []) {
        try {
          if (campaign.media_url && campaign.media_type) {
            // Enviar mídia via Motor
            const result = await motorClientAPI.sendGroupMedia(
              instanceName,
              delivery.group_id,
              campaign.media_url,
              campaign.message
            );
            
            if (!result.success) {
              throw new Error(result.error || 'Erro ao enviar mídia');
            }
          } else {
            // Enviar mensagem de texto via Motor
            const result = await motorClientAPI.sendGroupMessage(instanceName, {
              groupId: delivery.group_id,
              text: campaign.message,
            });
            
            if (!result.success) {
              throw new Error(result.error || 'Erro ao enviar mensagem');
            }
          }

          // Marcar como enviado
          await supabase
            .from('campaign_deliveries')
            .update({ status: 'sent', sent_at: new Date().toISOString(), error: null })
            .eq('id', delivery.id);
        } catch (err: any) {
          logger.error('[Campaigns Process Due] Erro ao enviar delivery', err, {
            deliveryId: delivery.id,
            groupId: delivery.group_id,
          }, requestContext);
          
          await supabase
            .from('campaign_deliveries')
            .update({ status: 'failed', error: String(err) })
            .eq('id', delivery.id);
        }
      }

      // Verificar se todas as deliveries estão concluídas
      const { data: remaining, error: remErr } = await supabase
        .from('campaign_deliveries')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('status', 'pending');

      if (!remErr && (remaining?.length || 0) === 0) {
        await supabase
          .from('campaigns')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', campaign.id);
      }

      processed.push(campaign.id);
    }

    logger.info('[Campaigns Process Due] Processamento concluído', {
      processedCount: processed.length,
    }, requestContext);

    const response = NextResponse.json({ success: true, processed });
    addSecurityHeaders(response);
    return response;
  } catch (error: any) {
    logger.error('[Campaigns Process Due] Erro inesperado', error, {}, requestContext);
    const errorResponse = NextResponse.json(
      { error: 'Erro ao processar campanhas', details: String(error) },
      { status: 500 }
    );
    addSecurityHeaders(errorResponse);
    return errorResponse;
  }
}
