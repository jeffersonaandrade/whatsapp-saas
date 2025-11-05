// Serviço de dados mockados
// Este arquivo será substituído por chamadas reais ao Supabase depois

import { WhatsAppInstance, BotFlow, Conversation, Message, Contact } from '@/types';

// Mock: Instâncias
const mockInstances: WhatsAppInstance[] = [
  {
    id: '1',
    name: 'instancia-principal',
    status: 'disconnected',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock: Fluxos do Bot
const mockFlows: BotFlow[] = [
  {
    id: '1',
    instanceId: '1',
    name: 'Fluxo Principal',
    nodes: [
      {
        id: 'node-1',
        type: 'message',
        position: { x: 250, y: 100 },
        data: {
          label: 'Mensagem de Boas-Vindas',
          message: 'Olá! Como posso ajudar você hoje?',
        },
      },
      {
        id: 'node-2',
        type: 'button',
        position: { x: 250, y: 250 },
        data: {
          label: 'Botões de Opções',
          buttons: ['Ver Produtos', 'Falar com Atendente', 'Horários'],
        },
      },
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
      },
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock: Conversas
const mockConversations: Conversation[] = [
  {
    id: '1',
    instanceId: '1',
    contactId: 'contact-1',
    status: 'bot',
    lastMessageAt: new Date().toISOString(),
    botHandoffCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock: Contatos
const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    phoneNumber: '+5511999999999',
    name: 'João Silva',
    createdAt: new Date().toISOString(),
  },
];

// Mock: Mensagens
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg-1',
      conversationId: '1',
      fromMe: true,
      body: 'Olá! Como posso ajudar você hoje?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      status: 'read',
      sentBy: 'bot',
    },
    {
      id: 'msg-2',
      conversationId: '1',
      fromMe: false,
      body: 'Oi, gostaria de saber mais sobre os produtos',
      timestamp: new Date(Date.now() - 30000).toISOString(),
      status: 'read',
      sentBy: 'customer',
    },
  ],
};

// Serviços Mockados
export const mockDataService = {
  // Instâncias
  async getInstance(accountId: string): Promise<WhatsAppInstance | null> {
    return mockInstances[0] || null;
  },

  async updateInstanceStatus(instanceId: string, status: WhatsAppInstance['status']): Promise<void> {
    const instance = mockInstances.find(i => i.id === instanceId);
    if (instance) {
      instance.status = status;
      instance.updatedAt = new Date().toISOString();
    }
  },

  // Fluxos
  async getFlow(instanceId: string): Promise<BotFlow | null> {
    return mockFlows.find(f => f.instanceId === instanceId) || null;
  },

  async saveFlow(flow: BotFlow): Promise<BotFlow> {
    const existingIndex = mockFlows.findIndex(f => f.id === flow.id);
    if (existingIndex >= 0) {
      mockFlows[existingIndex] = { ...flow, updatedAt: new Date().toISOString() };
      return mockFlows[existingIndex];
    } else {
      const newFlow = { ...flow, id: Date.now().toString(), createdAt: new Date().toISOString() };
      mockFlows.push(newFlow);
      return newFlow;
    }
  },

  // Conversas
  async getConversations(instanceId: string): Promise<Conversation[]> {
    return mockConversations.filter(c => c.instanceId === instanceId);
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return mockConversations.find(c => c.id === conversationId) || null;
  },

  async createOrUpdateConversation(
    instanceId: string,
    contactPhone: string,
    contactName?: string
  ): Promise<Conversation> {
    let conversation = mockConversations.find(
      c => c.instanceId === instanceId && c.contactId === `contact-${contactPhone}`
    );

    if (!conversation) {
      // Criar novo contato se não existir
      const contactId = `contact-${contactPhone}`;
      const existingContact = mockContacts.find(c => c.id === contactId);
      if (!existingContact) {
        mockContacts.push({
          id: contactId,
          phoneNumber: contactPhone,
          name: contactName,
          createdAt: new Date().toISOString(),
        });
      }

      conversation = {
        id: Date.now().toString(),
        instanceId,
        contactId,
        status: 'bot',
        lastMessageAt: new Date().toISOString(),
        botHandoffCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockConversations.push(conversation);
    } else {
      conversation.lastMessageAt = new Date().toISOString();
      conversation.updatedAt = new Date().toISOString();
    }

    return conversation;
  },

  // Mensagens
  async getMessages(conversationId: string): Promise<Message[]> {
    return mockMessages[conversationId] || [];
  },

  async addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    if (!mockMessages[message.conversationId]) {
      mockMessages[message.conversationId] = [];
    }
    mockMessages[message.conversationId].push(newMessage);

    return newMessage;
  },

  // Contatos
  async getContact(contactId: string): Promise<Contact | null> {
    return mockContacts.find(c => c.id === contactId) || null;
  },
};

