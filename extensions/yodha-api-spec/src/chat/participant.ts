import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { ApiSpecAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.api-spec';
const CONFIG_PREFIX = 'yodha-api-spec';

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
                const agent = new ApiSpecAgent(provider);

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
                stream.markdown('Set **`yodha-api-spec.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-api-spec'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha API Specification Engineer\n\n');
    stream.markdown('AI API spec engineer: OpenAPI 3.1, GraphQL SDL, gRPC Protobuf\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- OpenAPI 3.1 specification authoring\\n');
    stream.markdown('- GraphQL schema design (SDL)\\n');
    stream.markdown('- gRPC Protocol Buffer definitions\\n');
    stream.markdown('- AsyncAPI for event-driven APIs\\n');
    stream.markdown('- REST API design (HATEOAS)\\n');
    stream.markdown('- API versioning & deprecation strategy\\n');
    stream.markdown('- OAuth2 / security scheme documentation\\n');
    stream.markdown('- SDK generation configuration\\n');
    stream.markdown('\n**Usage:** `@yodha-api <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-api-spec.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
