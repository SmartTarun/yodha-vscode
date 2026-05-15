import * as vscode from 'vscode';
import { LLMProvider } from './provider';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { VSCodeLLMProvider } from './vscode-provider';

export function createLLMProvider(configPrefix: string): LLMProvider {
    const config = vscode.workspace.getConfiguration(configPrefix);
    const providerName = config.get<string>('aiProvider', 'vscode');

    if (providerName === 'openai') {
        const apiKey = config.get<string>('openaiApiKey', '');
        if (!apiKey) { throw new Error('OpenAI API key not configured. Set ' + configPrefix + '.openaiApiKey in VS Code settings.'); }
        const model = config.get<string>('openaiModel', 'gpt-4o');
        return new OpenAIProvider(apiKey, model, model);
    }

    if (providerName === 'claude') {
        const apiKey = config.get<string>('claudeApiKey', '');
        if (!apiKey) { throw new Error('Claude API key not configured. Set ' + configPrefix + '.claudeApiKey in VS Code settings.'); }
        const model = config.get<string>('claudeModel', 'claude-sonnet-4-5');
        return new ClaudeProvider(apiKey, model, model);
    }

    // Default: VS Code built-in LLM (GitHub Copilot)
    const model = config.get<string>('vscodeModel', 'gpt-4o');
    return new VSCodeLLMProvider(model, model);
}
