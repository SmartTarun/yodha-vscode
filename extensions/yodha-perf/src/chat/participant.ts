import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { PerfAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.perf';
const CONFIG_PREFIX = 'yodha-perf';

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
                const agent = new PerfAgent(provider);

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
                stream.markdown('Set **`yodha-perf.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-perf'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Performance Engineer\n\n');
    stream.markdown('AI performance engineer: k6, Locust, profiling, caching, optimization\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- k6 / Locust load test scripts\\n');
    stream.markdown('- Application profiling (py-spy, pprof)\\n');
    stream.markdown('- Frontend performance (Lighthouse, Web Vitals)\\n');
    stream.markdown('- Database query optimization\\n');
    stream.markdown('- Redis / CDN caching strategies\\n');
    stream.markdown('- Performance SLO definition & monitoring\\n');
    stream.markdown('- Memory leak detection\\n');
    stream.markdown('- Async concurrency optimization\\n');
    stream.markdown('\n**Usage:** `@yodha-perf <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-perf.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
