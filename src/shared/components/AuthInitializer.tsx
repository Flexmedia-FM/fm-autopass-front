import { useAuthInitializer } from '../hooks/useAuthInitializer';
import { useAuthStore } from '../../routes/auth/store';
import { AppLoadingScreen } from './AppLoadingScreen';

/**
 * Componente para inicializar a autenticação
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInitializer();

  const { isInitialized, isLoading } = useAuthStore();

  // Mostrar loading enquanto a autenticação está sendo inicializada
  if (!isInitialized || isLoading) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}
