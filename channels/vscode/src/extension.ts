import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('taproot.init', () => {
    const terminal = vscode.window.createTerminal('Taproot');
    terminal.show();
    terminal.sendText('npx @imix-js/taproot init');
  });
  context.subscriptions.push(disposable);
}

export function deactivate() {}
