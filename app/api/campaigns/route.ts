import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { evolutionAPI } from '@/lib/evolution-api';

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
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, message, groups' },
        { status: 400 }
      );
    }

    const usedInstanceName =
      instanceName ||
      process.env.NEXT_PUBLIC_EVOLUTION_INSTANCE ||
      'default-instance';

    const status = scheduledFor ? 'scheduled' : 'sent';

    // Criar campanha
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
      return NextResponse.json(
        { error: 'Erro ao criar campanha', details: insertError?.message },
        { status: 500 }
      );
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
      return NextResponse.json(
        { error: 'Erro ao criar entregas', details: deliveryError.message },
        { status: 500 }
      );
    }

    // Se não foi agendada, enviar imediatamente
    if (!scheduledFor) {
      for (const groupId of groups) {
        if (mediaUrl && mediaType) {
          await evolutionAPI.sendGroupMedia(usedInstanceName, groupId, mediaUrl, message);
        } else {
          await evolutionAPI.sendGroupMessage(usedInstanceName, {
            groupId,
            text: message,
          });
        }
      }
    }

    return NextResponse.json({ success: true, campaignId: campaign.id });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
}


