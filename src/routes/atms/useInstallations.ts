import { useState, useEffect, useCallback } from 'react';
import { InstallationsService } from '../../shared/services';
import { ZodErrorHandler } from '../../shared/utils/zodErrorHandler';
import { ZodError } from 'zod';

export interface Installation {
  id: string;
  name: string;
  code?: string;
}

interface UseInstallationsOptions {
  tenantId?: string;
  autoLoad?: boolean;
}

export function useInstallations(options: UseInstallationsOptions = {}) {
  const { tenantId, autoLoad = true } = options;
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstallations = useCallback(
    async (forceReload = false) => {
      if (isLoading && !forceReload) return;

      try {
        setIsLoading(true);
        setError(null);

        let response: Installation[];
        console.log('tenantId:', tenantId);
        if (tenantId) {
          console.log('Carregando instalações para o tenant:', tenantId);
          // Se tenantId estiver definido, busca as instalações associadas a ele
          try {
            console.log('entrada no try');
            const result = await InstallationsService.findByTenant(tenantId, {
              limit: 100,
            });
            console.log('Instalações carregadas:', result);
            response = result.data.map((installation) => ({
              id: installation.id,
              name: installation.name,
              code: installation.code,
            }));
            console.log('Instalações após mapeamento:', response);
            setInstallations(response);
          } catch (error) {
            const handled = ZodErrorHandler.handleError(error);
            if (handled.isZodError) {
              console.error(
                'ZodError detectado:',
                ZodErrorHandler.formatForLog(handled.originalError as ZodError)
              );
              setError(`Erro de validação: ${handled.message}`);
            }
          }
        } else {
          console.log('passei no findAllSimple');
          const result = await InstallationsService.findAllSimple();
          console.log('Instalações simplificadas carregadas:', result);
          response = result.data;
        }
      } catch (err) {
        console.error('Erro ao carregar instalações:', err);

        const handled = ZodErrorHandler.handleError(err);

        if (handled.isZodError) {
          console.log(
            'ZodError detectado:',
            ZodErrorHandler.formatForLog(handled.originalError as ZodError)
          );
          setError(`Erro de validação: ${handled.message}`);
        } else {
          setError(handled.message);
        }

        setInstallations([]);
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId]
  );

  useEffect(() => {
    if (autoLoad) {
      loadInstallations();
    }
  }, [autoLoad, loadInstallations]);

  const refreshInstallations = useCallback(
    () => loadInstallations(true),
    [loadInstallations]
  );

  return {
    installations,
    isLoading,
    error,
    loadInstallations,
    refreshInstallations,
  };
}
