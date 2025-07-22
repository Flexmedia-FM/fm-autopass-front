import { UsersResponseSchema, type UsersResponse } from './schema';
import { usersService } from '../../shared/services';

export interface UsersLoaderData {
  users: UsersResponse;
}

export async function usersLoader(): Promise<UsersLoaderData> {
  try {
    // Carregar dados iniciais com parâmetros padrão
    const response = await usersService.getUsers({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    // Validar resposta
    const validatedResponse = UsersResponseSchema.parse(response);

    return {
      users: validatedResponse,
    };
  } catch (error) {
    console.error('Erro no loader de usuários:', error);

    // Em caso de erro, tentar retornar dados mock para desenvolvimento
    const mockData = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };

    // Se for desenvolvimento, retornar dados de exemplo
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
      console.warn('Usando dados mock para usuários em desenvolvimento');
    }

    return {
      users: mockData,
    };
  }
}
