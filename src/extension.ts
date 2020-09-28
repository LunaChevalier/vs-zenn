import * as vscode from 'vscode';
import { ArticleProvider } from './article';
import { BookProvider } from './book';
import * as file from './file';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	if (!(vscode.workspace.workspaceFolders)) {
		vscode.window.showInformationMessage("Don't exist workspace");
		return;
	}

	const articleProvider = new ArticleProvider(vscode.workspace.workspaceFolders[0].uri.fsPath);
	vscode.window.registerTreeDataProvider('vs-zenn-article', articleProvider);

	const bookProvider = new BookProvider(vscode.workspace.workspaceFolders[0].uri.fsPath);
	vscode.window.registerTreeDataProvider('vs-zenn-book', bookProvider);

	context.subscriptions.push(vscode.commands.registerCommand('vs-zenn.new.article', () => {
		if (!vscode.workspace.workspaceFolders) {
			vscode.window.showInformationMessage("Don't exist workspace");
			return;
		}
		const config = vscode.workspace.getConfiguration("vs-zenn");
		const usingCommand = config.usingCommand;

		cp.execSync(`cd ${vscode.workspace.workspaceFolders[0].uri.fsPath} & ${usingCommand} zenn new:article`);
		articleProvider.refresh();
	}));
	vscode.commands.registerCommand('vs-zenn.openFile', filePath => file.tryOpenFile(filePath));
	vscode.commands.registerCommand('vs-zenn.refresh', () => {
		articleProvider.refresh();
	});

	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {articleProvider.refresh();}));
}

export function deactivate() {}
