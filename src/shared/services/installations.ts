import { z } from 'zod';
import { apiService } from './api';

// Schema para localização (coordenadas)
export const LocationSchema = z
  .object({
    lat: z.number(),
    lng: z.number(),
  })
  .optional();

// Schemas Zod para validação
export const InstallationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().optional(),
  address: z.string().optional(),
  location: LocationSchema,
  tenantId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateInstallationSchema = InstallationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateInstallationSchema = CreateInstallationSchema.partial();

export const QueryInstallationSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'code']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

// Tipos TypeScript
export type Installation = z.infer<typeof InstallationSchema>;
export type CreateInstallation = z.infer<typeof CreateInstallationSchema>;
export type UpdateInstallation = z.infer<typeof UpdateInstallationSchema>;
export type QueryInstallationParams = z.infer<typeof QueryInstallationSchema>;
export type Location = z.infer<typeof LocationSchema>;

export interface InstallationsResponse {
  data: Installation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Serviço para instalações (estações)
export class InstallationsService {
  /**
   * Buscar todas as instalações com filtros
   */
  static async findAll(
    params?: QueryInstallationParams
  ): Promise<InstallationsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.search) searchParams.append('search', params.search);

    const url = `/installations${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiService.get<InstallationsResponse>(url);

    // Validar dados com Zod
    const validatedData = {
      ...response,
      data: response.data.map((installation: unknown) =>
        InstallationSchema.parse(installation)
      ),
    };

    return validatedData;
  }

  /**
   * Buscar instalação por ID
   */
  static async findById(id: string): Promise<Installation> {
    const response = await apiService.get<Installation>(`/installations/${id}`);
    return InstallationSchema.parse(response);
  }

  /**
   * Criar nova instalação
   */
  static async create(
    installationData: CreateInstallation
  ): Promise<Installation> {
    // Validar dados antes de enviar
    const validatedData = CreateInstallationSchema.parse(installationData);
    const response = await apiService.post<Installation>(
      '/installations',
      validatedData
    );
    return InstallationSchema.parse(response);
  }

  /**
   * Atualizar instalação
   */
  static async update(
    id: string,
    installationData: UpdateInstallation
  ): Promise<Installation> {
    // Validar dados antes de enviar
    const validatedData = UpdateInstallationSchema.parse(installationData);
    const response = await apiService.patch<Installation>(
      `/installations/${id}`,
      validatedData
    );
    return InstallationSchema.parse(response);
  }

  /**
   * Excluir instalação
   */
  static async delete(id: string): Promise<void> {
    await apiService.delete(`/installations/${id}`);
  }

  /**
   * Buscar instalações simplificadas (apenas id, name e code)
   */
  static async findAllSimple(): Promise<
    Pick<Installation, 'id' | 'name' | 'code'>[]
  > {
    const response = await apiService.get<
      Pick<Installation, 'id' | 'name' | 'code'>[]
    >('/installations/simple');

    // Validar dados com Zod
    const simpleInstallationSchema = InstallationSchema.pick({
      id: true,
      name: true,
      code: true,
    });
    return response.map((installation: unknown) =>
      simpleInstallationSchema.parse(installation)
    );
  }

  /**
   * Buscar instalações por tenant
   */
  static async findByTenant(
    tenantId: string,
    params?: QueryInstallationParams
  ): Promise<InstallationsResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.search) searchParams.append('search', params.search);

    searchParams.append('tenantId', tenantId);

    const url = `/installations?${searchParams.toString()}`;
    const response = await apiService.get<InstallationsResponse>(url);

    // Validar dados com Zod
    const validatedData = {
      ...response,
      data: response.data.map((installation: unknown) =>
        InstallationSchema.parse(installation)
      ),
    };

    return validatedData;
  }

  /**
   * Buscar instalações próximas a uma localização
   */
  static async findNearby(
    lat: number,
    lng: number,
    radius?: number,
    params?: QueryInstallationParams
  ): Promise<InstallationsResponse> {
    const searchParams = new URLSearchParams();

    searchParams.append('lat', lat.toString());
    searchParams.append('lng', lng.toString());
    if (radius) searchParams.append('radius', radius.toString());

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.search) searchParams.append('search', params.search);

    const url = `/installations/nearby?${searchParams.toString()}`;
    const response = await apiService.get<InstallationsResponse>(url);

    // Validar dados com Zod
    const validatedData = {
      ...response,
      data: response.data.map((installation: unknown) =>
        InstallationSchema.parse(installation)
      ),
    };

    return validatedData;
  }
}

export const installationsService = InstallationsService;
