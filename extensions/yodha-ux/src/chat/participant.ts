import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { UxAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.ux';
const CONFIG_PREFIX = 'yodha-ux';

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
                const agent = new UxAgent(provider);

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
                stream.markdown('Set **`yodha-ux.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-ux'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha UX Designer\n\n');
    stream.markdown('AI UX designer: design systems, Tailwind UI, accessibility, wireframes\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- User flow & information architecture\\n');
    stream.markdown('- Component design specifications\\n');
    stream.markdown('- Design system creation (tokens, patterns)\\n');
    stream.markdown('- Tailwind CSS implementations\\n');
    stream.markdown('- Accessibility design (WCAG 2.1)\\n');
    stream.markdown('- Responsive & adaptive design\\n');
    stream.markdown('- Micro-interaction specifications\\n');
    stream.markdown('- Usability heuristic evaluation\\n');
    stream.markdown('\n**Usage:** `@yodha-ux <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-ux.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
