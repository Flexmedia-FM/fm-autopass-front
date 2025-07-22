import { z } from 'zod';
import { apiService } from './api';

// Schemas Zod para validação
export const LineSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  tenantId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateLineSchema = LineSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateLineSchema = CreateLineSchema.partial();

export const QueryLineSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  sortBy: z.enum(['createdAt', 'name', 'code']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

// Tipos TypeScript
export type Line = z.infer<typeof LineSchema>;
export type CreateLine = z.infer<typeof CreateLineSchema>;
export type UpdateLine = z.infer<typeof UpdateLineSchema>;
export type QueryLineParams = z.infer<typeof QueryLineSchema>;

export interface LinesResponse {
  data: Line[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Serviço para linhas
export class LinesService {
  /**
   * Buscar todas as linhas com filtros
   */
  static async findAll(params?: QueryLineParams): Promise<LinesResponse> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.order) searchParams.append('order', params.order);
    if (params?.search) searchParams.append('search', params.search);

    const url = `/lines${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await apiService.get<LinesResponse>(url);

    // Validar dados com Zod
    const validatedData = {
      ...response,
      data: response.data.map((line: unknown) => LineSchema.parse(line)),
    };

    return validatedData;
  }

  /**
   * Buscar linha por ID
   */
  static async findById(id: string): Promise<Line> {
    const response = await apiService.get<Line>(`/lines/${id}`);
    return LineSchema.parse(response);
  }

  /**
   * Criar nova linha
   */
  static async create(lineData: CreateLine): Promise<Line> {
    // Validar dados antes de enviar
    const validatedData = CreateLineSchema.parse(lineData);
    const response = await apiService.post<Line>('/lines', validatedData);
    return LineSchema.parse(response);
  }

  /**
   * Atualizar linha
   */
  static async update(id: string, lineData: UpdateLine): Promise<Line> {
    // Validar dados antes de enviar
    const validatedData = UpdateLineSchema.parse(lineData);
    const response = await apiService.patch<Line>(
      `/lines/${id}`,
      validatedData
    );
    return LineSchema.parse(response);
  }

  /**
   * Excluir linha
   */
  static async delete(id: string): Promise<void> {
    await apiService.delete(`/lines/${id}`);
  }

  /**
   * Buscar linhas simplificadas (apenas id, name e code)
   */
  static async findAllSimple(): Promise<Pick<Line, 'id' | 'name' | 'code'>[]> {
    const response =
      await apiService.get<Pick<Line, 'id' | 'name' | 'code'>[]>(
        '/lines/simple'
      );

    // Validar dados com Zod
    const simpleLineSchema = LineSchema.pick({
      id: true,
      name: true,
      code: true,
    });
    return response.map((line: unknown) => simpleLineSchema.parse(line));
  }
}

export const linesService = LinesService;
