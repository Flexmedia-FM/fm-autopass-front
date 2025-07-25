import { useLoaderData } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Build as MaintenanceIcon,
  // PowerSettingsNew as PowerIcon,
} from '@mui/icons-material';
import { useAtmsStore } from './store';
import {
  ReusableDataGrid,
  type DataGridColumn,
} from '../../shared/ui/ReusableDataGrid';
// import type { Atm, AtmStatus } from '../../shared/services';
import type {
  GridPaginationModel,
  GridSortModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
// import { AtmStatusLabels, AtmStatusColors } from '../../shared/services';

// Tipo para dados do loader (específico da rota)
interface AtmsLoaderData {
  atms: {
    data: Atm[];
    total: number;
    page: number;
    limit: number;
  };
}
import { TenantsService } from '../../shared/services';
import { CreateAtmDialog } from './CreateAtmDialog';
import { EditAtmDialog } from './EditAtmDialog';
import DeleteAtmDialog from './DeleteAtmDialog';
import {
  AtmStatusColors,
  AtmStatusLabels,
  type Atm,
  type AtmStatus,
} from './schema';

// Componente para exibir o nome do tenant de forma assíncrona
function TenantNameCell({ tenantId }: { tenantId: string }) {
  const [tenantName, setTenantName] = useState<string>('Carregando...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTenantName = async () => {
      try {
        const tenant = await TenantsService.findById(tenantId);
        if (isMounted) {
          setTenantName(tenant?.name || 'N/A');
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setTenantName('Erro');
          setIsLoading(false);
        }
      }
    };

    fetchTenantName();

    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2">Carregando...</Typography>
      </Box>
    );
  }

  return <Typography variant="body2">{tenantName}</Typography>;
}

export default function AtmsRoute() {
  const loaderData = useLoaderData() as AtmsLoaderData;
  const {
    atms,
    totalAtms,
    currentPage,
    limit,
    isLoading,
    error,
    filters,
    setAtms,
    loadAtms,
    refreshAtms,
    removeAtm,
    updateAtmStatus,
    // toggleAtmActive,
    setPage,
    setLimit,
  } = useAtmsStore();

  // Estados locais para diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAtm, setSelectedAtm] = useState<Atm | null>(null);

  // Estados para filtros locais
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState<AtmStatus | ''>(
    filters.deviceStatus || ''
  );

  // Carregar dados iniciais do loader
  useEffect(() => {
    if (loaderData?.atms) {
      setAtms(loaderData.atms);
    }
  }, [loaderData, setAtms]);

  // Handlers para diálogos
  const handleCreateClick = () => setCreateDialogOpen(true);
  const handleCreateClose = () => setCreateDialogOpen(false);

  const handleEditClick = (atm: Atm) => {
    setSelectedAtm(atm);
    setEditDialogOpen(true);
  };
  const handleEditClose = () => {
    setSelectedAtm(null);
    setEditDialogOpen(false);
  };

  const handleDeleteClick = (atm: Atm) => {
    setSelectedAtm(atm);
    setDeleteDialogOpen(true);
  };
  const handleDeleteClose = () => {
    setSelectedAtm(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (selectedAtm) {
      await removeAtm(selectedAtm.id);
      handleDeleteClose();
    }
  };

  // Handlers para filtros
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      loadAtms({ search: searchTerm.trim() || undefined, page: 1 });
    },
    [searchTerm, loadAtms]
  );

  const handleStatusFilterChange = useCallback(
    (status: AtmStatus | '') => {
      setStatusFilter(status);
      loadAtms({ deviceStatus: status || undefined, page: 1 });
    },
    [loadAtms]
  );

  const handleRefresh = () => {
    refreshAtms();
  };

  // Handlers para ações rápidas
  const handleMaintenanceToggle = async (atm: Atm) => {
    try {
      const newStatus: AtmStatus =
        atm.deviceStatus === 'MAINTENANCE' ? 'ACTIVE' : 'MAINTENANCE';
      await updateAtmStatus(atm.id, newStatus);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // const handleToggleActive = async (atm: Atm) => {
  //   try {
  //     await toggleAtmActive(atm.id, !!atm.deviceStatus);
  //   } catch (error) {
  //     console.error('Erro ao alterar estado ativo:', error);
  //   }
  // };

  // Handlers para paginação e ordenação
  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      if (model.page !== currentPage - 1) {
        const newPage = model.page + 1;
        setPage(newPage);
        loadAtms({ page: newPage });
      }
      if (model.pageSize !== limit) {
        setLimit(model.pageSize);
        loadAtms({ limit: model.pageSize, page: 1 });
      }
    },
    [currentPage, limit, setPage, setLimit, loadAtms]
  );

  const handleSortChange = useCallback(
    (model: GridSortModel) => {
      const sort = model[0];
      if (sort) {
        const sortBy = sort.field as
          | 'createdAt'
          | 'name'
          | 'code'
          | 'deviceStatus';
        const sortOrder = sort.sort as 'asc' | 'desc';
        loadAtms({ sortBy, sortOrder, page: 1 });
      } else {
        loadAtms({ sortBy: undefined, sortOrder: undefined, page: 1 });
      }
    },
    [loadAtms]
  );

  // Definição das colunas
  const columns: DataGridColumn[] = [
    {
      field: 'code',
      headerName: 'Código',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'location',
      headerName: 'Localização',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => params.value || 'N/A',
    },
    {
      field: 'tenantId',
      headerName: 'Organização',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <TenantNameCell tenantId={params.value} />
      ),
    },
    {
      field: 'deviceStatus',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={AtmStatusLabels[params.value as AtmStatus]}
          color={AtmStatusColors[params.value as AtmStatus]}
          size="small"
        />
      ),
    },
    // {
    //   field: 'isActive',
    //   headerName: 'Ativo',
    //   flex: 0.8,
    //   minWidth: 80,
    //   renderCell: (params: GridRenderCellParams) => (
    //     <Chip
    //       label={params.value ? 'Sim' : 'Não'}
    //       color={params.value ? 'success' : 'error'}
    //       size="small"
    //     />
    //   ),
    // },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      flex: 1.2,
      minWidth: 130,
      type: 'string',
      valueGetter: (value: string) => new Date(value).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 1.5,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => handleEditClick(params.row)}
              color="primary"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* <Tooltip title={`${params.row.isActive ? 'Desativar' : 'Ativar'}`}>
            <IconButton
              size="small"
              onClick={() => handleToggleActive(params.row)}
              color={params.row.isActive ? 'warning' : 'success'}
            >
              <PowerIcon fontSize="small" />
            </IconButton>
          </Tooltip> */}

          <Tooltip
            title={
              params.row.deviceStatus === 'MAINTENANCE'
                ? 'Retornar para Ativo'
                : 'Colocar em Manutenção'
            }
          >
            <IconButton
              size="small"
              disabled={isLoading}
              onClick={() => handleMaintenanceToggle(params.row)}
              color={
                params.row.deviceStatus === 'MAINTENANCE'
                  ? 'primary'
                  : 'warning'
              }
              sx={{
                '&:hover': {
                  backgroundColor:
                    params.row.deviceStatus === 'MAINTENANCE'
                      ? 'success.light'
                      : 'warning.light',

                  color:
                    params.row.deviceStatus === 'MAINTENANCE'
                      ? 'white'
                      : 'black',
                },
              }}
            >
              <MaintenanceIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          ATMs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Novo ATM
        </Button>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSearchSubmit}
            sx={{ display: 'flex', gap: 1 }}
          >
            <TextField
              size="small"
              placeholder="Buscar por nome, código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <Button type="submit" variant="outlined" size="small">
              Buscar
            </Button>
          </Box>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) =>
                handleStatusFilterChange(e.target.value as AtmStatus | '')
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ACTIVE">Ativo</MenuItem>
              <MenuItem value="INACTIVE">Inativo</MenuItem>
              <MenuItem value="MAINTENANCE">Em Manutenção</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Atualizar
          </Button>
        </Box>
      </Paper>

      {/* Alert de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grid de dados */}
      <ReusableDataGrid
        columns={columns}
        rows={atms}
        loading={isLoading}
        totalRows={totalAtms}
        pagination={{
          page: currentPage - 1,
          pageSize: limit,
        }}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
        disableRowSelectionOnClick
        sx={{ height: 600 }}
      />

      {/* Diálogos */}
      <CreateAtmDialog open={createDialogOpen} onClose={handleCreateClose} />

      {selectedAtm && (
        <>
          <EditAtmDialog
            open={editDialogOpen}
            onClose={handleEditClose}
            atm={selectedAtm}
          />
          <DeleteAtmDialog
            open={deleteDialogOpen}
            onClose={handleDeleteClose}
            onConfirm={handleDeleteConfirm}
            atm={selectedAtm}
          />
        </>
      )}
    </Box>
  );
}
