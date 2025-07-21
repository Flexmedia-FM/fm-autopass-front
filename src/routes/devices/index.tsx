import { useLoaderData } from 'react-router-dom';
import { Card, CardContent, Typography, Chip, Box, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useDevicesStore } from './store';
import { CustomButton } from '../../shared/ui';
import type { DevicesLoaderData } from './loader';

export default function DevicesRoute() {
  const loaderData = useLoaderData() as DevicesLoaderData;
  const { devices, error, addDevice } = useDevicesStore();

  const getStatusColor = (
    status: string
  ): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sensor':
        return 'Sensor';
      case 'camera':
        return 'Câmera';
      case 'access-control':
        return 'Controle de Acesso';
      default:
        return 'Outro';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'maintenance':
        return 'Manutenção';
      default:
        return status;
    }
  };

  const handleAddDevice = () => {
    addDevice({
      name: `Novo Dispositivo ${devices.length + 1}`,
      type: 'sensor',
      status: 'active',
      location: 'Nova Localização',
      lastUpdate: new Date().toISOString(),
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dispositivos
        </Typography>
        <CustomButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddDevice}
        >
          Adicionar Dispositivo
        </CustomButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Dados carregados via loader: {loaderData.devices.length} dispositivos
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: 3,
        }}
      >
        {devices.map((device) => (
          <Card key={device.id} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {device.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {getTypeLabel(device.type)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Localização:</strong> {device.location}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 2,
                }}
              >
                <Chip
                  label={getStatusLabel(device.status)}
                  color={getStatusColor(device.status)}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  Atualizado: {new Date(device.lastUpdate).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {devices.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum dispositivo encontrado
          </Typography>
        </Box>
      )}
    </Box>
  );
}
