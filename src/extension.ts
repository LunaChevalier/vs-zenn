import * as vscode from 'vscode';
import { ArticleProvider } from './article';
import { Book, BookProvider } from './book';
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
  context.subscriptions.push(vscode.commands.registerCommand("vs-zenn.add.chapter", async () => {
      if (!config.rootDir || !util.isExistsPath(config.rootDir)) {
        vscode.window.showInformationMessage("Don't exist workspace");
        return;
      }

      const items = Book.getTitles();
      const type = await vscode.window.showQuickPick(
        items.map((obj) => obj.title),
        {
          canPickMany: false,
          placeHolder: "select title you want to add chapter",
        }
      );
      if (!type) {
        return;
      }
      const newTitle = await vscode.window.showInputBox({
        prompt: "input article title",
      });
      if (!newTitle){
        return;
      }
      const slug = items.filter((obj) => obj.title === type)[0].slug;
      const chapters = Book.getChapters(slug);
      const chapter = await vscode.window.showQuickPick(chapters, {
        canPickMany: false,
        placeHolder: "input or select number you want to add chapter",
      });

      if (!chapter) {
        return;
      }
      Book.addChapter(slug, parseInt(chapter), newTitle);
      vscode.window.showInformationMessage("vs-zenn.add chapter books");
      bookProvider.refresh();
    })
  );

  context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
    vscode.commands.executeCommand("vs-zenn.refresh");
  }));
}

export function deactivate() {}
