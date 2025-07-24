import { create } from 'zustand';
import {
  type Device,
  type CreateDevice,
  type DevicesResponse,
  DevicesService,
} from '../../shared/services';

// Definindo o tipo de filtros localmente, já que é específico da UI
interface DeviceFilters {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'serialNumber' | 'status' | 'installationDate';
  sortOrder?: 'asc' | 'desc';
  status?: Device['status'];
  atmId?: string;
}

interface DevicesState {
  devices: Device[];
  totalDevices: number;
  currentPage: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  filters: DeviceFilters;

  // Actions
  setDevices: (response: DevicesResponse) => void;
  loadDevices: (filters?: Partial<DeviceFilters>) => Promise<void>;
  refreshDevices: () => Promise<void>;
  addDevice: (device: CreateDevice) => Promise<void>;
  updateDevice: (id: string, device: Partial<Device>) => Promise<void>;
  removeDevice: (id: string) => Promise<void>;
  updateDeviceStatus: (id: string, status: Device['status']) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<DeviceFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const initialFilters: DeviceFilters = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: [],
  totalDevices: 0,
  currentPage: 1,
  limit: 20,
  isLoading: false,
  error: null,
  filters: initialFilters,

  setDevices: (response) => {
    set({
      devices: response.data,
      totalDevices: response.total,
      currentPage: response.page,
      limit: response.limit,
      error: null,
    });
  },

  loadDevices: async (newFilters = {}) => {
    const state = get();
    const filters = { ...state.filters, ...newFilters };

    try {
      set({ isLoading: true, error: null, filters });

      const response = await DevicesService.findAll({
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        order: filters.sortOrder,
        search: filters.search,
        status: filters.status,
        atmId: filters.atmId,
      });
      console.log('Dispositivos carregados:', response);

      state.setDevices(response);
    } catch (error) {
      console.error('Erro ao carregar dispositivos:', error);
      const zodError =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.log(zodError);
      set({ error: 'Erro ao carregar dispositivos' });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshDevices: async () => {
    const state = get();
    await state.loadDevices(state.filters);
  },

  addDevice: async (deviceData) => {
    try {
      set({ isLoading: true, error: null });

      const newDevice = await DevicesService.create(deviceData);

      set((state) => ({
        devices: [newDevice, ...state.devices],
        totalDevices: state.totalDevices + 1,
        isLoading: false,
      }));

      // Recarregar para garantir sincronização
      await get().refreshDevices();
    } catch (error) {
      console.error('Erro ao adicionar dispositivo:', error);
      set({
        error: 'Erro ao adicionar dispositivo',
        isLoading: false,
      });
    }
  },

  updateDevice: async (id, deviceData) => {
    try {
      set({ isLoading: true, error: null });

      const updatedDevice = await DevicesService.update(id, deviceData);

      set((state) => ({
        devices: state.devices.map((device) =>
          device.id === id ? updatedDevice : device
        ),
        isLoading: false,
      }));

      // Recarregar para garantir sincronização
      await get().refreshDevices();
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
      set({
        error: 'Erro ao atualizar dispositivo',
        isLoading: false,
      });
    }
  },

  removeDevice: async (id) => {
    try {
      set({ isLoading: true, error: null });

      await DevicesService.delete(id);

      set((state) => ({
        devices: state.devices.filter((device) => device.id !== id),
        totalDevices: state.totalDevices - 1,
        isLoading: false,
      }));

      // Recarregar para garantir sincronização
      await get().refreshDevices();
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error);
      set({
        error: 'Erro ao excluir dispositivo',
        isLoading: false,
      });
    }
  },

  updateDeviceStatus: async (id, status) => {
    try {
      set({ isLoading: true, error: null });

      const updatedDevice = await DevicesService.updateStatus(id, status);

      set((state) => ({
        devices: state.devices.map((device) =>
          device.id === id ? updatedDevice : device
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Erro ao atualizar status do dispositivo:', error);
      set({
        error: 'Erro ao atualizar status do dispositivo',
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
