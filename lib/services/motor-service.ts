/**
 * Serviço para comunicação com o Motor (Backend na porta 3001)
 * 
 * Este serviço é usado APENAS para chamadas relacionadas à Evolution API:
 * - Conectar instância WhatsApp
 * - Verificar status da instância
 * - Desconectar instância
 * 
 * NÃO use este serviço para outras rotas (auth, dashboard, etc.)
 */

import axios from 'axios';

// URL do Motor (Backend na porta 3001)
const MOTOR_API_URL = process.env.NEXT_PUBLIC_MOTOR_API_URL || 'http://localhost:3001';

// Criar instância do axios configurada para o Motor
const motorApi = axios.create({
  baseURL: MOTOR_API_URL,
  withCredentials: true, // OBRIGATÓRIO: envia cookies (auth_token, user, etc.)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log de configuração (apenas no cliente)
if (typeof window !== 'undefined') {
  console.log('[Motor Service] Configurado:', {
    baseURL: MOTOR_API_URL,
    withCredentials: true,
  });
}

/**
 * Conectar instância WhatsApp e obter QR Code
 */
export async function connectInstance(data?: { instanceName?: string }) {
  try {
    const response = await motorApi.post('/api/instance/connect', data || {});
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
 */
export async function getInstanceStatus(instanceName?: string) {
  try {
    const url = instanceName 
      ? `/api/instance/status?instanceName=${instanceName}`
      : '/api/instance/status';
    const response = await motorApi.get(url);
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
 */
export async function disconnectInstance(data?: { instanceName?: string }) {
  try {
    const response = await motorApi.post('/api/instance/disconnect', data || {});
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

