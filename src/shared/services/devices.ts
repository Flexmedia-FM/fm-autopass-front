import { z } from 'zod';
import { apiService } from './api';

// Enum para status do dispositivo (baseado no DTO)
export const DeviceStatusEnum = z.enum([
  'NOT_INSTALLED',
  'INSTALLED',
  'ACTIVE',
  'INACTIVE',
  'MAINTENANCE',
  'DECOMMISSIONED',
]);

// Schemas Zod para validação
export const DeviceSchema = z.object({
  id: z.string(),
  serialNumber: z
    .string()
    .min(6, 'Número de série deve ter pelo menos 6 caracteres'),
  code: z.string().optional(),
  atmId: z.string().nullable(), // Pode ser null
  tenantId: z.string(),
  status: DeviceStatusEnum,
  statusLabel: z.string().optional(), // Campo adicional da API
  installationDate: z.iso.datetime({ local: true }).optional(),
  lastMaintenanceDate: z.iso.datetime({ local: true }).optional(),
  notes: z.string().optional(),
  createdAt: z.iso.datetime({ local: true }),
  updatedAt: z.iso.datetime({ local: true }),
  // Relacionamentos
  atm: z
    .object({
      // id: z.string(),
      // name: z.string(),
      code: z.string().optional(),
    })
    .optional()
    .nullable(),
  tenant: z
    .object({
      id: z.string(),
      // name: z.string(),
      // fantasyName: z.string(),
    })
    .optional(),
});

export const CreateDeviceSchema = DeviceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  atm: true,
  tenant: true,
});

export const UpdateDeviceSchema = CreateDeviceSchema.partial();

export const QueryDeviceSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z
    .enum(['createdAt', 'serialNumber', 'status', 'installationDate'])
    .optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  atmId: z.string().optional(),
  status: DeviceStatusEnum.optional(),
});

// Tipos TypeScript
export type Device = z.infer<typeof DeviceSchema>;
export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;
export type QueryDeviceParams = z.infer<typeof QueryDeviceSchema>;
export type DeviceStatus = z.infer<typeof DeviceStatusEnum>;

export interface DevicesResponse {
  data: Device[];
  total: number;
  page: number;
  limit: number;
  // totalPages: number;
}

// Mapeamento de status para português
export const DeviceStatusLabels: Record<DeviceStatus, string> = {
  NOT_INSTALLED: 'Não Instalado',
  INSTALLED: 'Instalado',
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  MAINTENANCE: 'Em Manutenção',
  DECOMMISSIONED: 'Descomissionado',
};

// Mapeamento de status para cores do Material-UI
export const DeviceStatusColors: Record<
  DeviceStatus,
  'success' | 'error' | 'warning' | 'default'
> = {
  NOT_INSTALLED: 'default',
  INSTALLED: 'default',
  ACTIVE: 'success',
  INACTIVE: 'error',
  MAINTENANCE: 'warning',
  DECOMMISSIONED: 'error',
};

// Serviço para dispositivos
export class DevicesService {
  /**
   * Buscar todos os dispositivos com filtros
   */
  static async findAll(params?: QueryDeviceParams): Promise<DevicesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.atmId) searchParams.append('atmId', params.atmId);
    if (params?.status) searchParams.append('status', params.status);

    const url = `/devices${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiService.get<DevicesResponse>(url);

    // Validar dados com Zod
    const validatedData = {
      ...response,
      data: response.data.map((device: unknown) => DeviceSchema.parse(device)),
    };

    return validatedData;
  }

  /**
   * Buscar dispositivo por ID
   */
  static async findById(id: string): Promise<Device> {
    const response = await apiService.get<Device>(`/devices/${id}`);
    return DeviceSchema.parse(response);
  }

  /**
   * Criar novo dispositivo
   */
  static async create(deviceData: CreateDevice): Promise<Device> {
    // Validar dados antes de enviar
    const validatedData = CreateDeviceSchema.parse(deviceData);
    const response = await apiService.post<Device>('/devices', validatedData);
    return DeviceSchema.parse(response);
  }

  /**
   * Atualizar dispositivo
   */
  static async update(id: string, deviceData: UpdateDevice): Promise<Device> {
    // Validar dados antes de enviar
    const validatedData = UpdateDeviceSchema.parse(deviceData);
    const response = await apiService.patch<Device>(
      `/devices/${id}`,
      validatedData
    );
    return DeviceSchema.parse(response);
  }

  /**
   * Excluir dispositivo
   */
  static async delete(id: string): Promise<void> {
    await apiService.delete(`/devices/${id}`);
  }

  /**
   * Buscar dispositivos por ATM
   */
  static async findByAtm(
    atmId: string,
    params?: QueryDeviceParams
  ): Promise<DevicesResponse> {
    const queryParams = { ...params, atmId };
    return this.findAll(queryParams);
  }

  /**
   * Buscar dispositivos por status
   */
  static async findByStatus(
    status: DeviceStatus,
    params?: QueryDeviceParams
  ): Promise<DevicesResponse> {
    const queryParams = { ...params, status };
    return this.findAll(queryParams);
  }

  /**
   * Atualizar status do dispositivo
   */
  static async updateStatus(id: string, status: DeviceStatus): Promise<Device> {
    return this.update(id, { status });
  }

  /**
   * Registrar manutenção do dispositivo
   */
  static async recordMaintenance(id: string, notes?: string): Promise<Device> {
    return this.update(id, {
      status: 'MAINTENANCE',
      lastMaintenanceDate: new Date().toISOString(),
      notes,
    });
  }

  /**
   * Marcar dispositivo como instalado
   */
  static async markAsInstalled(id: string): Promise<Device> {
    return this.update(id, {
      status: 'INSTALLED',
      installationDate: new Date().toISOString(),
    });
  }

  /**
   * Ativar dispositivo
   */
  static async activate(id: string): Promise<Device> {
    return this.update(id, { status: 'ACTIVE' });
  }

  /**
   * Desativar dispositivo
   */
  static async deactivate(id: string): Promise<Device> {
    return this.update(id, { status: 'INACTIVE' });
  }

  /**
   * Descomissionar dispositivo
   */
  static async decommission(id: string): Promise<Device> {
    return this.update(id, { status: 'DECOMMISSIONED' });
  }

  /**
   * Buscar dispositivos com necessidade de manutenção
   */
  static async findMaintenanceRequired(
    params?: QueryDeviceParams
  ): Promise<DevicesResponse> {
    const queryParams = { ...params, status: 'MAINTENANCE' as DeviceStatus };
    return this.findAll(queryParams);
  }

  /**
   * Obter estatísticas dos dispositivos
   */
  static async getStatistics(): Promise<{
    total: number;
    byStatus: Record<DeviceStatus, number>;
  }> {
    const response = await apiService.get<{
      total: number;
      byStatus: Record<DeviceStatus, number>;
    }>('/devices/statistics');

    return response;
  }
}

export const devicesService = DevicesService;
