import { ZodError, z } from 'zod';

/**
 * Utilitário para lidar com erros de validação Zod
 */
export class ZodErrorHandler {
  /**
   * Verifica se o erro é uma instância de ZodError
   */
  static isZodError(error: unknown): error is ZodError {
    return error instanceof ZodError;
  }

  /**
   * Extrai mensagens de erro do ZodError para exibição em formulários
   * @param error - O erro ZodError
   * @returns Objeto com campos e suas mensagens de erro
   */
  static getFormErrors(error: ZodError): Record<string, string> {
    const errors: Record<string, string> = {};

    error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      if (path) {
        errors[path] = issue.message;
      }
    });

    return errors;
  }

  /**
   * Obtém a primeira mensagem de erro do ZodError
   * @param error - O erro ZodError
   * @returns A primeira mensagem de erro
   */
  static getFirstErrorMessage(error: ZodError): string {
    return error.issues[0]?.message || 'Erro de validação';
  }

  /**
   * Obtém todas as mensagens de erro formatadas
   * @param error - O erro ZodError
   * @returns Array com todas as mensagens de erro
   */
  static getAllErrorMessages(error: ZodError): string[] {
    return error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
  }

  /**
   * Formata o ZodError para log detalhado
   * @param error - O erro ZodError
   * @returns String formatada para log
   */
  static formatForLog(error: ZodError): string {
    const issues = error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      received: 'received' in issue ? issue.received : undefined,
      expected: 'expected' in issue ? issue.expected : undefined,
    }));

    return JSON.stringify({ zodError: true, issues }, null, 2);
  }

  /**
   * Trata erros genéricos e identifica se são ZodError
   * @param error - Erro desconhecido
   * @returns Objeto com informações do erro tratado
   */
  static handleError(error: unknown): {
    isZodError: boolean;
    message: string;
    formErrors?: Record<string, string>;
    originalError: unknown;
  } {
    if (this.isZodError(error)) {
      return {
        isZodError: true,
        message: this.getFirstErrorMessage(error),
        formErrors: this.getFormErrors(error),
        originalError: error,
      };
    }

    // Tratamento para outros tipos de erro
    if (error instanceof Error) {
      return {
        isZodError: false,
        message: error.message,
        originalError: error,
      };
    }

    if (typeof error === 'string') {
      return {
        isZodError: false,
        message: error,
        originalError: error,
      };
    }

    return {
      isZodError: false,
      message: 'Erro desconhecido',
      originalError: error,
    };
  }
}

/**
 * Hook React para facilitar o uso do ZodErrorHandler em componentes
 */
export function useZodErrorHandler() {
  const handleZodError = (
    error: unknown,
    setValidationErrors?: (errors: Record<string, string>) => void
  ) => {
    const handled = ZodErrorHandler.handleError(error);

    if (handled.isZodError && handled.formErrors && setValidationErrors) {
      setValidationErrors(handled.formErrors);
    }

    return handled;
  };

  return { handleZodError, ZodErrorHandler };
}

/**
 * Decorator para métodos que podem gerar ZodError
 */
export function withZodErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  onError?: (error: ReturnType<typeof ZodErrorHandler.handleError>) => void
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);

      // Se o resultado for uma Promise, trata erros async
      if (result instanceof Promise) {
        return result.catch((error) => {
          const handled = ZodErrorHandler.handleError(error);
          onError?.(handled);
          throw error;
        });
      }

      return result;
    } catch (error) {
      const handled = ZodErrorHandler.handleError(error);
      onError?.(handled);
      throw error;
    }
  }) as T;
}

/**
 * Utilitário para validação segura com Zod
 */
export class SafeValidator {
  /**
   * Valida dados com um schema Zod de forma segura
   * @param schema - Schema Zod para validação
   * @param data - Dados para validar
   * @returns Resultado da validação com informações de erro tratadas
   */
  static validate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): {
    success: boolean;
    data?: T;
    error?: ReturnType<typeof ZodErrorHandler.handleError>;
  } {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: ZodErrorHandler.handleError(error),
      };
    }
  }

  /**
   * Validação usando safeParse (não gera exceção)
   * @param schema - Schema Zod para validação
   * @param data - Dados para validar
   * @returns Resultado da validação tratada
   */
  static safeParse<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): {
    success: boolean;
    data?: T;
    error?: ReturnType<typeof ZodErrorHandler.handleError>;
  } {
    const result = schema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      error: ZodErrorHandler.handleError(result.error),
    };
  }
}
