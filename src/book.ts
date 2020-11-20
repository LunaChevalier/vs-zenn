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
        items = fs
          .readdirSync(booksPath, "utf-8")
          .filter(
            (name) =>
              /.*\.md$/.test(name) ||
              /.*\.yaml$/.test(name) ||
              /.*\.yml$/.test(name)
          ).map((fileName) => {
            const filePath = path.join(booksPath, fileName);
            const articleData = fs.readFileSync(filePath).toString();
            const header = util.getHeader(articleData);
            return new Book(
              `${/.*\.md$/.test(filePath) ? "📝" + header?.title : "⚙設定"}`,
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
        items = items.sort((a, b) => {
          if (!a.filePath || !b.filePath) {
            return -1;
          }

          return chapters.indexOf(a.filePath.split('\\').slice(-1)[0].split('.')[0]) - chapters.indexOf(b.filePath.split('\\').slice(-1)[0].split('.')[0]);
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

  static addChapter(bookSlug: string, chapterIndex: number, title: string, chapter: string) {
    if (!Book.validateChapter(chapter)) {
      vscode.window.showErrorMessage(
        `Error: Chapter name must be named with a-z, 1-9 or '-'.\n You inputted ${chapter}`
      );
      return;
    }
    const config = vscode.workspace.getConfiguration("vs-zenn");
    const rootDirBook = path.join(config.rootDir, "books", bookSlug);
    const header = util.getBookConfig(path.join(rootDirBook, "config.yaml"));
    header.chapters.splice(chapterIndex - 1, 0, chapter);
    fs.writeFileSync(
      path.join(rootDirBook, "config.yaml"),
      util.generateBookConfigFile(header)
    );

    const content = `---\ntitle: ${title}\n---\n`;
    fs.writeFileSync(path.join(rootDirBook, `${chapter}.md`), content);
  }

  private static validateChapter(chapter: string):boolean {
    return /^[a-z0-9-]+$/.test(chapter);
  }
}
