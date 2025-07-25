import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { CustomButton } from '../../shared/ui';
import type { Atm } from '../../shared/services';

interface DeleteAtmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  atm: Atm;
  isLoading?: boolean;
}

export default function DeleteAtmDialog({
  open,
  onClose,
  onConfirm,
  atm,
  isLoading = false,
}: DeleteAtmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            Tem certeza que deseja excluir o ATM abaixo?
          </Typography>

          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'grey.50',
              mt: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Código:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {atm.code}
            </Typography>

            <Typography variant="subtitle2" color="text.secondary">
              Nome:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {atm.name}
            </Typography>

            {atm.location && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Localização:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {atm.location}
                </Typography>
              </>
            )}

            {atm.address && (
              <>
                <Typography variant="subtitle2" color="text.secondary">
                  Endereço:
                </Typography>
                <Typography variant="body1">{atm.address}</Typography>
              </>
            )}
          </Box>
        </Box>

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os
            dados relacionados a este ATM serão permanentemente removidos.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <CustomButton variant="outlined" onClick={onClose} disabled={isLoading}>
          Cancelar
        </CustomButton>
        <CustomButton
          variant="contained"
          color="error"
          onClick={onConfirm}
          loading={isLoading}
        >
          Excluir ATM
        </CustomButton>
      </DialogActions>
    </Dialog>
  );
}
