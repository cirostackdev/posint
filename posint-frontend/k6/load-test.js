import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const BACKEND_URL = __ENV.BACKEND_URL || 'http://localhost:3001';

export const options = {
  stages: [
    { duration: '1m', target: 1000 }, // Ramp-up: 0 to 1000 users over 1 minute
    { duration: '1m', target: 1000 }, // Hold load: maintain 1000 users for 1 minute
    { duration: '1m', target: 0 },    // Ramp-down: 1000 to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests under 500ms, 99% under 1s
    http_req_failed: ['rate<0.1'], // Error rate must be less than 10%
  },
};

export default function () {
  // Group 1: Load home page
  group('Home Page', () => {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'home status is 200': (r) => r.status === 200,
      'home load time < 2s': (r) => r.timings.duration < 2000,
    });
    sleep(1);
  });

  // Group 2: View politician list
  group('Politician List', () => {
    const res = http.get(`${BASE_URL}/politicians`);
    check(res, {
      'politician list status 200': (r) => r.status === 200,
      'politician list duration < 1s': (r) => r.timings.duration < 1000,
    });
    sleep(1);
  });

  // Group 3: Search for politician via tRPC endpoint
  group('Search API', () => {
    const payload = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'politician.search',
      params: { query: 'tinubu', limit: 10 },
    });
    const res = http.post(`${BACKEND_URL}/api/v1/trpc`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      'search status 200': (r) => r.status === 200,
      'search duration < 500ms': (r) => r.timings.duration < 500,
    });
    sleep(1);
  });

  // Group 4: View election results
  group('Elections', () => {
    const res = http.get(`${BASE_URL}/elections`);
    check(res, {
      'elections status 200': (r) => r.status === 200,
      'elections duration < 1s': (r) => r.timings.duration < 1000,
    });
    sleep(1);
  });

  // Group 5: Check corruption statistics
  group('Corruption Stats', () => {
    const res = http.get(`${BASE_URL}/corruption`);
    check(res, {
      'corruption status 200': (r) => r.status === 200,
      'corruption duration < 1s': (r) => r.timings.duration < 1000,
    });
    sleep(1);
  });
}
