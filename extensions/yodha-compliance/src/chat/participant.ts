import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { ComplianceAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.compliance';
const CONFIG_PREFIX = 'yodha-compliance';

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
                const agent = new ComplianceAgent(provider);

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
                stream.markdown('Set **`yodha-compliance.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-compliance'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Compliance Engineer\n\n');
    stream.markdown('AI compliance engineer: GDPR, SOC2, HIPAA, audit logs, data governance\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- GDPR compliance implementation\\n');
    stream.markdown('- SOC 2 Type II control design\\n');
    stream.markdown('- HIPAA data handling procedures\\n');
    stream.markdown('- PCI-DSS controls\\n');
    stream.markdown('- Audit logging & immutable trails\\n');
    stream.markdown('- Data retention & deletion policies\\n');
    stream.markdown('- Consent management systems\\n');
    stream.markdown('- Privacy by design architecture\\n');
    stream.markdown('\n**Usage:** `@yodha-compliance <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-compliance.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
