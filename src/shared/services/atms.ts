import { z } from 'zod';
import { apiService } from './api';

// Schema para ATM (caixa eletrônico)
export const AtmSchema = z.object({
  id: z.string(),
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  location: z.string().optional(),
  address: z.string().optional(),
  tenantId: z.string(),
  installationId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Relacionamentos opcionais
  tenant: z
    .object({
      id: z.string(),
      name: z.string(),
      fantasyName: z.string().optional(),
    })
    .optional(),
  installation: z
    .object({
      // id: z.string(),
      // name: z.string(),
      code: z.string(),
    })
    .optional(),
});

export const CreateAtmSchema = AtmSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenant: true,
  installation: true,
});

export const UpdateAtmSchema = CreateAtmSchema.partial();

export const QueryAtmSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'code', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  tenantId: z.string().optional(),
  installationId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).optional(),
  isActive: z.boolean().optional(),
});

// Tipos TypeScript
export type Atm = z.infer<typeof AtmSchema>;
export type CreateAtm = z.infer<typeof CreateAtmSchema>;
export type UpdateAtm = z.infer<typeof UpdateAtmSchema>;
export type QueryAtmParams = z.infer<typeof QueryAtmSchema>;
export type AtmStatus = z.infer<typeof AtmSchema>['status'];

export interface AtmsResponse {
  data: Atm[];
  total: number;
  page: number;
  limit: number;
}

// Mapeamento de status para português
export const AtmStatusLabels: Record<AtmStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  MAINTENANCE: 'Em Manutenção',
};

// Mapeamento de status para cores do Material-UI
export const AtmStatusColors: Record<
  AtmStatus,
  'success' | 'error' | 'warning' | 'default'
> = {
  ACTIVE: 'success',
  INACTIVE: 'error',
  MAINTENANCE: 'warning',
};

// Serviço para ATMs
export class AtmsService {
  /**
   * Buscar todos os ATMs com filtros
   */
  static async findAll(params?: QueryAtmParams): Promise<AtmsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.tenantId) searchParams.append('tenantId', params.tenantId);
    if (params?.installationId)
      searchParams.append('installationId', params.installationId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.isActive !== undefined)
      searchParams.append('isActive', params.isActive.toString());

    const url = `/atms${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiService.get<AtmsResponse>(url);

    // Validar dados com Zod
    const validatedData = {
      ...response,
      data: response.data.map((atm: unknown) => AtmSchema.parse(atm)),
    };

    return validatedData;
  }

  /**
   * Buscar ATM por ID
   */
  static async findById(id: string): Promise<Atm> {
    const response = await apiService.get<Atm>(`/atms/${id}`);
    return AtmSchema.parse(response);
  }

  /**
   * Criar novo ATM
   */
  static async create(atmData: CreateAtm): Promise<Atm> {
    const validatedData = CreateAtmSchema.parse(atmData);
    const response = await apiService.post<Atm>('/atms', validatedData);
    return AtmSchema.parse(response);
  }

  /**
   * Atualizar ATM
   */
  static async update(id: string, atmData: UpdateAtm): Promise<Atm> {
    const validatedData = UpdateAtmSchema.parse(atmData);
    const response = await apiService.patch<Atm>(`/atms/${id}`, validatedData);
    return AtmSchema.parse(response);
  }

  /**
   * Excluir ATM
   */
  static async delete(id: string): Promise<void> {
    await apiService.delete(`/atms/${id}`);
  }

  /**
   * Buscar ATMs por tenant
   */
  static async findByTenant(
    tenantId: string,
    params?: QueryAtmParams
  ): Promise<AtmsResponse> {
    const queryParams = { ...params, tenantId };
    return this.findAll(queryParams);
  }

  /**
   * Buscar ATMs por instalação
   */
  static async findByInstallation(
    installationId: string,
    params?: QueryAtmParams
  ): Promise<AtmsResponse> {
    const queryParams = { ...params, installationId };
    return this.findAll(queryParams);
  }

  /**
   * Atualizar status do ATM
   */
  static async updateStatus(id: string, status: AtmStatus): Promise<Atm> {
    return this.update(id, { status });
  }

  /**
   * Ativar/Desativar ATM
   */
  static async toggleActive(id: string, isActive: boolean): Promise<Atm> {
    return this.update(id, { isActive });
  }

  /**
   * Buscar ATMs ativos de um tenant (usado para selects)
   */
  static async findActiveByTenant(tenantId: string): Promise<Atm[]> {
    const response = await this.findByTenant(tenantId, {
      isActive: true,
      status: 'ACTIVE',
      limit: 100, // Buscar mais ATMs para selects
    });
    return response.data;
  }

  /**
   * Obter estatísticas dos ATMs
   */
  static async getStatistics(): Promise<{
    total: number;
    byStatus: Record<AtmStatus, number>;
    active: number;
    inactive: number;
  }> {
    const response = await apiService.get<{
      total: number;
      byStatus: Record<AtmStatus, number>;
      active: number;
      inactive: number;
    }>('/atms/statistics');

    return response;
  }
}

export const atmsService = AtmsService;
