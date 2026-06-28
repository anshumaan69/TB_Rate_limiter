import { jest } from '@jest/globals';

// Mock the repository module
jest.unstable_mockModule('../../src/repositories/requestLogRepository.js', () => {
    return {
        countInWindow: jest.fn(),
        add: jest.fn(),
        clearOldLogs: jest.fn(),
    };
});

// Import service and mock after mocking
const { checkLimit } = await import('../../src/services/slidingWindow/slidingWindowService.js');
const requestLogRepository = await import('../../src/repositories/requestLogRepository.js');

describe('Sliding Window Service Unit Tests', () => {
    let fakeTx;

    beforeEach(() => {
        jest.clearAllMocks();
        fakeTx = {
            request_logs: {
                findFirst: jest.fn()
            }
        };
    });

    test('Should ALLOW request if request count is less than rate', async () => {
        requestLogRepository.countInWindow.mockResolvedValue(2);
        requestLogRepository.add.mockResolvedValue({});
        requestLogRepository.clearOldLogs.mockResolvedValue({});
        fakeTx.request_logs.findFirst.mockResolvedValue({
            request_time: new Date(Date.now() - 5000) // 5 seconds ago
        });

        const clientKey = 'test_client';
        const rate = 5;       // max 5 requests
        const burst = 10;     // window size 10 seconds

        const result = await checkLimit(clientKey, rate, burst, fakeTx);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(2); // rate(5) - count(2) - 1 = 2
        expect(result.limit).toBe(5);
        expect(requestLogRepository.add).toHaveBeenCalledWith(clientKey, fakeTx);
        expect(requestLogRepository.clearOldLogs).toHaveBeenCalledWith(clientKey, expect.any(Date), fakeTx);
    });

    test('Should DENY request if request count is equal to or exceeds rate', async () => {
        requestLogRepository.countInWindow.mockResolvedValue(5);
        fakeTx.request_logs.findFirst.mockResolvedValue({
            request_time: new Date(Date.now() - 8000)
        });

        const clientKey = 'test_client';
        const rate = 5;
        const burst = 10;

        const result = await checkLimit(clientKey, rate, burst, fakeTx);

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
        expect(requestLogRepository.add).not.toHaveBeenCalled();
    });

    test('Should set reset time to now + burst if no oldest request is found', async () => {
        requestLogRepository.countInWindow.mockResolvedValue(0);
        requestLogRepository.add.mockResolvedValue({});
        requestLogRepository.clearOldLogs.mockResolvedValue({});
        fakeTx.request_logs.findFirst.mockResolvedValue(null);

        const clientKey = 'test_client';
        const rate = 5;
        const burst = 10;

        const result = await checkLimit(clientKey, rate, burst, fakeTx);

        expect(result.allowed).toBe(true);
        expect(result.reset).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000));
    });
});
