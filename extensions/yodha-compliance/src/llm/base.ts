import { LLMProvider, LLMMessage, LLMUsage } from './provider';

export interface AgentTask {
    id: string;
    description: string;
    context: {
        userRequirement: string;
        [key: string]: unknown;
    };
}

export interface AgentResult {
    taskId: string;
    agentName: string;
    agentRole: string;
    content: string;
    usage: LLMUsage;
    durationMs: number;
    success: boolean;
    error?: string;
}

export abstract class BaseAgent {
    protected readonly llmProvider: LLMProvider;
    readonly agentName: string;
    readonly agentRole: string;

    constructor(llmProvider: LLMProvider, agentName: string, agentRole: string) {
        this.llmProvider = llmProvider;
        this.agentName = agentName;
        this.agentRole = agentRole;
    }

    abstract getSystemPrompt(): string;
    abstract getRole(): string;
    abstract getCapabilities(): string[];

    async execute(task: AgentTask, onStream?: (text: string) => void): Promise<AgentResult> {
        const startTime = Date.now();
        const messages: LLMMessage[] = [
            { role: 'user', content: `**Task:** ${task.description}\n\n**User Requirement:**\n${task.context.userRequirement}` },
        ];

        try {
            let result;
            if (onStream) {
                result = await this.llmProvider.stream(
                    messages, this.getSystemPrompt(), this.llmProvider.workerModel,
                    chunk => { if (!chunk.done) { onStream(chunk.delta); } }
                );
            } else {
                result = await this.llmProvider.complete(
                    messages, this.getSystemPrompt(), this.llmProvider.workerModel
                );
            }
            return {
                taskId: task.id, agentName: this.agentName, agentRole: this.agentRole,
                content: result.content, usage: result.usage,
                durationMs: Date.now() - startTime, success: true,
            };
        } catch (err) {
            return {
                taskId: task.id, agentName: this.agentName, agentRole: this.agentRole,
                content: '', usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCostUsd: 0 },
                durationMs: Date.now() - startTime, success: false,
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }
}
