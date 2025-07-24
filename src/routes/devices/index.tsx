/* eslint-disable react-refresh/only-export-components */
import type { DevicesResponse } from '../../shared/services/devices';

export { default as DevicesRoute } from './DevicesRoute';
export { default as CreateDeviceDialog } from './CreateDeviceDialog';
export { default as EditDeviceDialog } from './EditDeviceDialog';
export { default as DeleteDeviceDialog } from './DeleteDeviceDialog';
export { devicesLoader } from './loader';
export { useDevicesStore } from './store';
export { useAtms } from './useAtms';
export type {
  Device,
  CreateDevice,
  UpdateDevice,
  DeviceStatus,
  DevicesResponse,
} from '../../shared/services/devices';

// Tipo específico da rota
export interface DevicesLoaderData {
  devices: DevicesResponse;
}
