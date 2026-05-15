import { LLMProvider, LLMMessage, LLMUsage } from '../llm/provider';

export interface AgentTask {
    id: string;
    agentName: string;
    description: string;
    context: {
        userRequirement: string;
        previousResults?: AgentResult[];
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
    private readonly isPmAgent: boolean;

    constructor(
        llmProvider: LLMProvider,
        agentName: string,
        agentRole: string,
        isPmAgent: boolean
    ) {
        this.llmProvider = llmProvider;
        this.agentName = agentName;
        this.agentRole = agentRole;
        this.isPmAgent = isPmAgent;
    }

    abstract getSystemPrompt(): string;
    abstract getRole(): string;
    abstract getCapabilities(): string[];

    protected get model(): string {
        return this.isPmAgent
            ? this.llmProvider.pmModel
            : this.llmProvider.workerModel;
    }

    async execute(
        task: AgentTask,
        onStream?: (text: string) => void
    ): Promise<AgentResult> {
        const startTime = Date.now();

        const userMessage = this.buildUserMessage(task);
        const messages: LLMMessage[] = [{ role: 'user', content: userMessage }];

        try {
            let result;
            if (onStream) {
                result = await this.llmProvider.stream(
                    messages,
                    this.getSystemPrompt(),
                    this.model,
                    chunk => {
                        if (!chunk.done) {
                            onStream(chunk.delta);
                        }
                    }
                );
            } else {
                result = await this.llmProvider.complete(
                    messages,
                    this.getSystemPrompt(),
                    this.model
                );
            }

            return {
                taskId: task.id,
                agentName: this.agentName,
                agentRole: this.agentRole,
                content: result.content,
                usage: result.usage,
                durationMs: Date.now() - startTime,
                success: true,
            };
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            return {
                taskId: task.id,
                agentName: this.agentName,
                agentRole: this.agentRole,
                content: '',
                usage: {
                    inputTokens: 0,
                    outputTokens: 0,
                    totalTokens: 0,
                    estimatedCostUsd: 0,
                },
                durationMs: Date.now() - startTime,
                success: false,
                error,
            };
        }
    }

    private buildUserMessage(task: AgentTask): string {
        const parts: string[] = [`**Task:** ${task.description}`, ``, `**User Requirement:**`, task.context.userRequirement];

        if (task.context.previousResults && task.context.previousResults.length > 0) {
            parts.push(``, `**Context from previous agents:**`);
            for (const prev of task.context.previousResults) {
                parts.push(``, `### ${prev.agentRole}`, prev.content);
            }
        }

        return parts.join('\n');
    }
}
