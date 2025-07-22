import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email('Email inválido'),
  resetToken: z.string().nullable(),
  resetExpires: z.string().nullable(),
  login: z.string().min(1, 'Login é obrigatório'),
  name: z.string().nullable(),
  userRole: z.enum(['ADMIN', 'OPERATOR']),
  isActive: z.boolean(),
  tenantId: z.string(),
  createdAt: z.string().datetime('Data de criação inválida'),
  updatedAt: z.string().datetime('Data de atualização inválida'),
  tenantName: z.string(),
  tenantRole: z.string().nullable(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resetToken: true,
  resetExpires: true,
})
  .extend({
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.tenantId && data.tenantName, {
    message: 'Organização é obrigatória',
    path: ['tenantId'],
  });
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = UserSchema.partial().omit({
  id: true,
  createdAt: true,
  resetToken: true,
  resetExpires: true,
});
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Schema para os filtros de pesquisa
export const UserFiltersSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  userRole: z.enum(['ADMIN', 'OPERATOR']).optional(),
  isActive: z.boolean().optional(),
  tenantId: z.string().optional(),
});
export type UserFilters = z.infer<typeof UserFiltersSchema>;

// Schema para a resposta da API de usuários
export const UsersResponseSchema = z.object({
  data: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
