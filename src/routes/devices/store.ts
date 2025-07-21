import { create } from 'zustand';
import { DeviceSchema, type Device } from './schema';

interface DevicesState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  addDevice: (device: Omit<Device, 'id'>) => void;
  removeDevice: (id: string) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  setDevices: (devices: Device[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data inicial
const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Sensor de Temperatura',
    type: 'sensor',
    status: 'active',
    location: 'Sala Principal',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Câmera de Segurança',
    type: 'camera',
    status: 'inactive',
    location: 'Entrada',
    lastUpdate: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Controle de Acesso',
    type: 'access-control',
    status: 'active',
    location: 'Portão Principal',
    lastUpdate: new Date().toISOString(),
  },
];

export const useDevicesStore = create<DevicesState>((set, get) => ({
  devices: mockDevices,
  isLoading: false,
  error: null,

  addDevice: (deviceData) => {
    try {
      const newDevice = DeviceSchema.parse({
        ...deviceData,
        id: Date.now().toString(),
        lastUpdate: new Date().toISOString(),
      });

      set((state) => ({
        devices: [...state.devices, newDevice],
        error: null,
      }));
    } catch {
      set({ error: 'Erro ao adicionar dispositivo: dados inválidos' });
    }
  },

  removeDevice: (id) => {
    set((state) => ({
      devices: state.devices.filter((device) => device.id !== id),
      error: null,
    }));
  },

  updateDevice: (id, deviceData) => {
    try {
      const currentDevice = get().devices.find((device) => device.id === id);
      if (!currentDevice) {
        set({ error: 'Dispositivo não encontrado' });
        return;
      }

      const updatedDevice = DeviceSchema.parse({
        ...currentDevice,
        ...deviceData,
        lastUpdate: new Date().toISOString(),
      });

      set((state) => ({
        devices: state.devices.map((device) =>
          device.id === id ? updatedDevice : device
        ),
        error: null,
      }));
    } catch {
      set({ error: 'Erro ao atualizar dispositivo: dados inválidos' });
    }
  },

  setDevices: (devices) => {
    try {
      const validatedDevices = devices.map((device) =>
        DeviceSchema.parse(device)
      );
      set({ devices: validatedDevices, error: null });
    } catch {
      set({ error: 'Erro ao carregar dispositivos: dados inválidos' });
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
