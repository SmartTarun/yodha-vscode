import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { CloudArchAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.cloud-arch';
const CONFIG_PREFIX = 'yodha-cloud-arch';

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
                const agent = new CloudArchAgent(provider);

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
                stream.markdown('Set **`yodha-cloud-arch.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-cloud-arch'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Cloud Architect\n\n');
    stream.markdown('AI cloud architect: AWS, Azure, GCP, Terraform, Kubernetes\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- AWS / Azure / GCP architecture design\\n');
    stream.markdown('- Terraform & IaC configurations\\n');
    stream.markdown('- Kubernetes manifests & Helm charts\\n');
    stream.markdown('- Serverless architecture (Lambda, Cloud Run)\\n');
    stream.markdown('- Multi-cloud strategies\\n');
    stream.markdown('- FinOps & cost optimization\\n');
    stream.markdown('- Disaster recovery planning\\n');
    stream.markdown('- Service mesh (Istio, Linkerd)\\n');
    stream.markdown('\n**Usage:** `@yodha-cloud <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-cloud-arch.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
