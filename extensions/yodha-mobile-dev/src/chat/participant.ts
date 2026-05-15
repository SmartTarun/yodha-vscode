import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { MobileDevAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.mobile-dev';
const CONFIG_PREFIX = 'yodha-mobile-dev';

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
                const agent = new MobileDevAgent(provider);

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
                stream.markdown('Set **`yodha-mobile-dev.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-mobile-dev'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Mobile Developer\n\n');
    stream.markdown('AI mobile developer: Swift/SwiftUI, Kotlin/Compose, React Native\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- iOS development (Swift, SwiftUI, Combine)\\n');
    stream.markdown('- Android development (Kotlin, Jetpack Compose)\\n');
    stream.markdown('- React Native cross-platform apps\\n');
    stream.markdown('- Flutter cross-platform apps\\n');
    stream.markdown('- Mobile security (pinning, biometrics)\\n');
    stream.markdown('- Push notifications (APNs, FCM)\\n');
    stream.markdown('- Offline-first architecture\\n');
    stream.markdown('- App Store / Play Store optimization\\n');
    stream.markdown('\n**Usage:** `@yodha-mobile <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-mobile-dev.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
