import { create } from 'zustand';

interface DashboardState {
  totalDevices: number;
  activeDevices: number;
  alerts: Array<{
    id: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
    timestamp: string;
  }>;
  setStats: (stats: { totalDevices: number; activeDevices: number }) => void;
  addAlert: (
    alert: Omit<DashboardState['alerts'][0], 'id' | 'timestamp'>
  ) => void;
  removeAlert: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  totalDevices: 3,
  activeDevices: 2,
  alerts: [
    {
      id: '1',
      message: 'Sistema funcionando normalmente',
      severity: 'info',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      message: 'Câmera de segurança offline',
      severity: 'warning',
      timestamp: new Date().toISOString(),
    },
  ],

  setStats: (stats) => set(stats),

  addAlert: (alertData) =>
    set((state) => ({
      alerts: [
        {
          ...alertData,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        },
        ...state.alerts,
      ],
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),
}));
