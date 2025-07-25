import { AtmsService } from '../../shared/services';
import type { AtmsResponse } from './schema';

export interface AtmsLoaderData {
  atms: AtmsResponse;
}

export async function atmsLoader(): Promise<AtmsLoaderData> {
  try {
    // Carregar dados iniciais com parâmetros padrão
    const response = await AtmsService.findAll({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      order: 'desc',
    });

    return {
      atms: response,
    };
  } catch (error) {
    console.error('Erro no loader de ATMs:', error);

    // Em caso de erro, retornar dados vazios
    const mockData = {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    };

    // Se for desenvolvimento, retornar dados de exemplo
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      console.warn('Usando dados mock para ATMs em desenvolvimento');
    }

    return {
      atms: mockData,
    };
  }
}
