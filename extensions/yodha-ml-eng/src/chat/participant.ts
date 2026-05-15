import * as vscode from 'vscode';
import { createLLMProvider } from '../llm/factory';
import { MlEngAgent } from '../agent';

const PARTICIPANT_ID = 'yodha.ml-eng';
const CONFIG_PREFIX = 'yodha-ml-eng';

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
                const agent = new MlEngAgent(provider);

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
                stream.markdown('Set **`yodha-ml-eng.aiProvider`** in VS Code Settings to `vscode`, `claude`, or `openai`.\n');
                stream.button({ command: 'workbench.action.openSettings', title: 'Open Settings', arguments: ['yodha-ml-eng'] });
            }
        }
    );

    participant.iconPath = new vscode.ThemeIcon('robot');
    context.subscriptions.push(participant);
}

function showHelp(stream: vscode.ChatResponseStream): void {
    stream.markdown('# Yodha ML Engineer\n\n');
    stream.markdown('AI ML engineer: PyTorch, TensorFlow, MLflow, model serving\n\n');
    stream.markdown('## Capabilities\n\n');
    stream.markdown('- PyTorch / TensorFlow model development\\n');
    stream.markdown('- Hugging Face Transformers & fine-tuning\\n');
    stream.markdown('- scikit-learn ML pipelines\\n');
    stream.markdown('- MLflow / W&B experiment tracking\\n');
    stream.markdown('- Model serving (BentoML, TorchServe)\\n');
    stream.markdown('- MLOps pipelines & model versioning\\n');
    stream.markdown('- Computer vision & NLP models\\n');
    stream.markdown('- Hyperparameter optimization (Optuna)\\n');
    stream.markdown('\n**Usage:** `@yodha-ml <your request>`\n\n');
    stream.markdown('**Provider:** Configured via `yodha-ml-eng.aiProvider` in Settings (`vscode` / `claude` / `openai`).\n');
}
