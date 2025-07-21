import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1, 3),
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: theme.shadows[4],
  },
  transition: 'all 0.2s ease-in-out',
}));

interface CustomButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function CustomButton({ children, ...props }: CustomButtonProps) {
  return <StyledButton {...props}>{children}</StyledButton>;
}

export default CustomButton;
