import { useState, useEffect, useCallback, useContext } from 'react';
import HealthCheckConfig from './config';

import { checkServiceHealth, extractServiceConfig, updateServiceState } from './helpers';
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
  const [state, setState] = useState<ServiceState>({
    service: extractServiceConfig(serviceName, localConfig, globalConfig),
    available: true,
    since: Date.now(),
    last: null,
  });

  const startCheckingInterval = useCallback(() => {
    return setInterval(() => {
      checkService(serviceName, localConfig, globalConfig);
    }, localConfig?.refreshInterval ?? globalConfig?.refreshInterval ?? 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceName, localConfig, globalConfig]);

  const checkService = useCallback(
    async (serviceName, localConfig, globalConfig) => {
      const checkResult = await checkServiceHealth(state?.service);

      setState((prevState) => ({
        ...updateServiceState(prevState, checkResult),
        service: extractServiceConfig(serviceName, localConfig, globalConfig),
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startCheckingInterval],
  );

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
      typeof localConfig?.onSuccess === 'function'
        ? localConfig.onSuccess(state)
        : globalConfig.onSuccess(state);

      return;
    } else {
      typeof localConfig?.onError === 'function'
        ? localConfig.onError(state)
        : globalConfig.onError(state);
    }
  }, [localConfig, globalConfig, state]);

  return {
    ...state,
    refresh: async () => {
      await checkService(serviceName, localConfig, globalConfig);
    },
  };
}

export default useHealthCheck;
