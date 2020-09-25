import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } from 'constants';

export class ItemProvider implements vscode.TreeDataProvider<Item> {
  onDidChangeTreeData?: vscode.Event<void | Item | null | undefined> | undefined;

  constructor(private workspaceRoot: string) {
  }

  getTreeItem(element: Item): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Item): vscode.ProviderResult<Item[]> {
    return Promise.resolve(this.getArticles(path.join(this.workspaceRoot, 'articles')));
  }

  private getArticles(articlesPath: string): Item[] {
    let items = [new Item("labels")];
    if (this.pathExists(articlesPath)) {
      return fs.readdirSync(articlesPath, "utf-8").map((file) => {
        const data = fs.readFileSync(path.join(articlesPath, file), "utf-8");
        this.getHeader(data);
        return new Item(this.getHeader(data));
      });
    }

    vscode.window.showInformationMessage(items.join(","));
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

    const label =
      headers.find((header) => /^title:/.test(header)) ||
      "タイトルなし";
    return label.replace(/^title: /, "").replace(/"/g, "");
  }
}

export class Item extends vscode.TreeItem {
  constructor(
    public readonly label: string
  ) {
    super("labelabel");
  }
}

export class Article {
  constructor(public readonly title: string) {
  }
}