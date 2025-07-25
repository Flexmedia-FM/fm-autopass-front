/* eslint-disable react-refresh/only-export-components */
import type { AtmsResponse } from '../../shared/services/atms';

export { default as AtmsRoute } from './AtmsRoute';
export { default as CreateAtmDialog } from './CreateAtmDialog';
export { default as EditAtmDialog } from './EditAtmDialog';
export { default as DeleteAtmDialog } from './DeleteAtmDialog';
export { atmsLoader } from './loader';
export { useAtmsStore } from './store';
export { useInstallations } from './useInstallations';
export type {
  Atm,
  CreateAtm,
  UpdateAtm,
  AtmStatus,
  AtmsResponse,
} from '../../shared/services/atms';

// Tipo específico da rota
export interface AtmsLoaderData {
  atms: AtmsResponse;
}
