export interface CommonConfigInterface<S = string> {
  refreshInterval?: number;
  onSuccess?: (state: ServiceState<S>) => void;
  onError?: (state: ServiceState<S>) => void;
}

export interface GlobalConfigInterface<S = string> extends CommonConfigInterface<S> {
  services?: [Service<S>, ...Service<S>[]];
}

export interface LocalConfigInterface<S = string> extends CommonConfigInterface<S> {
  service: Service<S>;
}

export type Service<S = string> = {
  name: S;
  url: string;
};

export type ServiceState<S = string> = {
  service: Service<S>;
  available: boolean;
  since: number;
  last: number;
};

export type ServiceHealthCheckResult = {
  service: Service;
  available: boolean;
  timestamp: number;
};
