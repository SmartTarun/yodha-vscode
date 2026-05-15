import * as vscode from 'vscode';
import { LLMProvider } from './provider';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { VSCodeLLMProvider } from './vscode-provider';

export function createLLMProvider(configPrefix = 'yodha-pm'): LLMProvider {
    const config = vscode.workspace.getConfiguration(configPrefix);
    const providerName = config.get<string>('aiProvider', 'vscode');

    if (providerName === 'openai') {
        const apiKey = config.get<string>('openaiApiKey', '');
        if (!apiKey) {
            throw new Error(`OpenAI API key not configured. Set ${configPrefix}.openaiApiKey in VS Code settings.`);
        }
        const pmModel = config.get<string>('openaiModel.pm', 'gpt-4');
        const workerModel = config.get<string>('openaiModel.worker', 'gpt-4-turbo');
        return new OpenAIProvider(apiKey, pmModel, workerModel);
    }

    if (providerName === 'claude') {
        const apiKey = config.get<string>('claudeApiKey', '');
        if (!apiKey) {
            throw new Error(`Claude API key not configured. Set ${configPrefix}.claudeApiKey in VS Code settings.`);
        }
        const pmModel = config.get<string>('claudeModel.pm', 'claude-opus-4-5');
        const workerModel = config.get<string>('claudeModel.worker', 'claude-sonnet-4-5');
        return new ClaudeProvider(apiKey, pmModel, workerModel);
    }

    // Default: VS Code built-in LLM
    const pmModel = config.get<string>('vscodeModel.pm', 'gpt-4o');
    const workerModel = config.get<string>('vscodeModel.worker', 'gpt-4o-mini');
    return new VSCodeLLMProvider(pmModel, workerModel);
}
