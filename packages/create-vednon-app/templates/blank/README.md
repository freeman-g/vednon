# __PROJECT_NAME__

A blank **Vednon** extension — the unopinionated starting point. This is a minimal VS Code
extension you build on top of the Vednon chassis. Edit `src/extension.ts` and go.

## Get started

```bash
npm install
npm run dev
```

`npm run dev` compiles the extension and launches it in a Vednon window (an Extension
Development Host). Open the Command Palette and run **Hello World** — you'll see a message
from your extension.

### Pointing `npm run dev` at Vednon

`npm run dev` needs to know where your Vednon build is. It runs `$VEDNON_BIN` (defaulting to a
`vednon` command on your PATH). Set `VEDNON_BIN` to your launcher:

```bash
# In development, that's the fork's code.sh:
export VEDNON_BIN="/path/to/vednon/scripts/code.sh"
# Once Vednon ships as an installed app, just put its `vednon` CLI on PATH.
```

> The Vednon editor is the runtime your extension runs in (like a browser is for a web app).
> It isn't bundled into this project — you point at an existing Vednon build.

Alternatively, open this folder in an editor and press `F5` ("Run Extension").

## Develop

- `src/extension.ts` — your extension's entry point (`activate` / `deactivate`).
- `package.json` — the manifest: declare commands, views, editors, etc. under `contributes`.
- `npm run watch` — recompile on save; reload the dev-host window to pick up changes.

From here you have the full VS Code extension API: commands, webviews, custom editors, tree
views, MCP, and more.

## Build a sharable package

```bash
npm run compile
# then package with @vscode/vsce if you want a .vsix
```
