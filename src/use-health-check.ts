import { useEffect, useCallback, useContext, useMemo, useRef, useState } from 'react';
import HealthCheckConfig from './config';

import { checkServiceHealth, mergeConfigs, updateServiceState } from './helpers';
import { LocalConfigInterface, ServiceHealthCheckReturn } from './types';

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

  const [, rerender] = useState(null);
  const serviceState = useRef({
    service: config.service,
    available: true,
    timestamp: null,
  });

  const checkService = useCallback(async (config: LocalConfigInterface) => {
    const { service } = config;
    const checkResult = await checkServiceHealth(service);

    if (serviceState.current.available != checkResult.available) {
      serviceState.current = updateServiceState(serviceState.current, checkResult);
      rerender({});
    }
  }, []);

  const refreshService = useCallback(async () => {
    await checkService(config);
  }, [config, checkService]);

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
  }, [checkService]);

  useEffect(() => {
    const intervalId = startCheckingInterval();

    return () => {
      clearInterval(intervalId);
    };
  }, [startCheckingInterval]);

  useEffect(() => {
    const state = serviceState.current;

    if (!state.timestamp) {
      return;
    }

    if (state.available) {
      typeof config.onSuccess === 'function' && config.onSuccess(state);
      return;
    } else {
      typeof config.onError === 'function' && config.onError(state);
    }
  }, [serviceState.current.available]);

  const memoizedState = useMemo<ServiceHealthCheckReturn>(() => {
    return {
      service: serviceState.current.service,
      available: serviceState.current.available,
      timestamp: serviceState.current.timestamp,
      refresh: refreshService,
    };
  }, [refreshService]);

  return memoizedState;
}

export default useHealthCheck;
