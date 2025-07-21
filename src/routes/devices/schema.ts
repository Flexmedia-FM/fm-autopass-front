import { z } from 'zod';

export const DeviceSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['sensor', 'camera', 'access-control', 'other']),
  status: z.enum(['active', 'inactive', 'maintenance']),
  location: z.string().min(1, 'Localização é obrigatória'),
  lastUpdate: z.string().datetime('Data de atualização inválida'),
});

export type Device = z.infer<typeof DeviceSchema>;

export const CreateDeviceSchema = DeviceSchema.omit({
  id: true,
  lastUpdate: true,
});
export type CreateDevice = z.infer<typeof CreateDeviceSchema>;

export const UpdateDeviceSchema = DeviceSchema.partial().omit({ id: true });
export type UpdateDevice = z.infer<typeof UpdateDeviceSchema>;
