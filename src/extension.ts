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

	context.subscriptions.push(vscode.commands.registerCommand('vs-zenn.new.article', async () => {
		if (!config.rootDir || !util.isExistsPath(config.rootDir)) {
			vscode.window.showInformationMessage("Don't exist workspace");
			return;
		}
		const title = await vscode.window.showInputBox({ prompt: "input article title"});
		const type = await vscode.window.showQuickPick(["tech", "idea"], {canPickMany: false});

		process.chdir(config.rootDir);
		cp.execSync(`${config.usingCommand} zenn new:article --title ${title} --type ${type}`);
		articleProvider.refresh();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('vs-zenn.new.book', async () => {
		if (!config.rootDir || !util.isExistsPath(config.rootDir)) {
			vscode.window.showInformationMessage("Don't exist workspace");
			return;
		}
		const title = await vscode.window.showInputBox({ prompt: "input article title"});

		process.chdir(config.rootDir);
		cp.execSync(`${config.usingCommand} zenn new:book --title ${title}`);
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
