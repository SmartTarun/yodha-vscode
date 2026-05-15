import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from './provider';

// Pricing per million tokens (USD) as of 2025
const CLAUDE_PRICING: Record<string, { input: number; output: number }> = {
    'claude-opus-4-5': { input: 15.0, output: 75.0 },
    'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
    'claude-haiku-4-5': { input: 0.25, output: 1.25 },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = CLAUDE_PRICING[model] ?? { input: 3.0, output: 15.0 };
    return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export class ClaudeProvider implements LLMProvider {
    readonly providerName = 'claude' as const;
    readonly pmModel: string;
    readonly workerModel: string;

    private client: Anthropic;

    constructor(apiKey: string, pmModel: string, workerModel: string) {
        this.client = new Anthropic({ apiKey });
        this.pmModel = pmModel;
        this.workerModel = workerModel;
    }

    async complete(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        options: LLMOptions = {}
    ): Promise<LLMResponse> {
        const anthropicMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }));

        const response = await this.client.messages.create({
            model,
            system: systemPrompt,
            messages: anthropicMessages,
            max_tokens: options.maxTokens ?? 4096,
            temperature: options.temperature,
        });

        const content = response.content
            .filter(block => block.type === 'text')
            .map(block => (block as { type: 'text'; text: string }).text)
            .join('');

        const inputTokens = response.usage.input_tokens;
        const outputTokens = response.usage.output_tokens;

        return {
            content,
            usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                estimatedCostUsd: estimateCost(model, inputTokens, outputTokens),
            },
            model,
            provider: 'claude',
        };
    }

    async stream(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        onChunk: (chunk: LLMStreamChunk) => void,
        options: LLMOptions = {}
    ): Promise<LLMResponse> {
        const anthropicMessages = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            }));

        let fullContent = '';
        let inputTokens = 0;
        let outputTokens = 0;

        const streamResponse = this.client.messages.stream({
            model,
            system: systemPrompt,
            messages: anthropicMessages,
            max_tokens: options.maxTokens ?? 4096,
            temperature: options.temperature,
        });

        for await (const event of streamResponse) {
            if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
            ) {
                const delta = event.delta.text;
                fullContent += delta;
                onChunk({ delta, done: false });
            } else if (event.type === 'message_delta' && event.usage) {
                outputTokens = event.usage.output_tokens;
            } else if (event.type === 'message_start' && event.message.usage) {
                inputTokens = event.message.usage.input_tokens;
            }
        }

        onChunk({ delta: '', done: true });

        return {
            content: fullContent,
            usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                estimatedCostUsd: estimateCost(model, inputTokens, outputTokens),
            },
            model,
            provider: 'claude',
        };
    }
}
