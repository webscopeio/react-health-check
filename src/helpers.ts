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
  timestamp:
    !prevState.timestamp || prevState.available != checkResult.available
      ? checkResult.timestamp
      : prevState.timestamp,
});

/**
 * Helper function to extract service from local or global config.
 * @param serviceName Name of service (used if services are defined globally)
 * @param localConfig Local configuration object
 * @param globalConfig Global configuration object (context)
 */
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

/**
 * Helper function to merge configurations (local configuration has a higher priority).
 * @param serviceName Name of service (used if services are defined globally)
 * @param localConfig Local configuration object
 * @param globalConfig Global configuration object (context)
 */
export const mergeConfigs = (
  serviceName: string,
  localConfig: LocalConfigInterface | Omit<LocalConfigInterface, 'service'> = {},
  globalConfig: GlobalConfigInterface = {},
): LocalConfigInterface => ({
  service: extractServiceConfig(serviceName, localConfig, globalConfig),
  onSuccess: localConfig.onSuccess ?? globalConfig.onSuccess,
  onError: localConfig.onError ?? globalConfig.onError,
  refreshInterval: localConfig.refreshInterval ?? globalConfig.refreshInterval ?? 5000,
  refreshWhileHidden: localConfig.refreshWhileHidden ?? globalConfig.refreshWhileHidden ?? false,
});
