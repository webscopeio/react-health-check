import { enableFetchMocks } from 'jest-fetch-mock';

import {
  checkServiceHealth,
  extractServiceConfig,
  mergeConfigs,
  updateServiceState,
} from '../src/helpers';
import {
  GlobalConfigInterface,
  LocalConfigInterface,
  Service,
  ServiceHealthCheckResult,
  ServiceState,
} from '../src/types';

describe('Helpers', () => {
  const MOCK_SERVICES: Service[] = [
    {
      name: 'auth',
      url: 'https://example.com/auth/health',
    },
    {
      name: 'payment',
      url: 'https://example.com/payment/health',
    },
  ];

  enableFetchMocks();
  const RealDate = Date;

  beforeAll(() => {
    global.Date.now = jest.fn(() => 1598949813);
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  describe('checkServiceHealth', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });

    it('Sends a GET request to a correct endpoint.', async () => {
      await checkServiceHealth(MOCK_SERVICES[0]);

      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(MOCK_SERVICES[0].url);
      expect(fetchMock.mock.calls[0][1].method).toEqual('GET');
    });

    it('Returns a correct result for a successful request.', async () => {
      fetchMock.mockResponse(JSON.stringify({}), {
        status: 200,
      });

      const result = await checkServiceHealth(MOCK_SERVICES[1]);

      const expectedResult: ServiceHealthCheckResult = {
        service: MOCK_SERVICES[1],
        available: true,
        timestamp: Date.now(),
      };

      expect(result).toEqual(expectedResult);
    });

    it('Returns a correct result for a failed request.', async () => {
      fetchMock.mockReject();

      const result = await checkServiceHealth(MOCK_SERVICES[1]);

      const expectedResult: ServiceHealthCheckResult = {
        service: MOCK_SERVICES[1],
        available: false,
        timestamp: Date.now(),
      };

      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateServiceState', () => {
    it('Updates service state correctly.', () => {
      const PREV_STATE: ServiceState = {
        service: MOCK_SERVICES[0],
        available: true,
        timestamp: null,
      };

      const CHECK_RESULT: ServiceHealthCheckResult = {
        service: MOCK_SERVICES[0],
        available: false,
        timestamp: Date.now(),
      };

      const NEXT_STATE: ServiceState = {
        service: MOCK_SERVICES[0],
        available: false,
        timestamp: Date.now(),
      };

      expect(updateServiceState(PREV_STATE, CHECK_RESULT)).toEqual(NEXT_STATE);

      CHECK_RESULT.available = true;

      expect(updateServiceState(PREV_STATE, CHECK_RESULT)).toEqual({
        ...NEXT_STATE,
        available: true,
      });

      PREV_STATE.timestamp = Date.now() - 1;

      expect(updateServiceState(PREV_STATE, CHECK_RESULT)).toEqual({
        ...NEXT_STATE,
        available: true,
        timestamp: Date.now() - 1,
      });
    });
  });

  describe('extractServiceConfig', () => {
    it('Extracts service config correctly.', () => {
      expect(
        extractServiceConfig(MOCK_SERVICES[0].name, undefined, {
          services: [MOCK_SERVICES[0], MOCK_SERVICES[1]],
        }),
      ).toEqual(MOCK_SERVICES[0]);

      expect(
        extractServiceConfig(
          MOCK_SERVICES[0].name,
          {
            refreshInterval: 3000,
          },
          {
            services: [MOCK_SERVICES[0], MOCK_SERVICES[1]],
          },
        ),
      ).toEqual(MOCK_SERVICES[0]);

      expect(
        extractServiceConfig(
          null,
          {
            service: MOCK_SERVICES[1],
            refreshInterval: 3000,
          },
          {
            services: [MOCK_SERVICES[0], MOCK_SERVICES[1]],
          },
        ),
      ).toEqual(MOCK_SERVICES[1]);
    });
  });

  describe('mergeConfigs', () => {
    const localConfig: LocalConfigInterface = {
      service: MOCK_SERVICES[0],
      onSuccess: jest.fn(),
      onError: jest.fn(),
      refreshInterval: 1000,
      refreshWhileHidden: true,
    };

    const globalConfig: GlobalConfigInterface = {
      services: MOCK_SERVICES,
      onSuccess: jest.fn(),
      onError: jest.fn(),
      refreshInterval: 10000,
      refreshWhileHidden: false,
    };

    it('Merges configs correctly.', () => {
      expect(mergeConfigs(undefined, localConfig, globalConfig)).toEqual(localConfig);

      expect(
        mergeConfigs(
          undefined,
          {
            ...localConfig,
            refreshInterval: undefined,
          },
          globalConfig,
        ),
      ).toEqual({
        ...localConfig,
        refreshInterval: globalConfig.refreshInterval,
      });

      expect(mergeConfigs('auth', undefined, globalConfig)).toEqual({
        ...globalConfig,
        services: undefined,
        service: MOCK_SERVICES[0],
      });
    });
  });
});
