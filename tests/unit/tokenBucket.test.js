import { jest } from '@jest/globals';

// Mock the repository module
jest.unstable_mockModule('../../src/repositories/bucketStateRepository.js', () => {
    return {
        getForUpdate: jest.fn(),
        upsert: jest.fn(),
    };
});

// Import service and mock after mocking
const { checkLimit } = await import('../../src/services/tokenBucket/tokenBucketService.js');
const bucketStateRepository = await import('../../src/repositories/bucketStateRepository.js');

describe('Token Bucket Service Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Should ALLOW request if bucket has enough tokens (1st request)', async () => {
        bucketStateRepository.getForUpdate.mockResolvedValue(null);
        bucketStateRepository.upsert.mockResolvedValue(undefined);

        const clientKey = 'test_client';
        const rate = 1;  // 1 token per second
        const burst = 5; // Bucket capacity 5
        const fakeTx = {};

        const result = await checkLimit(clientKey, rate, burst, fakeTx);

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4); // 5 total capacity, 1 consumed
        expect(result.limit).toBe(5);

        expect(bucketStateRepository.upsert).toHaveBeenCalledWith(
            clientKey,
            4,
            expect.any(Date),
            fakeTx
        );
    });

    test('Should DENY request if bucket is empty (0 tokens)', async () => {
        const fakeState = {
            client_key: 'test_client',
            tokens: 0,
            last_refill: new Date(),
        };
        bucketStateRepository.getForUpdate.mockResolvedValue(fakeState);

        const result = await checkLimit('test_client', 1, 5, {});

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    });

    test('Should ALLOW request and refill tokens based on elapsed time', async () => {
        const twoSecondsAgo = new Date(Date.now() - 2000);
        const fakeState = {
            client_key: 'test_client',
            tokens: 1,
            last_refill: twoSecondsAgo,
        };
        bucketStateRepository.getForUpdate.mockResolvedValue(fakeState);
        bucketStateRepository.upsert.mockResolvedValue(undefined);

        const result = await checkLimit('test_client', 2, 5, {});

        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
    });
});
