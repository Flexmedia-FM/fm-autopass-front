import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  type GridFilterModel,
  type GridRowSelectionModel,
  type GridCallbackDetails,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarColumnsButton,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';

export interface DataGridColumn extends Omit<GridColDef, 'field'> {
  field: string;
  headerName: string;
}

export interface DataGridFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: unknown;
}

interface ReusableDataGridProps<T = Record<string, unknown>> {
  rows: T[];
  columns: DataGridColumn[];
  totalRows: number;
  loading?: boolean;
  error?: string | null;
  title?: string;
  pagination?: {
    page: number;
    pageSize: number;
  };
  onPaginationChange?: (model: GridPaginationModel) => void;
  onSortChange?: (model: GridSortModel) => void;
  onFilterChange?: (model: GridFilterModel) => void;
  disableColumnFilter?: boolean;
  disableColumnSelector?: boolean;
  disableDensitySelector?: boolean;
  getRowId?: (row: T) => string | number;
  sx?: object;
  height?: number | string;
  rowHeight?: number;
  headerHeight?: number;
  autoHeight?: boolean;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
  onRowSelectionModelChange?: (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails
  ) => void;
}

// Toolbar customizada com busca
function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ p: 2, justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
}

export function ReusableDataGrid({
  rows,
  columns,
  totalRows,
  loading = false,
  error = null,
  title,
  pagination = { page: 0, pageSize: 10 },
  onPaginationChange,
  onSortChange,
  onFilterChange,
  disableColumnFilter = false,
  disableColumnSelector = false,
  disableDensitySelector = false,
  getRowId,
  sx = {},
  height = 400,
  rowHeight = 52,
  headerHeight = 56,
  autoHeight = false,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
  onRowSelectionModelChange,
}: ReusableDataGridProps) {
  if (error) {
    return (
      <Paper sx={{ p: 2, ...sx }}>
        {title && (
          <Typography variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, ...sx }}>
      {title && (
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
      )}

      <Box sx={{ width: '100%', position: 'relative' }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={totalRows}
          loading={loading}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          paginationModel={pagination}
          onPaginationModelChange={onPaginationChange}
          onSortModelChange={onSortChange}
          onFilterModelChange={onFilterChange}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          disableColumnFilter={disableColumnFilter}
          disableColumnSelector={disableColumnSelector}
          disableDensitySelector={disableDensitySelector}
          getRowId={getRowId}
          autoHeight={autoHeight}
          rowHeight={rowHeight}
          columnHeaderHeight={headerHeight}
          checkboxSelection={checkboxSelection}
          disableRowSelectionOnClick={disableRowSelectionOnClick}
          onRowSelectionModelChange={onRowSelectionModelChange}
          slots={{
            toolbar: CustomToolbar,
          }}
          sx={{
            height: autoHeight ? 'auto' : height,
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: 'background.paper',
              fontWeight: 600,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
            ...sx,
          }}
          localeText={{
            // Tradução para português
            columnMenuLabel: 'Menu',
            columnMenuShowColumns: 'Mostrar colunas',
            columnMenuManageColumns: 'Gerenciar colunas',
            columnMenuFilter: 'Filtrar',
            columnMenuHideColumn: 'Ocultar coluna',
            columnMenuUnsort: 'Desfazer ordenação',
            columnMenuSortAsc: 'Ordenar crescente',
            columnMenuSortDesc: 'Ordenar decrescente',
            columnsManagementSearchTitle: 'Buscar',
            columnsManagementShowHideAllText: 'Mostrar/Ocultar Todas',
            toolbarDensity: 'Densidade',
            toolbarDensityLabel: 'Densidade',
            toolbarDensityCompact: 'Compacta',
            toolbarDensityStandard: 'Padrão',
            toolbarDensityComfortable: 'Confortável',
            toolbarColumns: 'Colunas',
            toolbarColumnsLabel: 'Selecionar colunas',
            toolbarFilters: 'Filtros',
            toolbarFiltersLabel: 'Mostrar filtros',
            toolbarFiltersTooltipHide: 'Ocultar filtros',
            toolbarFiltersTooltipShow: 'Mostrar filtros',
            toolbarExport: 'Exportar',
            toolbarExportLabel: 'Exportar',
            toolbarExportCSV: 'Exportar como CSV',
            toolbarExportPrint: 'Imprimir',
            noRowsLabel: 'Nenhum registro encontrado',
            noResultsOverlayLabel: 'Nenhum resultado encontrado',
            footerRowSelected: (count: number) =>
              count !== 1
                ? `${count.toLocaleString()} linhas selecionadas`
                : `${count.toLocaleString()} linha selecionada`,
            footerTotalRows: 'Total de linhas:',
            footerTotalVisibleRows: (
              visibleCount: number,
              totalCount: number
            ) =>
              `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
          }}
        />
      </Box>
    </Paper>
  );
}

export default ReusableDataGrid;
