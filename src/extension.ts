import * as vscode from 'vscode';
import { registerChatParticipant } from './chat/participant';

export function activate(context: vscode.ExtensionContext): void {
    registerChatParticipant(context);

    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.text = '$(robot) Yodha';
    statusBar.tooltip = 'Yodha AI Engineering Team — type @yodha in Copilot Chat';
    statusBar.command = 'workbench.action.chat.open';
    statusBar.show();

    context.subscriptions.push(statusBar);

    context.subscriptions.push(
        vscode.commands.registerCommand('yodha.openSettings', () => {
            vscode.commands.executeCommand('workbench.action.openSettings', 'yodha');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('yodha.showAgents', () => {
            vscode.commands.executeCommand('workbench.action.chat.open');
            vscode.window.showInformationMessage(
                'Type @yodha /agents in Copilot Chat to see all available agents.'
            );
        })
    );
}

export function deactivate(): void {
    // No-op: VS Code handles cleanup via context.subscriptions
}
