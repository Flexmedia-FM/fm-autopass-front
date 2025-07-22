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
    }
  },

  updateUser: async (id, userData) => {
    try {
      set({ isLoading: true, error: null });
      await usersService.updateUser(id, userData);

      // Recarregar a lista após atualizar
      const state = get();
      await get().loadUsers(state.filters);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Erro ao atualizar usuário',
        isLoading: false,
      });
    }
  },

  removeUser: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await usersService.deleteUser(id);

      // Recarregar a lista após excluir
      const state = get();
      await get().loadUsers(state.filters);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      set({
        error:
          error instanceof Error ? error.message : 'Erro ao excluir usuário',
        isLoading: false,
      });
    }
  },

  toggleUserStatus: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await usersService.toggleUserStatus(id);

      // Recarregar a lista após alterar status
      const state = get();
      await get().loadUsers(state.filters);
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao alterar status do usuário',
        isLoading: false,
      });
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
