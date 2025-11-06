'use client';

import { useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Plus,
  Send,
  Calendar,
  Image as ImageIcon,
  Video,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

interface Group {
  id: string;
  name: string;
  participantsCount: number;
  pictureUrl?: string;
  isSelected: boolean;
}

interface Campaign {
  id: string;
  name: string;
  message: string;
  groupsCount: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
}

export default function CampaignsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  // Mock data - será substituído por dados reais
  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Clientes VIP', participantsCount: 45, isSelected: false },
    { id: '2', name: 'Promoções Semanais', participantsCount: 128, isSelected: false },
    { id: '3', name: 'Novidades', participantsCount: 89, isSelected: false },
    { id: '4', name: 'Lançamentos', participantsCount: 67, isSelected: false },
  ]);

  const campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Promoção Black Friday',
      message: '🔥 Black Friday! 50% OFF em todos os produtos...',
      groupsCount: 3,
      status: 'sent',
      sentAt: 'Hoje às 10:00',
      createdAt: '2024-11-01',
    },
    {
      id: '2',
      name: 'Lançamento Produto X',
      message: '✨ Novidade! Acabou de chegar o Produto X...',
      groupsCount: 2,
      status: 'scheduled',
      scheduledFor: 'Amanhã às 14:00',
      createdAt: '2024-11-02',
    },
    {
      id: '3',
      name: 'Cupom de Desconto',
      message: '🎁 Cupom especial para você...',
      groupsCount: 1,
      status: 'draft',
      createdAt: '2024-11-03',
    },
  ];

  const stats = {
    totalCampaigns: 12,
    sentToday: 3,
    scheduled: 2,
    totalGroupsReached: 8,
  };

  const toggleGroupSelection = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isSelected: !g.isSelected } : g
    ));
  };

  const selectedGroupsCount = groups.filter(g => g.isSelected).length;

  const handleCreateCampaign = () => {
    // Aqui será implementada a lógica real de criação
    console.log('Criando campanha:', {
      name: campaignName,
      message: campaignMessage,
      groups: groups.filter(g => g.isSelected),
      media: selectedMedia,
      scheduledFor: scheduleDate,
    });
    setShowCreateModal(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sent':
        return { label: 'Enviada', color: 'bg-green-100 text-green-800', icon: CheckCircle2 };
      case 'scheduled':
        return { label: 'Agendada', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'draft':
        return { label: 'Rascunho', color: 'bg-gray-100 text-gray-800', icon: FileText };
      case 'failed':
        return { label: 'Falhou', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800', icon: FileText };
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campanhas em Grupos</h1>
            <p className="mt-2 text-sm text-gray-600">
              Envie promoções e novidades para seus grupos do WhatsApp
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Campanha
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Campanhas</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <Send className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enviadas Hoje</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.sentToday}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agendadas</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.scheduled}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grupos Alcançados</p>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalGroupsReached}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Histórico de Campanhas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campanha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => {
                  const statusConfig = getStatusConfig(campaign.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 truncate max-w-xs">{campaign.message}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-1" />
                          {campaign.groupsCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {campaign.sentAt || campaign.scheduledFor || campaign.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowCreateModal(false)} />
              
              <div className="relative inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Nova Campanha</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Nome da Campanha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Campanha
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="Ex: Promoção de Natal"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      value={campaignMessage}
                      onChange={(e) => setCampaignMessage(e.target.value)}
                      placeholder="Digite a mensagem que será enviada aos grupos..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {campaignMessage.length} caracteres
                    </p>
                  </div>

                  {/* Mídia (Opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mídia (Opcional)
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        onClick={() => imageInputRef.current?.click()}
                        type="button"
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Imagem
                      </button>
                      <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors" onClick={() => videoInputRef.current?.click()} type="button">
                        <Video className="w-4 h-4 mr-2" />
                        Vídeo
                      </button>
                    </div>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/mpeg,video/quicktime"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          setSelectedMedia(file);
                        }
                      }}
                    />
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          setSelectedMedia(file);
                        }
                      }}
                    />
                  </div>

                  {/* Selecionar Grupos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Grupos ({selectedGroupsCount} selecionados)
                    </label>
                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {groups.map((group) => (
                        <div
                          key={group.id}
                          onClick={() => toggleGroupSelection(group.id)}
                          className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                            group.isSelected ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={group.isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{group.name}</p>
                                <p className="text-xs text-gray-500">{group.participantsCount} participantes</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Agendar (Opcional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agendar Envio (Opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
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
                    onClick={handleCreateCampaign}
                    disabled={!campaignName || !campaignMessage || selectedGroupsCount === 0}
                    className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {scheduleDate ? (
                      <>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Agendar
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 inline mr-2" />
                        Enviar Agora
                      </>
                    )}
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
