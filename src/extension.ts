import * as vscode from 'vscode';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let statusBarItem: vscode.StatusBarItem;
let extensionPath: string;

export function activate(context: vscode.ExtensionContext) {
	extensionPath = context.extensionPath;
	
	// Create status bar item
	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'git-nacht.addAll';
	
	const iconUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'git-nacht.png'));
	statusBarItem.text = `Git Nacht`;
	statusBarItem.tooltip = 'Click to git add .';
	
	// Set icon for light and dark themes
	(statusBarItem as any).iconPath = {
		light: iconUri,
		dark: iconUri
	};
	
	statusBarItem.show();

	// Register the command
	let disposable = vscode.commands.registerCommand('git-nacht.addAll', async () => {
		await gitAddAll();
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(statusBarItem);

	// Update status bar when workspace changes
	vscode.workspace.onDidChangeWorkspaceFolders(() => {
		updateStatusBar();
	});

	// Initial update
	updateStatusBar();
}

function updateStatusBar() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
	
	if (!workspaceFolder) {
		statusBarItem.text = `$(git-commit) Git Nacht (no workspace)`;
		statusBarItem.command = undefined;
		return;
	}

	const gitDir = path.join(workspaceFolder.uri.fsPath, '.git');
	
	if (!fs.existsSync(gitDir)) {
		statusBarItem.text = `$(warning) Git Nacht (not initialized)`;
		statusBarItem.command = 'git-nacht.addAll';
		statusBarItem.tooltip = 'You haven\'t git init yet dumbass';
		return;
	}

	statusBarItem.text = `$(git-commit) Git Nacht`;
	statusBarItem.tooltip = 'Click to git add .';
	statusBarItem.command = 'git-nacht.addAll';
}

async function gitAddAll() {
	const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

	if (!workspaceFolder) {
		vscode.window.showErrorMessage('Git Nacht: No workspace folder open');
		return;
	}

	const gitDir = path.join(workspaceFolder.uri.fsPath, '.git');

	if (!fs.existsSync(gitDir)) {
		vscode.window.showErrorMessage('Git Nacht: You haven\'t git init yet dumbass');
		return;
	}

	try {
		const projectRoot = workspaceFolder.uri.fsPath;
		execSync('git add .', { cwd: projectRoot });
		const iconUri = vscode.Uri.file(path.join(extensionPath, 'assets', 'git-nacht.png'));
		vscode.window.showInformationMessage(`Git Nacht: All files staged!`, { modal: false });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		vscode.window.showErrorMessage(`Git Nacht: ${errorMessage}`);
	}
}

export function deactivate() {}
