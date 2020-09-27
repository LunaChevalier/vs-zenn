import * as vscode from 'vscode';
import { ItemProvider } from './items';

export function activate(context: vscode.ExtensionContext) {
	if (!(vscode.workspace.workspaceFolders)) {
		vscode.window.showInformationMessage;("Don't exist workspace")
		return;
	}

	const itemProvider = new ItemProvider(vscode.workspace.workspaceFolders[0].uri.fsPath);
	vscode.window.registerTreeDataProvider('vs-zenn-article', itemProvider);

	let disposable = vscode.commands.registerCommand('vs-zenn.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from vs-zenn!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
