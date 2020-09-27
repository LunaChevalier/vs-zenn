import * as vscode from 'vscode';

export async function tryOpenFile(workspaceUri: string): Promise<void> {
  await openFile(workspaceUri);
}

async function openFile(fileName: string): Promise<void> {
  const doc = await vscode.workspace.openTextDocument(fileName);
  vscode.window.showTextDocument(doc);
}
