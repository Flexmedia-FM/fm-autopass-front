import { useState, useEffect, useCallback } from 'react';
import { AtmsService, type Atm } from '../../shared/services';

interface UseAtmsOptions {
  tenantId?: string;
  autoLoad?: boolean;
}

export function useAtms(options: UseAtmsOptions = {}) {
  const { tenantId, autoLoad = true } = options;
  const [atms, setAtms] = useState<Atm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAtms = useCallback(
    async (forceReload = false) => {
      if (isLoading && !forceReload) return;

      try {
        setIsLoading(true);
        setError(null);

        let response: Atm[];
        if (tenantId) {
          response = await AtmsService.findActiveByTenant(tenantId);
        } else {
          const result = await AtmsService.findAll({
            isActive: true,
            status: 'ACTIVE',
            limit: 100,
          });
          response = result.data;
        }

        setAtms(response);
      } catch (err) {
        console.error('Erro ao carregar ATMs:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar ATMs';
        setError(errorMessage);
        setAtms([]);
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, isLoading]
  );

  useEffect(() => {
    if (autoLoad) {
      loadAtms();
    }
  }, [autoLoad, loadAtms]);

  const refreshAtms = useCallback(() => loadAtms(true), [loadAtms]);

  return {
    atms,
    isLoading,
    error,
    loadAtms,
    refreshAtms,
  };
}
