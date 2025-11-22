/**
 * Serviço para comunicação com as rotas de API do CÉREBRO
 * 
 * IMPORTANTE: Este serviço chama as rotas do próprio CÉREBRO (Netlify),
 * que fazem proxy para o Motor. NÃO chama o Motor diretamente.
 * 
 * Este serviço é usado APENAS para chamadas relacionadas à WhatsApp:
 * - Conectar instância WhatsApp
 * - Verificar status da instância
 * - Desconectar instância
 * 
 * NÃO use este serviço para outras rotas (auth, dashboard, etc.)
 */

import axios from 'axios';

// Usar rotas do próprio CÉREBRO (relativas, sem baseURL)
// As rotas do CÉREBRO fazem proxy para o Motor
const api = axios.create({
  baseURL: '', // Vazio = usa a mesma origem (Netlify)
  withCredentials: true, // OBRIGATÓRIO: envia cookies (auth_token, user, etc.)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de configuração (apenas no cliente)
if (typeof window !== 'undefined') {
  console.log('[Motor Service] Configurado para usar rotas do CÉREBRO:', {
    baseURL: 'relativo (mesma origem)',
    withCredentials: true,
  });
}

/**
 * Conectar instância WhatsApp e obter QR Code
 * Chama a rota do CÉREBRO que faz proxy para o Motor
 */
export async function connectInstance(data?: { instanceName?: string }) {
  try {
    const response = await api.post('/api/instance/connect', data || {});
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('[Motor Service] Erro ao conectar instância:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Erro ao conectar instância',
      statusCode: error.response?.status,
    };
  }
}

/**
 * Verificar status da instância WhatsApp
 * Chama a rota do CÉREBRO que faz proxy para o Motor
 */
export async function getInstanceStatus(instanceName?: string) {
  try {
    const url = instanceName 
      ? `/api/instance/status?instanceName=${encodeURIComponent(instanceName)}`
      : '/api/instance/status';
    const response = await api.get(url);
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('[Motor Service] Erro ao verificar status:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Erro ao verificar status',
      statusCode: error.response?.status,
    };
  }
}

/**
 * Desconectar instância WhatsApp
 * Chama a rota do CÉREBRO que faz proxy para o Motor
 */
export async function disconnectInstance(data?: { instanceName?: string }) {
  try {
    const response = await api.post('/api/instance/disconnect', data || {});
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    console.error('[Motor Service] Erro ao desconectar instância:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Erro ao desconectar instância',
      statusCode: error.response?.status,
    };
  }
}
