import { apiService } from './api';

export interface Tenant {
  id: string;
  name: string;
  fantasyName: string;
  cnpj: string;
  address: string;
  slug: string;
  ownerId?: string;
  tenantRole: 'TENANT_ADMIN' | 'TENANT';
  billingCycle?: string;
  billingDueDate?: Date;
  billingStatus?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueryTenantParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  search?: string;
}

export interface TenantsResponse {
  data: Tenant[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TenantsService {
  static async findAll(params?: QueryTenantParams): Promise<TenantsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.search) searchParams.append('search', params.search);

    const url = `/tenants${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return await apiService.get<TenantsResponse>(url);
  }

  static async findById(id: string): Promise<Tenant> {
    return await apiService.get<Tenant>(`/tenants/${id}`);
  }

  static async findAllSimple(): Promise<
    Pick<Tenant, 'id' | 'name' | 'fantasyName'>[]
  > {
    const response =
      await apiService.get<TenantsResponse>('/tenants?limit=100');
    console.log('TenantsService.findAllSimple response:', response);

    return response.data.map((tenant: Tenant) => ({
      id: tenant.id,
      name: tenant.name,
      fantasyName: tenant.fantasyName,
    }));
  }
}
