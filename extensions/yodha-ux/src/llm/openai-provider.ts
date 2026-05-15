import OpenAI from 'openai';
import { LLMProvider, LLMMessage, LLMOptions, LLMResponse, LLMStreamChunk } from './provider';

// Pricing per million tokens (USD) as of 2025
const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 30.0, output: 60.0 },
    'gpt-4-turbo': { input: 10.0, output: 30.0 },
    'gpt-4o': { input: 5.0, output: 15.0 },
    'gpt-4o-mini': { input: 0.15, output: 0.6 },
    'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = OPENAI_PRICING[model] ?? { input: 10.0, output: 30.0 };
    return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export class OpenAIProvider implements LLMProvider {
    readonly providerName = 'openai' as const;
    readonly pmModel: string;
    readonly workerModel: string;

    private client: OpenAI;

    constructor(apiKey: string, pmModel: string, workerModel: string) {
        this.client = new OpenAI({ apiKey });
        this.pmModel = pmModel;
        this.workerModel = workerModel;
    }

    async complete(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        options: LLMOptions = {}
    ): Promise<LLMResponse> {
        const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
        ];

        const response = await this.client.chat.completions.create({
            model,
            messages: openaiMessages,
            max_tokens: options.maxTokens ?? 4096,
            temperature: options.temperature,
            stream: false,
        });

        const content = response.choices[0]?.message?.content ?? '';
        const inputTokens = response.usage?.prompt_tokens ?? 0;
        const outputTokens = response.usage?.completion_tokens ?? 0;

        return {
            content,
            usage: {
                inputTokens,
                outputTokens,
                totalTokens: inputTokens + outputTokens,
                estimatedCostUsd: estimateCost(model, inputTokens, outputTokens),
            },
            model,
            provider: 'openai',
        };
    }

    async stream(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        onChunk: (chunk: LLMStreamChunk) => void,
        options: LLMOptions = {}
    ): Promise<LLMResponse> {
        const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            ...messages
                .filter(m => m.role !== 'system')
                .map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
        ];

        let fullContent = '';
        let inputTokens = 0;
        let outputTokens = 0;

        const streamResponse = await this.client.chat.completions.create({
            model,
            messages: openaiMessages,
            max_tokens: options.maxTokens ?? 4096,
            temperature: options.temperature,
            stream: true,
            stream_options: { include_usage: true },
        });

        for await (const chunk of streamResponse) {
            const delta = chunk.choices[0]?.delta?.content ?? '';
            if (delta) {
                fullContent += delta;
                onChunk({ delta, done: false });
            }
            if (chunk.usage) {
                inputTokens = chunk.usage.prompt_tokens;
                outputTokens = chunk.usage.completion_tokens;
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
            provider: 'openai',
        };
    }
}
