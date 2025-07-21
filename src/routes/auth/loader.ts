import { redirect } from 'react-router-dom';
import { useAuthStore } from './store';
import { TokenCookieManager } from '../../shared/utils';

export interface AuthLoaderData {
  isAuthenticated: boolean;
}

// Função para aguardar a inicialização da autenticação
async function ensureAuthInitialized(): Promise<boolean> {
  const store = useAuthStore.getState();

  // Se já foi inicializado, retorna o estado atual
  if (store.isInitialized) {
    return store.isAuthenticated;
  }

  // Se há tokens nos cookies, inicializar autenticação
  if (TokenCookieManager.hasTokens()) {
    try {
      await store.initializeAuth();
      return useAuthStore.getState().isAuthenticated;
    } catch (error) {
      console.error('Erro na inicialização da autenticação:', error);
      return false;
    }
  }

  // Não há tokens, marcar como inicializado
  const { initializeAuth } = store;
  await initializeAuth();
  return false;
}

// Loader para rotas de autenticação (login, forgot-password)
// Redireciona para dashboard se já estiver autenticado
export async function authLoader(): Promise<AuthLoaderData | Response> {
  const isAuthenticated = await ensureAuthInitialized();

  if (isAuthenticated) {
    return redirect('/dashboard');
  }

  return {
    isAuthenticated,
  };
}

// Loader para rotas protegidas
// Redireciona para login se não estiver autenticado
export async function protectedLoader(): Promise<AuthLoaderData | Response> {
  const isAuthenticated = await ensureAuthInitialized();

  if (!isAuthenticated) {
    return redirect('/auth/login');
  }

  return {
    isAuthenticated,
  };
}
