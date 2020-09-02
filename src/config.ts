import { createContext } from 'react';

import { GlobalConfigInterface } from './types';

/* HealthCheckConfig
============================================================================= */
const HealthCheckConfig = createContext<GlobalConfigInterface>({
  onError: () => null,
  onSuccess: () => null,
  refreshInterval: 3000,
});

HealthCheckConfig.displayName = 'HealthCheckConfig';

export const Provider = HealthCheckConfig.Provider;
export default HealthCheckConfig;
