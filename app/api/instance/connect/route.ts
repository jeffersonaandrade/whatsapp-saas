import { NextRequest, NextResponse } from 'next/server';
import { evolutionAPI } from '@/lib/evolution-api';
import { evolutionAPIMock } from '@/lib/services/evolution-api-mock';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthenticatedUser } from '@/lib/utils/auth';

/**
 * API Route para conectar instância e obter QR Code
 * Usa Evolution API real se configurada, senão usa mock
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let { instanceName } = body;

    // Se não forneceu instanceName, gerar baseado no accountId (sem hífens)
    if (!instanceName) {
      // Remover hífens do accountId para gerar o nome da instância
      const accountIdWithoutHyphens = user.accountId.replace(/-/g, '');
      instanceName = `instance${accountIdWithoutHyphens}`;
    }

    // Verificar se Evolution API está configurada
    const useRealAPI = !!process.env.NEXT_PUBLIC_EVOLUTION_API_URL && !!process.env.EVOLUTION_API_KEY;
    
    console.log('[Instance Connect] Configuração:', {
      useRealAPI,
      evolutionApiUrl: process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'não configurado',
      hasApiKey: !!process.env.EVOLUTION_API_KEY,
      accountId: user.accountId,
      instanceName,
    });
    
    if (useRealAPI) {
      // PASSO 1: Verificar se existe instância para o accountId no Supabase
      const { data: existingInstance, error: dbError } = await supabaseAdmin
        .from('instances')
        .select('*')
        .eq('account_id', user.accountId)
        .maybeSingle(); // maybeSingle() retorna null se não encontrar, sem erro

      if (dbError) {
        console.error('[Supabase] Erro ao buscar instância:', dbError);
      }

      if (existingInstance) {
        console.log('[Supabase] Instância encontrada:', existingInstance.name, existingInstance.status);
        
        // Se já está conectada, retornar sucesso
        if (existingInstance.status === 'connected') {
          return NextResponse.json({
            success: true,
            qrCode: null,
            instanceName: existingInstance.name,
            status: 'connected',
            phoneNumber: existingInstance.phone_number || null,
            message: 'Instância já está conectada',
          });
        }

        // Se está desconectada, usar o nome da instância existente para obter QR Code
        instanceName = existingInstance.name;
      }

      // PASSO 2 e 3: Chamar Evolution API (que verifica se existe e cria se necessário)
      console.log(`[Evolution API] Conectando instância: ${instanceName}`);
      
      // Chamar endpoint do Evolution API: POST /api/instance/connect
      // O Evolution API só precisa do header 'apikey', não precisa de cookies
      const connectResult = await evolutionAPI.connectInstance(instanceName);
      
      if (!connectResult.success) {
        console.error('[Evolution API] Erro ao conectar:', connectResult);
        return NextResponse.json(
          { 
            error: 'Erro ao conectar instância', 
            details: connectResult.error || 'Erro desconhecido',
            statusCode: connectResult.statusCode || 500,
            url: connectResult.url || 'N/A',
          },
          { status: 500 }
        );
      }

      // Extrair dados da resposta
      const responseData = connectResult.data;
      const qrCode = responseData?.qrcode 
        || responseData?.qrcode?.base64 
        || responseData?.qrcode?.code 
        || responseData?.base64 
        || responseData?.code;
      
      const returnedInstanceName = responseData?.instanceName || instanceName;
      const instanceId = responseData?.instanceId;
      const status = responseData?.status || (qrCode ? 'connecting' : 'connected');
      const phoneNumber = responseData?.phoneNumber;

      // Salvar/atualizar instância no Supabase
      const { error: upsertError } = await supabaseAdmin
        .from('instances')
        .upsert({
          account_id: user.accountId,
          name: returnedInstanceName,
          status: status === 'connected' ? 'connected' : 'connecting',
          phone_number: phoneNumber || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'name',
        });

      if (upsertError) {
        console.error('[Supabase] Erro ao salvar instância:', upsertError);
      }

      // Retornar resposta
      return NextResponse.json({
        success: true,
        qrCode: qrCode || null,
        instanceName: returnedInstanceName,
        instanceId: instanceId || null,
        status: status,
        phoneNumber: phoneNumber || null,
        message: qrCode 
          ? 'Escaneie o QR Code com o WhatsApp' 
          : status === 'connected'
          ? 'Instância já está conectada'
          : 'Conectando...',
      });
    } else {
      // Usar mock para desenvolvimento
      console.log('[Mock] Usando Evolution API Mock');
      const result = await evolutionAPIMock.createInstance(instanceName);

      if (!result.success) {
        return NextResponse.json(
          { error: 'Erro ao criar instância', details: result.error || 'Erro desconhecido' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        qrCode: result.data?.base64 || result.data?.code,
        instanceName,
      });
    }
  } catch (error: any) {
    console.error('Erro ao conectar instância:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}

