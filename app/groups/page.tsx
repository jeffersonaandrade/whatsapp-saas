'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Plus,
  Users,
  UserPlus,
  Settings,
  Trash2,
  Edit,
  Key,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Bot
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  description?: string;
  participantsCount: number;
  pictureUrl?: string;
  createdBy: 'user' | 'system';
  autoSubscribe: boolean;
  keywords: string[];
  welcomeMessage?: string;
}

export default function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [autoSubscribe, setAutoSubscribe] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Mock data - será substituído por dados reais
  const groups: Group[] = [
    {
      id: '1',
      name: 'Promoções Exclusivas',
      description: 'Grupo para receber promoções e ofertas especiais',
      participantsCount: 156,
      createdBy: 'system',
      autoSubscribe: true,
      keywords: ['PROMOÇÕES', 'OFERTAS', 'SIM'],
      welcomeMessage: '🎉 Bem-vindo ao grupo de promoções! Aqui você receberá ofertas exclusivas.',
    },
    {
      id: '2',
      name: 'Clientes VIP',
      description: 'Grupo exclusivo para clientes VIP',
      participantsCount: 45,
      createdBy: 'user',
      autoSubscribe: false,
      keywords: [],
    },
    {
      id: '3',
      name: 'Novidades e Lançamentos',
      description: 'Seja o primeiro a saber sobre nossos lançamentos',
      participantsCount: 89,
      createdBy: 'system',
      autoSubscribe: true,
      keywords: ['NOVIDADES', 'LANÇAMENTOS', 'QUERO'],
      welcomeMessage: '✨ Você agora faz parte do grupo de novidades!',
    },
  ];

  const stats = {
    totalGroups: 3,
    systemGroups: 2,
    totalMembers: 290,
    newMembersToday: 12,
  };

  const handleCreateGroup = () => {
    console.log('Criando grupo:', {
      name: groupName,
      description: groupDescription,
      autoSubscribe,
      keywords: keywords.split(',').map(k => k.trim()),
      welcomeMessage,
    });
    setShowCreateModal(false);
  };

  const openConfigModal = (group: Group) => {
    setSelectedGroup(group);
    setGroupName(group.name);
    setGroupDescription(group.description || '');
    setAutoSubscribe(group.autoSubscribe);
    setKeywords(group.keywords.join(', '));
    setWelcomeMessage(group.welcomeMessage || '');
    setShowConfigModal(true);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Grupos</h1>
            <p className="mt-2 text-sm text-gray-600">
              Crie e gerencie grupos para inscrição automática de clientes
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Grupo
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Grupos</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalGroups}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grupos Automáticos</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.systemGroups}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Bot className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Membros</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novos Hoje</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.newMembersToday}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Como funciona a inscrição automática?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Quando um cliente envia uma das palavras-chave configuradas (ex: "PROMOÇÕES", "SIM"), o bot automaticamente adiciona o cliente ao grupo e envia a mensagem de boas-vindas. É 100% opt-in e seguro!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                      {group.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      {group.createdBy === 'system' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          <Bot className="w-3 h-3 mr-1" />
                          Automático
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {group.description && (
                  <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="font-medium">{group.participantsCount}</span>
                    <span className="ml-1">membros</span>
                  </div>
                </div>

                {group.autoSubscribe && group.keywords.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Palavras-chave:</p>
                    <div className="flex flex-wrap gap-1">
                      {group.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                        >
                          <Key className="w-3 h-3 mr-1" />
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openConfigModal(group)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Configurar
                  </button>
                  <button className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <Users className="w-4 h-4 mr-1" />
                    Membros
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowCreateModal(false)} />
              
              <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Criar Novo Grupo</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Nome do Grupo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Grupo *
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Ex: Promoções Exclusivas"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição (Opcional)
                    </label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Descreva o propósito do grupo..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Inscrição Automática */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={autoSubscribe}
                      onChange={(e) => setAutoSubscribe(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Ativar inscrição automática
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Clientes serão adicionados automaticamente quando enviarem as palavras-chave
                      </p>
                    </div>
                  </div>

                  {autoSubscribe && (
                    <>
                      {/* Palavras-chave */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Palavras-chave (separadas por vírgula)
                        </label>
                        <input
                          type="text"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          placeholder="Ex: PROMOÇÕES, OFERTAS, SIM"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Quando o cliente enviar qualquer uma dessas palavras, será adicionado ao grupo
                        </p>
                      </div>

                      {/* Mensagem de Boas-vindas */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mensagem de Boas-vindas
                        </label>
                        <textarea
                          value={welcomeMessage}
                          onChange={(e) => setWelcomeMessage(e.target.value)}
                          placeholder="Ex: 🎉 Bem-vindo! Você agora faz parte do nosso grupo de promoções."
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-3 mt-8">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateGroup}
                    disabled={!groupName}
                    className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Criar Grupo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Config Modal (similar structure) */}
        {showConfigModal && selectedGroup && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowConfigModal(false)} />
              
              <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Configurar Grupo</h3>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Grupo</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={autoSubscribe}
                      onChange={(e) => setAutoSubscribe(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Inscrição automática ativa</label>
                    </div>
                  </div>

                  {autoSubscribe && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Palavras-chave</label>
                        <input
                          type="text"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem de Boas-vindas</label>
                        <textarea
                          value={welcomeMessage}
                          onChange={(e) => setWelcomeMessage(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 mt-8">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
