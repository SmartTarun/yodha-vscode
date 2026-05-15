import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { SecurityAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.security';
const CONFIG_PREFIX = 'yodha-security';

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
                const agent = new SecurityAgent(provider);

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
                stream.markdown('Set **`yodha-security.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-security'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Security Engineer\n\n');
    stream.markdown('AI security engineer: OWASP, SAST, auth, encryption, threat modeling\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- OWASP Top 10 vulnerability remediation\\n');
    stream.markdown('- SAST integration (Semgrep, Bandit)\\n');
    stream.markdown('- Dependency scanning (Snyk, Dependabot)\\n');
    stream.markdown('- Authentication security (OAuth2, MFA)\\n');
    stream.markdown('- Cryptography & key management\\n');
    stream.markdown('- Container & Kubernetes security\\n');
    stream.markdown('- Threat modeling (STRIDE)\\n');
    stream.markdown('- Security CI/CD pipeline setup\\n');
    stream.markdown('\n**Usage:** `@yodha-security <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-security.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
