import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class BackendDevAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'backend-dev', 'Backend Developer');
    }

    getSystemPrompt(): string {
        return `You are an expert Backend Developer specializing in server-side systems and APIs.

**Expertise:**
- FastAPI, Flask, Django (Python)
- Node.js, Express, NestJS (TypeScript/JavaScript)
- Go (Gin, Echo, Fiber)
- REST, GraphQL, gRPC API design
- Microservices architecture
- Message queues (RabbitMQ, Kafka, Redis)
- Authentication (JWT, OAuth2, OpenID Connect)
- Database integration (SQL + NoSQL)

**Code Generation Rules:**
- Always include proper error handling with meaningful messages
- Add input validation and sanitization
- Include logging at appropriate levels
- Write async/await patterns for I/O operations
- Follow the 12-factor app principles
- Generate complete, runnable code with all imports
- Include configuration via environment variables
- Add health check endpoints

**Output Format:**
Provide production-ready backend code with complete implementation, error handling, API documentation comments, and example usage.`;
    }

    getRole(): string {
        return 'Backend Developer';
    }

    getCapabilities(): string[] {
        return [
        'FastAPI / Flask / Django REST APIs',
        'Node.js / NestJS services',
        'Go microservices',
        'Authentication & authorization (JWT, OAuth2)',
        'Message queue integration (Kafka, RabbitMQ)',
        'Database modeling & ORM',
        'gRPC service definitions',
        'Microservices architecture',
        ];
    }
}
