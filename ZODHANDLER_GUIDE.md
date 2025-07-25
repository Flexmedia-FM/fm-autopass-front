# Como lidar com ZodError

Este documento explica como utilizar o `ZodErrorHandler` para tratar erros de validação Zod de forma consistente em toda a aplicação.

## 🎯 Problema

O código anterior tratava ZodError de forma inconsistente:

```typescript
// ❌ Tratamento incorreto anterior
} catch (err) {
  if (typeof err === 'object') {
    const zodError = (err && err) || { errors: [] };
    console.log('Zod errors:', zodError);
  }
}
```

## ✅ Solução: ZodErrorHandler

### 1. Importação

```typescript
import { ZodErrorHandler, useZodErrorHandler, SafeValidator } from '../../shared/utils';
```

### 2. Tratamento Básico de Erros

```typescript
try {
  const result = await SomeService.getData();
  return result;
} catch (error) {
  const handled = ZodErrorHandler.handleError(error);
  
  if (handled.isZodError) {
    console.log('ZodError detectado:', ZodErrorHandler.formatForLog(handled.originalError));
    setError(`Erro de validação: ${handled.message}`);
  } else {
    setError(handled.message);
  }
}
```

### 3. Uso em Formulários

```typescript
const validateForm = (): boolean => {
  try {
    CreateUserSchema.parse(formData);
    setValidationErrors({});
    return true;
  } catch (error) {
    const handled = ZodErrorHandler.handleError(error);
    
    if (handled.isZodError && handled.formErrors) {
      setValidationErrors(handled.formErrors);
    }
    return false;
  }
};
```

### 4. Hook React para Formulários

```typescript
const { handleZodError } = useZodErrorHandler();

const validateField = (field: string, value: any) => {
  try {
    fieldSchema.parse(value);
    // Remove erro se validação passou
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  } catch (error) {
    const handled = handleZodError(error, setValidationErrors);
    // Erro já foi tratado pelo hook
  }
};
```

### 5. Validação Segura (sem exceções)

```typescript
const { success, data, error } = SafeValidator.safeParse(UserSchema, rawData);

if (!success) {
  console.log('Erro de validação:', error?.message);
  if (error?.formErrors) {
    setValidationErrors(error.formErrors);
  }
  return;
}

// Use `data` com segurança - está tipado e validado
console.log('Dados válidos:', data);
```

### 6. Validação de Campo Individual

```typescript
const validateField = (field: keyof FormData, value: string | boolean) => {
  try {
    const fieldSchema = CreateUserSchema.shape[field];
    if (fieldSchema) {
      fieldSchema.parse(value);
      // Remove erro se validação passou
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  } catch (error) {
    if (ZodErrorHandler.isZodError(error)) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ZodErrorHandler.getFirstErrorMessage(error),
      }));
    }
  }
};
```

## 📋 Métodos Disponíveis

### ZodErrorHandler

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `isZodError(error)` | Verifica se é ZodError | `boolean` |
| `getFormErrors(error)` | Extrai erros para formulários | `Record<string, string>` |
| `getFirstErrorMessage(error)` | Primeira mensagem de erro | `string` |
| `getAllErrorMessages(error)` | Todas as mensagens | `string[]` |
| `formatForLog(error)` | Formata para log detalhado | `string` |
| `handleError(error)` | Trata qualquer tipo de erro | `object` |

### SafeValidator

| Método | Descrição | Uso |
|--------|-----------|-----|
| `validate(schema, data)` | Validação com exceção | Validação crítica |
| `safeParse(schema, data)` | Validação sem exceção | Validação de formulários |

## 🔧 Exemplos Práticos

### Exemplo 1: Service Layer

```typescript
// services/users.ts
export class UsersService {
  static async getUsers(filters: any) {
    try {
      const response = await apiService.get<UsersResponse>('/users', filters);
      
      // Validação da resposta da API
      const { success, data, error } = SafeValidator.safeParse(
        UsersResponseSchema, 
        response
      );
      
      if (!success) {
        throw new Error(`Dados inválidos da API: ${error?.message}`);
      }
      
      return data;
    } catch (err) {
      const handled = ZodErrorHandler.handleError(err);
      console.error('Erro no UsersService:', handled);
      throw err;
    }
  }
}
```

### Exemplo 2: Hook Customizado

```typescript
// hooks/useFormValidation.ts
export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { handleZodError } = useZodErrorHandler();

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

  const validateField = (field: string, value: unknown) => {
    try {
      const fieldSchema = schema.shape[field as keyof T];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      handleZodError(error, (formErrors) => {
        setErrors(prev => ({ ...prev, ...formErrors }));
      });
    }
  };

  return { validate, validateField, errors, clearErrors: () => setErrors({}) };
}
```

### Exemplo 3: Componente de Formulário

```typescript
// components/UserForm.tsx
export function UserForm({ onSubmit }: { onSubmit: (data: User) => void }) {
  const { validate, validateField, errors } = useFormValidation(UserSchema);
  const [formData, setFormData] = useState<Partial<User>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate(formData)) {
      onSubmit(formData); // formData é tipado como User aqui
    }
  };

  const handleFieldChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        value={formData.email || ''}
        onChange={(e) => handleFieldChange('email', e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
      />
      {/* Outros campos... */}
    </form>
  );
}
```

## 🎯 Benefícios

1. **Consistência**: Tratamento uniforme de ZodError em toda aplicação
2. **Type Safety**: Métodos tipados e seguros
3. **Developer Experience**: Logs detalhados e mensagens claras
4. **Reusabilidade**: Utilitários que podem ser usados em qualquer lugar
5. **Manutenibilidade**: Código mais limpo e organizado

## 🚨 Boas Práticas

1. **Sempre use SafeValidator** para validação de dados da API
2. **Use handleZodError** em hooks e componentes React
3. **Log erros detalhados** em desenvolvimento com `formatForLog`
4. **Valide campos individuais** em tempo real nos formulários
5. **Trate ZodError diferente** de outros erros para melhor UX
