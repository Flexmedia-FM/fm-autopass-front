import { create } from 'zustand';
import {
  UserSchema,
  type User,
  type CreateUser,
  type UserFilters,
  type UsersResponse,
} from './schema';
import { usersService } from '../../shared/services';

interface UsersState {
  users: User[];
  totalUsers: number;
  currentPage: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;

  // Actions
  setUsers: (response: UsersResponse) => void;
  loadUsers: (filters?: Partial<UserFilters>) => Promise<void>;
  refreshUsers: () => Promise<void>;
  addUser: (user: CreateUser) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const initialFilters: UserFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  totalUsers: 0,
  currentPage: 1,
  limit: 10,
  isLoading: false,
  error: null,
  filters: initialFilters,

  setUsers: (response) => {
    try {
      const validatedResponse = {
        data: response.data.map((user) => UserSchema.parse(user)),
        total: response.total,
        page: response.page,
        limit: response.limit,
      };

      set({
        users: validatedResponse.data,
        totalUsers: validatedResponse.total,
        currentPage: validatedResponse.page,
        limit: validatedResponse.limit,
        error: null,
      });
    } catch (error) {
      console.error('Erro ao validar dados de usuários:', error);
      set({ error: 'Erro ao carregar usuários: dados inválidos' });
    }
  },

  loadUsers: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const state = get();
      const mergedFilters = { ...state.filters, ...filters };

      const response = await usersService.getUsers(mergedFilters);
      get().setUsers(response);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Erro ao carregar usuários',
        users: [],
        totalUsers: 0,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshUsers: async () => {
    const state = get();
    await get().loadUsers(state.filters);
  },

  addUser: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      await usersService.createUser(userData);

      // Recarregar a lista após criar
      const state = get();
      await get().loadUsers(state.filters);
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Erro ao adicionar usuário',
        isLoading: false,
      });
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  },

  updateUser: async (id, userData) => {
    try {
      set({ isLoading: true, error: null });

      // Obter o usuário atual antes da atualização
      const currentUser = get().users.find((user) => user.id === id);
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }

      console.log('Atualizando usuário:', id);
      console.log('Dados atuais:', currentUser);
      console.log('Dados para atualização:', userData);

      // Atualização otimista: atualizar o usuário localmente primeiro
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, ...userData } : user
        ),
      }));

      // Fazer a chamada para a API
      const updatedUser = await usersService.updateUser(id, userData);

      console.log('Resposta da API:', updatedUser);

      // Se a resposta da API tem dados incompletos (especialmente para toggle de status),
      // manter os dados originais e apenas aplicar as mudanças específicas
      const safeMergedUser = {
        ...currentUser, // Dados originais como base
        ...userData, // Dados que queríamos alterar
        ...updatedUser, // Dados da resposta da API (apenas se completos)
        id: currentUser.id, // Garantir que o ID nunca seja perdido
        // Proteger campos críticos se vieram como null na resposta
        tenantId: updatedUser.tenantId || currentUser.tenantId,
        tenantName: updatedUser.tenantName || currentUser.tenantName,
        createdAt: updatedUser.createdAt || currentUser.createdAt,
      };

      // Atualizar com os dados mesclados de forma segura
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? safeMergedUser : user
        ),
        isLoading: false,
      }));

      console.log('Usuário após merge seguro:', safeMergedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      // Em caso de erro, recarregar os dados para reverter a mudança otimista
      const state = get();
      await get().loadUsers(state.filters);
      set({
        error:
          error instanceof Error ? error.message : 'Erro ao atualizar usuário',
        isLoading: false,
      });
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  },
  removeUser: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // Atualização otimista: remover o usuário localmente primeiro
      set((state) => ({
        users: state.users.filter((user) => user.id !== id),
        totalUsers: state.totalUsers - 1,
      }));

      await usersService.deleteUser(id);

      // Recarregar a lista para garantir consistência
      const state = get();
      await get().loadUsers(state.filters);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      // Em caso de erro, recarregar os dados para reverter a mudança otimista
      const state = get();
      await get().loadUsers(state.filters);
      set({
        error:
          error instanceof Error ? error.message : 'Erro ao excluir usuário',
        isLoading: false,
      });
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  },

  toggleUserStatus: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // Obter o usuário atual antes da atualização
      const currentUser = get().users.find((user) => user.id === id);
      if (!currentUser) {
        throw new Error('Usuário não encontrado');
      }

      const newStatus = !currentUser.isActive;

      console.log(
        `Toggle status para usuário ${id}: ${currentUser.isActive} -> ${newStatus}`
      );

      // Atualização otimista: alterar apenas o status localmente
      set((state) => ({
        users: state.users.map((user) =>
          user.id === id ? { ...user, isActive: newStatus } : user
        ),
      }));

      // Fazer a chamada para a API enviando apenas o campo isActive
      await usersService.updateUser(id, { isActive: newStatus });

      console.log('Status alterado com sucesso');

      // NÃO atualizar com a resposta da API para evitar perda de dados
      // A atualização otimista já foi feita e é confiável para este campo específico
      set({ isLoading: false });
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      // Em caso de erro, recarregar os dados para reverter a mudança otimista
      const state = get();
      await get().loadUsers(state.filters);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao alterar status do usuário',
        isLoading: false,
      });
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    // Recarregar dados quando filtros mudarem
    const state = get();
    get().loadUsers(state.filters);
  },

  clearFilters: () => {
    set({ filters: initialFilters });
  },

  setPage: (page) => {
    set((state) => ({
      currentPage: page,
      filters: { ...state.filters, page },
    }));
  },

  setLimit: (limit) => {
    set((state) => ({
      limit,
      filters: { ...state.filters, limit },
    }));
  },
}));
