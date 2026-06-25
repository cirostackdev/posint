# k6 Load Tests

## Installation

```bash
# Windows
winget install k6 --accept-package-agreements

# macOS
brew install k6
```

## Run

```bash
# Against local backend
k6 run k6/load-test.js --env API_URL=http://localhost:4000/api/v1

# Quick smoke test (10 users, 30s)
k6 run --vus 10 --duration 30s k6/load-test.js
```

## Thresholds

- p95 response time < 2s
- p99 response time < 5s  
- Error rate < 5%
- API latency p95 < 1.5s
