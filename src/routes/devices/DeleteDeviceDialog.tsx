import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
  Button,
  CircularProgress,
  TextField,
  Chip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { CustomButton } from '../../shared/ui';
import { useDevicesStore } from './store';
import {
  DeviceStatusLabels,
  DeviceStatusColors,
  type Device,
} from '../../shared/services/devices';

interface DeleteDeviceDialogProps {
  open: boolean;
  onClose: () => void;
  device: Device | null;
}

export function DeleteDeviceDialog({
  open,
  onClose,
  device,
}: DeleteDeviceDialogProps) {
  const { removeDevice, isLoading } = useDevicesStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleConfirmDelete = async () => {
    if (!device) {
      return;
    }

    try {
      setSubmitError(null);
      setIsDeleting(true);
      await removeDevice(device.id);
      // Pequeno delay para melhor UX
      setTimeout(() => {
        setIsDeleting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Erro ao excluir dispositivo:', error);
      setIsDeleting(false);
      setSubmitError(
        error instanceof Error ? error.message : 'Erro ao excluir dispositivo'
      );
    }
  };

  const handleCancel = () => {
    if (isDeleting) return; // Não permitir cancelar durante a exclusão
    setSubmitError(null);
    setConfirmationText('');
    onClose();
  };

  if (!device) {
    return null;
  }

  const isProcessing = isLoading || isDeleting;
  const isConfirmationValid = confirmationText.toLowerCase() === 'confirmar';

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon color="error" fontSize="large" />
          <Typography variant="h6" component="span">
            Confirmar Exclusão
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="body2" fontWeight="medium">
              ⚠️ Esta ação é irreversível!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Uma vez excluído, o dispositivo e todos os dados associados serão
              permanentemente removidos do sistema.
            </Typography>
          </Alert>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200',
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Dispositivo que será excluído:
            </Typography>

            <Typography variant="h6" gutterBottom>
              {device.serialNumber}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>ATM:</strong> {device.atm?.code || 'N/A'}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong>
                </Typography>
                <Chip
                  label={DeviceStatusLabels[device.status]}
                  color={DeviceStatusColors[device.status]}
                  size="small"
                  variant="outlined"
                />
              </Box>

              {device.installationDate && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Data de Instalação:</strong>{' '}
                  {new Date(device.installationDate).toLocaleDateString(
                    'pt-BR'
                  )}
                </Typography>
              )}

              {device.lastMaintenanceDate && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Última Manutenção:</strong>{' '}
                  {new Date(device.lastMaintenanceDate).toLocaleDateString(
                    'pt-BR'
                  )}
                </Typography>
              )}

              <Typography variant="body2" color="text.secondary">
                <strong>Criado em:</strong>{' '}
                {new Date(device.createdAt).toLocaleDateString('pt-BR')}
              </Typography>

              {device.notes && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Observações:</strong> {device.notes}
                </Typography>
              )}
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Tem certeza que deseja continuar com a exclusão?
          </Typography>

          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: 'error.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.200',
            }}
          >
            <Typography
              variant="body2"
              color="error.light"
              fontWeight="bold"
              gutterBottom
            >
              Para confirmar a exclusão, digite "CONFIRMAR" no campo abaixo:
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Digite CONFIRMAR para continuar"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isProcessing}
              sx={{ mt: 1 }}
              autoComplete="off"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <CustomButton
          variant="outlined"
          onClick={handleCancel}
          disabled={isProcessing}
          sx={{ minWidth: 120 }}
        >
          Cancelar
        </CustomButton>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirmDelete}
          disabled={isProcessing || !isConfirmationValid}
          startIcon={
            isProcessing ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <DeleteIcon />
            )
          }
          sx={{ minWidth: 120 }}
        >
          {isProcessing ? 'Excluindo...' : 'Excluir Dispositivo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteDeviceDialog;
