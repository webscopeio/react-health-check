import { useState, useEffect, useCallback, useContext } from 'react';
import HealthCheckConfig from './config';

import { checkServiceHealth, extractServiceConfig, updateServiceState } from './helpers';
import { LocalConfigInterface, ServiceState } from './types';

/* useHealthCheck
============================================================================= */
function useHealthCheck<S = string>(
  serviceName: S,
  localConfig: Omit<LocalConfigInterface, 'service'>,
): ServiceState;
function useHealthCheck<S = string>(localConfig: LocalConfigInterface<S>): ServiceState;

function useHealthCheck<S = string>(
  ...args: Array<S | LocalConfigInterface | Omit<LocalConfigInterface, 'service'>>
): ServiceState {
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

  const checkService = useCallback(() => {
    return setInterval(async () => {
      const checkResult = await checkServiceHealth(state?.service);

      setState((prevState) => ({
        ...updateServiceState(prevState, checkResult),
        service: extractServiceConfig(serviceName, localConfig, globalConfig),
      }));
    }, localConfig?.refreshInterval ?? globalConfig?.refreshInterval ?? 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceName, localConfig, globalConfig]);

  useEffect(() => {
    const intervalId = checkService();

    return () => {
      clearInterval(intervalId);
    };
  }, [checkService]);

  useEffect(() => {
    if (state.since !== state.last) {
      return;
    }

    if (state.available) {
      typeof localConfig.onSuccess === 'function'
        ? localConfig.onSuccess(state)
        : globalConfig.onSuccess(state);

      return;
    } else {
      typeof localConfig?.onError === 'function'
        ? localConfig.onError(state)
        : globalConfig.onError(state);
    }
  }, [localConfig, globalConfig, state]);

  return { ...state };
}

export default useHealthCheck;
