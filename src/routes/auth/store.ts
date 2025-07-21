import { create } from 'zustand';
import { authService, type UserProfile } from '../../shared/services';
import { TokenCookieManager } from '../../shared/utils';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  login: async (email: string, password: string, rememberMe = false) => {
    set({ isLoading: true, error: null });

    try {
      // Fazer login e obter tokens
      const loginResponse = await authService.login({
        email,
        password,
        rememberMe,
      });

      console.log('Login response:', loginResponse);

      // Salvar tokens nos cookies
      TokenCookieManager.setTokens(
        loginResponse.access_token,
        loginResponse.refresh_token,
        rememberMe
      );

      // Buscar perfil do usuário após login bem-sucedido
      const userProfile = await authService.getProfile();

      set({
        user: userProfile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Erro no login';

      set({
        isLoading: false,
        error: errorMessage,
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      // Tentar fazer logout na API (se o token ainda for válido)
      await authService.logout();
    } catch (error) {
      // Ignorar erros de logout na API (token pode estar expirado)
      console.warn('Erro ao fazer logout na API:', error);
    } finally {
      // Limpar tokens dos cookies
      TokenCookieManager.clearTokens();

      // Limpar o estado local
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });

    try {
      await authService.forgotPassword({ email });
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Erro ao enviar email de recuperação';

      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      await authService.resetPassword({
        token,
        password,
        confirmPassword: password,
      });
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error && typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : 'Erro ao redefinir senha';

      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  refreshTokens: async () => {
    const refreshToken = TokenCookieManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('Token de atualização não encontrado');
    }

    try {
      const response = await authService.refreshToken({
        refresh_token: refreshToken,
      });

      // Atualizar tokens nos cookies
      TokenCookieManager.updateAccessToken(response.access_token);

      // Se vier um novo refresh token, atualizar também
      if (response.refresh_token) {
        TokenCookieManager.setTokens(
          response.access_token,
          response.refresh_token,
          true
        );
      }
    } catch (error) {
      // Se falhar ao renovar tokens, fazer logout
      TokenCookieManager.clearTokens();
      set({
        user: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  initializeAuth: async () => {
    const currentState = useAuthStore.getState();

    // Se já foi inicializado ou está carregando, não fazer nada
    if (currentState.isInitialized || currentState.isLoading) {
      return;
    }

    // Verificar se há tokens salvos nos cookies
    if (TokenCookieManager.hasTokens()) {
      set({ isLoading: true });

      try {
        // Tentar obter o perfil do usuário para validar o token
        const userProfile = await authService.getProfile();

        set({
          user: userProfile,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      } catch {
        // Token inválido, limpar cookies
        TokenCookieManager.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
      }
    } else {
      // Não há tokens, marcar como inicializado
      set({
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  setError: (error: string | null) => set({ error }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  clearError: () => set({ error: null }),
}));
