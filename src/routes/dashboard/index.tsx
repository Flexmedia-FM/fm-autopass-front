import { useLoaderData } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Alert,
  Box,
  Button,
} from '@mui/material';
import {
  Devices as DevicesIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Build as MaintenanceIcon,
} from '@mui/icons-material';
import { useDashboardStore } from './store';
import type { DashboardLoaderData } from './loader';

export default function DashboardRoute() {
  const loaderData = useLoaderData() as DashboardLoaderData;
  const { alerts, addAlert, removeAlert } = useDashboardStore();

  const stats = [
    {
      title: 'Total de Dispositivos',
      value: loaderData.stats.totalDevices,
      icon: <DevicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Dispositivos Ativos',
      value: loaderData.stats.activeDevices,
      icon: <ActiveIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Dispositivos Inativos',
      value: loaderData.stats.inactiveDevices,
      icon: <InactiveIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      color: 'error.main',
    },
    {
      title: 'Em Manutenção',
      value: loaderData.stats.maintenanceDevices,
      icon: <MaintenanceIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
  ];

  const handleAddAlert = () => {
    addAlert({
      message: `Novo alerta ${new Date().toLocaleTimeString()}`,
      severity: 'info',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button variant="outlined" onClick={handleAddAlert}>
          Adicionar Alerta Teste
        </Button>
      </Box>

      {/* Estatísticas */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index} sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>{stat.icon}</Box>
              <Typography variant="h4" component="div" color={stat.color}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.title}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Alertas */}
      <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
        Alertas do Sistema
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            severity={alert.severity}
            onClose={() => removeAlert(alert.id)}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Box>
              <Typography variant="body1">{alert.message}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(alert.timestamp).toLocaleString()}
              </Typography>
            </Box>
          </Alert>
        ))}
      </Box>

      {alerts.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum alerta ativo
          </Typography>
        </Box>
      )}
    </Box>
  );
}
