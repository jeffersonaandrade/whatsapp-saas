'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ao acessar e usar o WhatsApp SaaS, você concorda em ficar vinculado a estes Termos de Uso e a todas as leis e regulamentos aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O WhatsApp SaaS é uma plataforma de atendimento via WhatsApp que permite:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Automatizar conversas com clientes através de bots inteligentes</li>
                <li>Gerenciar campanhas em grupos do WhatsApp</li>
                <li>Administrar equipes de atendimento</li>
                <li>Monitorar e analisar métricas de atendimento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Uso Aceitável</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Você concorda em usar o serviço apenas para fins legais e de acordo com estes Termos. Você não deve:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Usar o serviço para atividades ilegais ou não autorizadas</li>
                <li>Enviar spam ou mensagens não solicitadas</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Interferir ou interromper o funcionamento do serviço</li>
                <li>Acessar contas não autorizadas ou tentar obter acesso não autorizado</li>
                <li>Usar o serviço para enviar conteúdo ofensivo, difamatório ou prejudicial</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Conta do Usuário</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para usar certos recursos do serviço, você precisará criar uma conta. Você é responsável por:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4 ml-4">
                <li>Manter a confidencialidade de suas credenciais de acesso</li>
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades que ocorrem sob sua conta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Privacidade e Proteção de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                O uso de nossos serviços também é regido por nossa Política de Privacidade. Ao usar o serviço, você concorda com a coleta e uso de informações de acordo com nossa Política de Privacidade.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Propriedade Intelectual</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Todo o conteúdo presente no serviço, incluindo mas não limitado a textos, gráficos, logos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade da empresa ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Em nenhuma circunstância seremos responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso, boa vontade ou outras perdas intangíveis, resultantes do uso ou incapacidade de usar o serviço.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Modificações dos Termos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Reservamo-nos o direito de modificar estes Termos a qualquer momento. Se fizermos alterações materiais, notificaremos você por e-mail ou através de um aviso em nosso serviço. O uso continuado do serviço após tais modificações constitui sua aceitação dos novos termos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Rescisão</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podemos encerrar ou suspender sua conta e acesso ao serviço imediatamente, sem aviso prévio, por qualquer motivo, incluindo, sem limitação, violação destes Termos de Uso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Lei Aplicável</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus conflitos de disposições legais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Contato</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco através do e-mail: <a href="mailto:contato@whatsappsaas.com" className="text-green-600 hover:text-green-700">contato@whatsappsaas.com</a>
              </p>
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

