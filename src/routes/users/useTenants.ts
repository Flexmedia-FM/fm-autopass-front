import { useState, useEffect } from 'react';
import { TenantsService } from '../../shared/services';

interface TenantOption {
  id: string;
  name: string;
  fantasyName: string;
  displayName: string;
}

export function useTenants() {
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await TenantsService.findAllSimple();

      const tenantOptions: TenantOption[] = data.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        fantasyName: tenant.fantasyName,
        displayName: `${tenant.fantasyName} (${tenant.name})`,
      }));

      setTenants(tenantOptions);
    } catch (err) {
      console.error('Erro ao carregar organizações:', err);
      setError('Erro ao carregar organizações');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tenants,
    isLoading,
    error,
    reload: loadTenants,
  };
}
