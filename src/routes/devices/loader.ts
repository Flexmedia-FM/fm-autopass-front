import { DeviceSchema } from './schema';
import { useDevicesStore } from './store';

export interface DevicesLoaderData {
  devices: Array<ReturnType<typeof DeviceSchema.parse>>;
}

export async function devicesLoader(): Promise<DevicesLoaderData> {
  // Simular uma chamada API
  try {
    // Em um app real, isso seria uma chamada fetch para sua API
    const mockApiResponse = [
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

    // Validar dados com Zod
    const validatedDevices = mockApiResponse.map((device) =>
      DeviceSchema.parse(device)
    );

    // Atualizar o store do Zustand
    useDevicesStore.getState().setDevices(validatedDevices);

    return {
      devices: validatedDevices,
    };
  } catch (error) {
    console.error('Erro ao carregar dispositivos:', error);
    throw new Response('Erro ao carregar dispositivos', { status: 500 });
  }
}
