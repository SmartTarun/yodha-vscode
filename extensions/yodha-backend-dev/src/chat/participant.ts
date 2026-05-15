import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { BackendDevAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.backend-dev';
const CONFIG_PREFIX = 'yodha-backend-dev';

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
                const agent = new BackendDevAgent(provider);

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
                stream.markdown('Set **`yodha-backend-dev.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-backend-dev'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Backend Developer\n\n');
    stream.markdown('AI backend developer: FastAPI, Node.js, Go, REST/GraphQL APIs\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- FastAPI / Flask / Django REST APIs\\n');
    stream.markdown('- Node.js / NestJS services\\n');
    stream.markdown('- Go microservices\\n');
    stream.markdown('- Authentication & authorization (JWT, OAuth2)\\n');
    stream.markdown('- Message queue integration (Kafka, RabbitMQ)\\n');
    stream.markdown('- Database modeling & ORM\\n');
    stream.markdown('- gRPC service definitions\\n');
    stream.markdown('- Microservices architecture\\n');
    stream.markdown('\n**Usage:** `@yodha-backend <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-backend-dev.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
