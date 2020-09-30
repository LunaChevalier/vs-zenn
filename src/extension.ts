import * as vscode from 'vscode';
import { ArticleProvider } from './article';
import { BookProvider } from './book';
import * as file from './file';
import * as cp from 'child_process';
import * as util from "./util";

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration("vs-zenn");
	if (!config.rootDir || !util.isExistsPath(config.rootDir)) {
    vscode.window.showInformationMessage("Don't exist workspace");
    return;
  }

	const articleProvider = new ArticleProvider(config.rootDir);
	vscode.window.registerTreeDataProvider('vs-zenn-article', articleProvider);

	const bookProvider = new BookProvider(config.rootDir);
	vscode.window.registerTreeDataProvider('vs-zenn-book', bookProvider);

	context.subscriptions.push(vscode.commands.registerCommand('vs-zenn.new.article', () => {
		if (!config.rootDir || !util.isExistsPath(config.rootDir)) {
			vscode.window.showInformationMessage("Don't exist workspace");
			return;
		}
		const usingCommand = config.usingCommand;

		cp.execSync(`cd ${config.rootDir} & ${usingCommand} zenn new:article`);
		articleProvider.refresh();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vs-zenn.new.book', () => {
		if (!config.rootDir || !util.isExistsPath(config.rootDir)) {
			vscode.window.showInformationMessage("Don't exist workspace");
			return;
		}
		const usingCommand = config.usingCommand;

		cp.execSync(`cd ${config.rootDir} & ${usingCommand} zenn new:book`);
		bookProvider.refresh();
	}));

	vscode.commands.registerCommand('vs-zenn.openFile', filePath => file.tryOpenFile(filePath));
	vscode.commands.registerCommand('vs-zenn.refresh', () => {
		articleProvider.refresh();
		bookProvider.refresh();
	});

	context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
		vscode.commands.executeCommand("vs-zenn.refresh");
	}));
}

export function deactivate() {}
