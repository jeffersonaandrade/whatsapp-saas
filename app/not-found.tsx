'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Ícone de erro */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-50"></div>
              <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Número do erro */}
          <h1 className="text-8xl md:text-9xl font-bold text-gray-900 mb-4">
            404
          </h1>
          
          {/* Título */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Página não encontrada
          </h2>
          
          {/* Descrição */}
          <p className="text-base md:text-lg text-gray-600 mb-8 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida para outro endereço.
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

          {/* Links úteis */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Ou acesse:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/login" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Login
              </Link>
              <Link href="/dashboard" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Dashboard
              </Link>
              <Link href="/settings" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Configurações
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

