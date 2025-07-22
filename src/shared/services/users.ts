import { apiService } from './api';
import type {
  User,
  CreateUser,
  UpdateUser,
  UserFilters,
  UsersResponse,
} from '../../routes/users/schema';

export class UsersService {
  /**
   * Buscar todos os usuários com filtros
   */
  async getUsers(filters: Partial<UserFilters> = {}): Promise<UsersResponse> {
    const params = new URLSearchParams();

    // Adicionar parâmetros de filtro
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('order', filters.sortOrder);
    if (filters.search) params.append('search', filters.search);
    if (filters.userRole) params.append('userRole', filters.userRole);
    if (filters.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());
    if (filters.tenantId) params.append('tenantId', filters.tenantId);

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    return apiService.get<UsersResponse>(url);
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`/users/${id}`);
  }

  /**
   * Criar novo usuário
   */
  async createUser(userData: CreateUser): Promise<User> {
    return apiService.post<User>('/users', userData);
  }

  /**
   * Atualizar usuário
   */
  async updateUser(id: string, userData: Partial<UpdateUser>): Promise<User> {
    return apiService.put<User>(`/users/${id}`, userData);
  }

  /**
   * Excluir usuário
   */
  async deleteUser(id: string): Promise<void> {
    return apiService.delete(`/users/${id}`);
  }

  /**
   * Alterar status do usuário (ativar/desativar)
   */
  async toggleUserStatus(id: string): Promise<User> {
    return apiService.patch<User>(`/users/${id}/toggle-status`);
  }

  /**
   * Reset de senha do usuário
   */
  async resetPassword(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/users/reset-password', {
      email,
    });
  }

  /**
   * Alterar senha do usuário
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/users/change-password', data);
  }
}

export const usersService = new UsersService();
