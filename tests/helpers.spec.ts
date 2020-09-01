import { enableFetchMocks } from 'jest-fetch-mock';

import { checkServiceHealth, updateServiceState } from '../src/helpers';
import { HealthCheckService, ServiceHealthCheckResult, HealthCheckState } from '../src/types';

describe('Helpers', () => {
  enableFetchMocks();
  const RealDate = Date;

  beforeAll(() => {
    global.Date.now = jest.fn(() => 1598949813);
  });

  afterAll(() => {
    global.Date = RealDate;
  });

  const MOCK_SERVICES: HealthCheckService[] = [
    {
      name: 'auth',
      url: 'https://example.com/auth/health',
    },
    {
      name: 'payment',
      url: 'https://example.com/payment/health',
    },
  ];

  describe('checkServiceHealth', () => {
    beforeEach(() => {
      fetchMock.resetMocks();
    });

    it('Sends a GET request to a correct endpoint.', async () => {
      await checkServiceHealth(MOCK_SERVICES[0]);

      expect(fetchMock.mock.calls).toHaveLength(1);
      expect(fetchMock.mock.calls[0][0]).toEqual(MOCK_SERVICES[0].url);
      expect(fetchMock.mock.calls[0][1].method).toEqual('get');
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
      const PREV_STATE: HealthCheckState = {
        service: MOCK_SERVICES[0],
        available: true,
        since: null,
        last: null,
      };

      const CHECK_RESULT: ServiceHealthCheckResult = {
        service: MOCK_SERVICES[0],
        available: false,
        timestamp: Date.now(),
      };

      const NEXT_STATE: HealthCheckState = {
        service: MOCK_SERVICES[0],
        available: false,
        since: Date.now(),
        last: Date.now(),
      };

      expect(updateServiceState(PREV_STATE, CHECK_RESULT)).toEqual(NEXT_STATE);

      CHECK_RESULT.available = true;

      expect(updateServiceState(PREV_STATE, CHECK_RESULT)).toEqual({
        ...NEXT_STATE,
        available: true,
      });

      PREV_STATE.since = Date.now() - 1;

      expect(updateServiceState(PREV_STATE, CHECK_RESULT)).toEqual({
        ...NEXT_STATE,
        available: true,
        since: Date.now() - 1,
        last: Date.now(),
      });
    });
  });
});
