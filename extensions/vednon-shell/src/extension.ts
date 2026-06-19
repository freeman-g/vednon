/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

const CONFIG_FILE = 'vednon.json';

/**
 * Shape of the per-workspace chassis config. `name` is used today; `starterApp`
 * and `agent` are parsed-but-unused hooks reserved for later passes:
 *  - `starterApp`: which bundled "starter app" / capability pack to surface.
 *  - `agent`: which AI coding agent (e.g. "claude-code" | "codex") to offer.
 */
interface VednonConfig {
	name?: string;
	starterApp?: string;
	agent?: string;
}

let current: VednonConfig | undefined;

export function activate(context: vscode.ExtensionContext) {
	void loadConfig();

	const watcher = vscode.workspace.createFileSystemWatcher(`**/${CONFIG_FILE}`);
	context.subscriptions.push(
		watcher,
		watcher.onDidChange(() => loadConfig()),
		watcher.onDidCreate(() => loadConfig()),
		watcher.onDidDelete(() => loadConfig()),
		vscode.commands.registerCommand('vednon.reloadConfig', async () => {
			const cfg = await loadConfig();
			void vscode.window.showInformationMessage(
				cfg ? `Vednon config loaded: ${cfg.name ?? '(unnamed)'}` : 'No vednon.json found; using defaults.'
			);
		})
	);
}

export function deactivate() { }

/**
 * Reads and validates `vednon.json` at the first workspace folder root. Missing
 * or malformed config is non-fatal — the chassis works without any setup.
 *
 * Extension points for later passes live here:
 *  - if (cfg.starterApp) { /* activate the named starter capability pack *\/ }
 *  - if (cfg.agent)      { /* offer to install/enable the named AI agent  *\/ }
 */
async function loadConfig(): Promise<VednonConfig | undefined> {
	const folder = vscode.workspace.workspaceFolders?.[0];
	if (!folder) {
		current = undefined;
		return undefined;
	}
	const uri = vscode.Uri.joinPath(folder.uri, CONFIG_FILE);
	try {
		const bytes = await vscode.workspace.fs.readFile(uri);
		const parsed = JSON.parse(Buffer.from(bytes).toString('utf8'));
		current = {
			name: typeof parsed.name === 'string' ? parsed.name : undefined,
			starterApp: typeof parsed.starterApp === 'string' ? parsed.starterApp : undefined,
			agent: typeof parsed.agent === 'string' ? parsed.agent : undefined
		};
	} catch {
		current = undefined;
	}
	return current;
}
