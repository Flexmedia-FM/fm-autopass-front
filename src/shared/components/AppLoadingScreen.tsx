import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Componente de loading para inicialização da aplicação
 */
export function AppLoadingScreen() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        gap: 2,
      }}
    >
      <CircularProgress size={48} thickness={4} />
      <Typography variant="body1" color="text.secondary">
        Carregando aplicação...
      </Typography>
    </Box>
  );
}
