import * as vscode from 'vscode';
import { ItemProvider } from './items';
import * as file from './file';

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
	file.tryOpenFile('C:\\Users\\lunac\\git_src\\github.com\\LunaChevalier\\zenn\\articles\\fcade41f1b31943224bf.md');
}

export function deactivate() {}
