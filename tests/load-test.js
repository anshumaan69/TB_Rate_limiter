import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 50 },  // Ramp up to 50 virtual users
        { duration: '30s', target: 100 }, // Steady state with 100 virtual users
        { duration: '10s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<150'], // 95% of requests must complete within 150ms
    },
};

// Setup runs once before the load test begins
export function setup() {
    const url = 'http://localhost:5000/admin/client';
    const payload = JSON.stringify({
        clientKey: 'k6_load_test_client',
        algorithm: 'token_bucket',
        rate: 200,      // 200 tokens per second
        burst: 500      // bucket capacity of 500
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Initialize/configure the client settings
    const res = http.post(url, payload, params);
    console.log(`Setup client configuration response status: ${res.status}`);
    return { clientKey: 'k6_load_test_client' };
}

export default function (data) {
    const url = 'http://localhost:5000/check';
    const payload = JSON.stringify({
        clientKey: data.clientKey,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post(url, payload, params);

    // Expect either 200 (allowed) or 429 (rate limited)
    check(res, {
        'status is 200 or 429': (r) => r.status === 200 || r.status === 429,
        'has rate limit headers': (r) => r.headers['X-Ratelimit-Limit'] !== undefined,
    });

    // Control the iteration throughput
    sleep(0.01);
}
