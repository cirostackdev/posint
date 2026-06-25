import http from "k6/http"
import { check, sleep, group } from "k6"
import { Rate, Trend } from "k6/metrics"

const errorRate = new Rate("errors")
const apiLatency = new Trend("api_latency", true)

export const options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "1m", target: 500 },
    { duration: "2m", target: 1000 },
    { duration: "1m", target: 1000 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    errors: ["rate<0.05"],
    api_latency: ["p(95)<1500"],
  },
}

const BASE_URL = __ENV.API_URL || "http://localhost:4000/api/v1"

export default function () {
  group("Public Endpoints", () => {
    const healthRes = http.get(`${BASE_URL}/health`)
    check(healthRes, { "health 200": (r) => r.status === 200 })
    errorRate.add(healthRes.status !== 200)

    const statsRes = http.get(`${BASE_URL}/stats`)
    check(statsRes, { "stats 200": (r) => r.status === 200 })
    apiLatency.add(statsRes.timings.duration)
    errorRate.add(statsRes.status !== 200)

    const politiciansRes = http.get(`${BASE_URL}/politicians?page=1&limit=20`)
    check(politiciansRes, {
      "politicians 200": (r) => r.status === 200,
      "politicians has data": (r) => {
        try { return JSON.parse(r.body).data !== undefined } catch { return false }
      },
    })
    apiLatency.add(politiciansRes.timings.duration)
    errorRate.add(politiciansRes.status !== 200)

    const partiesRes = http.get(`${BASE_URL}/parties`)
    check(partiesRes, { "parties 200": (r) => r.status === 200 })
    apiLatency.add(partiesRes.timings.duration)

    const casesRes = http.get(`${BASE_URL}/corruption/cases?page=1&limit=20`)
    check(casesRes, { "cases 200": (r) => r.status === 200 })
    apiLatency.add(casesRes.timings.duration)

    const billsRes = http.get(`${BASE_URL}/legislature/bills?page=1&limit=20`)
    check(billsRes, { "bills 200": (r) => r.status === 200 })
    apiLatency.add(billsRes.timings.duration)

    const searchRes = http.get(`${BASE_URL}/search?q=tinubu`)
    check(searchRes, { "search ok": (r) => r.status === 200 || r.status === 404 })
    apiLatency.add(searchRes.timings.duration)
  })

  group("Auth Endpoints", () => {
    const loginRes = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({ email: "loadtest@posint.ng", password: "LoadTest123!" }),
      { headers: { "Content-Type": "application/json" } }
    )

    if (loginRes.status === 200) {
      try {
        const token = JSON.parse(loginRes.body).data?.accessToken
        if (token) {
          const adminStatsRes = http.get(`${BASE_URL}/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          check(adminStatsRes, { "admin stats auth ok": (r) => r.status === 200 || r.status === 403 })
          apiLatency.add(adminStatsRes.timings.duration)
        }
      } catch {}
    }
  })

  sleep(Math.random() * 2 + 1)
}
