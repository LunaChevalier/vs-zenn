import * as vscode from 'vscode';

export class ItemProvider implements vscode.TreeDataProvider<Item> {
  onDidChangeTreeData?: vscode.Event<void | Item | null | undefined> | undefined;

  constructor(private workspaceRoot: string) {
  }

  getTreeItem(element: Item): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: Item): vscode.ProviderResult<Item[]> {
    vscode.window.showInformationMessage('Method not implemented.');
    return Promise.resolve([]);
  }

}

export class Item extends vscode.TreeItem {
  constructor(
    public readonly label: string
  ) {
    super("labelabel");
  }
}
