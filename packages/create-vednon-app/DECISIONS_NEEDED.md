# Decisions needed — create-vednon-app

Open product decisions hit while building the v1 scaffolder. Each was resolved with a
reasonable default so work could proceed; flagging here for confirmation.

## 1. What does a scaffolded project contain? (resolved: a runnable VS Code extension)

Modeled on `npm create vue@latest`: the CLI generates a **small, runnable project you jump
into and extend**. For Vednon, the thing you build on top of the chassis is a **VS Code
extension**, so the `blank` template is a minimal, unopinionated extension (a single
`helloWorld` command + the standard `package.json` / `tsconfig.json` / `src/extension.ts` /
`.vscode` run config). No artifacts, no `vednon.json`, no opinions.

The de-deved chassis itself is *not* copied into each project — it lives in the fork. A
scaffolded extension is run against that chassis via `F5` (Extension Development Host) or
`./scripts/code.sh --extensionDevelopmentPath=<dir>`.

(Supersedes the earlier "scaffold = workspace folder of artifacts" interpretation, which was
the wrong model.)

## 2. CLI package name (resolved: `create-vednon-app`)

Named **`create-vednon-app`** to match the product brand and the `npm create vednon-app`
convention.

## 3. Running an extension in the de-deved chassis

The chassis hides the Run/Debug UI, so `F5` may not surface in a Vednon window. The generated
README documents the CLI launch (`code.sh --extensionDevelopmentPath`) as the reliable path.
Open question for later: should Vednon expose a first-class "run this extension" affordance for
developers, or is the CLI launch enough?

## 4. Future templates (out of scope for now)

Only `blank` ships today. Opinionated starters (e.g. a webview-app template, or a vertical
example) can be added later as sibling folders under `templates/`; the CLI discovers them
automatically and will prompt for a choice once more than one exists.
