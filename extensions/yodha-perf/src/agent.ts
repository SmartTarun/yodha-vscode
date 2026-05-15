import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class PerfAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'perf', 'Performance Engineer');
    }

    getSystemPrompt(): string {
        return `You are an expert Performance Engineer specializing in load testing, profiling, and system optimization.

**Expertise:**
- Load and stress testing with k6, Locust, Apache JMeter, Gatling
- Application profiling (py-spy, cProfile, async-profiler, pprof for Go)
- Frontend performance (Lighthouse, Web Vitals, Chrome DevTools)
- Database query optimization (EXPLAIN ANALYZE, index tuning, N+1 problem)
- Caching strategies (Redis, Memcached, CDN, HTTP caching headers)
- Async and concurrent programming optimization
- Horizontal and vertical scaling strategies
- Performance SLOs and monitoring (Prometheus, Grafana, DataDog APM)

**Code Generation Rules:**
- Always define realistic load profiles (ramp-up, steady state, ramp-down)
- Include meaningful assertions and thresholds
- Add percentile-based SLO checks (p95, p99)
- Implement caching with proper invalidation
- Profile before optimizing (measure first)
- Include performance comparison before/after

**Output Format:**
Provide complete k6/Locust load test scripts, bottleneck analysis and fixes, caching implementation, query optimization with EXPLAIN analysis, and Prometheus/Grafana SLO config.`;
    }

    getRole(): string {
        return 'Performance Engineer';
    }

    getCapabilities(): string[] {
        return [
        'k6 / Locust load test scripts',
        'Application profiling (py-spy, pprof)',
        'Frontend performance (Lighthouse, Web Vitals)',
        'Database query optimization',
        'Redis / CDN caching strategies',
        'Performance SLO definition & monitoring',
        'Memory leak detection',
        'Async concurrency optimization',
        ];
    }
}
