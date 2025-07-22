# Exemplos de Uso - Serviços Lines e Installations

Este documento fornece exemplos práticos de como usar os serviços de **Linhas** e **Instalações** implementados no FM AutoPass Frontend.

## 🚌 Serviço de Linhas (`LinesService`)

### Importação
```typescript
import { LinesService } from '../shared/services';
```

### Exemplos de Uso

#### 1. Buscar todas as linhas com paginação
```typescript
const getAllLines = async () => {
  try {
    const response = await LinesService.findAll({
      page: 1,
      limit: 10,
      sortBy: 'name',
      order: 'asc'
    });
    
    console.log('Linhas encontradas:', response.data);
    console.log('Total de linhas:', response.total);
    console.log('Páginas totais:', response.totalPages);
  } catch (error) {
    console.error('Erro ao buscar linhas:', error);
  }
};
```

#### 2. Buscar linhas com filtro de texto
```typescript
const searchLines = async (searchTerm: string) => {
  try {
    const response = await LinesService.findAll({
      search: searchTerm,
      page: 1,
      limit: 20
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro na busca:', error);
    return [];
  }
};

// Uso
const azulLines = await searchLines('Azul');
```

#### 3. Buscar linha específica por ID
```typescript
const getLineById = async (lineId: string) => {
  try {
    const line = await LinesService.findById(lineId);
    console.log('Linha encontrada:', line);
    return line;
  } catch (error) {
    console.error('Linha não encontrada:', error);
  }
};
```

#### 4. Criar nova linha
```typescript
const createNewLine = async () => {
  try {
    const newLine = await LinesService.create({
      name: 'Linha Verde',
      code: 'LV-001',
      tenantId: 'b3d72d04-7e63-48fc-8e90-2b35d1c6c8f4'
    });
    
    console.log('Linha criada:', newLine);
    return newLine;
  } catch (error) {
    console.error('Erro ao criar linha:', error);
  }
};
```

#### 5. Atualizar linha existente
```typescript
const updateLine = async (lineId: string) => {
  try {
    const updatedLine = await LinesService.update(lineId, {
      name: 'Linha Verde - Atualizada'
    });
    
    console.log('Linha atualizada:', updatedLine);
    return updatedLine;
  } catch (error) {
    console.error('Erro ao atualizar linha:', error);
  }
};
```

#### 6. Buscar linhas simplificadas para dropdowns
```typescript
const getSimpleLines = async () => {
  try {
    const simpleLines = await LinesService.findAllSimple();
    
    // Retorna apenas { id, name, code }
    return simpleLines;
  } catch (error) {
    console.error('Erro ao buscar linhas simplificadas:', error);
    return [];
  }
};
```

#### 7. Excluir linha
```typescript
const deleteLine = async (lineId: string) => {
  try {
    await LinesService.delete(lineId);
    console.log('Linha excluída com sucesso');
  } catch (error) {
    console.error('Erro ao excluir linha:', error);
  }
};
```

## 🏢 Serviço de Instalações (`InstallationsService`)

### Importação
```typescript
import { InstallationsService } from '../shared/services';
```

### Exemplos de Uso

#### 1. Buscar todas as instalações
```typescript
const getAllInstallations = async () => {
  try {
    const response = await InstallationsService.findAll({
      page: 1,
      limit: 15,
      sortBy: 'name',
      order: 'asc'
    });
    
    console.log('Instalações encontradas:', response.data);
    console.log('Total:', response.total);
    
    return response;
  } catch (error) {
    console.error('Erro ao buscar instalações:', error);
  }
};
```

#### 2. Buscar instalações por tenant
```typescript
const getInstallationsByTenant = async (tenantId: string) => {
  try {
    const response = await InstallationsService.findByTenant(tenantId, {
      limit: 50,
      sortBy: 'name'
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar instalações do tenant:', error);
    return [];
  }
};
```

#### 3. Buscar instalação por ID
```typescript
const getInstallationById = async (installationId: string) => {
  try {
    const installation = await InstallationsService.findById(installationId);
    console.log('Instalação:', installation);
    
    if (installation.location) {
      console.log('Coordenadas:', installation.location);
    }
    
    return installation;
  } catch (error) {
    console.error('Instalação não encontrada:', error);
  }
};
```

#### 4. Criar nova instalação
```typescript
const createNewInstallation = async () => {
  try {
    const newInstallation = await InstallationsService.create({
      name: 'Estação Consolação',
      code: 'CON-001',
      address: 'Avenida Paulista, 1000, São Paulo - SP',
      location: {
        lat: -23.561684,
        lng: -46.655981
      },
      tenantId: '3f7c2d3e-8d12-4e50-9e7a-4e3e3dbed765'
    });
    
    console.log('Instalação criada:', newInstallation);
    return newInstallation;
  } catch (error) {
    console.error('Erro ao criar instalação:', error);
  }
};
```

#### 5. Buscar instalações próximas
```typescript
const getNearbyInstallations = async (userLat: number, userLng: number) => {
  try {
    const nearbyInstallations = await InstallationsService.findNearby(
      userLat,
      userLng,
      5000, // raio de 5km
      {
        limit: 10,
        sortBy: 'name'
      }
    );
    
    console.log('Instalações próximas:', nearbyInstallations.data);
    return nearbyInstallations.data;
  } catch (error) {
    console.error('Erro ao buscar instalações próximas:', error);
    return [];
  }
};

// Exemplo: buscar perto da Estação da Sé
const nearSe = await getNearbyInstallations(-23.5505, -46.6333);
```

#### 6. Atualizar instalação
```typescript
const updateInstallation = async (installationId: string) => {
  try {
    const updated = await InstallationsService.update(installationId, {
      name: 'Estação Consolação - Renovada',
      address: 'Avenida Paulista, 1000 - Bela Vista, São Paulo - SP'
    });
    
    console.log('Instalação atualizada:', updated);
    return updated;
  } catch (error) {
    console.error('Erro ao atualizar instalação:', error);
  }
};
```

#### 7. Buscar instalações simplificadas
```typescript
const getSimpleInstallations = async () => {
  try {
    const simpleInstallations = await InstallationsService.findAllSimple();
    
    // Útil para dropdowns e seletores
    return simpleInstallations.map(inst => ({
      value: inst.id,
      label: `${inst.name} ${inst.code ? `(${inst.code})` : ''}`.trim()
    }));
  } catch (error) {
    console.error('Erro ao buscar instalações simplificadas:', error);
    return [];
  }
};
```

#### 8. Excluir instalação
```typescript
const deleteInstallation = async (installationId: string) => {
  try {
    await InstallationsService.delete(installationId);
    console.log('Instalação excluída com sucesso');
  } catch (error) {
    console.error('Erro ao excluir instalação:', error);
  }
};
```

## 🔄 Exemplo de Uso em React Hook

### Hook personalizado para linhas
```typescript
import { useState, useEffect } from 'react';
import { LinesService, type Line } from '../shared/services';

export const useLines = () => {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLines = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await LinesService.findAll({
        limit: 100,
        sortBy: 'name',
        order: 'asc'
      });
      
      setLines(response.data);
    } catch (err) {
      setError('Erro ao carregar linhas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLines();
  }, []);

  return {
    lines,
    loading,
    error,
    reload: loadLines
  };
};
```

### Hook personalizado para instalações
```typescript
import { useState, useEffect } from 'react';
import { InstallationsService, type Installation } from '../shared/services';

export const useInstallations = (tenantId?: string) => {
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstallations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = tenantId 
        ? await InstallationsService.findByTenant(tenantId)
        : await InstallationsService.findAll();
      
      setInstallations(response.data);
    } catch (err) {
      setError('Erro ao carregar instalações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstallations();
  }, [tenantId]);

  return {
    installations,
    loading,
    error,
    reload: loadInstallations
  };
};
```

## 🎯 Características dos Serviços

### ✅ Recursos Implementados

1. **Validação com Zod**: Todos os dados são validados antes e depois das chamadas à API
2. **TypeScript**: Tipos completamente tipados para melhor desenvolvimento
3. **Tratamento de Erros**: Interceptors automáticos para erros HTTP
4. **Paginação**: Suporte nativo a paginação nas listagens
5. **Filtros**: Busca por texto, ordenação e filtros customizados
6. **Autenticação**: Tokens automáticos em todas as requisições
7. **Padronização**: Interface consistente entre todos os serviços

### 🔧 Próximos Passos

Para usar estes serviços em componentes React:

1. Crie hooks personalizados como nos exemplos acima
2. Implemente stores Zustand para gerenciamento de estado
3. Adicione loaders para React Router
4. Crie componentes de UI para exibir os dados

### 📚 Documentação de Referência

- **API Endpoints**: Veja `SERVICES_DOCUMENTATION.md`
- **Schemas**: Arquivos `postman/` contêm os DTOs de referência
- **Tipos TypeScript**: Exportados diretamente dos services
