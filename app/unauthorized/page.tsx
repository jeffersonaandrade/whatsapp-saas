'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Home, Lock } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            {/* Ícone de erro */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-50"></div>
                <div className="relative w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                  <Lock className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            {/* Número do erro */}
            <h1 className="text-8xl md:text-9xl font-bold text-gray-900 mb-4">
              403
            </h1>
            
            {/* Título */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Acesso Negado
            </h2>
            
            {/* Descrição */}
            <p className="text-base md:text-lg text-gray-600 mb-2">
              Você não tem permissão para acessar esta página.
            </p>
            
            <p className="text-sm text-gray-500 mb-8">
              Entre em contato com o administrador se você acredita que deveria ter acesso.
            </p>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
              >
                <Home className="w-5 h-5 mr-2" />
                Ir para Dashboard
              </Link>
              
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </button>
            </div>

            {/* Informações adicionais */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-start gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Precisa de acesso?
                  </p>
                  <p className="text-xs text-yellow-700">
                    Entre em contato com o administrador do sistema para solicitar permissões.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
