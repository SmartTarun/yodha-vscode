import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { FrontendDevAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.frontend-dev';
const CONFIG_PREFIX = 'yodha-frontend-dev';

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
                const agent = new FrontendDevAgent(provider);

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
                stream.markdown('Set **`yodha-frontend-dev.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-frontend-dev'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Frontend Developer\n\n');
    stream.markdown('AI frontend developer: React, Vue, Angular, TypeScript, Tailwind\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- React / Vue / Angular components\\n');
    stream.markdown('- TypeScript UI development\\n');
    stream.markdown('- State management (Redux, Zustand, Pinia)\\n');
    stream.markdown('- Tailwind CSS & responsive design\\n');
    stream.markdown('- Component testing (Jest, Vitest)\\n');
    stream.markdown('- Web performance optimization\\n');
    stream.markdown('- Accessibility (WCAG 2.1)\\n');
    stream.markdown('- Progressive Web Apps (PWA)\\n');
    stream.markdown('\n**Usage:** `@yodha-frontend <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-frontend-dev.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
