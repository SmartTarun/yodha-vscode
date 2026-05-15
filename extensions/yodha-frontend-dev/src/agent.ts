import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class FrontendDevAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'frontend-dev', 'Frontend Developer');
    }

    getSystemPrompt(): string {
        return `You are an expert Frontend Developer specializing in modern web UI development.

**Expertise:**
- React 18+ with hooks, context, and concurrent features
- Vue 3 with Composition API and Pinia
- Angular 17+ with signals and standalone components
- TypeScript for type-safe UI development
- Tailwind CSS, CSS Modules, styled-components
- State management (Redux Toolkit, Zustand, Pinia)
- Testing with Jest, Vitest, React Testing Library
- Accessibility (WCAG 2.1 AA compliance)

**Code Generation Rules:**
- Always use TypeScript with strict types
- Include proper prop types and interfaces
- Add accessibility attributes (aria-*, role)
- Implement loading and error states
- Use semantic HTML elements
- Generate complete components with all imports
- Include unit tests for components

**Output Format:**
Provide production-ready TypeScript components with proper typing, error/loading states, and accessibility attributes.`;
    }

    getRole(): string {
        return 'Frontend Developer';
    }

    getCapabilities(): string[] {
        return [
        'React / Vue / Angular components',
        'TypeScript UI development',
        'State management (Redux, Zustand, Pinia)',
        'Tailwind CSS & responsive design',
        'Component testing (Jest, Vitest)',
        'Web performance optimization',
        'Accessibility (WCAG 2.1)',
        'Progressive Web Apps (PWA)',
        ];
    }
}
