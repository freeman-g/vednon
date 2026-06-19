import * as vscode from 'vscode';

// This is the entry point of your Vednon extension. `activate` runs the first time
// one of your contributed commands (or activation events) fires.
export function activate(context: vscode.ExtensionContext) {
	const helloWorld = vscode.commands.registerCommand('__PROJECT_NAME__.helloWorld', () => {
		vscode.window.showInformationMessage('Hello from __PROJECT_NAME__!');
	});

	context.subscriptions.push(helloWorld);
}

export function deactivate() { }
