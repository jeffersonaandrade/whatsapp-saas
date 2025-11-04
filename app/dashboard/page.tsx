'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Smartphone, 
  MessageCircle, 
  Users, 
  TrendingUp,
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [showQRCode, setShowQRCode] = useState(false);

  // Mock data - será substituído por dados reais do Supabase
  const stats = [
    { name: 'Conversas Hoje', value: '12', icon: MessageCircle, change: '+4.75%', changeType: 'positive' },
    { name: 'Mensagens na Fila', value: '3', icon: Users, change: '-2.02%', changeType: 'negative' },
    { name: 'Taxa de Resposta', value: '98.5%', icon: TrendingUp, change: '+1.39%', changeType: 'positive' },
    { name: 'Tempo Médio', value: '2.4min', icon: Smartphone, change: '-0.95%', changeType: 'positive' },
  ];

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setShowQRCode(true);
    // Aqui será feita a chamada para a Evolution API
    setTimeout(() => {
      setConnectionStatus('connected');
      setShowQRCode(false);
    }, 3000);
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setShowQRCode(false);
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Bem-vindo ao seu painel de atendimento via WhatsApp
          </p>
        </div>

        {/* Connection Status Card */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Status da Conexão</h2>
                {connectionStatus === 'connected' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Conectado
                  </span>
                )}
                {connectionStatus === 'disconnected' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" />
                    Desconectado
                  </span>
                )}
                {connectionStatus === 'connecting' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Conectando...
                  </span>
                )}
              </div>

              {connectionStatus === 'disconnected' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <Smartphone className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    WhatsApp Desconectado
                  </h3>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    Conecte seu WhatsApp para começar a receber e responder mensagens dos seus clientes
                  </p>
                  <button
                    onClick={handleConnect}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    Conectar Agora
                  </button>
                </div>
              )}

              {showQRCode && connectionStatus === 'connecting' && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg mb-4">
                    {/* Aqui será exibido o QR Code real da Evolution API */}
                    <div className="text-gray-400">
                      <QrCode className="w-32 h-32 mx-auto mb-4" />
                      <p className="text-sm">Gerando QR Code...</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Escaneie o QR Code
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Abra o WhatsApp no seu celular, vá em <strong>Configurações → Aparelhos conectados</strong> e escaneie este código
                  </p>
                </div>
              )}

              {connectionStatus === 'connected' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Conectado como</p>
                      <p className="text-sm text-gray-600">+55 11 99999-9999</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Desconectar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Cliente #{item}</p>
                    <p className="text-sm text-gray-600 truncate">Última mensagem recebida...</p>
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    há {item * 5}min
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

