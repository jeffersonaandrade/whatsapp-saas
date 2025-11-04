// Tipos para a instância do WhatsApp
export interface WhatsAppInstance {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'connecting';
  phoneNumber?: string;
  profilePicUrl?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para o fluxo do bot
export interface BotFlow {
  id: string;
  instanceId: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlowNode {
  id: string;
  type: 'message' | 'button' | 'condition' | 'webhook' | 'transfer_to_human';
  position: { x: number; y: number };
  data: {
    label: string;
    message?: string;
    buttons?: string[];
    condition?: string;
    webhookUrl?: string;
    transferReason?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Tipos para conversas com sistema de transbordo
export interface Conversation {
  id: string;
  instanceId: string;
  contactId: string;
  status: 'bot' | 'waiting_agent' | 'in_service' | 'resolved';
  assignedTo?: string;
  lastMessageAt: string;
  transferredAt?: string;
  transferReason?: string;
  botHandoffCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  phoneNumber: string;
  name?: string;
  profilePicUrl?: string;
  tags?: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  fromMe: boolean;
  body: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  sentBy: 'bot' | 'agent' | 'customer';
  agentId?: string;
}

// Tipos para grupos e campanhas
export interface WhatsAppGroup {
  id: string;
  groupId: string; // ID do grupo no WhatsApp
  name: string;
  description?: string;
  participantsCount: number;
  pictureUrl?: string;
  isAdmin: boolean;
  createdBy: 'user' | 'system'; // Criado manualmente ou pelo sistema
  autoSubscribe: boolean; // Se permite inscrição automática
  keywords: string[]; // Palavras-chave para inscrição (ex: ["PROMOÇÕES", "SIM"])
  welcomeMessage?: string; // Mensagem de boas-vindas ao entrar no grupo
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  phoneNumber: string;
  name?: string;
  joinedAt: string;
  addedBy: 'user' | 'bot'; // Adicionado manualmente ou pelo bot
}

export interface Campaign {
  id: string;
  instanceId: string;
  name: string;
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  targetGroups: string[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  sentToday: number;
  scheduled: number;
  totalGroupsReached: number;
}

export interface GroupStats {
  totalGroups: number;
  systemGroups: number;
  totalMembers: number;
  newMembersToday: number;
}

// Tipos para a Evolution API
export interface EvolutionAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface QRCodeResponse {
  base64: string;
  code: string;
}

export interface SendMessagePayload {
  number: string;
  text: string;
}

export interface SendGroupMessagePayload {
  groupId: string;
  text: string;
  mediaUrl?: string;
}

export interface CreateGroupPayload {
  groupName: string;
  participants: string[];
}

// Tipos para usuários e permissões
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  avatar?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPermissions {
  canManageTeam: boolean;
  canManageCampaigns: boolean;
  canManageGroups: boolean;
  canViewAllConversations: boolean;
  canManageSettings: boolean;
  canConnectWhatsApp: boolean;
}

export interface TeamStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  agents: number;
}

// Tipos para estatísticas e métricas
export interface ConversationStats {
  total: number;
  byBot: number;
  waitingAgent: number;
  inService: number;
  resolved: number;
  avgResponseTime: number;
  botResolutionRate: number;
}
