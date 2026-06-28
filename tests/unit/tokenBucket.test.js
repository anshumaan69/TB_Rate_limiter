import { jest } from '@jest/globals';

// 1. Repository ko mock karenge taaki actual database queries na chalein
jest.unstable_mockModule('../../src/repositories/bucketStateRepository.js', () => {
    return {
        getForUpdate: jest.fn(),
        upsert: jest.fn(),
    };
});

describe('Token Bucket Service Unit Tests', () => {
    let checkLimit;
    let bucketStateRepository;

    // 2. Tests register hone ke baad, hum beforeAll me modules ko import karenge
    beforeAll(async () => {
        const service = await import('../../src/services/tokenBucket/tokenBucketService.js');
        checkLimit = service.checkLimit;
        bucketStateRepository = await import('../../src/repositories/bucketStateRepository.js');
    });

    beforeEach(() => {
        // Har test se pehle mocks ko clear karenge
        jest.clearAllMocks();
    });

    test('Should ALLOW request if bucket has enough tokens (1st request)', async () => {
        // Pehli request ke liye DB me koi state nahi hogi (null return hoga)
        bucketStateRepository.getForUpdate.mockResolvedValue(null);
        bucketStateRepository.upsert.mockResolvedValue(undefined);

        const clientKey = 'test_client';
        const rate = 1;  // 1 token per second
        const burst = 5; // Bucket capacity 5

        // Transaction mock object (tx) pass karenge
        const fakeTx = {};

        const result = await checkLimit(clientKey, rate, burst, fakeTx);

        // Assertions (Checks)
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4); // 5 total capacity thi, 1 request consume ho gayi
        expect(result.limit).toBe(5);

        // Check karein ki repository ka upsert correctly call hua dynamic value ke sath
        expect(bucketStateRepository.upsert).toHaveBeenCalledWith(
            clientKey,
            4, // remaining tokens
            expect.any(Date),
            fakeTx
        );
    });
    import { jest } from '@jest/globals';

    // 1. Repository ko mock karenge taaki actual database queries na chalein
    jest.unstable_mockModule('../../src/repositories/bucketStateRepository.js', () => {
        return {
            getForUpdate: jest.fn(),
            upsert: jest.fn(),
        };
    });

    // 2. Mocking ke baad hum dynamically humare service aur mock repository ko import karenge
    const { checkLimit } = await import('../../src/services/tokenBucket/tokenBucketService.js');
    const bucketStateRepository = await import('../../src/repositories/bucketStateRepository.js');

    describe('Token Bucket Service Unit Tests', () => {
        beforeEach(() => {
            // Har test se pehle mocks ko clear karenge
            jest.clearAllMocks();
        });

        test('Should ALLOW request if bucket has enough tokens (1st request)', async () => {
            // Pehli request ke liye DB me koi state nahi hogi (null return hoga)
            bucketStateRepository.getForUpdate.mockResolvedValue(null);
            bucketStateRepository.upsert.mockResolvedValue(undefined);

            const clientKey = 'test_client';
            const rate = 1;  // 1 token per second
            const burst = 5; // Bucket capacity 5

            // Transaction mock object (tx) pass karenge
            const fakeTx = {};

            const result = await checkLimit(clientKey, rate, burst, fakeTx);

            // Assertions (Checks)
            expect(result.allowed).toBe(true);
            expect(result.remaining).toBe(4); // 5 total capacity thi, 1 request consume ho gayi
            expect(result.limit).toBe(5);

            // Check karein ki repository ka upsert correctly call hua dynamic value ke sath
            expect(bucketStateRepository.upsert).toHaveBeenCalledWith(
                clientKey,
                4, // remaining tokens
                expect.any(Date),
                fakeTx
            );
        });

        test('Should DENY request if bucket is empty (0 tokens)', async () => {
            // Ek fake state set karenge jisme tokens 0 hain
            const fakeState = {
                client_key: 'test_client',
                tokens: 0,
                last_refill: new Date(), // Just refilled now, so elapsed time is 0
            };
            bucketStateRepository.getForUpdate.mockResolvedValue(fakeState);

            const result = await checkLimit('test_client', 1, 5, {});

            expect(result.allowed).toBe(false);
            expect(result.remaining).toBe(0);
        });
    });

    test('Should DENY request if bucket is empty (0 tokens)', async () => {
        // Ek fake state set karenge jisme tokens 0 hain
        const fakeState = {
            client_key: 'test_client',
            tokens: 0,
            last_refill: new Date(), // Just refilled now, so elapsed time is 0
        };
        bucketStateRepository.getForUpdate.mockResolvedValue(fakeState);

        const result = await checkLimit('test_client', 1, 5, {});

        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    });
});
