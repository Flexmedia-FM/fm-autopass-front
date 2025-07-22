import { z } from 'zod';

// Usando o schema real do serviço, não o mock
export const DeviceStatusEnum = z.enum([
  'NOT_INSTALLED',
  'INSTALLED',
  'ACTIVE',
  'INACTIVE',
  'MAINTENANCE',
  'DECOMMISSIONED',
]);

export const DeviceSchema = z.object({
  id: z.string(),
  serialNumber: z
    .string()
    .min(6, 'Número de série deve ter pelo menos 6 caracteres'),
  atmId: z.string(),
  tenantId: z.string(),
  status: DeviceStatusEnum,
  installationDate: z.string().datetime().optional(),
  lastMaintenanceDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  // Relacionamentos (opcionais na listagem)
  atm: z
    .object({
      // id: z.string(),
      // name: z.string(),
      code: z.string().optional(),
    })
    .optional(),
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

// Schema para filtros de pesquisa
export const DeviceFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z
    .enum(['createdAt', 'serialNumber', 'status', 'installationDate'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: DeviceStatusEnum.optional(),
  atmId: z.string().optional(),
});

// Schema para resposta da API
export const DevicesResponseSchema = z.object({
  data: z.array(DeviceSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  // totalPages: z.number(),
});

// Tipos TypeScript
export type Device = z.infer<typeof DeviceSchema>;
export type CreateDevice = z.infer<typeof CreateDeviceSchema>;
export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;
export type DeviceStatus = z.infer<typeof DeviceStatusEnum>;
export type DeviceFilters = z.infer<typeof DeviceFiltersSchema>;
export type DevicesResponse = z.infer<typeof DevicesResponseSchema>;

// Loader data type
export interface DevicesLoaderData {
  devices: DevicesResponse;
}
