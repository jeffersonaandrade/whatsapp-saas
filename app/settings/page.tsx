'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Save, Bot, MessageSquare, UserCheck, AlertCircle, Key, Info, Building2, Clock, MapPin, Truck } from 'lucide-react';
import { defaultBotConfig } from '@/lib/services/bot-logic';
import { mockDataService } from '@/lib/services/mock-data';
import { businessConfigService } from '@/lib/services/business-config';
import PasswordInput from '@/components/ui/PasswordInput';

interface BusinessConfig {
  companyName: string;
  businessType: string;
  businessDescription: string;
  openingHours: string;
  address: string;
  phone: string;
  deliveryAvailable: boolean;
  deliveryFee: number;
}

interface BotConfig {
  welcomeMessage: string;
  defaultMessage: string;
  transferMessage: string;
  transferKeywords: string[];
  botPersonality: string;
}

export default function SettingsPage() {
  const [groqApiKey, setGroqApiKey] = useState('');
  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    companyName: '',
    businessType: '',
    businessDescription: '',
    openingHours: '',
    address: '',
    phone: '',
    deliveryAvailable: false,
    deliveryFee: 0,
  });
  const [botConfig, setBotConfig] = useState<BotConfig>({
    welcomeMessage: '',
    defaultMessage: '',
    transferMessage: '',
    transferKeywords: ['atendente', 'atendimento humano', 'falar com alguém', 'humano', 'pessoa'],
    botPersonality: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    // Carregar configuração do negócio (mockado por enquanto)
    // TODO: Substituir por chamada ao Supabase:
    // const { data: user } = useAuth();
    // const businessConfig = await businessConfigService.getBusinessConfig(user.accountId);
    const accountId = 'account-1'; // Mockado por enquanto
    const businessConfigData = await businessConfigService.getBusinessConfig(accountId);
    
    if (businessConfigData) {
      setBusinessConfig({
        companyName: businessConfigData.companyName,
        businessType: businessConfigData.businessType,
        businessDescription: businessConfigData.businessDescription || '',
        openingHours: businessConfigData.openingHours || '',
        address: businessConfigData.address || '',
        phone: businessConfigData.phone || '',
        deliveryAvailable: businessConfigData.deliveryAvailable,
        deliveryFee: businessConfigData.deliveryFee || 0,
      });
      setGroqApiKey(businessConfigData.groqApiKey || '');
      
      // Carregar configurações do bot
      setBotConfig({
        welcomeMessage: businessConfigData.welcomeMessage || '',
        defaultMessage: businessConfigData.defaultMessage || '',
        transferMessage: businessConfigData.transferMessage || '',
        transferKeywords: businessConfigData.transferKeywords || ['atendente', 'atendimento humano', 'falar com alguém', 'humano', 'pessoa'],
        botPersonality: businessConfigData.botPersonality || '',
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (
        !businessConfig.companyName.trim() ||
        !businessConfig.businessType.trim() ||
        !businessConfig.businessDescription.trim() ||
        !businessConfig.openingHours.trim() ||
        !businessConfig.phone.trim() ||
        !businessConfig.address.trim()
      ) {
        alert('Preencha todos os campos obrigatórios do negócio.');
        setSaving(false);
        return;
      }
      // TODO: Substituir por chamada ao Supabase quando conectar:
      // const { data: user } = useAuth();
      // await businessConfigService.updateBusinessConfig(user.accountId, {
      //   companyName: businessConfig.companyName,
      //   businessType: businessConfig.businessType,
      //   businessDescription: businessConfig.businessDescription,
      //   openingHours: businessConfig.openingHours,
      //   address: businessConfig.address,
      //   phone: businessConfig.phone,
      //   deliveryAvailable: businessConfig.deliveryAvailable,
      //   deliveryFee: businessConfig.deliveryFee,
      //   groqApiKey: groqApiKey,
      // });
      
      // Por enquanto, salva no mock
      const accountId = 'account-1'; // Mockado por enquanto
      await businessConfigService.updateBusinessConfig(accountId, {
        companyName: businessConfig.companyName,
        businessType: businessConfig.businessType,
        businessDescription: businessConfig.businessDescription,
        openingHours: businessConfig.openingHours,
        address: businessConfig.address,
        phone: businessConfig.phone,
        deliveryAvailable: businessConfig.deliveryAvailable,
        deliveryFee: businessConfig.deliveryFee,
        groqApiKey: groqApiKey,
        // Configurações do Bot
        welcomeMessage: botConfig.welcomeMessage || undefined,
        defaultMessage: botConfig.defaultMessage || undefined,
        transferMessage: botConfig.transferMessage || undefined,
        transferKeywords: botConfig.transferKeywords,
        botPersonality: botConfig.botPersonality || undefined,
      });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const updateBotConfig = (field: keyof BotConfig, value: any) => {
    setBotConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Bot</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure as mensagens e comportamento do seu bot de atendimento
          </p>
        </div>

        {/* Business Configuration Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Configurações do Negócio</h2>
                  <p className="text-sm text-gray-600">Configure informações do seu negócio para a IA responder com contexto correto</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessConfig.companyName}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, companyName: e.target.value })}
                    placeholder="Ex: Pizzaria do João"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Negócio *
                  </label>
                  <select
                    value={businessConfig.businessType}
                    required
                    onChange={(e) => setBusinessConfig({ ...businessConfig, businessType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    <option value="Pizzaria">Pizzaria</option>
                    <option value="Hamburgueria">Hamburgueria</option>
                    <option value="Restaurante">Restaurante</option>
                    <option value="Clínica">Clínica</option>
                    <option value="Oficina">Oficina</option>
                    <option value="Padaria">Padaria</option>
                    <option value="Loja">Loja</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Negócio *
                </label>
                <textarea
                  value={businessConfig.businessDescription}
                  required
                  onChange={(e) => setBusinessConfig({ ...businessConfig, businessDescription: e.target.value })}
                  rows={2}
                  placeholder="Ex: Pizzaria artesanal com ingredientes frescos"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Horário de Funcionamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessConfig.openingHours}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, openingHours: e.target.value })}
                    placeholder="Ex: 18h às 23h (seg-sáb)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone de Contato *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessConfig.phone}
                    onChange={(e) => setBusinessConfig({ ...businessConfig, phone: e.target.value })}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Endereço *
                </label>
                <input
                  type="text"
                  required
                  value={businessConfig.address}
                  onChange={(e) => setBusinessConfig({ ...businessConfig, address: e.target.value })}
                  placeholder="Ex: Rua das Pizzas, 123 - Centro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Configurações de Entrega</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="deliveryAvailable"
                      checked={businessConfig.deliveryAvailable}
                      onChange={(e) => setBusinessConfig({ ...businessConfig, deliveryAvailable: e.target.checked })}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="deliveryAvailable" className="text-sm font-medium text-gray-700">
                      Fazemos entregas
                    </label>
                  </div>

                  {businessConfig.deliveryAvailable && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Taxa de Entrega (R$)
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="^\\d{1,4}(,\\d{1,2}|\\.\\d{1,2})?$"
                        value={String(businessConfig.deliveryFee ?? '')}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, '.');
                          if (raw === '') {
                            setBusinessConfig({ ...businessConfig, deliveryFee: 0 });
                            return;
                          }
                          const valid = /^\d{0,4}(\.\d{0,2})?$/.test(raw);
                          if (!valid) return;
                          const num = parseFloat(raw);
                          if (isNaN(num)) return;
                          if (num > 9999.99) return;
                          setBusinessConfig({ ...businessConfig, deliveryFee: num });
                        }}
                        placeholder="0.00"
                        className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Como funciona:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Essas informações serão usadas pela IA para responder aos clientes</li>
                    <li>Quando um cliente perguntar sobre horário, endereço ou entrega, a IA usará essas informações</li>
                    <li>O tipo de negócio define o tom e estilo das respostas da IA</li>
                    <li>Cada conta (cliente do seu SaaS) terá suas próprias configurações</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Groq AI Configuration Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Key className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Configuração da IA (Groq)</h2>
                  <p className="text-sm text-gray-600">Configure a chave de API do Groq para usar IA gratuita</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  API Key do Groq
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Obtenha sua chave gratuita em{' '}
                  <a 
                    href="https://console.groq.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 underline"
                  >
                    console.groq.com
                  </a>
                </p>
                <PasswordInput
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Sobre a Groq:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Production Systems 100% gratuitos (Developer Plan)</li>
                      <li>Rate limits: 200K TPM (Tokens/min) e 200 RPM (Requests/min)</li>
                      <li>Modelos: groq/compound ou groq/compound-mini</li>
                      <li>Detecta automaticamente se cliente quer comprar ou apenas prospectar</li>
                      <li>Gera respostas naturais e contextuais</li>
                      <li>A chave é armazenada apenas no servidor (variável de ambiente)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bot Configuration Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Configurações do Bot</h2>
                  <p className="text-sm text-gray-600">Configure o comportamento e mensagens do bot (opcional)</p>
                </div>
              </div>
              {saved && (
                <span className="text-sm text-green-600 font-medium">Salvo com sucesso!</span>
              )}
            </div>

            <div className="space-y-6">
              {/* Personalidade do Bot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bot className="w-4 h-4 inline mr-2" />
                  Personalidade do Bot
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Defina como o bot deve se comportar. Exemplos: "despojado", "totalmente social", "profissional", "amigável", "casual", "formal".
                  A IA lerá e seguirá essas instruções.
                </p>
                <input
                  type="text"
                  value={botConfig.botPersonality}
                  onChange={(e) => updateBotConfig('botPersonality', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: despojado, totalmente social, profissional, amigável"
                />
                <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-medium mb-1">Como funciona:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Se deixar em branco, o bot usará comportamento padrão (profissional e amigável)</li>
                      <li>A IA lerá essa personalidade e adaptará suas respostas</li>
                      <li>Exemplo: "despojado" → bot será mais casual e descontraído</li>
                      <li>Exemplo: "totalmente social" → bot será muito amigável e conversacional</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mensagem de Boas-Vindas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Mensagem de Boas-Vindas (Opcional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Mensagem enviada quando um cliente iniciar uma conversa. Se deixar em branco, a IA gerará automaticamente.
                </p>
                <textarea
                  value={botConfig.welcomeMessage}
                  onChange={(e) => updateBotConfig('welcomeMessage', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Deixe em branco para a IA gerar automaticamente"
                />
              </div>

              {/* Mensagem Padrão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Mensagem Padrão (Opcional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Mensagem enviada quando o bot não souber o que responder. Se deixar em branco, a IA gerará automaticamente.
                </p>
                <textarea
                  value={botConfig.defaultMessage}
                  onChange={(e) => updateBotConfig('defaultMessage', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Deixe em branco para a IA gerar automaticamente"
                />
              </div>

              {/* Mensagem de Transferência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserCheck className="w-4 h-4 inline mr-2" />
                  Mensagem de Transferência (Opcional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Mensagem enviada quando o bot transferir a conversa para um atendente humano. Se deixar em branco, usa mensagem padrão.
                </p>
                <textarea
                  value={botConfig.transferMessage}
                  onChange={(e) => updateBotConfig('transferMessage', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Deixe em branco para usar mensagem padrão"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transfer Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Palavras-chave para Transferir</h2>
                <p className="text-sm text-gray-600">Configure quando o bot deve transferir para um humano</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Palavras-chave de Transferência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Palavras-chave
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Se o cliente usar alguma dessas palavras, o bot transferirá automaticamente para um atendente.
                  O bot também transfere automaticamente se detectar que o cliente quer comprar.
                  Separe cada palavra por vírgula.
                </p>
                <input
                  type="text"
                  value={botConfig.transferKeywords.join(', ')}
                  onChange={(e) => updateBotConfig('transferKeywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="atendente, atendimento humano, falar com alguém"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {botConfig.transferKeywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Regras de transferência:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Bot transfere se cliente usar palavras-chave acima</li>
                      <li>Bot transfere se detectar que cliente quer comprar</li>
                      <li>Bot NÃO transfere apenas por prospecção (perguntas)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

