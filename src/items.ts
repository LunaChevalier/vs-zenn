import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

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

    const title = this.getTitle(headers);
    const emoji = this.getEmoji(headers);
    return `${emoji}${title}`;
  }

  private getTitle(headers: string[]) {
    const title = headers.find((header) => /^title:/.test(header)) || "non title";
    return title.replace(/^title: /, "").replace(/^"/, "").replace(/"$/, "");
  }

  private getEmoji(headers: string[]) {
    const emoji = headers.find((header) => /^emoji:/.test(header)) || "🈳";
    return emoji.replace(/^emoji: /, "").replace(/^"/, "").replace(/"$/, "");
  }
}

export class Item extends vscode.TreeItem {
  constructor(
    public readonly label: string
  ) {
    super(label);
  }
}

export class Article {
  constructor(public readonly title: string) {
  }
}
