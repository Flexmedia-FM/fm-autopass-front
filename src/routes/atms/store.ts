import { create } from 'zustand';
import { AtmsService } from '../../shared/services';
import type {
  Atm,
  AtmsResponse,
  CreateAtm,
  QueryAtmParams,
  UpdateAtm,
} from './schema';

interface AtmFilters extends QueryAtmParams {
  sortOrder?: 'asc' | 'desc';
}

interface AtmsState {
  atms: Atm[];
  totalAtms: number;
  currentPage: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  filters: AtmFilters;

  // Actions
  setAtms: (response: AtmsResponse) => void;
  loadAtms: (filters?: Partial<AtmFilters>) => Promise<void>;
  refreshAtms: () => Promise<void>;
  addAtm: (atm: CreateAtm) => Promise<void>;
  updateAtm: (id: string, atm: Partial<UpdateAtm>) => Promise<void>;
  removeAtm: (id: string) => Promise<void>;
  updateAtmStatus: (id: string, status: Atm['deviceStatus']) => Promise<void>;
  toggleAtmActive: (id: string, isActive: boolean) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<AtmFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const initialFilters: AtmFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useAtmsStore = create<AtmsState>((set, get) => ({
  atms: [],
  totalAtms: 0,
  currentPage: 1,
  limit: 20,
  isLoading: false,
  error: null,
  filters: initialFilters,

  setAtms: (response) => {
    try {
      set({
        atms: response.data,
        totalAtms: response.total,
        currentPage: response.page,
        limit: response.limit,
        error: null,
      });
    } catch (error) {
      console.error('Erro ao processar resposta de ATMs:', error);
      set({
        error: 'Erro ao processar dados de ATMs',
        atms: [],
        totalAtms: 0,
      });
    }
  },

  loadAtms: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });

      const currentState = get();
      const mergedFilters = { ...currentState.filters, ...filters };

      // Mapear sortOrder para order (compatibilidade com API)
      const apiFilters = {
        ...mergedFilters,
        order: mergedFilters.sortOrder,
      };
      delete apiFilters.sortOrder;

      const response = await AtmsService.findAll(apiFilters);

      get().setAtms(response);

      // Atualizar filtros se foram passados
      if (Object.keys(filters).length > 0) {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar ATMs:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao carregar ATMs';
      set({ error: errorMessage, atms: [], totalAtms: 0 });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshAtms: async () => {
    const state = get();
    await get().loadAtms(state.filters);
  },

  addAtm: async (atmData) => {
    try {
      set({ isLoading: true, error: null });

      const newAtm = await AtmsService.create(atmData);

      // Recarregar lista após criação
      await get().refreshAtms();

      console.log('ATM criado com sucesso:', newAtm);
    } catch (error) {
      console.error('Erro ao criar ATM:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao criar ATM';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAtm: async (id, atmData) => {
    try {
      set({ isLoading: true, error: null });

      const updatedAtm = await AtmsService.update(id, atmData);

      // Atualizar item na lista local
      set((state) => ({
        atms: state.atms.map((atm) => (atm.id === id ? updatedAtm : atm)),
        error: null,
      }));

      console.log('ATM atualizado com sucesso:', updatedAtm);
    } catch (error) {
      console.error('Erro ao atualizar ATM:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao atualizar ATM';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeAtm: async (id) => {
    try {
      set({ isLoading: true, error: null });

      await AtmsService.delete(id);

      // Remover item da lista local
      set((state) => ({
        atms: state.atms.filter((atm) => atm.id !== id),
        totalAtms: Math.max(0, state.totalAtms - 1),
        error: null,
      }));

      console.log('ATM removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover ATM:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao remover ATM';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAtmStatus: async (id, status) => {
    try {
      set({ isLoading: true, error: null });

      const updatedAtm = await AtmsService.updateStatus(id, status);

      // Atualizar item na lista local
      set((state) => ({
        atms: state.atms.map((atm) => (atm.id === id ? updatedAtm : atm)),
        error: null,
      }));

      console.log('Status do ATM atualizado com sucesso:', updatedAtm);
    } catch (error) {
      console.error('Erro ao atualizar status do ATM:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao atualizar status do ATM';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAtmActive: async (id, isActive) => {
    try {
      set({ isLoading: true, error: null });

      const updatedAtm = await AtmsService.toggleActive(id, isActive);

      // Atualizar item na lista local
      set((state) => ({
        atms: state.atms.map((atm) => (atm.id === id ? updatedAtm : atm)),
        error: null,
      }));

      console.log('Status ativo do ATM atualizado com sucesso:', updatedAtm);
    } catch (error) {
      console.error('Erro ao alterar status ativo do ATM:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao alterar status ativo do ATM';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isLoading: false });
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
    get().loadAtms(state.filters);
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().loadAtms(initialFilters);
  },

  setPage: (page) => {
    set((state) => ({
      currentPage: page,
      filters: { ...state.filters, page },
    }));
    get().loadAtms({ page });
  },

  setLimit: (limit) => {
    set((state) => ({
      limit,
      filters: { ...state.filters, limit, page: 1 }, // Reset para página 1
      currentPage: 1,
    }));
    get().loadAtms({ limit, page: 1 });
  },
}));
