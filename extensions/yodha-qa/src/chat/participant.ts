import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { QaAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.qa';
const CONFIG_PREFIX = 'yodha-qa';

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
                const agent = new QaAgent(provider);

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
                stream.markdown('Set **`yodha-qa.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-qa'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha QA Engineer\n\n');
    stream.markdown('AI QA engineer: pytest, Jest, Playwright, Cypress, k6\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- pytest test suites with fixtures\\n');
    stream.markdown('- Jest / Vitest unit & integration tests\\n');
    stream.markdown('- Playwright E2E browser automation\\n');
    stream.markdown('- Cypress frontend testing\\n');
    stream.markdown('- API testing (Postman, REST-assured)\\n');
    stream.markdown('- Performance testing (k6, Locust)\\n');
    stream.markdown('- BDD / Gherkin test scenarios\\n');
    stream.markdown('- Contract testing (Pact)\\n');
    stream.markdown('\n**Usage:** `@yodha-qa <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-qa.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
