'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Archive,
  Tag,
  User,
  Clock,
  CheckCheck,
  Bot,
  UserCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: 'bot' | 'waiting_agent' | 'in_service' | 'resolved';
  assignedTo?: string;
  transferReason?: string;
  avatar?: string;
}

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  sentBy: 'bot' | 'agent' | 'customer';
}

type FilterType = 'all' | 'bot' | 'waiting' | 'mine';

export default function ConversationsPage() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  // Mock data - será substituído por dados reais do Supabase
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'João Silva',
      phoneNumber: '+55 11 98765-4321',
      lastMessage: 'Preciso falar com um atendente',
      timestamp: 'há 2min',
      unread: 2,
      status: 'waiting_agent',
      transferReason: 'Cliente solicitou atendimento humano',
    },
    {
      id: '2',
      name: 'Maria Santos',
      phoneNumber: '+55 11 91234-5678',
      lastMessage: 'Obrigada pelo atendimento!',
      timestamp: 'há 15min',
      unread: 0,
      status: 'resolved',
      assignedTo: 'Você',
    },
    {
      id: '3',
      name: 'Pedro Costa',
      phoneNumber: '+55 11 99999-8888',
      lastMessage: 'Qual o horário de funcionamento?',
      timestamp: 'há 1h',
      unread: 0,
      status: 'bot',
    },
    {
      id: '4',
      name: 'Ana Oliveira',
      phoneNumber: '+55 11 97777-6666',
      lastMessage: 'Estou com um problema urgente',
      timestamp: 'há 5min',
      unread: 3,
      status: 'waiting_agent',
      transferReason: 'Palavra-chave: urgente',
    },
  ];

  const messages: Message[] = selectedContact ? [
    {
      id: '1',
      text: 'Olá! Sou o assistente virtual. Como posso ajudar?',
      fromMe: true,
      timestamp: '10:30',
      status: 'read',
      sentBy: 'bot',
    },
    {
      id: '2',
      text: 'Oi, gostaria de saber mais sobre os produtos',
      fromMe: false,
      timestamp: '10:32',
      status: 'read',
      sentBy: 'customer',
    },
    {
      id: '3',
      text: 'Temos várias opções! Você está procurando algo específico?',
      fromMe: true,
      timestamp: '10:32',
      status: 'read',
      sentBy: 'bot',
    },
    {
      id: '4',
      text: 'Preciso falar com um atendente',
      fromMe: false,
      timestamp: '10:33',
      status: 'read',
      sentBy: 'customer',
    },
    {
      id: '5',
      text: '🤖 Transferindo para um atendente humano...',
      fromMe: true,
      timestamp: '10:33',
      status: 'delivered',
      sentBy: 'bot',
    },
  ] : [];

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedContact) {
      // Aqui será implementado o envio real via Evolution API
      console.log('Enviando mensagem:', messageInput);
      setMessageInput('');
    }
  };

  const handleTakeOver = () => {
    if (selectedContact) {
      // Atualizar status da conversa para 'in_service'
      console.log('Assumindo conversa:', selectedContact.id);
    }
  };

  const handleResolve = () => {
    if (selectedContact) {
      // Atualizar status da conversa para 'resolved'
      console.log('Finalizando conversa:', selectedContact.id);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'bot':
        return {
          label: 'Bot',
          color: 'bg-green-100 text-green-800',
          icon: Bot,
        };
      case 'waiting_agent':
        return {
          label: 'Aguardando',
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertCircle,
        };
      case 'in_service':
        return {
          label: 'Em Atendimento',
          color: 'bg-blue-100 text-blue-800',
          icon: UserCheck,
        };
      case 'resolved':
        return {
          label: 'Resolvido',
          color: 'bg-gray-100 text-gray-800',
          icon: CheckCheck,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: User,
        };
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'bot') return contact.status === 'bot';
    if (filter === 'waiting') return contact.status === 'waiting_agent';
    if (filter === 'mine') return contact.assignedTo === 'Você';
    return true;
  });

  const waitingCount = contacts.filter(c => c.status === 'waiting_agent').length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
        <div className="flex flex-col lg:flex-row h-full gap-4">
          {/* Lista de Conversas - Coluna Esquerda */}
          <div className={`
            ${selectedContact ? 'hidden lg:flex' : 'flex'} 
            flex-col w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
          `}>
            {/* Header da lista */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900">Conversas</h2>
                {waitingCount > 0 && (
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {waitingCount} aguardando
                  </span>
                )}
              </div>
              
              {/* Filtros */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    filter === 'all' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter('waiting')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    filter === 'waiting' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aguardando ({waitingCount})
                </button>
                <button
                  onClick={() => setFilter('bot')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    filter === 'bot' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bot
                </button>
                <button
                  onClick={() => setFilter('mine')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    filter === 'mine' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Minhas
                </button>
              </div>

              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Lista de contatos */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => {
                const statusConfig = getStatusConfig(contact.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`
                      p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50
                      ${selectedContact?.id === contact.id ? 'bg-green-50' : ''}
                      ${contact.status === 'waiting_agent' ? 'border-l-4 border-l-yellow-500' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                          {contact.name.charAt(0)}
                        </div>
                        {contact.status === 'bot' && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {contact.name}
                          </p>
                          <span className="text-xs text-gray-500">{contact.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {contact.lastMessage}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                          {contact.unread > 0 && (
                            <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                              {contact.unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Área de Chat - Coluna Central */}
          <div className={`
            ${!selectedContact ? 'hidden lg:flex' : 'flex'}
            flex-col flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
          `}>
            {selectedContact ? (
              <>
                {/* Header do chat */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedContact(null)}
                        className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        ←
                      </button>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                        {selectedContact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedContact.name}</p>
                        <p className="text-xs text-gray-500">{selectedContact.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Phone className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Video className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Alerta de transbordo */}
                  {selectedContact.status === 'waiting_agent' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-900">Cliente aguardando atendimento</p>
                            <p className="text-xs text-yellow-700 mt-1">{selectedContact.transferReason}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleTakeOver}
                          className="ml-3 px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors whitespace-nowrap"
                        >
                          Assumir Conversa
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedContact.status === 'in_service' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Você está atendendo este cliente</p>
                      </div>
                      <button
                        onClick={handleResolve}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Finalizar
                      </button>
                    </div>
                  )}
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex flex-col max-w-[70%]">
                        {/* Label do remetente */}
                        {message.sentBy === 'bot' && message.fromMe && (
                          <div className="flex items-center gap-1 mb-1 ml-2">
                            <Bot className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-green-600 font-medium">Bot</span>
                          </div>
                        )}
                        {message.sentBy === 'agent' && message.fromMe && (
                          <div className="flex items-center gap-1 mb-1 ml-2">
                            <User className="w-3 h-3 text-blue-600" />
                            <span className="text-xs text-blue-600 font-medium">Você</span>
                          </div>
                        )}
                        
                        <div
                          className={`
                            rounded-lg px-4 py-2 
                            ${message.fromMe 
                              ? message.sentBy === 'bot'
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                            }
                          `}
                        >
                          <p className="text-sm">{message.text}</p>
                          <div className={`flex items-center justify-end space-x-1 mt-1 ${message.fromMe ? 'text-white/70' : 'text-gray-500'}`}>
                            <span className="text-xs">{message.timestamp}</span>
                            {message.fromMe && (
                              <CheckCheck className={`w-4 h-4 ${message.status === 'read' ? 'text-blue-300' : ''}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input de mensagem */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  {selectedContact.status === 'bot' ? (
                    <div className="text-center py-4 text-gray-500">
                      <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Esta conversa está sendo atendida pelo bot</p>
                      <button
                        onClick={handleTakeOver}
                        className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Assumir conversa manualmente
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-end space-x-2">
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <textarea
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder="Digite sua mensagem..."
                          rows={1}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                        className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">Selecione uma conversa</p>
                  <p className="text-sm mt-2">Escolha um contato para começar a conversar</p>
                </div>
              </div>
            )}
          </div>

          {/* Painel de Informações - Coluna Direita (Desktop) */}
          {selectedContact && (
            <div className="hidden xl:flex flex-col w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-semibold mb-3">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">{selectedContact.phoneNumber}</p>
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">Adicionar Tag</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                    <Archive className="w-4 h-4" />
                    <span className="text-sm font-medium">Arquivar</span>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Informações</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Primeira mensagem</p>
                      <p className="text-sm text-gray-600">Hoje às 10:30</p>
                    </div>
                  </div>
                  
                  {selectedContact.status !== 'bot' && (
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Atribuído a</p>
                        <p className="text-sm text-gray-600">{selectedContact.assignedTo || 'Não atribuído'}</p>
                      </div>
                    </div>
                  )}

                  {selectedContact.transferReason && (
                    <div className="flex items-start space-x-3">
                      <ArrowRight className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Motivo do transbordo</p>
                        <p className="text-sm text-gray-600">{selectedContact.transferReason}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
