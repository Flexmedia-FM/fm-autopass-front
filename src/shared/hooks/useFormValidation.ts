import { useState } from 'react';
import { z } from 'zod';
import { ZodErrorHandler, useZodErrorHandler } from '../utils';

/**
 * Hook customizado para validação de formulários com Zod
 * Fornece validação em tempo real e tratamento consistente de erros
 */
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { handleZodError } = useZodErrorHandler();

  /**
   * Valida todos os dados do formulário
   */
  const validate = (data: unknown): data is T => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      handleZodError(error, setErrors);
      return false;
    }
  };

  /**
   * Valida um campo específico (versão simplificada)
   */
  const validateField = (field: string, value: unknown) => {
    // Para validação individual, criamos um objeto temporário
    const testData = { [field]: value };

    try {
      // Usa o schema completo para validar, mas só captura erros do campo específico
      schema.parse(testData);

      // Remove erro se validação passou
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      return true;
    } catch (error) {
      if (ZodErrorHandler.isZodError(error)) {
        // Procura erros específicos para este campo
        const fieldErrors = error.issues.filter((issue: z.ZodIssue) =>
          issue.path.includes(field)
        );

        if (fieldErrors.length > 0) {
          setErrors((prev) => ({
            ...prev,
            [field]: fieldErrors[0].message,
          }));
        }
      }
      return false;
    }
  };

  /**
   * Valida múltiplos campos
   */
  const validateFields = (fields: Record<string, unknown>) => {
    let allValid = true;
    Object.entries(fields).forEach(([field, value]) => {
      const isValid = validateField(field, value);
      if (!isValid) allValid = false;
    });
    return allValid;
  };

  /**
   * Limpa todos os erros
   */
  const clearErrors = () => setErrors({});

  /**
   * Limpa erro de um campo específico
   */
  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  /**
   * Define erro customizado para um campo
   */
  const setFieldError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  /**
   * Verifica se tem erros
   */
  const hasErrors = Object.keys(errors).length > 0;

  /**
   * Verifica se um campo específico tem erro
   */
  const hasFieldError = (field: string) => !!errors[field];

  return {
    // Estados
    errors,
    hasErrors,

    // Métodos de validação
    validate,
    validateField,
    validateFields,

    // Métodos de manipulação de erros
    clearErrors,
    clearFieldError,
    setFieldError,
    hasFieldError,
  };
}

/**
 * Hook para validação de formulários com estado integrado
 * Combina estado do formulário com validação
 */
export function useValidatedForm<T>(
  schema: z.ZodSchema<T>,
  initialData: Partial<T> = {}
) {
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const validation = useFormValidation(schema);

  /**
   * Atualiza um campo e valida
   */
  const setFieldValue = (field: keyof T, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    validation.validateField(field as string, value);
  };

  /**
   * Atualiza múltiplos campos
   */
  const setFieldValues = (fields: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    validation.validateFields(fields as Record<string, unknown>);
  };

  /**
   * Reset do formulário
   */
  const reset = (newData: Partial<T> = initialData) => {
    setFormData(newData);
    validation.clearErrors();
  };

  /**
   * Submit do formulário com validação
   */
  const handleSubmit = (
    onValidSubmit: (data: T) => void | Promise<void>,
    onInvalidSubmit?: (errors: Record<string, string>) => void
  ) => {
    return async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (validation.validate(formData)) {
        await onValidSubmit(formData as T);
      } else {
        onInvalidSubmit?.(validation.errors);
      }
    };
  };

  return {
    // Estado do formulário
    formData,
    setFormData,
    setFieldValue,
    setFieldValues,
    reset,

    // Validação
    ...validation,

    // Handlers
    handleSubmit,
  };
}

export default useFormValidation;
