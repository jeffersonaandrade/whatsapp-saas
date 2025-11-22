/**
 * Cliente do Motor para uso nas API Routes do Next.js (Serverless)
 * 
 * Este cliente é usado APENAS no servidor (API Routes) para fazer proxy
 * das requisições do frontend para o Motor.
 * 
 * IMPORTANTE: Este é diferente de motor-service.ts que é usado no frontend.
 * Este cliente roda no servidor e repassa requisições HTTP.
 */

import axios, { AxiosError } from 'axios';
import { logger, getRequestContext } from '@/lib/utils/logger';

// URL do Motor (Serviço Externo)
// Aceita ambas as variáveis para compatibilidade durante migração
const MOTOR_API_URL = process.env.NEXT_PUBLIC_MOTOR_API_URL 
  || process.env.NEXT_PUBLIC_EVOLUTION_API_URL // Fallback para compatibilidade
  || 'https://whatsapp-evolution-api-fa3y.onrender.com';

// Criar instância do axios configurada para o Motor
const motorClient = axios.create({
  baseURL: MOTOR_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout
});

// Log de configuração (apenas no servidor)
if (typeof window === 'undefined') {
  logger.info('[Motor Client] Configurado', {
    baseURL: MOTOR_API_URL,
    isConfigured: !!MOTOR_API_URL,
  });
}

/**
 * Faz uma requisição para o Motor e retorna a resposta
 * Usado pelas API Routes para fazer proxy
 */
async function proxyRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  headers?: Record<string, string>
): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
  const requestContext = getRequestContext();
  
  try {
    logger.debug('[Motor Client] Requisição enviada', {
      method,
      endpoint,
      url: `${MOTOR_API_URL}${endpoint}`,
    }, requestContext);

    const config: any = {
      method,
      url: endpoint,
      headers: {
        ...headers,
      },
    };

    // Adicionar dados se for POST/PUT
    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    const response = await motorClient(config);

    logger.info('[Motor Client] Requisição bem-sucedida', {
      method,
      endpoint,
      statusCode: response.status,
    }, requestContext);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const errorMessage = axiosError.response?.data 
      ? (typeof axiosError.response.data === 'string' 
          ? axiosError.response.data 
          : (axiosError.response.data as any)?.error || axiosError.message)
      : axiosError.message || 'Erro desconhecido';

    logger.error('[Motor Client] Erro na requisição', error, {
      method,
      endpoint,
      statusCode,
      errorMessage,
    }, requestContext);

    return {
      success: false,
      error: errorMessage,
      statusCode,
    };
  }
}

/**
 * Cliente do Motor para uso nas API Routes
 */
export const motorClientAPI = {
  /**
   * Conectar instância WhatsApp
   */
  async connectInstance(
    data?: { instanceName?: string },
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    return proxyRequest('POST', '/api/instance/connect', data, headers);
  },

  /**
   * Verificar status da instância
   */
  async getInstanceStatus(
    instanceName?: string,
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    const endpoint = instanceName 
      ? `/api/instance/status?instanceName=${encodeURIComponent(instanceName)}`
      : '/api/instance/status';
    return proxyRequest('GET', endpoint, undefined, headers);
  },

  /**
   * Desconectar instância WhatsApp
   */
  async disconnectInstance(
    data?: { instanceName?: string },
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    return proxyRequest('POST', '/api/instance/disconnect', data, headers);
  },

  /**
   * Enviar mensagem de texto
   */
  async sendMessage(
    instanceName: string,
    payload: { number: string; text: string },
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    return proxyRequest('POST', `/api/messages/send`, {
      instanceName,
      ...payload,
    }, headers);
  },

  /**
   * Enviar mídia
   */
  async sendMedia(
    instanceName: string,
    payload: { number: string; mediaUrl: string; caption?: string },
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    return proxyRequest('POST', `/api/messages/send-media`, {
      instanceName,
      ...payload,
    }, headers);
  },

  /**
   * Enviar mensagem para grupo
   */
  async sendGroupMessage(
    instanceName: string,
    payload: { groupId: string; text: string },
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    return proxyRequest('POST', `/api/messages/send-group`, {
      instanceName,
      ...payload,
    }, headers);
  },

  /**
   * Enviar mídia para grupo
   */
  async sendGroupMedia(
    instanceName: string,
    groupId: string,
    mediaUrl: string,
    message: string,
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    return proxyRequest('POST', `/api/messages/send-group-media`, {
      instanceName,
      groupId,
      mediaUrl,
      message,
    }, headers);
  },

  /**
   * Listar grupos
   */
  async fetchGroups(
    instanceName: string,
    headers?: Record<string, string>
  ): Promise<{ success: boolean; data?: any; error?: string; statusCode?: number }> {
    return proxyRequest('GET', `/api/groups?instanceName=${encodeURIComponent(instanceName)}`, undefined, headers);
  },
};

