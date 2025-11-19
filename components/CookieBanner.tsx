'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, Info } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const COOKIE_CONSENT_KEY = 'cookie-consent-lgpd';

interface CookieConsent {
  accepted: boolean;
  timestamp: number;
}

export default function CookieBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Só mostrar se o usuário estiver logado
    if (!user) {
      return;
    }

    // Verificar se já existe consentimento
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (!consent) {
      // Não há consentimento - mostrar banner
      setShowBanner(true);
      // Pequeno delay para animação
      setTimeout(() => setIsVisible(true), 100);
    } else {
      // Verificar se o consentimento é válido
      try {
        const consentData: CookieConsent = JSON.parse(consent);
        // Se foi recusado, não mostrar novamente
        // Se foi aceito, não mostrar novamente
        setShowBanner(false);
      } catch {
        // Erro ao parsear - mostrar novamente
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }
    }
  }, [user]);

  const handleAccept = () => {
    const consent: CookieConsent = {
      accepted: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  const handleReject = () => {
    const consent: CookieConsent = {
      accepted: false,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
    // Se recusou, pode fazer logout ou outras ações
    // Por enquanto, apenas esconde o banner
  };

  const handleClose = () => {
    // Fechar sem aceitar/recusar (não salva preferência)
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner || !user) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Conteúdo */}
            <div className="flex-1 flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Uso de Cookies - LGPD
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Utilizamos cookies para autenticação e melhorar sua experiência. 
                  Ao continuar navegando, você concorda com nossa{' '}
                  <Link 
                    href="/privacy" 
                    className="text-green-600 hover:text-green-700 underline font-medium"
                    target="_blank"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Info className="w-3 h-3" />
                  <span>
                    Cookies essenciais: autenticação (12h) | Cookies de preferências: salvas localmente
                  </span>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <button
                onClick={handleReject}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Recusar
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Aceitar
              </button>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

