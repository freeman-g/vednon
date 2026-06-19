# create-vednon-app

A small `create-vite`-style scaffolder for **Vednon** (the de-developed VS Code fork in this
repo). It creates a new workspace folder from a template; you then open that folder in the
Vednon build with `./scripts/code.sh`.

## Usage

Run from the repo root.

### Non-interactive

```bash
node ./packages/create-vednon-app/index.js my-app --template blank
```

`-t` is shorthand for `--template`.

### Interactive

Run with no arguments (or omit either the name or the template) and you'll be prompted:

```bash
node ./packages/create-vednon-app/index.js
# → Project name: …
# → Select a template: › blank
```

### Open the scaffolded workspace

```bash
./scripts/code.sh my-app
```

This opens the folder in the de-deved Vednon window (stripped developer UI, full extension
host + MCP intact).

## Templates

Templates are real folders under `templates/<name>/`. Adding a new one is just creating a
folder there — it shows up in the CLI automatically.

| Template | Contents |
|---|---|
| `blank` | `vednon.json` (workspace config), `README.md`, `.gitignore`. A minimal, usable Vednon workspace. |

## How it works

- Recursively copies the chosen template folder into `./<project-name>/`.
- Replaces the `__PROJECT_NAME__` token in text files (`.json`, `.md`, `.js`, `.ts`, `.css`,
  `.html`, `.txt`, and `.gitignore`).
- Renames `_gitignore` → `.gitignore` on copy (the create-vite convention).
- No templating engine, no remote download, no `git init`, no package-manager detection (v1).

## Notes

- A future starter-app template (e.g. a "title-abstractor" example that bundles the
  form-rendering extension) is planned but intentionally out of scope for this commit — see
  `DECISIONS_NEEDED.md`.
