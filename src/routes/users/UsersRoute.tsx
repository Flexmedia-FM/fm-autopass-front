import { useLoaderData } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Switch,
  IconButton,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Button,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useUsersStore } from './store';
import {
  ReusableDataGrid,
  type DataGridColumn,
} from '../../shared/ui/ReusableDataGrid';
import CreateUserDialog from './CreateUserDialog';
import EditUserDialog from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import type { UsersLoaderData } from './loader';
import type { User } from './schema';
import type { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

export default function UsersRoute() {
  const loaderData = useLoaderData() as UsersLoaderData;
  const {
    users,
    totalUsers,
    currentPage,
    limit,
    isLoading,
    error,
    toggleUserStatus,
    setPage,
    setLimit,
    setFilters,
    setUsers,
    refreshUsers,
  } = useUsersStore();

  // Sincronizar dados do loader com o store na inicialização
  useEffect(() => {
    if (loaderData.users && loaderData.users.data.length > 0) {
      setUsers(loaderData.users);
    }
  }, [loaderData.users, setUsers]);

  const [paginationModel, setPaginationModel] = useState({
    page: currentPage - 1, // DataGrid usa 0-based, nossa store usa 1-based
    pageSize: limit,
  });

  // Atualizar paginationModel quando o store mudar
  useEffect(() => {
    setPaginationModel({
      page: currentPage - 1, // DataGrid usa 0-based, nossa store usa 1-based
      pageSize: limit,
    });
  }, [currentPage, limit]);

  const [searchValue, setSearchValue] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      setPaginationModel(model);
      setPage(model.page + 1); // Converter para 1-based
      setLimit(model.pageSize);
    },
    [setPage, setLimit]
  );

  const handleSortChange = useCallback(
    (model: GridSortModel) => {
      if (model.length > 0) {
        const sort = model[0];
        setFilters({
          sortBy: sort.field,
          sortOrder: sort.sort || 'asc',
        });
      } else {
        setFilters({
          sortBy: undefined,
          sortOrder: undefined,
        });
      }
    },
    [setFilters]
  );

  const handleSearch = useCallback(() => {
    setFilters({
      search: searchValue || undefined,
    });
    // Reset para primeira página quando buscar
    setPage(1);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [searchValue, setFilters, setPage]);

  const handleSearchKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshUsers();
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  }, [refreshUsers]);

  const handleStatusToggle = useCallback(
    async (id: string) => {
      try {
        await toggleUserStatus(id);
      } catch (error) {
        console.error('Erro ao alterar status:', error);
        // O erro já é tratado no store e exibido na interface
      }
    },
    [toggleUserStatus]
  );

  const handleEdit = useCallback(
    (id: string) => {
      const userToEdit = users.find((user) => user.id === id);
      if (userToEdit) {
        setSelectedUser(userToEdit);
        setEditDialogOpen(true);
      }
    },
    [users]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const userToDelete = users.find((user) => user.id === id);
      if (userToDelete) {
        setSelectedUser(userToDelete);
        setDeleteDialogOpen(true);
      }
    },
    [users]
  );

  const getUserRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'OPERATOR':
        return 'Operador';
      default:
        return role;
    }
  };

  const getUserRoleColor = (
    role: string
  ): 'primary' | 'secondary' | 'default' => {
    switch (role) {
      case 'ADMIN':
        return 'primary';
      case 'OPERATOR':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const columns: DataGridColumn[] = [
    {
      field: 'login',
      headerName: 'Login',
      width: 150,
      sortable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      sortable: true,
    },
    {
      field: 'name',
      headerName: 'Nome',
      width: 200,
      sortable: true,
      renderCell: (params) => <span>{params.value || 'Não informado'}</span>,
    },
    {
      field: 'userRole',
      headerName: 'Perfil',
      width: 140,
      sortable: true,
      renderCell: (params) => (
        <Chip
          label={getUserRoleLabel(params.value as string)}
          color={getUserRoleColor(params.value as string)}
          size="small"
        />
      ),
    },
    {
      field: 'tenantName',
      headerName: 'Organização',
      width: 150,
      sortable: true,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      sortable: true,
      renderCell: (params) => (
        <Tooltip title={params.value ? 'Usuário ativo' : 'Usuário inativo'}>
          <Switch
            checked={params.value as boolean}
            onChange={() => handleStatusToggle(params.row.id as string)}
            size="small"
            color="primary"
            disabled={isLoading}
          />
        </Tooltip>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      width: 120,
      sortable: true,
      renderCell: (params) => (
        <span>
          {new Date(params.value as string).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Editar usuário">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row.id as string)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir usuário">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id as string)}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Usuários
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Barra de busca */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por login, email ou nome..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{ minWidth: 100 }}
          >
            Buscar
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            sx={{ minWidth: 100, px: 2 }}
          >
            <RefreshIcon />
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreateDialogOpen(true)}
            startIcon={<PersonAddIcon />}
            sx={{ width: 200, px: 2, flexGrow: 1 }}
          >
            Criar Usuário
          </Button>
        </Box>
      </Paper>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Dados carregados via loader: {loaderData.users.total} usuários
        encontrados
      </Typography>

      <ReusableDataGrid
        rows={users}
        columns={columns}
        totalRows={totalUsers}
        loading={isLoading}
        error={error}
        pagination={paginationModel}
        onPaginationChange={handlePaginationChange}
        onSortChange={handleSortChange}
        getRowId={(row) => (row as User).id}
        autoHeight
        rowHeight={60}
        sx={{
          '& .MuiDataGrid-cell--textLeft': {
            paddingLeft: 2,
          },
          '& .MuiDataGrid-columnHeader--sortable': {
            fontWeight: 600,
          },
        }}
      />

      {/* Dialog de criação de usuário */}
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Dialog de edição de usuário */}
      <EditUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />

      {/* Dialog de exclusão de usuário */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </Box>
  );
}
