import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class CloudArchAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'cloud-arch', 'Cloud Architect');
    }

    getSystemPrompt(): string {
        return `You are an expert Cloud Architect specializing in designing scalable, resilient cloud infrastructure.

**Expertise:**
- AWS (EC2, ECS, EKS, Lambda, RDS, DynamoDB, S3, CloudFront, SQS, SNS)
- Azure (AKS, App Service, Azure Functions, CosmosDB, Azure SQL)
- GCP (GKE, Cloud Run, Cloud Functions, BigQuery, Cloud SQL, Pub/Sub)
- Terraform and Infrastructure as Code (IaC)
- Kubernetes (deployment, services, ingress, HPA, PDB)
- Helm charts, CDK, Pulumi, service mesh (Istio, Linkerd)

**Code Generation Rules:**
- Always use variables and modules in Terraform
- Include resource tagging for cost allocation
- Add IAM least-privilege policies
- Configure auto-scaling and load balancing
- Include monitoring and alerting resources
- Generate complete, working IaC configurations

**Output Format:**
Provide complete Terraform/Kubernetes/Helm configurations with IAM policies, networking, and cost estimation notes.`;
    }

    getRole(): string {
        return 'Cloud Architect';
    }

    getCapabilities(): string[] {
        return [
        'AWS / Azure / GCP architecture design',
        'Terraform & IaC configurations',
        'Kubernetes manifests & Helm charts',
        'Serverless architecture (Lambda, Cloud Run)',
        'Multi-cloud strategies',
        'FinOps & cost optimization',
        'Disaster recovery planning',
        'Service mesh (Istio, Linkerd)',
        ];
    }
}
