import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';
import * as yaml from 'js-yaml';

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
    return Promise.resolve(this.getBooks(path.join(this.workspaceRoot, 'books')));
  }

  private getBooks(booksPath: string): Book[] {
    let items = [new Book("labels")];
    if (this.pathExists(booksPath)) {
      fs.readdirSync(booksPath, "utf-8").forEach(dir => {
        console.log(`dir:${dir}`);
        const bookPath = path.join(booksPath, dir);
        const toItems = fs.readdirSync(bookPath, 'utf-8').map(fileName => {
          const filePath = path.join(bookPath, fileName);
          if (/.*md/.test(filePath)) {
            return new Book("article 1", filePath, vscode.TreeItemCollapsibleState.None, {
              command: 'vs-zenn.openFile',
              title: '',
              arguments: [filePath]
            });
          } else {
            const bookData = fs.readFileSync(filePath);
            return new Book(yaml.safeLoad(bookData).title, "", vscode.TreeItemCollapsibleState.Collapsed);
          }
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
