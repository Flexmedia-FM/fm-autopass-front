import { z } from 'zod';
import { DeviceStatusEnum } from '../devices/schema';

export const AtmSchema = z.object({
  id: z.string(),
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  location: z.string().optional(),
  address: z.string().optional(),
  tenantId: z.string(),
  installationId: z.string().optional(),
  deviceStatus: DeviceStatusEnum.default('INACTIVE'),
  notes: z.string().optional(),
  createdAt: z.iso.datetime({
    local: true,
    message: 'Data de criação inválida',
  }),
  updatedAt: z.iso.datetime({
    local: true,
    message: 'Data de atualização inválida',
  }),
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
      code: z.string(),
    })
    .optional(),
});

export type Atm = z.infer<typeof AtmSchema>;

export const CreateAtmSchema = AtmSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  tenant: true,
  installation: true,
}).refine((data) => data.tenantId, {
  message: 'Organização é obrigatória',
  path: ['tenantId'],
});

export type CreateAtm = z.infer<typeof CreateAtmSchema>;

export const UpdateAtmSchema = AtmSchema.partial().omit({
  id: true,
  createdAt: true,
  tenant: true,
  installation: true,
});

export type UpdateAtm = z.infer<typeof UpdateAtmSchema>;

// Schema para os filtros de pesquisa
export const AtmFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'code', 'deviceStatus']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  deviceStatus: DeviceStatusEnum.optional(),
  isActive: z.boolean().optional(),
  tenantId: z.string().optional(),
  installationId: z.string().optional(),
});

export type AtmFilters = z.infer<typeof AtmFiltersSchema>;

// Schema para a resposta da API de ATMs
export const AtmsResponseSchema = z.object({
  data: z.array(AtmSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type AtmsResponse = z.infer<typeof AtmsResponseSchema>;

// Enum e labels para status
export type AtmStatus = z.infer<typeof AtmSchema>['deviceStatus'];

export const AtmStatusLabels: Record<AtmStatus, string> = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  MAINTENANCE: 'Em Manutenção',
  NOT_INSTALLED: 'Não Instalado',
  INSTALLED: 'Instalado',
  DECOMMISSIONED: 'Descomissionado',
};

export const AtmStatusColors: Record<
  AtmStatus,
  'success' | 'error' | 'warning' | 'default' | 'info' | 'primary' | 'secondary'
> = {
  ACTIVE: 'success',
  INACTIVE: 'error',
  MAINTENANCE: 'warning',
  NOT_INSTALLED: 'default',
  INSTALLED: 'primary',
  DECOMMISSIONED: 'secondary',
};

export const QueryAtmSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'code', 'deviceStatus']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  tenantId: z.string().optional(),
  installationId: z.string().optional(),
  deviceStatus: DeviceStatusEnum.optional(),
  isActive: z.boolean().optional(),
});

export type QueryAtmParams = z.infer<typeof QueryAtmSchema>;
