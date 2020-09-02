import {
  ServiceHealthCheckResult,
  ServiceState,
  Service,
  LocalConfigInterface,
  GlobalConfigInterface,
} from './types';

/**
 * Helper function to check service health.
 * @param service Object describing service that should be checked
 */
export const checkServiceHealth = (service: Service): Promise<ServiceHealthCheckResult> => {
  return fetch(service.url, {
    method: 'GET',
  })
    .then<ServiceHealthCheckResult>((response: Response) => {
      if (response?.status !== 200) {
        return { service, available: false, timestamp: Date.now() };
      }

      return { service, available: true, timestamp: Date.now() };
    })
    .catch<ServiceHealthCheckResult>(() => {
      return { service, available: false, timestamp: Date.now() };
    });
};

/**
 * Helper function to update service state when new health check result comes in.
 * @param prevState Previous service state
 * @param checkResult Health check result
 */
export const updateServiceState = (
  prevState: ServiceState,
  checkResult: ServiceHealthCheckResult,
): ServiceState => ({
  service: checkResult.service,
  available: checkResult.available,
  since:
    !prevState.since || prevState.available != checkResult.available
      ? checkResult.timestamp
      : prevState.since,
  last: checkResult.timestamp,
});

export const extractServiceConfig = (
  serviceName: string,
  localConfig: LocalConfigInterface | Omit<LocalConfigInterface, 'service'>,
  globalConfig: GlobalConfigInterface,
): Service => {
  let service: Service = null;

  if (serviceName) {
    service = globalConfig?.services?.find((service) => service.name === serviceName);
  }

  if ((localConfig as LocalConfigInterface)?.service) {
    service = (localConfig as LocalConfigInterface)?.service;
  }

  return service;
};
