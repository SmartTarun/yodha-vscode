import { LLMProvider, LLMMessage } from '../llm/provider';
import { AgentTask, AgentResult } from './base';

export interface OrchestratorPlan {
    summary: string;
    tasks: AgentTask[];
    estimatedAgents: string[];
}

export class PMAgent {
    private readonly llmProvider: LLMProvider;

    constructor(llmProvider: LLMProvider) {
        this.llmProvider = llmProvider;
    }

    async createPlan(userPrompt: string, availableAgents: string[]): Promise<OrchestratorPlan> {
        const systemPrompt = `You are a senior Project Manager and Software Architect coordinating a team of specialized AI agents.

**Available agents:** ${availableAgents.join(', ')}

**Your role:**
- Analyze the user's requirement
- Break it down into tasks for the appropriate specialist agents
- Order tasks so dependencies are respected (e.g., DB schema before backend API)
- Pass relevant context from earlier tasks to later ones

**Response format — respond ONLY with valid JSON, no markdown fences:**
{
  "summary": "One sentence describing what will be built",
  "estimatedAgents": ["agent-name-1", "agent-name-2"],
  "tasks": [
    {
      "id": "task-1",
      "agentName": "agent-name",
      "description": "Specific task description",
      "context": {
        "userRequirement": "The original user requirement"
      }
    }
  ]
}

**Rules:**
- Only use agents from the available agents list
- Keep tasks focused and specific
- Maximum 5 tasks to keep responses timely
- Order tasks by dependency (foundational first)
- Each task description must be actionable and specific`;

        const messages: LLMMessage[] = [
            {
                role: 'user',
                content: `Please create an execution plan for this requirement:\n\n${userPrompt}`,
            },
        ];

        const response = await this.llmProvider.complete(
            messages,
            systemPrompt,
            this.llmProvider.pmModel,
            { maxTokens: 2048 }
        );

        return this.parsePlan(response.content, userPrompt);
    }

    private parsePlan(rawJson: string, userPrompt: string): OrchestratorPlan {
        // Strip markdown fences if the model wrapped the JSON despite instructions
        const cleaned = rawJson
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .trim();

        try {
            const parsed = JSON.parse(cleaned) as OrchestratorPlan;
            // Ensure every task carries the original user requirement
            for (const task of parsed.tasks) {
                task.context.userRequirement = task.context.userRequirement || userPrompt;
            }
            return parsed;
        } catch {
            // Fallback: single general-purpose task if JSON parsing fails
            return {
                summary: 'Processing your request',
                estimatedAgents: ['backend-dev'],
                tasks: [
                    {
                        id: 'task-1',
                        agentName: 'backend-dev',
                        description: userPrompt,
                        context: { userRequirement: userPrompt },
                    },
                ],
            };
        }
    }

    buildHandoffContext(
        currentTask: AgentTask,
        previousResults: AgentResult[]
    ): AgentTask {
        return {
            ...currentTask,
            context: {
                ...currentTask.context,
                previousResults: previousResults.filter(r => r.success),
            },
        };
    }
}
