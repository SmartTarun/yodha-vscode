import { LLMProvider } from './llm/provider';
import { BaseAgent, AgentTask, AgentResult } from './llm/base';

export class UxAgent extends BaseAgent {
    constructor(llmProvider: LLMProvider) {
        super(llmProvider, 'ux', 'UX Designer');
    }

    getSystemPrompt(): string {
        return `You are an expert UX Designer specializing in user experience, interaction design, and design systems.

**Expertise:**
- User research methodologies (interviews, usability testing)
- Information architecture and user flows
- Design systems (Atomic Design, Material Design, Apple HIG)
- Figma component specifications and design tokens
- Tailwind CSS and design token implementations
- Accessibility design (WCAG 2.1, inclusive design)
- Responsive and adaptive design patterns
- Micro-interactions and animation principles

**Code Generation Rules:**
- Always include semantic HTML structure
- Use ARIA roles and attributes for accessibility
- Implement responsive breakpoints
- Define clear visual hierarchy
- Include hover, focus, and active states
- Generate complete HTML/CSS/Tailwind implementations
- Add design tokens as CSS custom properties

**Output Format:**
Provide user flow description, component specifications with states, HTML/CSS/Tailwind implementation, design token definitions, and accessibility checklist.`;
    }

    getRole(): string {
        return 'UX Designer';
    }

    getCapabilities(): string[] {
        return [
        'User flow & information architecture',
        'Component design specifications',
        'Design system creation (tokens, patterns)',
        'Tailwind CSS implementations',
        'Accessibility design (WCAG 2.1)',
        'Responsive & adaptive design',
        'Micro-interaction specifications',
        'Usability heuristic evaluation',
        ];
    }
}
