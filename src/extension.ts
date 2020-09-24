import * as vscode from 'vscode';
import { ItemProvider } from './items';

export function activate(context: vscode.ExtensionContext) {
	vscode.window.showInformationMessage(vscode.workspace.workspaceFolders[0].uri.fsPath)
	const itemProvider = new ItemProvider(vscode.workspace.workspaceFolders[0].uri.fsPath);
	vscode.window.registerTreeDataProvider('vs-zenn-article', itemProvider);
	console.log('Congratulations, your extension "vs-zenn" is now active!');

	let disposable = vscode.commands.registerCommand('vs-zenn.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from vs-zenn!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
