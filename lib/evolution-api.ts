import axios from 'axios';
import { EvolutionAPIResponse, QRCodeResponse, SendMessagePayload, SendGroupMessagePayload } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_EVOLUTION_API_URL || 'http://localhost:8080';
const API_KEY = process.env.EVOLUTION_API_KEY || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'apikey': API_KEY,
  },
});

export const evolutionAPI = {
  // Criar uma nova instância
  async createInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.post('/instance/create', {
        instanceName,
        qrcode: true,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Conectar instância e obter QR Code
  async connectInstance(instanceName: string): Promise<EvolutionAPIResponse<QRCodeResponse>> {
    try {
      const response = await api.get(`/instance/connect/${instanceName}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Verificar status da conexão
  async getInstanceStatus(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.get(`/instance/connectionState/${instanceName}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Enviar mensagem de texto
  async sendTextMessage(instanceName: string, payload: SendMessagePayload): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.post(`/message/sendText/${instanceName}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Listar grupos do WhatsApp
  async fetchGroups(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.get(`/group/fetchAllGroups/${instanceName}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Enviar mensagem para grupo
  async sendGroupMessage(instanceName: string, payload: SendGroupMessagePayload): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.post(`/message/sendText/${instanceName}`, {
        number: payload.groupId,
        text: payload.text,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Enviar mídia para grupo
  async sendGroupMedia(instanceName: string, groupId: string, mediaUrl: string, caption?: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.post(`/message/sendMedia/${instanceName}`, {
        number: groupId,
        mediaUrl: mediaUrl,
        caption: caption || '',
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Desconectar instância
  async logoutInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.delete(`/instance/logout/${instanceName}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Deletar instância
  async deleteInstance(instanceName: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.delete(`/instance/delete/${instanceName}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Criar grupo
  async createGroup(instanceName: string, groupName: string, participants: string[]): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.post(`/group/create/${instanceName}`, {
        subject: groupName,
        participants: participants,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Atualizar informações do grupo
  async updateGroupInfo(instanceName: string, groupId: string, subject?: string, description?: string): Promise<EvolutionAPIResponse> {
    try {
      const payload: any = { groupJid: groupId };
      if (subject) payload.subject = subject;
      if (description) payload.description = description;
      
      const response = await api.put(`/group/updateGroupInfo/${instanceName}`, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Adicionar participante ao grupo
  async addParticipantToGroup(instanceName: string, groupId: string, phoneNumber: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.put(`/group/updateParticipant/${instanceName}`, {
        groupJid: groupId,
        action: 'add',
        participants: [phoneNumber],
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Remover participante do grupo
  async removeParticipantFromGroup(instanceName: string, groupId: string, phoneNumber: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.put(`/group/updateParticipant/${instanceName}`, {
        groupJid: groupId,
        action: 'remove',
        participants: [phoneNumber],
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },

  // Obter informações detalhadas de um grupo
  async getGroupInfo(instanceName: string, groupId: string): Promise<EvolutionAPIResponse> {
    try {
      const response = await api.get(`/group/findGroupInfo/${instanceName}`, {
        params: { groupJid: groupId },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  },
};
