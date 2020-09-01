import axios from 'redaxios';

import { ServiceHealthCheckResult, HealthCheckState, HealthCheckService } from './types';

/**
 * Helper function to check service health.
 * @param service Object describing service that should be checked
 */
export const checkServiceHealth = <S = string>(
  service: HealthCheckService<S>,
): Promise<ServiceHealthCheckResult<S>> => {
  return axios
    .get<void>(service.url)
    .then<ServiceHealthCheckResult<S>>(() => {
      return { service, available: true, timestamp: Date.now() };
    })
    .catch<ServiceHealthCheckResult<S>>(() => {
      return { service, available: false, timestamp: Date.now() };
    });
};

/**
 * Helper function to update service state when new health check result comes in.
 * @param prevState Previous service state
 * @param checkResult Health check result
 */
export const updateServiceState = <S = string>(
  prevState: HealthCheckState<S>,
  checkResult: ServiceHealthCheckResult<S>,
): HealthCheckState<S> => ({
  service: checkResult.service,
  available: checkResult.available,
  since:
    !prevState.since || prevState.available != checkResult.available
      ? checkResult.timestamp
      : prevState.since,
  last: checkResult.timestamp,
});
