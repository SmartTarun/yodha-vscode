import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { PMAgent } from '../agents/orchestrator';
import { AgentFactory } from '../agents/factory';
import { AgentResult } from '../agents/base';
import { LLMUsage } from '../llm/provider';

const PARTICIPANT_ID = 'yodha.assistant';

// Command → agent name mapping for direct agent commands
const COMMAND_TO_AGENT: Record<string, string> = {
    backend: 'backend-dev',
    frontend: 'frontend-dev',
    cloud: 'cloud-arch',
    qa: 'qa',
    devops: 'devops',
    db: 'db-arch',
    data: 'data-eng',
    mobile: 'mobile-dev',
    ux: 'ux',
    api: 'api-spec',
    ml: 'ml-eng',
    security: 'security',
    perf: 'perf',
    docs: 'tech-writer',
    compliance: 'compliance',
};

function sumUsage(results: AgentResult[]): LLMUsage {
    return results.reduce(
        (acc, r) => ({
            inputTokens: acc.inputTokens + r.usage.inputTokens,
            outputTokens: acc.outputTokens + r.usage.outputTokens,
            totalTokens: acc.totalTokens + r.usage.totalTokens,
            estimatedCostUsd: acc.estimatedCostUsd + r.usage.estimatedCostUsd,
        }),
        { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0 }
    );
}

async function handleAgentsCommand(stream: vscode.ChatResponseStream): Promise<void> {
    stream.markdown('# Yodha AI Engineering Team\n\n');
    stream.markdown('**15 specialized agents ready to help you build production-grade software.**\n\n');

    const agents = [
        { cmd: '/backend', name: 'Backend Developer', desc: 'FastAPI, Node.js, Go, REST/GraphQL APIs' },
        { cmd: '/frontend', name: 'Frontend Developer', desc: 'React, Vue, Angular, TypeScript, Tailwind' },
        { cmd: '/cloud', name: 'Cloud Architect', desc: 'AWS/Azure/GCP, Terraform, Kubernetes' },
        { cmd: '/qa', name: 'QA Engineer', desc: 'pytest, Jest, Playwright, Cypress, k6' },
        { cmd: '/devops', name: 'DevOps Engineer', desc: 'GitHub Actions, Docker, ArgoCD, Prometheus' },
        { cmd: '/db', name: 'Database Architect', desc: 'PostgreSQL, MongoDB, Redis, migrations' },
        { cmd: '/data', name: 'Data Engineer', desc: 'Airflow, PySpark, dbt, Kafka, Delta Lake' },
        { cmd: '/mobile', name: 'Mobile Developer', desc: 'Swift/SwiftUI, Kotlin/Compose, React Native' },
        { cmd: '/ux', name: 'UX Designer', desc: 'Design systems, Tailwind UI, accessibility' },
        { cmd: '/api', name: 'API Specification', desc: 'OpenAPI 3.1, GraphQL SDL, gRPC Protobuf' },
        { cmd: '/ml', name: 'ML Engineer', desc: 'PyTorch, TensorFlow, MLflow, model serving' },
        { cmd: '/security', name: 'Security Engineer', desc: 'OWASP, SAST, Auth, encryption, threat modeling' },
        { cmd: '/perf', name: 'Performance Engineer', desc: 'k6, Locust, profiling, caching, optimization' },
        { cmd: '/docs', name: 'Technical Writer', desc: 'README, API docs, ADRs, runbooks, Mermaid' },
        { cmd: '/compliance', name: 'Compliance Engineer', desc: 'GDPR, SOC2, HIPAA, audit logs' },
    ];

    stream.markdown('| Command | Agent | Specialization |\n');
    stream.markdown('|---------|-------|----------------|\n');
    for (const a of agents) {
        stream.markdown(`| \`@yodha ${a.cmd}\` | **${a.name}** | ${a.desc} |\n`);
    }

    stream.markdown('\n---\n');
    stream.markdown('**Quick start:**\n');
    stream.markdown('- `@yodha /create build a todo app with React + FastAPI + PostgreSQL`\n');
    stream.markdown('- `@yodha /backend implement JWT authentication in FastAPI`\n');
    stream.markdown('- `@yodha /security review my API for OWASP Top 10 vulnerabilities`\n');
    stream.markdown('\n**Providers:** `vscode` (GitHub Copilot, no key needed) · `claude` · `openai` — configure via `yodha.aiProvider` in Settings.\n');
}

async function handleCreateCommand(
    prompt: string,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<void> {
    const provider = createLLMProvider();
    const pmAgent = new PMAgent(provider);
    const agentFactory = new AgentFactory(provider);

    stream.markdown(`**Provider:** ${provider.providerName} | **PM Model:** ${provider.pmModel} | **Worker Model:** ${provider.workerModel}\n\n`);
    stream.markdown('---\n\n');
    stream.markdown('**PM-Agent** is analyzing your request...\n\n');

    const plan = await pmAgent.createPlan(prompt, agentFactory.getAvailableAgentNames());

    stream.markdown(`**Plan:** ${plan.summary}\n\n`);
    stream.markdown(`**Agents engaged:** ${plan.estimatedAgents.join(', ')}\n\n`);
    stream.markdown('---\n\n');

    const results: AgentResult[] = [];

    for (let i = 0; i < plan.tasks.length; i++) {
        if (token.isCancellationRequested) {
            stream.markdown('\n\n*Request cancelled.*\n');
            break;
        }

        const task = pmAgent.buildHandoffContext(plan.tasks[i], results);
        let agent;
        try {
            agent = agentFactory.getAgent(task.agentName);
        } catch {
            stream.markdown(`\n> **Warning:** Unknown agent "${task.agentName}", skipping.\n\n`);
            continue;
        }

        stream.markdown(`### ${i + 1}. ${agent.getRole()}\n\n`);
        stream.markdown(`*${task.description}*\n\n`);

        const result = await agent.execute(task, text => stream.markdown(text));

        if (!result.success) {
            stream.markdown(`\n\n> **Error:** ${result.error}\n\n`);
        } else {
            stream.markdown('\n\n');
        }

        results.push(result);
        stream.markdown('---\n\n');
    }

    // Cost summary
    const usage = sumUsage(results);
    const costNote = usage.estimatedCostUsd > 0
        ? `Estimated cost: $${usage.estimatedCostUsd.toFixed(4)}`
        : 'Cost: covered by GitHub Copilot subscription';
    const tokenNote = usage.totalTokens > 0
        ? `Tokens: ${usage.totalTokens.toLocaleString()} | `
        : '';
    stream.markdown(`**Session summary** | ${tokenNote}${costNote}\n`);
}

async function handleDirectAgentCommand(
    agentName: string,
    prompt: string,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<void> {
    const provider = createLLMProvider();
    const agentFactory = new AgentFactory(provider);

    const agent = agentFactory.getAgent(agentName);

    stream.markdown(`**${agent.getRole()}** | Provider: ${provider.providerName}\n\n`);
    stream.markdown('---\n\n');

    const task = {
        id: 'direct-task',
        agentName,
        description: prompt,
        context: { userRequirement: prompt },
    };

    const result = await agent.execute(task, text => {
        if (!token.isCancellationRequested) {
            stream.markdown(text);
        }
    });

    if (!result.success) {
        stream.markdown(`\n\n> **Error:** ${result.error}\n`);
    }

    const tokenStr = result.usage.totalTokens > 0
        ? `Tokens: ${result.usage.totalTokens.toLocaleString()} | `
        : '';
    const costStr = result.usage.estimatedCostUsd > 0
        ? `Est. cost: $${result.usage.estimatedCostUsd.toFixed(4)}`
        : 'Cost: covered by GitHub Copilot subscription';
    stream.markdown(`\n\n---\n*${tokenStr}${costStr}*\n`);
}

export function registerChatParticipant(context: vscode.ExtensionContext): void {
    const participant = vscode.chat.createChatParticipant(
        PARTICIPANT_ID,
        async (
            request: vscode.ChatRequest,
            _chatContext: vscode.ChatContext,
            stream: vscode.ChatResponseStream,
            token: vscode.CancellationToken
        ) => {
            try {
                const command = request.command ?? '';
                const prompt = request.prompt.trim() || 'Please help me with my task.';

                if (command === 'agents') {
                    await handleAgentsCommand(stream);
                    return;
                }

                if (command === 'create') {
                    await handleCreateCommand(prompt, stream, token);
                    return;
                }

                const directAgent = COMMAND_TO_AGENT[command];
                if (directAgent) {
                    await handleDirectAgentCommand(directAgent, prompt, stream, token);
                    return;
                }

                // No command: default to /create behavior
                await handleCreateCommand(prompt, stream, token);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);

                if (message.includes('API key') || message.includes('not configured')) {
                    stream.markdown(`## Configuration Required\n\n${message}\n\n`);
                    stream.markdown('**Setup options:**\n');
                    stream.markdown('- **VS Code LLM (recommended):** Set `yodha.aiProvider` to `vscode` — uses your GitHub Copilot subscription, no extra key needed.\n');
                    stream.markdown('- **Claude:** Set `yodha.aiProvider` to `claude` and add your Anthropic API key in `yodha.claudeApiKey`.\n');
                    stream.markdown('- **OpenAI:** Set `yodha.aiProvider` to `openai` and add your OpenAI API key in `yodha.openaiApiKey`.\n');
                    stream.button({
                        command: 'workbench.action.openSettings',
                        title: 'Open Settings',
                        arguments: ['yodha'],
                    });
                } else {
                    stream.markdown(`## Error\n\n${message}\n`);
                }
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');

    context.subscriptions.push(participant);
}
