export interface LLMMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface LLMOptions {
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
}

export interface LLMUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
}

export interface LLMResponse {
    content: string;
    usage: LLMUsage;
    model: string;
    provider: 'claude' | 'openai' | 'vscode';
}

export interface LLMStreamChunk {
    delta: string;
    done: boolean;
}

export interface LLMProvider {
    readonly providerName: 'claude' | 'openai' | 'vscode';
    readonly pmModel: string;
    readonly workerModel: string;

    complete(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        options?: LLMOptions
    ): Promise<LLMResponse>;

    stream(
        messages: LLMMessage[],
        systemPrompt: string,
        model: string,
        onChunk: (chunk: LLMStreamChunk) => void,
        options?: LLMOptions
    ): Promise<LLMResponse>;
}
