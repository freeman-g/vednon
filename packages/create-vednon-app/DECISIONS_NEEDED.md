# Decisions needed — create-vednon-app

Open product decisions hit while building the v1 scaffolder. Each was resolved with a
reasonable default so work could proceed; flagging here for confirmation.

## 1. What is a scaffolded project? (resolved: a workspace folder, not a fork copy)

The original goal said the CLI creates "a working copy of the de-deved nondev fork," but also
that the result is "launched via `./scripts/code.sh <dir>`" — i.e. the existing fork opens
`<dir>` as a **workspace folder**. Those two readings conflict (a full fork copy wouldn't be
opened as a folder by the repo's own `code.sh`).

**Default chosen:** a scaffolded project is a **workspace folder** that the de-deved Vednon
fork opens — analogous to what `create-vite` produces (a small app dir, not a copy of Vite
itself). The "de-deved" experience comes from the fork build (the
`product.vednon.hideDeveloperUI` flag), so any folder opened in the fork already gets the
stripped chassis. The scaffold just seeds the folder with a `vednon.json` config and starter
content.

## 2. CLI package name (resolved: `create-vednon-app`)

Renamed from the goal's working path `create-nondev-app` to **`create-vednon-app`** to match
the product brand and the `npm create vednon-app` convention.

## 3. Starter-app template scope (deferred to a later commit)

A `title-abstractor` template that additionally bundles the form-rendering extension and a
sample `matters/example.matter.json` was prototyped, but it is **not part of this commit** —
it embeds an example extension whose auto-activation story isn't settled (VS Code does not
auto-load an extension just because its source sits in an opened workspace folder).

When revisited, the open question is how the bundled extension gets activated: via the
`vednon-shell` `starterApp` hook (already stubbed in the fork), or a documented
`--extensionDevelopmentPath` launch. For now the CLI ships **`blank` only**.
