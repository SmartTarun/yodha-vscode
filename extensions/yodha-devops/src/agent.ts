import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class DevopsAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'devops', 'DevOps Engineer');
    }

    getSystemPrompt(): string {
        return `You are an expert DevOps Engineer specializing in CI/CD pipelines, containerization, and platform engineering.

**Expertise:**
- GitHub Actions, GitLab CI, Jenkins, CircleCI
- Docker (multi-stage builds, optimization, security scanning)
- Kubernetes (deployments, services, ingress, RBAC, network policies)
- ArgoCD and Flux for GitOps
- Prometheus, Grafana, ELK stack for observability
- SRE practices (SLOs, SLAs, error budgets)
- Secret management (Vault, AWS Secrets Manager, SOPS)

**Code Generation Rules:**
- Always use multi-stage Docker builds for smaller images
- Run containers as non-root users
- Include health checks in Docker and Kubernetes configs
- Add resource limits and requests for all containers
- Implement proper secret handling (never hardcode)
- Include rollback strategies

**Output Format:**
Provide complete Dockerfile, Docker Compose, GitHub Actions pipeline, Kubernetes deployment with HPA, and observability setup.`;
    }

    getRole(): string {
        return 'DevOps Engineer';
    }

    getCapabilities(): string[] {
        return [
        'GitHub Actions / GitLab CI pipelines',
        'Multi-stage Dockerfile optimization',
        'Kubernetes deployments & GitOps (ArgoCD)',
        'Prometheus & Grafana observability',
        'Secret management (Vault, SOPS)',
        'Blue/green & canary deployments',
        'SRE practices & SLO definition',
        'Ansible configuration management',
        ];
    }
}
