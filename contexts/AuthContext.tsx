'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent';
  accountId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // TODO: Verificar se há sessão ativa no Supabase
    // Por enquanto, simula verificação de sessão
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // TODO: Implementar verificação real com Supabase
      // const { data: { session } } = await supabase.auth.getSession()
      
      // Simulação: verifica se há um usuário no localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // TODO: Implementar login real com Supabase
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // })
      
      // Simulação de login (REMOVER quando conectar ao Supabase)
      // Credenciais mockadas para teste:
      // - Email: admin@test.com / Senha: admin123
      // - Email: agente@test.com / Senha: agente123
      // - Qualquer outro email/senha também funciona (modo de desenvolvimento)
      
      const mockCredentials = [
        { email: 'admin@test.com', password: 'admin123', name: 'Administrador', role: 'admin' as const },
        { email: 'agente@test.com', password: 'agente123', name: 'Agente de Vendas', role: 'agent' as const },
      ];
      
      const credential = mockCredentials.find(c => c.email === email && c.password === password);
      
      // Se não encontrar credenciais específicas, permite login com qualquer email/senha (modo dev)
      const mockUser: User = {
        id: credential ? '1' : Date.now().toString(),
        name: credential ? credential.name : 'Usuário Teste',
        email: email,
        role: credential ? credential.role : 'admin',
        accountId: 'account-1',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string, companyName: string) => {
    try {
      setLoading(true);
      
      // TODO: Implementar cadastro real com Supabase
      // 1. Criar conta no Supabase Auth
      // 2. Criar registro na tabela 'accounts'
      // 3. Criar primeiro usuário admin na tabela 'users'
      
      // Simulação de cadastro (REMOVER quando conectar ao Supabase)
      const mockUser: User = {
        id: '1',
        name: name,
        email: email,
        role: 'admin',
        accountId: 'new-account-1',
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // TODO: Implementar logout real com Supabase
      // await supabase.auth.signOut()
      
      setUser(null);
      localStorage.removeItem('user');
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
