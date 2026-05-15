import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { TechWriterAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.tech-writer';
const CONFIG_PREFIX = 'yodha-tech-writer';

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
                const agent = new TechWriterAgent(provider);

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
                stream.markdown('Set **`yodha-tech-writer.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-tech-writer'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Technical Writer\n\n');
    stream.markdown('AI technical writer: README, API docs, ADRs, runbooks, Mermaid diagrams\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- README & project documentation\\n');
    stream.markdown('- API reference documentation\\n');
    stream.markdown('- Architecture Decision Records (ADRs)\\n');
    stream.markdown('- Runbooks & operational playbooks\\n');
    stream.markdown('- Developer onboarding guides\\n');
    stream.markdown('- Mermaid / PlantUML diagrams\\n');
    stream.markdown('- Docusaurus / MkDocs site setup\\n');
    stream.markdown('- Changelog & release notes\\n');
    stream.markdown('\n**Usage:** `@yodha-docs <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-tech-writer.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
