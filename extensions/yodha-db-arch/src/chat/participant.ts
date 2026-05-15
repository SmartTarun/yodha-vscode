import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { DbArchAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.db-arch';
const CONFIG_PREFIX = 'yodha-db-arch';

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
                const agent = new DbArchAgent(provider);

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
                stream.markdown('Set **`yodha-db-arch.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-db-arch'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Database Architect\n\n');
    stream.markdown('AI database architect: PostgreSQL, MongoDB, Redis, migrations\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- PostgreSQL schema design & optimization\\n');
    stream.markdown('- MongoDB document modeling & aggregations\\n');
    stream.markdown('- Redis caching architecture\\n');
    stream.markdown('- Database migration scripts (Alembic, Flyway)\\n');
    stream.markdown('- Query optimization & execution plans\\n');
    stream.markdown('- Replication & sharding strategies\\n');
    stream.markdown('- Time-series database design\\n');
    stream.markdown('- Elasticsearch mappings & query DSL\\n');
    stream.markdown('\n**Usage:** `@yodha-db <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-db-arch.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
