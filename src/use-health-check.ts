import { useState, useEffect, useCallback } from 'react';

import {
  HealthCheckConfig,
  ServiceHealthCheckResult,
  HealthCheckState,
  HealthCheckReturn,
} from './types';
import { checkServiceHealth, updateServiceState } from './helpers';

/* useHealthCheck
============================================================================= */
const useHealthCheck = <S = string>(config: HealthCheckConfig<S>): HealthCheckReturn<S> => {
  const [services] = useState<HealthCheckConfig<S>['services']>(config?.services);
  const [states, setStates] = useState<HealthCheckState<S>[]>(
    config?.services.map((service) => ({
      service,
      available: true,
      since: Date.now(),
      last: null,
    })),
  );

  const checkServices = useCallback(() => {
    return setInterval(() => {
      const requests: Promise<ServiceHealthCheckResult<S>>[] = [];

      services.forEach((service) => requests.push(checkServiceHealth<S>(service)));

      Promise.all(requests)
        .then((results) => {
          setStates((prevStates) => {
            const nextStates = results.map((result) =>
              updateServiceState<S>(
                prevStates.find((state) => state.service.name === result.service.name),
                result,
              ),
            );

            return nextStates;
          });
        })
        .catch(() => {
          typeof config?.onError === 'function' && config.onError(states);
        });
    }, config?.refreshInterval ?? 3000);
  }, [config, services, states]);

  useEffect(() => {
    const intervalId = checkServices();

    return () => {
      clearInterval(intervalId);
    };
  }, [checkServices]);

  useEffect(() => {
    const changedStates = states.filter((state) => state.since === state.last);

    if (!changedStates.length) {
      return;
    }

    if (states.every((state) => state.available)) {
      typeof config.onSuccess === 'function' && config.onSuccess(states);
      return;
    }

    if (states.some((state) => !state.available)) {
      typeof config?.onError === 'function' && config.onError(states);
    }
  }, [config, states]);

  return { states };
};

export default useHealthCheck;
