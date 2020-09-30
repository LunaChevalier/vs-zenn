import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as yaml from 'js-yaml'

export class BookProvider implements vscode.TreeDataProvider<Book> {
  private _onDidChangeTreeData: vscode.EventEmitter<Book | undefined> = new vscode.EventEmitter<Book | undefined>();
  readonly onDidChangeTreeData?: vscode.Event<Book | undefined> = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {
  }

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: Book): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Book): vscode.ProviderResult<Book[]> {
    if (element && element.filePath) {
      return Promise.resolve(this.getBooks(element.filePath));
    } else {
      return Promise.resolve(this.getBooks(path.join(this.workspaceRoot, "books")));
    }
  }

  private getBooks(booksPath: string): Book[] {
    let items: Array<Book> = [];
    if (util.isExistsPath(booksPath)) {
      if (/.*books$/.test(booksPath)) {
        items = fs.readdirSync(booksPath, "utf-8").map((fileName) => {
          const filePath = path.join(booksPath, fileName, "config.yaml");
          const bookData = fs.readFileSync(filePath).toString();
          return new Book(
            `📖${util.getHeader(bookData)?.title}`,
            path.join(booksPath, fileName),
            vscode.TreeItemCollapsibleState.Collapsed
          );
        });
      } else {
        items = fs.readdirSync(booksPath, "utf-8").map((fileName) => {
          const filePath = path.join(booksPath, fileName);
          const articleData = fs.readFileSync(filePath).toString();
          const header = util.getHeader(articleData);
          return new Book(
            `${/.*\.md$/.test(filePath) ? "📝" + header?.title : "⚙設定" }`,
            filePath,
            vscode.TreeItemCollapsibleState.None,
            {
              command: "vs-zenn.openFile",
              title: "",
              arguments: [filePath],
            }
          );
        });
      }
    }

    return items;
  }
}

export class Book extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly filePath?: string,
    public readonly collapsibleState?: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState || vscode.TreeItemCollapsibleState.None);
  }
}
