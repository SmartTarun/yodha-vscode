import { LLMProvider } from '../llm/provider';
import { BaseAgent } from './base';
import { BackendDevAgent } from './backend-dev';
import { FrontendDevAgent } from './frontend-dev';
import { CloudArchAgent } from './cloud-arch';
import { QAAgent } from './qa-agent';
import { DevOpsEngAgent } from './devops-eng';
import { DBArchAgent } from './db-arch';
import { DataEngAgent } from './data-eng';
import { MobileDevAgent } from './mobile-dev';
import { UXDesignerAgent } from './ux-designer';
import { APISpecAgent } from './api-spec';
import { MLEngineerAgent } from './ml-engineer';
import { SecurityEngAgent } from './security-eng';
import { PerfEngAgent } from './perf-eng';
import { TechWriterAgent } from './tech-writer';
import { ComplianceAgent } from './compliance';

type AgentConstructor = new (provider: LLMProvider) => BaseAgent;

const AGENT_REGISTRY: Record<string, AgentConstructor> = {
    'backend-dev': BackendDevAgent,
    'frontend-dev': FrontendDevAgent,
    'cloud-arch': CloudArchAgent,
    'qa': QAAgent,
    'devops': DevOpsEngAgent,
    'db-arch': DBArchAgent,
    'data-eng': DataEngAgent,
    'mobile-dev': MobileDevAgent,
    'ux': UXDesignerAgent,
    'api-spec': APISpecAgent,
    'ml-eng': MLEngineerAgent,
    'security': SecurityEngAgent,
    'perf': PerfEngAgent,
    'tech-writer': TechWriterAgent,
    'compliance': ComplianceAgent,
};

export class AgentFactory {
    private readonly llmProvider: LLMProvider;
    private readonly cache = new Map<string, BaseAgent>();

    constructor(llmProvider: LLMProvider) {
        this.llmProvider = llmProvider;
    }

    getAgent(agentName: string): BaseAgent {
        if (this.cache.has(agentName)) {
            return this.cache.get(agentName)!;
        }

        const AgentClass = AGENT_REGISTRY[agentName];
        if (!AgentClass) {
            throw new Error(
                `Unknown agent: "${agentName}". Available: ${this.getAvailableAgentNames().join(', ')}`
            );
        }

        const agent = new AgentClass(this.llmProvider);
        this.cache.set(agentName, agent);
        return agent;
    }

    getAvailableAgentNames(): string[] {
        return Object.keys(AGENT_REGISTRY);
    }

    getAllAgentInfo(): { name: string; role: string; capabilities: string[] }[] {
        return this.getAvailableAgentNames().map(name => {
            const agent = this.getAgent(name);
            return {
                name,
                role: agent.getRole(),
                capabilities: agent.getCapabilities(),
            };
        });
    }
}
