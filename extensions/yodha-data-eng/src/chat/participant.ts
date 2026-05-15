import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { DataEngAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.data-eng';
const CONFIG_PREFIX = 'yodha-data-eng';

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
                const agent = new DataEngAgent(provider);

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
                stream.markdown('Set **`yodha-data-eng.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-data-eng'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha Data Engineer\n\n');
    stream.markdown('AI data engineer: Airflow, PySpark, dbt, Kafka, Delta Lake\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- Apache Airflow DAG development\\n');
    stream.markdown('- PySpark / Spark SQL transformations\\n');
    stream.markdown('- dbt models & incremental processing\\n');
    stream.markdown('- Kafka streaming pipelines\\n');
    stream.markdown('- Data lake design (Delta, Iceberg)\\n');
    stream.markdown('- Data warehouse modeling (Snowflake, BigQuery)\\n');
    stream.markdown('- Data quality (Great Expectations)\\n');
    stream.markdown('- ETL/ELT pipeline orchestration\\n');
    stream.markdown('\n**Usage:** `@yodha-data <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-data-eng.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
