import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { PMAgent } from '../agents/orchestrator';
import { AgentFactory } from '../agents/factory';
import { AgentResult } from '../agents/base';
import { LLMUsage } from '../llm/provider';

const PARTICIPANT_ID = 'yodha.pm';

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

export function registerChatParticipant(context: vscode.ExtensionContext): void {
    const participant = vscode.chat.createChatParticipant(
        PARTICIPANT_ID,
        async (
            request: vscode.ChatRequest,
            _chatContext: vscode.ChatContext,
            stream: vscode.ChatResponseStream,
            token: vscode.CancellationToken
        ) => {
            const command = request.command ?? '';
            const prompt = request.prompt.trim();

            if (command === 'help' || (!prompt && !command)) {
                showHelp(stream);
                return;
            }

            if (command === 'agents') {
                showAgents(stream);
                return;
            }

            if (command === 'plan') {
                await handlePlan(prompt, stream);
                return;
            }

            // /create or bare message → full orchestration
            await handleCreate(prompt || command, stream, token);
        }
    );

    participant.iconPath = new vscode.ThemeIcon('organization');
    context.subscriptions.push(participant);
}

async function handleCreate(
    prompt: string,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<void> {
    try {
        const provider = createLLMProvider();
        const pmAgent = new PMAgent(provider);
        const agentFactory = new AgentFactory(provider);

        stream.markdown(`**Yodha PM Agent** | Provider: ${provider.providerName} | PM model: ${provider.pmModel}\n\n`);
        stream.markdown('---\n\n');
        stream.markdown('**Planning your request...**\n\n');

        const plan = await pmAgent.createPlan(prompt, agentFactory.getAvailableAgentNames());

        stream.markdown(`**Plan:** ${plan.summary}\n\n`);
        stream.markdown(`**Agents:** ${plan.estimatedAgents.join(' → ')}\n\n`);
        stream.markdown('---\n\n');

        const results: AgentResult[] = [];

        for (let i = 0; i < plan.tasks.length; i++) {
            if (token.isCancellationRequested) {
                stream.markdown('\n*Cancelled.*\n');
                break;
            }

            const task = pmAgent.buildHandoffContext(plan.tasks[i], results);
            let agent;
            try {
                agent = agentFactory.getAgent(task.agentName);
            } catch {
                stream.markdown(`> **Warning:** Unknown agent "${task.agentName}", skipping.\n\n`);
                continue;
            }

            stream.markdown(`### ${i + 1}. ${agent.getRole()}\n\n`);
            stream.markdown(`*${task.description}*\n\n`);

            const result = await agent.execute(task, (text: string) => stream.markdown(text));

            if (!result.success) {
                stream.markdown(`\n\n> **Error:** ${result.error}\n\n`);
            } else {
                stream.markdown('\n\n');
            }

            results.push(result);
            stream.markdown('---\n\n');
        }

        const usage = sumUsage(results);
        const costStr = usage.estimatedCostUsd > 0
            ? `Est. cost: $${usage.estimatedCostUsd.toFixed(4)}`
            : 'Cost: covered by GitHub Copilot subscription';
        const tokenStr = usage.totalTokens > 0 ? `Tokens: ${usage.totalTokens.toLocaleString()} | ` : '';
        stream.markdown(`**Session complete** | ${tokenStr}${costStr}\n`);

    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        stream.markdown(`## Error\n\n${message}\n\n`);
        stream.markdown('Configure your provider via **`yodha-pm.aiProvider`** in VS Code Settings.\n');
        stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-pm'] });
    }
}

async function handlePlan(
    prompt: string,
    stream: vscode.ChatResponseStream
): Promise<void> {
    try {
        const provider = createLLMProvider();
        const pmAgent = new PMAgent(provider);
        const agentFactory = new AgentFactory(provider);

        stream.markdown('**Generating plan (no agents will run)...**\n\n');

        const plan = await pmAgent.createPlan(prompt, agentFactory.getAvailableAgentNames());

        stream.markdown(`## Plan: ${plan.summary}\n\n`);
        stream.markdown(`**Agents to engage:** ${plan.estimatedAgents.join(', ')}\n\n`);
        stream.markdown('### Tasks\n\n');

        plan.tasks.forEach((task, i) => {
            stream.markdown(`**${i + 1}. ${task.agentName}** — ${task.description}\n\n`);
        });

        stream.markdown('\n> Run `@yodha-pm /create` with the same prompt to execute this plan.\n');
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        stream.markdown(`## Error\n\n${message}\n`);
    }
}

function showAgents(stream: vscode.ChatResponseStream): void {
    stream.markdown('## Agents available to Yodha PM\n\n');
    stream.markdown('| Agent | Specialization |\n');
    stream.markdown('|-------|----------------|\n');
    const agents = [
        ['backend-dev', 'FastAPI, Node.js, Go, REST/GraphQL APIs'],
        ['frontend-dev', 'React, Vue, Angular, TypeScript, Tailwind'],
        ['cloud-arch', 'AWS, Azure, GCP, Terraform, Kubernetes'],
        ['qa', 'pytest, Jest, Playwright, Cypress, k6'],
        ['devops', 'GitHub Actions, Docker, ArgoCD, Prometheus'],
        ['db-arch', 'PostgreSQL, MongoDB, Redis, migrations'],
        ['data-eng', 'Airflow, PySpark, dbt, Kafka, Delta Lake'],
        ['mobile-dev', 'Swift/SwiftUI, Kotlin/Compose, React Native'],
        ['ux', 'Design systems, Tailwind UI, accessibility'],
        ['api-spec', 'OpenAPI 3.1, GraphQL SDL, gRPC Protobuf'],
        ['ml-eng', 'PyTorch, TensorFlow, MLflow, model serving'],
        ['security', 'OWASP, SAST, auth, encryption, threat modeling'],
        ['perf', 'k6, Locust, profiling, caching, optimization'],
        ['tech-writer', 'README, API docs, ADRs, runbooks, Mermaid'],
        ['compliance', 'GDPR, SOC2, HIPAA, audit logs'],
    ];
    for (const [name, spec] of agents) {
        stream.markdown(`| \`${name}\` | ${spec} |\n`);
    }
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha PM Agent\n\n');
    stream.markdown('AI Project Manager that coordinates 15 specialist agents to deliver complete solutions.\n\n');
    stream.markdown('## Commands\n\n');
    stream.markdown('| Command | Description |\n');
    stream.markdown('|---------|-------------|\n');
    stream.markdown('| `@yodha-pm /create <requirement>` | Plan + execute with all relevant agents |\n');
    stream.markdown('| `@yodha-pm /plan <requirement>` | Show the plan without running agents |\n');
    stream.markdown('| `@yodha-pm /agents` | List all 15 available agents |\n');
    stream.markdown('| `@yodha-pm <message>` | Same as /create |\n\n');
    stream.markdown('## Example\n\n');
    stream.markdown('```\n@yodha-pm /create build a REST API for a blog with auth, PostgreSQL, and tests\n```\n\n');
    stream.markdown('**Provider:** Configured via `yodha-pm.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
