import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { evolutionAPI } from '@/lib/evolution-api';

export async function POST() {
  try {
    // Buscar campanhas agendadas que já venceram
    const { data: dueCampaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, message, target_groups, instance_name, media_url, media_type, scheduled_for, status')
      .eq('status', 'scheduled')
      .lte('scheduled_for', new Date().toISOString());

    if (campaignsError) {
      return NextResponse.json(
        { error: 'Erro ao buscar campanhas vencidas', details: campaignsError.message },
        { status: 500 }
      );
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
        continue;
      }

      for (const delivery of pendingDeliveries || []) {
        try {
          if (campaign.media_url && campaign.media_type) {
            await evolutionAPI.sendGroupMedia(instanceName, delivery.group_id, campaign.media_url, campaign.message);
          } else {
            await evolutionAPI.sendGroupMessage(instanceName, {
              groupId: delivery.group_id,
              text: campaign.message,
            });
          }

          await supabase
            .from('campaign_deliveries')
            .update({ status: 'sent', sent_at: new Date().toISOString(), error: null })
            .eq('id', delivery.id);
        } catch (err: any) {
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

    return NextResponse.json({ success: true, processed });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar campanhas', details: String(error) },
      { status: 500 }
    );
  }
}


