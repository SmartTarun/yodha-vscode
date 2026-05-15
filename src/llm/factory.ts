import * as vscode from 'vscode';
import { LLMProvider } from './provider';
import { ClaudeProvider } from './claude-provider';
import { OpenAIProvider } from './openai-provider';
import { VSCodeLLMProvider } from './vscode-provider';

export function createLLMProvider(): LLMProvider {
    const config = vscode.workspace.getConfiguration('yodha');
    const providerName = config.get<string>('aiProvider', 'claude');

    if (providerName === 'vscode') {
        const pmModel = config.get<string>('vscodeModel.pm', 'gpt-4o');
        const workerModel = config.get<string>('vscodeModel.worker', 'gpt-4o-mini');
        return new VSCodeLLMProvider(pmModel, workerModel);
    }

    if (providerName === 'openai') {
        const apiKey = config.get<string>('openaiApiKey', '');
        if (!apiKey) {
            throw new Error(
                'OpenAI API key is not configured. Set yodha.openaiApiKey in VS Code settings.'
            );
        }
        const pmModel = config.get<string>('openaiModel.pm', 'gpt-4');
        const workerModel = config.get<string>('openaiModel.worker', 'gpt-4-turbo');
        return new OpenAIProvider(apiKey, pmModel, workerModel);
    }

    // Default: Claude
    const apiKey = config.get<string>('claudeApiKey', '');
    if (!apiKey) {
        throw new Error(
            'Claude API key is not configured. Set yodha.claudeApiKey in VS Code settings.'
        );
    }
    const pmModel = config.get<string>('claudeModel.pm', 'claude-opus-4-5');
    const workerModel = config.get<string>('claudeModel.worker', 'claude-sonnet-4-5');
    return new ClaudeProvider(apiKey, pmModel, workerModel);
}
