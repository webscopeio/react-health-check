import { useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import HealthCheckConfig from './config';

import { checkServiceHealth, mergeConfigs, updateServiceState } from './helpers';
import { LocalConfigInterface, ServiceHealthCheckReturn } from './types';

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

  const serviceState = useRef({
    service: config.service,
    available: true,
    since: Date.now(),
    last: null,
  });

  const checkService = useCallback(async (config: LocalConfigInterface) => {
    const { service } = config;
    const checkResult = await checkServiceHealth(service);

    serviceState.current = updateServiceState(serviceState.current, checkResult);
  }, []);

  const refreshService = useCallback(async () => {
    await checkService(config);
  }, [checkService]);

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
    const state = serviceState.current;

    if (state.since !== state.last) {
      return;
    }

    if (state.available) {
      typeof config.onSuccess === 'function' && config.onSuccess(state);

      return;
    } else {
      typeof config.onError === 'function' && config.onError(state);
    }
  }, [config]);

  const memoizedState = useMemo<ServiceHealthCheckReturn>(() => {
    return {
      service: serviceState.current.service,
      available: serviceState.current.available,
      since: serviceState.current.since,
      refresh: refreshService,
    };
  }, [refreshService, serviceState.current.available]);

  return memoizedState;
}

export default useHealthCheck;
