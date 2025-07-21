import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  totalDevices: z.number().min(0),
  activeDevices: z.number().min(0),
  inactiveDevices: z.number().min(0),
  maintenanceDevices: z.number().min(0),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const AlertSchema = z.object({
  id: z.string(),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  severity: z.enum(['info', 'warning', 'error']),
  timestamp: z.string().datetime(),
});

export type Alert = z.infer<typeof AlertSchema>;
