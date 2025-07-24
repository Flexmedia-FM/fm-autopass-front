import { DevicesService } from '../../shared/services';
import type { DevicesLoaderData } from './index';

export async function devicesLoader(): Promise<DevicesLoaderData> {
  try {
    // Buscar dispositivos reais da API
    const devicesResponse = await DevicesService.findAll({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      order: 'desc',
    });

    return {
      devices: devicesResponse,
    };
  } catch (error) {
    console.error('Erro ao carregar dispositivos:', error);
    // faça o debug do erro considerando que é um zodError
    if (error instanceof Error) {
      console.error('Erro específico:', error.message);
    } else {
      console.error('Erro desconhecido:', error);
    }

    // Retornar dados vazios em caso de erro
    return {
      devices: {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
        // totalPages: 0,
      },
    };
  }
}
