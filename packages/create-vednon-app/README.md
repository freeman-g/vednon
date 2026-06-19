# create-vednon-app

A `create-vue`-style scaffolder for **Vednon** (the de-developed VS Code fork in this repo).
It generates a small, runnable **VS Code extension** project — the unit you build on top of
the Vednon chassis — so you can `npm install`, run it, and start editing.

## Usage

Run from the repo root.

### Non-interactive

```bash
node ./packages/create-vednon-app/index.js my-app --template blank
```

`-t` is shorthand for `--template`. With a single template installed, `--template` is
optional.

### Interactive

Run with no arguments and you'll be prompted for a project name (the template is chosen
automatically when only one exists):

```bash
node ./packages/create-vednon-app/index.js
# → Project name: …
```

### Run the generated extension

```bash
cd my-app
npm install
export VEDNON_BIN="/path/to/vednon/scripts/code.sh"   # your Vednon launcher
npm run dev
```

`npm run dev` compiles the extension and launches it in a Vednon window. Run **Hello World**
from the Command Palette to confirm it loaded, then edit `src/extension.ts`. (`VEDNON_BIN`
defaults to a `vednon` command on PATH; in dev it's the fork's `code.sh`. Or just open the
folder and press `F5`.)

> The Vednon editor is the runtime the extension runs in — like a browser for a web app — so
> it isn't bundled into the scaffold; you point `npm run dev` at an existing Vednon build.

## Templates

Templates are real folders under `templates/<name>/`. Adding a new one is just creating a
folder there — it shows up in the CLI automatically.

| Template | Contents |
|---|---|
| `blank` | A minimal, unopinionated VS Code extension: `package.json` manifest with one `helloWorld` command, `src/extension.ts`, `tsconfig.json`, `.vscode/{launch,tasks}.json`, `.vscodeignore`, `.gitignore`, `README.md`. |

## How it works

- Recursively copies the chosen template folder into `./<project-name>/`.
- Replaces the `__PROJECT_NAME__` token in text files (`.json`, `.md`, `.js`, `.ts`, `.css`,
  `.html`, `.txt`, and `.gitignore`).
- Renames `_gitignore` → `.gitignore` on copy (the create-vite convention).
- No templating engine, no remote download, no `git init`, no package-manager detection (v1).
