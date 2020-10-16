import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as util from './util';

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
        if (items.length === 0) {
          vscode.window.showErrorMessage('failed get book items.');
          return [];
        }
        const bookConfigPath = items.filter((item) => item.filePath?.includes("config.yaml"))[0].filePath;
        if (!bookConfigPath) {
          vscode.window.showErrorMessage("failed get book config.");
          return [];
        }
        const bookConfig = fs.readFileSync(bookConfigPath).toString();
        const chapters = util.getHeader(bookConfig).chapters;
        console.log(chapters);
        items = items.sort((a, b) => {
          if (!a.filePath || !b.filePath) {
            return -1;
          }
          console.log(a.filePath.split('\\').slice(-1)[0]);
          console.log(chapters.indexOf(a.filePath.split('\\').slice(-1)[0]));
          console.log(chapters.indexOf(b.filePath.split('\\').slice(-1)[0]));

          return chapters.indexOf(a.filePath.split('\\').slice(-1)[0]) - chapters.indexOf(b.filePath.split('\\').slice(-1)[0]);
          // return uti1l.getHeader(bookConfig).chapters.indexOf(a.);
          // fs.readdirSync(booksPath, "utf-8").forEach((fileName) => {
          //   const filePath = path.join(booksPath, fileName);
          //   console.log(filePath);
          // });
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

  static getTitles() {
    const config = vscode.workspace.getConfiguration("vs-zenn");
    const rootDirBook = path.join(config.rootDir, "books");
    const items = fs.readdirSync(rootDirBook, "utf-8").map((dirName) => {
      const filePath = path.join(rootDirBook, dirName, "config.yaml");
      const articleData = fs.readFileSync(filePath).toString();
      const header = util.getHeader(articleData);
      return {
        slug: dirName,
        title: header.title
      };
    });
    return items;
  }

  static getChapters(slug: string) {
    const config = vscode.workspace.getConfiguration("vs-zenn");
    const rootDirBook = path.join(config.rootDir, "books", slug);
    const files = fs.readdirSync(rootDirBook, "utf-8");
    return Array(files.length).fill(0).map((v,i)=>++i).map((i) => i.toString());
  }

  static addChapter(slug: string, chapter: number, title: string) {
    const config = vscode.workspace.getConfiguration("vs-zenn");
    const rootDirBook = path.join(config.rootDir, "books", slug);
    const files = fs.readdirSync(rootDirBook, "utf-8");
    for (let i = files.length; i > chapter; i--) {
      const oldFileDir = path.join(rootDirBook, `${i - 1}.md`);
      const newFileDir = path.join(rootDirBook, `${i}.md`);
      fs.renameSync(oldFileDir, newFileDir);
    }

    const content = `---\ntitle: ${title}\n---\n`;
    fs.writeFileSync(path.join(rootDirBook, `${chapter}.md`), content);
  }
}
