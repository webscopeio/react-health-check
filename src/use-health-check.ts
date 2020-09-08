import { useState, useEffect, useCallback, useContext } from 'react';
import HealthCheckConfig from './config';

import { checkServiceHealth, mergeConfigs, updateServiceState } from './helpers';
import { LocalConfigInterface, ServiceHealthCheckReturn, ServiceState } from './types';

/* useHealthCheck
============================================================================= */
function useHealthCheck<S = string>(serviceName: S): ServiceHealthCheckReturn;
function useHealthCheck<S = string>(
  serviceName: S,
  localConfig?: Omit<LocalConfigInterface, 'service'>,
): ServiceHealthCheckReturn;
function useHealthCheck<S = string>(localConfig: LocalConfigInterface<S>): ServiceHealthCheckReturn;

function useHealthCheck<S = string>(
  ...args: Array<S | LocalConfigInterface | Omit<LocalConfigInterface, 'service'>>
): ServiceHealthCheckReturn {
  const serviceName = typeof args[0] === 'string' ? args[0] : null;
  const localConfig =
    typeof args[0] === 'string'
      ? (args[1] as Omit<LocalConfigInterface, 'service'>)
      : (args[0] as LocalConfigInterface);

  const globalConfig = useContext(HealthCheckConfig);

  const config = mergeConfigs(serviceName, localConfig, globalConfig);

  const [state, setState] = useState<ServiceState>({
    service: config.service,
    available: true,
    since: Date.now(),
    last: null,
  });

  const checkService = useCallback(async (config: LocalConfigInterface) => {
    const { service } = config;
    const checkResult = await checkServiceHealth(service);

    setState((prevState) => ({
      ...updateServiceState(prevState, checkResult),
      service,
    }));
  }, []);

  const startCheckingInterval = useCallback(() => {
    return setInterval(() => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'hidden' &&
        !config.refreshWhileHidden
      ) {
        return;
      }

      checkService(config);
    }, config.refreshInterval);
  }, [config, checkService]);

  useEffect(() => {
    const intervalId = startCheckingInterval();

    return () => {
      clearInterval(intervalId);
    };
  }, [startCheckingInterval]);

  useEffect(() => {
    if (state.since !== state.last) {
      return;
    }

    if (state.available) {
      typeof config.onSuccess === 'function' && config.onSuccess(state);

      return;
    } else {
      typeof config.onError === 'function' && config.onError(state);
    }
  }, [config, state]);

  return {
    ...state,
    refresh: async () => {
      await checkService(config);
    },
  };
}

export default useHealthCheck;
