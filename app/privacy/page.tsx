'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    // Renderizar data apenas no cliente para evitar erro de hidratação
    setLastUpdate(new Date().toLocaleDateString('pt-BR'));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-green-600 hover:text-green-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para login
          </Link>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
              {lastUpdate && (
                <p className="text-sm text-gray-600 mt-1">Última atualização: {lastUpdate}</p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introdução</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você usa o WhatsApp SaaS. Estamos comprometidos em proteger sua privacidade e garantir a segurança de seus dados pessoais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Informações que Coletamos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Coletamos as seguintes informações quando você usa nosso serviço:
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2.1. Informações de Conta</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Nome da empresa</li>
                <li>Senha (criptografada)</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2.2. Informações de Uso</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Logs de acesso e atividade</li>
                <li>Informações sobre como você interage com o serviço</li>
                <li>Métricas de uso e desempenho</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2.3. Informações de Mensagens</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Conteúdo das mensagens enviadas e recebidas através do WhatsApp</li>
                <li>Informações de contatos e conversas</li>
                <li>Dados de campanhas e grupos</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2.4. Informações Técnicas</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Endereço IP</li>
                <li>Tipo de navegador e sistema operacional</li>
                <li>Data e hora de acesso</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Como Usamos suas Informações</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Usamos as informações coletadas para:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Fornecer, manter e melhorar nossos serviços</li>
                <li>Processar suas transações e gerenciar sua conta</li>
                <li>Enviar notificações importantes sobre o serviço</li>
                <li>Responder a suas solicitações e fornecer suporte ao cliente</li>
                <li>Detectar e prevenir fraudes e atividades não autorizadas</li>
                <li>Cumprir obrigações legais e regulamentares</li>
                <li>Analisar e melhorar a experiência do usuário</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Prestadores de Serviços:</strong> Com empresas que nos ajudam a operar nosso serviço (como hospedagem, análise de dados, processamento de pagamentos)</li>
                <li><strong>Obrigações Legais:</strong> Quando exigido por lei ou em resposta a processos legais válidos</li>
                <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos, propriedade ou segurança, ou dos nossos usuários</li>
                <li><strong>Com seu Consentimento:</strong> Com seu consentimento explícito em outras situações</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Segurança dos Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controles de acesso rigorosos</li>
                <li>Monitoramento regular de segurança</li>
                <li>Backups regulares dos dados</li>
                <li>Treinamento de pessoal em práticas de segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Retenção de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta Política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Seus Direitos (LGPD)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li><strong>Acesso:</strong> Solicitar acesso às suas informações pessoais</li>
                <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de suas informações pessoais</li>
                <li><strong>Portabilidade:</strong> Solicitar a portabilidade dos seus dados</li>
                <li><strong>Revogação:</strong> Revogar seu consentimento a qualquer momento</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de suas informações pessoais</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para exercer esses direitos, entre em contato conosco através do e-mail: <a href="mailto:privacidade@whatsappsaas.com" className="text-green-600 hover:text-green-700">privacidade@whatsappsaas.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Usamos cookies e tecnologias similares para coletar informações sobre como você usa nosso serviço. Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Alterações nesta Política</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas publicando a nova Política nesta página e atualizando a data de "Última atualização".
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contato</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos suas informações pessoais, entre em contato conosco:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-gray-700 mb-2">
                  <strong>E-mail:</strong> <a href="mailto:privacidade@whatsappsaas.com" className="text-green-600 hover:text-green-700">privacidade@whatsappsaas.com</a>
                </p>
                <p className="text-gray-700">
                  <strong>Encarregado de Dados (DPO):</strong> <a href="mailto:dpo@whatsappsaas.com" className="text-green-600 hover:text-green-700">dpo@whatsappsaas.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
}

