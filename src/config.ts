import { createContext } from 'react';

import { GlobalConfigInterface } from './types';

/* HealthCheckConfig
============================================================================= */
const HealthCheckConfig = createContext<GlobalConfigInterface>({
  onError: () => null,
  onSuccess: () => null,
});

HealthCheckConfig.displayName = 'HealthCheckConfig';

export const Provider = HealthCheckConfig.Provider;
export default HealthCheckConfig;
