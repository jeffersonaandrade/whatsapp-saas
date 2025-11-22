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
    // Verificar sessão ao carregar
    checkSession();

    // Verificar sessão periodicamente (a cada 5 minutos)
    const interval = setInterval(() => {
      checkSession();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  const checkSession = async () => {
    try {
      // Verificar sessão via API local (porta 3000)
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else if (data.expired) {
          // Sessão expirada - limpar estado local
          setUser(null);
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Chamar API local (porta 3000) para login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Cookie já foi definido pelo servidor (httpOnly)
      // Apenas atualizar estado local
      setUser(data.user);
      
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
      
      // Chamar API local (porta 3000) para cadastro
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar conta');
      }

      // Cookie já foi definido pelo servidor (httpOnly)
      // Apenas atualizar estado local
      setUser(data.user);
      
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
      // Chamar API local (porta 3000) para logout
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Não lançar erro, apenas fazer logout local
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
