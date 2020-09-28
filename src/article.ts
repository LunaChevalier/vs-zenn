import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';

export class ArticleProvider implements vscode.TreeDataProvider<Article> {
  private _onDidChangeTreeData: vscode.EventEmitter<Article | undefined> = new vscode.EventEmitter<Article | undefined>();
  readonly onDidChangeTreeData?: vscode.Event<Article | undefined> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: Article): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Article): vscode.ProviderResult<Article[]> {
    return Promise.resolve(this.getArticles(path.join(this.workspaceRoot, 'articles')));
  }

  private getArticles(articlesPath: string): Article[] {
    let items = [new Article("labels")];
    if (this.pathExists(articlesPath)) {
      return fs.readdirSync(articlesPath, "utf-8").map((file) => {
        const filePath = path.join(articlesPath, file);
        const data = fs.readFileSync(filePath, "utf-8");
        this.getHeader(data);
        return new Article(this.getHeader(data), filePath, {
          command: 'vs-zenn.openFile',
          title: '',
          arguments: [filePath]
        });
      });
    }

    return items;
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }

    return true;
  }

  private getHeader(text: string): string {
    const newLineHex = /\r\n|\n/;
    const separate = "---";
    const startIndex = text.split(newLineHex).indexOf(separate) + 1;
    const endIndex = text.split(newLineHex).indexOf(separate, startIndex);
    const headers = text.split(newLineHex).slice(startIndex, endIndex);

    const title = util.getTitle(headers);
    const emoji = util.getEmoji(headers);
    return `${emoji}${title}`;
  }
}

export class Article extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly filePath?: string,
    public readonly command?: vscode.Command
  ) {
    super(label);
  }
}
