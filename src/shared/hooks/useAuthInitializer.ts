import { useEffect } from 'react';
import { useAuthStore } from '../../routes/auth/store';

/**
 * Hook para inicializar a autenticação ao carregar a aplicação
 */
export function useAuthInitializer() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
}
