import { DashboardStatsSchema } from './schema';
import { useDashboardStore } from './store';

export interface DashboardLoaderData {
  stats: ReturnType<typeof DashboardStatsSchema.parse>;
}

export async function dashboardLoader(): Promise<DashboardLoaderData> {
  try {
    // Simular uma chamada API para buscar estatísticas
    const mockApiResponse = {
      totalDevices: 3,
      activeDevices: 2,
      inactiveDevices: 1,
      maintenanceDevices: 0,
    };

    // Validar dados com Zod
    const validatedStats = DashboardStatsSchema.parse(mockApiResponse);

    // Atualizar o store do Zustand
    useDashboardStore.getState().setStats({
      totalDevices: validatedStats.totalDevices,
      activeDevices: validatedStats.activeDevices,
    });

    return {
      stats: validatedStats,
    };
  } catch (error) {
    console.error('Erro ao carregar estatísticas do dashboard:', error);
    throw new Response('Erro ao carregar dashboard', { status: 500 });
  }
}
