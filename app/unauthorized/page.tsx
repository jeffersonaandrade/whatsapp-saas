import Link from 'next/link';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

export default function UnauthorizedPage() {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-6xl font-bold text-gray-900">403</h1>
            <div className="mt-4 inline-block w-24 h-1 bg-red-600"></div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h2>
          
          <p className="text-lg text-gray-600 mb-2">
            Você não tem permissão para acessar esta página.
          </p>
          
          <p className="text-sm text-gray-500 mb-8">
            Entre em contato com o administrador se você acredita que deveria ter acesso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir para Dashboard
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

