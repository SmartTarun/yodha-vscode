import * as vscode from 'vscode';
import { registerChatParticipant } from './chat/participant';

export function activate(context: vscode.ExtensionContext): void {
    registerChatParticipant(context);

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(robot) DevOps Engineer';
    statusBar.tooltip = 'Yodha DevOps Engineer — type @yodha-devops in Copilot Chat';
    statusBar.command = 'workbench.action.chat.open';
    statusBar.show();

    context.subscriptions.push(statusBar);
}

export function deactivate(): void {}
