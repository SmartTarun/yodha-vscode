import * as vscode from 'vscode';
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from './provider';

export class VSCodeLLMProvider implements LLMProvider {
    readonly providerName = 'vscode' as const;
    readonly pmModel: string;
    readonly workerModel: string;

    constructor(pmModel: string, workerModel: string) {
        this.pmModel = pmModel;
        this.workerModel = workerModel;
    }

    private async selectModel(modelFamily: string): Promise<vscode.LanguageModelChat> {
        const models = await vscode.lm.selectChatModels({ family: modelFamily });
        if (models.length === 0) {
            // Fallback: any available model
            const fallback = await vscode.lm.selectChatModels();
            if (fallback.length === 0) {
                throw new Error(
                    'No VS Code language models available. Ensure GitHub Copilot is installed and signed in.'
                );
            }
            return fallback[0];
        }
        return models[0];
    }

    private buildMessages(
        messages: LLMMessage[],
        systemPrompt: string
    ): vscode.LanguageModelChatMessage[] {
        // VS Code LM API has no system role — prepend as user message
        const result: vscode.LanguageModelChatMessage[] = [
            vscode.LanguageModelChatMessage.User(`[System Instructions]\n${systemPrompt}`),
        ];

        for (const msg of messages) {
            if (msg.role === 'system') {
                continue; // already handled above
            }
            if (msg.role === 'assistant') {
                result.push(vscode.LanguageModelChatMessage.Assistant(msg.content));
            } else {
                result.push(vscode.LanguageModelChatMessage.User(msg.content));
            }
        }

        return result;
    }

    async complete(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        options: LLMOptions = {}
    ): Promise<LLMResponse> {
        const lmModel = await this.selectModel(model);
        const lmMessages = this.buildMessages(messages, systemPrompt);

        const response = await lmModel.sendRequest(
            lmMessages,
            { justification: 'Yodha agent processing your request' },
            new vscode.CancellationTokenSource().token
        );

        let content = '';
        for await (const chunk of response.text) {
            content += chunk;
        }

        return {
            content,
            usage: {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
                estimatedCostUsd: 0, // Covered by Copilot subscription
            },
            model: lmModel.id,
            provider: 'vscode',
        };
    }

    async stream(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        onChunk: (chunk: LLMStreamChunk) => void,
        options: LLMOptions = {}
    ): Promise<LLMResponse> {
        const lmModel = await this.selectModel(model);
        const lmMessages = this.buildMessages(messages, systemPrompt);

        const response = await lmModel.sendRequest(
            lmMessages,
            { justification: 'Yodha agent processing your request' },
            new vscode.CancellationTokenSource().token
        );

        let fullContent = '';
        for await (const chunk of response.text) {
            fullContent += chunk;
            onChunk({ delta: chunk, done: false });
        }

        onChunk({ delta: '', done: true });

        return {
            content: fullContent,
            usage: {
                inputTokens: 0,
                outputTokens: 0,
                totalTokens: 0,
                estimatedCostUsd: 0, // Covered by Copilot subscription
            },
            model: lmModel.id,
            provider: 'vscode',
        };
    }
}
