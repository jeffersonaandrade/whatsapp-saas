'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [stats, setStats] = useState([
    { name: 'Conversas Hoje', value: '0', icon: MessageCircle, change: '0%', changeType: 'positive' },
    { name: 'Mensagens na Fila', value: '0', icon: Users, change: '0%', changeType: 'negative' },
    { name: 'Taxa de Resposta', value: '0%', icon: TrendingUp, change: '0%', changeType: 'positive' },
    { name: 'Tempo Médio', value: '0min', icon: Smartphone, change: '0%', changeType: 'positive' },
  ]);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    contactName: string;
    lastMessage: string;
    timeAgo: string;
  }>>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        
        // Buscar estatísticas (rota local na porta 3000)
        const statsResponse = await fetch('/api/dashboard/stats', {
          credentials: 'include',
        });
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success && statsData.stats) {
            setStats([
              { name: 'Conversas Hoje', value: String(statsData.stats.conversationsToday), icon: MessageCircle, change: '+0%', changeType: 'positive' },
              { name: 'Mensagens na Fila', value: String(statsData.stats.messagesInQueue), icon: Users, change: '0%', changeType: 'negative' },
              { name: 'Taxa de Resposta', value: statsData.stats.responseRate, icon: TrendingUp, change: '+0%', changeType: 'positive' },
              { name: 'Tempo Médio', value: statsData.stats.averageTime, icon: Smartphone, change: '0%', changeType: 'positive' },
            ]);
          }
        }

        // Buscar atividade recente (rota local na porta 3000)
        const activityResponse = await fetch('/api/dashboard/recent-activity', {
          credentials: 'include',
        });
        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          if (activityData.success && activityData.activities) {
            setRecentActivities(activityData.activities);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const checkConnectionStatus = useCallback(async () => {
    // Não fazer nada se não estiver em estado 'connecting'
    if (connectionStatus !== 'connecting') {
      return;
    }

    try {
      // Polling passivo: apenas verificar status (GET)
      // NÃO chamar connectInstance() aqui - isso reiniciaria o processo
      const { getInstanceStatus } = await import('@/lib/services/motor-service');
      
      const result = await getInstanceStatus();
      
      if (!result.success) {
        // Se der erro (ex: 401, 500), parar o loop
        console.error('Erro ao verificar status:', result.error);
        setConnectionStatus('disconnected');
        setShowQRCode(false);
        setQrCodeImage(null);
        // Limpar intervalo
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }
      
      const data = result.data;

      // Se o status retornar QR Code, atualizar estado imediatamente
      // O backend pode ter recebido o webhook qrcode.update e agora retorna no status
      if (data.qrcode && !qrCodeImage) {
        setQrCodeImage(data.qrcode);
        console.log('[Polling] QR Code obtido via status');
      }

      // Se conectado, atualizar estado e parar polling
      if (data.isConnected || data.status === 'connected') {
        setConnectionStatus('connected');
        setShowQRCode(false);
        setQrCodeImage(null);
        setPhoneNumber(data.phoneNumber || null);
        // Limpar intervalo
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        return;
      }

      // Se ainda está desconectado/connecting, continuar aguardando
      // O polling continuará até conectar ou dar erro
      if (data.status === 'disconnected' || data.status === 'connecting') {
        // Manter em 'connecting' - o polling continuará
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      // Em caso de erro, parar o loop
      setConnectionStatus('disconnected');
      setShowQRCode(false);
      setQrCodeImage(null);
      // Limpar intervalo
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [connectionStatus, qrCodeImage]);

  // Verificar status da conexão periodicamente
  useEffect(() => {
    // Limpar intervalo anterior se existir
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Só fazer polling se estiver em estado 'connecting' e não estiver carregando
    if (connectionStatus === 'connecting' && !loading) {
      pollingIntervalRef.current = setInterval(() => {
        checkConnectionStatus();
      }, 3000); // Verificar a cada 3 segundos
    }

    // Cleanup: limpar intervalo quando componente desmontar ou status mudar
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [connectionStatus, loading, checkConnectionStatus]);

  const handleConnect = async () => {
    // Não permitir múltiplas chamadas simultâneas
    if (loading || connectionStatus === 'connecting') {
      return;
    }

    setLoading(true);
    setConnectionStatus('connecting');
    setShowQRCode(true);

    try {
      // Chamar Motor (Backend na porta 3001) para conectar instância
      // O Motor então chama o Evolution API (porta 8080)
      // IMPORTANTE: Chamar apenas UMA vez. Se não retornar QR Code, aguardar webhook
      const { connectInstance } = await import('@/lib/services/motor-service');
      
      const result = await connectInstance({
        // Não enviar instanceName - deixar o Motor gerar automaticamente
        // O Motor extrai accountId dos cookies
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao conectar instância');
      }
      
      const data = result.data;

      if (data.success) {
        if (data.qrCode) {
          // QR Code retornado na primeira chamada - exibir imediatamente
          setQrCodeImage(data.qrCode);
          setConnectionStatus('connecting');
        } else if (data.status === 'connected') {
          // Já está conectado
          setConnectionStatus('connected');
          setShowQRCode(false);
          setQrCodeImage(null);
          setPhoneNumber(data.phoneNumber || null);
        } else if (data.message && data.message.includes('webhook')) {
          // Backend informou que QR Code virá via webhook
          // Manter em 'connecting' e aguardar webhook ou polling de status
          setConnectionStatus('connecting');
          setQrCodeImage(null); // QR Code ainda não disponível
          // O polling de status continuará verificando
        } else {
          // Status 'connecting' mas sem QR Code ainda
          setConnectionStatus('connecting');
          // O polling de status continuará verificando
        }
      } else {
        throw new Error(data.error || 'Erro ao conectar');
      }
    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      alert(error.message || 'Erro ao conectar. Tente novamente.');
      setConnectionStatus('disconnected');
      setShowQRCode(false);
      setQrCodeImage(null);
    } finally {
      setLoading(false);
    }
  };


  const handleDisconnect = async () => {
    setLoading(true);
    
    // Limpar intervalo de polling antes de desconectar
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    try {
      // Chamar Motor (Backend na porta 3001) para desconectar instância
      const { disconnectInstance } = await import('@/lib/services/motor-service');
      
      const result = await disconnectInstance({
        // Não enviar instanceName - deixar o Motor gerar automaticamente
        // O Motor extrai accountId dos cookies
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao desconectar instância');
      }
      
      const data = result.data;

      if (data.success) {
        setConnectionStatus('disconnected');
        setShowQRCode(false);
        setQrCodeImage(null);
        setPhoneNumber(null);
      } else {
        alert('Erro ao desconectar. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      alert('Erro ao desconectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
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
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <QrCode className="w-5 h-5 mr-2" />
                    {loading ? 'Conectando...' : 'Conectar Agora'}
                  </button>
                </div>
              )}

              {showQRCode && connectionStatus === 'connecting' && (
                <div className="text-center py-8">
                  {qrCodeImage ? (
                    <div className="inline-flex items-center justify-center w-64 h-64 bg-white rounded-lg mb-4 p-4 border-2 border-gray-200">
                      <img 
                        src={qrCodeImage} 
                        alt="QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="inline-flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg mb-4">
                      <div className="text-gray-400">
                        <Loader2 className="w-32 h-32 mx-auto mb-4 animate-spin" />
                        <p className="text-sm">Gerando QR Code...</p>
                      </div>
                    </div>
                  )}
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
                      <p className="text-sm text-gray-600">{phoneNumber || '+55 11 99999-9999'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnect}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Desconectando...' : 'Desconectar'}
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
            {statsLoading ? (
              <div className="text-center py-8 text-gray-500">Carregando...</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhuma atividade recente</div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.contactName}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.lastMessage}</p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-gray-500">
                      {activity.timeAgo}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

