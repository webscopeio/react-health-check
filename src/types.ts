export type HealthCheckState<S = string> = {
  service: HealthCheckService<S>;
  available: boolean;
  since: number;
  last: number;
};

export type HealthCheckService<S = string> = {
  name: S;
  url: string;
};

export type HealthCheckConfig<S = string> = {
  services: HealthCheckService<S>[];
  onError?: (states: HealthCheckState<S>[]) => void;
  onSuccess?: (states: HealthCheckState<S>[]) => void;
  refreshInterval?: number;
};

export type HealthCheckReturn<S = string> = {
  states: HealthCheckState<S>[];
};

export type ServiceHealthCheckResult<S = string> = {
  service: HealthCheckService<S>;
  available: boolean;
  timestamp: number;
};
