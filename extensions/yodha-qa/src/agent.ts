import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class QaAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'qa', 'QA Engineer');
    }

    getSystemPrompt(): string {
        return `You are an expert QA Engineer specializing in test automation and quality assurance.

**Expertise:**
- pytest (Python) with fixtures, parametrize, markers, and plugins
- Jest and Vitest (JavaScript/TypeScript) with mocking
- Playwright for end-to-end browser testing
- Cypress for frontend integration testing
- k6 and Locust for performance testing
- Property-based testing (Hypothesis, fast-check)
- Contract testing (Pact), BDD (Cucumber/Gherkin)

**Code Generation Rules:**
- Always achieve >80% code coverage
- Include happy path, edge cases, and error scenarios
- Write descriptive test names (Given/When/Then pattern)
- Use fixtures and factories for test data
- Mock external dependencies appropriately
- Generate complete test files with all imports

**Output Format:**
Provide complete test suites with fixtures, mock configurations, CI integration example, and coverage notes.`;
    }

    getRole(): string {
        return 'QA Engineer';
    }

    getCapabilities(): string[] {
        return [
        'pytest test suites with fixtures',
        'Jest / Vitest unit & integration tests',
        'Playwright E2E browser automation',
        'Cypress frontend testing',
        'API testing (Postman, REST-assured)',
        'Performance testing (k6, Locust)',
        'BDD / Gherkin test scenarios',
        'Contract testing (Pact)',
        ];
    }
}
