import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/utils/prismaClient.js';

// Increase Jest timeout for these database integration tests
jest.setTimeout(60000);

describe('API Integration Tests', () => {
    beforeEach(async () => {
        // Clean database tables before each test to ensure test isolation
        await prisma.request_logs.deleteMany({});
        await prisma.bucket_state.deleteMany({});
        await prisma.clients.deleteMany({});
    });

    afterAll(async () => {
        // Close database connection after all tests run
        await prisma.$disconnect();
    });

    describe('Admin Client Management Endpoints', () => {
        test('POST /admin/client - Should create a new client config', async () => {
            const res = await request(app)
                .post('/admin/client')
                .send({
                    clientKey: 'client_tb_1',
                    algorithm: 'token_bucket',
                    rate: 5,
                    burst: 10
                });

            expect(res.status).toBe(201);
            expect(res.body.message).toBe('Client created successfully');
            expect(res.body.client).toEqual({
                clientKey: 'client_tb_1',
                algorithm: 'token_bucket',
                rate: 5,
                burst: 10
            });
        });

        test('GET /admin/client/:clientKey - Should retrieve client details', async () => {
            // Create a client directly in DB
            await prisma.clients.create({
                data: {
                    client_key: 'client_tb_2',
                    algorithm: 'token_bucket',
                    rate: 3,
                    burst: 5
                }
            });

            const res = await request(app)
                .get('/admin/client/client_tb_2');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                clientKey: 'client_tb_2',
                algorithm: 'token_bucket',
                rate: 3,
                burst: 5
            });
        });

        test('PUT /admin/client/:clientKey - Should update client settings', async () => {
            await prisma.clients.create({
                data: {
                    client_key: 'client_tb_3',
                    algorithm: 'token_bucket',
                    rate: 3,
                    burst: 5
                }
            });

            const res = await request(app)
                .put('/admin/client/client_tb_3')
                .send({
                    rate: 8,
                    burst: 12
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Client updated');
            expect(res.body.client).toEqual({
                clientKey: 'client_tb_3',
                algorithm: 'token_bucket',
                rate: 8,
                burst: 12
            });
        });
    });

    describe('Rate Limiter Check Endpoint', () => {
        test('POST /check - Token Bucket flow: allow within limit, deny when empty', async () => {
            // Create client with rate = 0 so that it does not refill during the test execution
            await request(app)
                .post('/admin/client')
                .send({
                    clientKey: 'tb_test_user',
                    algorithm: 'token_bucket',
                    rate: 0,
                    burst: 2
                });

            // 1st request - allowed
            let res = await request(app)
                .post('/check')
                .send({ clientKey: 'tb_test_user' });

            expect(res.status).toBe(200);
            expect(res.body.allowed).toBe(true);
            expect(res.body.remaining).toBe(1);
            expect(res.headers['x-ratelimit-limit']).toBe('2');
            expect(res.headers['x-ratelimit-remaining']).toBe('1');

            // 2nd request - allowed
            res = await request(app)
                .post('/check')
                .send({ clientKey: 'tb_test_user' });

            expect(res.status).toBe(200);
            expect(res.body.allowed).toBe(true);
            expect(res.body.remaining).toBe(0);
            expect(res.headers['x-ratelimit-remaining']).toBe('0');

            // 3rd request - denied (429 Too Many Requests)
            res = await request(app)
                .post('/check')
                .send({ clientKey: 'tb_test_user' });

            expect(res.status).toBe(429);
            expect(res.body.allowed).toBe(false);
            expect(res.body.remaining).toBe(0);
        });

        test('POST /check - Sliding Window flow: allow within limit, deny when exceeded', async () => {
            // Create sliding window client
            await request(app)
                .post('/admin/client')
                .send({
                    clientKey: 'sw_test_user',
                    algorithm: 'sliding_window',
                    rate: 2,
                    burst: 60 // 60 seconds window
                });

            // 1st request
            let res = await request(app)
                .post('/check')
                .send({ clientKey: 'sw_test_user' });

            expect(res.status).toBe(200);
            expect(res.body.allowed).toBe(true);
            expect(res.body.remaining).toBe(1);

            // 2nd request
            res = await request(app)
                .post('/check')
                .send({ clientKey: 'sw_test_user' });

            expect(res.status).toBe(200);
            expect(res.body.allowed).toBe(true);
            expect(res.body.remaining).toBe(0);

            // 3rd request - blocked
            res = await request(app)
                .post('/check')
                .send({ clientKey: 'sw_test_user' });

            expect(res.status).toBe(429);
            expect(res.body.allowed).toBe(false);
        });
    });
});
