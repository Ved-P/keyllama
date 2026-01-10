// src/extension.ts
import * as vscode from 'vscode';

/**
 * Called when the extension is activated.
 * Sets up automatic notifications for typing activity.
 */
export function activate(context: vscode.ExtensionContext) {

  console.log('KeyLogger extension is now active!');

  // Listen for all text changes in any document
  const disposable = vscode.workspace.onDidChangeTextDocument(event => {

    // Loop through all changes in this event (can be multiple per typing event)
    for (const change of event.contentChanges) {

      // Show a popup if text was inserted
      if (change.text.length > 0) {
        vscode.window.showInformationMessage(`Inserted: "${change.text}"`);
      }

      // Show a popup if text was deleted
      if (change.rangeLength > 0) {
        vscode.window.showInformationMessage(`Deleted ${change.rangeLength} character(s)`);
      }

    }

  });

  // Register the listener for cleanup on deactivation
  context.subscriptions.push(disposable);
}

/**
 * Called when the extension is deactivated.
 */
export function deactivate() {
  console.log('KeyLogger extension is now deactivated.');
}
