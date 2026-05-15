import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { DevopsAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.devops';
const CONFIG_PREFIX = 'yodha-devops';

export function registerChatParticipant(context: vscode.ExtensionContext): void {
    const participant = vscode.chat.createChatParticipant(
        PARTICIPANT_ID,
        async (
            request: vscode.ChatRequest,
            _chatContext: vscode.ChatContext,
            stream: vscode.ChatResponseStream,
            token: vscode.CancellationToken
        ) => {
            const prompt = request.prompt.trim();

            if (request.command === 'help' || !prompt) {
                showHelp(stream);
                return;
            }

            try {
                const provider = createLLMProvider(CONFIG_PREFIX);
                const agent = new DevopsAgent(provider);

                stream.markdown(`**${agent.getRole()}** | Provider: ${provider.providerName}\n\n---\n\n`);

                const result = await agent.execute(
                    { id: 'task-1', description: prompt, context: { userRequirement: prompt } },
                    (text: string) => { if (!token.isCancellationRequested) { stream.markdown(text); } }
                );

                if (!result.success) {
                    stream.markdown(`\n\n> **Error:** ${result.error}\n`);
                }

                const costStr = result.usage.estimatedCostUsd > 0
                    ? `Est. cost: $${result.usage.estimatedCostUsd.toFixed(4)}`
                    : 'Cost: covered by GitHub Copilot subscription';
                const tokenStr = result.usage.totalTokens > 0
                    ? `Tokens: ${result.usage.totalTokens.toLocaleString()} | `
                    : '';
                stream.markdown(`\n\n---\n*${tokenStr}${costStr}*\n`);
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                stream.markdown(`## Error\n\n${message}\n\n`);
                stream.markdown('Set **`yodha-devops.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-devops'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha DevOps Engineer\n\n');
    stream.markdown('AI DevOps engineer: GitHub Actions, Docker, Kubernetes, ArgoCD\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- GitHub Actions / GitLab CI pipelines\\n');
    stream.markdown('- Multi-stage Dockerfile optimization\\n');
    stream.markdown('- Kubernetes deployments & GitOps (ArgoCD)\\n');
    stream.markdown('- Prometheus & Grafana observability\\n');
    stream.markdown('- Secret management (Vault, SOPS)\\n');
    stream.markdown('- Blue/green & canary deployments\\n');
    stream.markdown('- SRE practices & SLO definition\\n');
    stream.markdown('- Ansible configuration management\\n');
    stream.markdown('\n**Usage:** `@yodha-devops <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-devops.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
