# Vednon — Blank Chassis

Vednon is a lightweight, rebranded fork of Code-OSS intended as a **blank chassis**: a
developer-clutter-free base that a forward-deployed engineer forks to build native vertical
apps for business users (e.g. "Cursor for Real Estate Agents").

It keeps the full VS Code capability surface intact — extension host, MCP, webviews, the
Open VSX marketplace — and simply hides the developer-IDE UI by default. AI capability is
expected to come from installed extensions/agents, not from anything built into the chassis.

---

## The single switch

Everything is gated behind one product flag:

```jsonc
// product.json
"vednon": { "hideDeveloperUI": true }
```

Typed on `IProductConfiguration` (`src/vs/base/common/product.ts`). Flip it to `false`
(or remove it) and the full IDE surface comes back. Nothing is deleted or unregistered —
the developer UI is only **hidden**, so it is fully reversible.

> **Maintenance tip:** every core touchpoint is marked with the grep-able token
> `hideDeveloperUI` and a `// Vednon` comment. After merging upstream, run
> `git grep hideDeveloperUI` to confirm no guard was dropped.

---

## What the chassis does

| Area | Behavior with `hideDeveloperUI` |
|---|---|
| Rebrand | App identity is "Vednon" (name, app id, data folder `~/.vednon`, URL protocol) |
| Marketplace | Points at **Open VSX** (`open-vsx.org`) instead of an empty/absent gallery |
| Activity bar / panel | Run & Debug, Testing, Source Control, Output, Problems, Terminal, Debug Console, and Chat containers are hidden |
| Secondary side bar | Hidden (this removes the Chat / Agent Sessions panel) |
| Menu bar | The top-level **Run** and **Terminal** menus are removed (both the custom in-window menu and the macOS native menu) |
| Explorer | The **Outline** and **Timeline** views are removed (only the file tree remains) |
| Status bar | The **Remote/SSH** indicator (`><`) and the **Problems** errors/warnings item are removed |
| Source control / Git | Disabled via `git.enabled: false` — removes the Git status-bar branch, the SCM provider, and Git commands |
| Copilot onboarding | The "Sign in to use GitHub Copilot" welcome and title-bar sign-in entry are suppressed |
| Getting Started | Suppressed on startup |
| Workspace trust | Disabled (no "Restricted Mode" banner) |
| Kept visible | Explorer, Search, Extensions, Settings — plus the full extension host & MCP |

> **Not stripped (by design):** the Command Palette still lists core Debug/Terminal/Testing
> commands. There is no single choke point for those, and fully removing hundreds of commands
> across core + extensions has poor cost/benefit for a chassis whose end users rarely open the
> palette. Git commands *are* gone because `git.enabled: false` disables the provider.

---

## Touchpoints

### Configuration
- **`product.json`** — Vednon identity fields, `extensionsGallery` → Open VSX, and the
  `vednon.hideDeveloperUI` flag. (`defaultChatAgent` is left intact — blanking it crashes
  startup because many call sites assume it is defined.)
- **`src/vs/base/common/product.ts`** — adds `vednon?: { hideDeveloperUI?: boolean }` to
  `IProductConfiguration`.

### Core guards (all small, additive, flag-gated early-returns/filters)
- **`src/vs/workbench/browser/parts/paneCompositeBar.ts`** — the primary choke point.
  `getViewContainers()` filters out a fixed set of developer container ids
  (`VEDNON_HIDDEN_CONTAINER_IDS`). One edit covers the activity bar, panel, and aux bar.
- **`src/vs/workbench/browser/layout.ts`** — `isVisible(AUXILIARYBAR_PART)` returns `false`,
  keeping the Chat / Agent Sessions side bar hidden.
- **`src/vs/workbench/contrib/welcomeGettingStarted/browser/startupPage.ts`** —
  `tryShowOnboarding()` returns early (no Copilot onboarding overlay).
- **`src/vs/workbench/contrib/chat/browser/chatSetup/chatSetupContributions.ts`** —
  `ChatSetupContribution` constructor returns early (no sign-in welcome / title-bar entry).
- **`src/vs/workbench/services/workspaces/common/workspaceTrust.ts`** —
  `isWorkspaceTrustEnabled()` returns `false` (no Restricted Mode).
- **`src/vs/workbench/browser/parts/titlebar/menubarControl.ts`** — base `setupMainMenu()`
  filters out the `Run` and `Terminal` top-level menus. This is shared by both the custom
  menubar and `NativeMenubarControl` (which calls `super.setupMainMenu()`), so it covers the
  macOS native menu too.
- **`src/vs/workbench/contrib/outline/browser/outline.contribution.ts`** and
  **`src/vs/workbench/contrib/timeline/browser/timeline.contribution.ts`** — skip the
  `registerViews` call for the Outline and Timeline views in the Explorer.
- **`src/vs/workbench/contrib/remote/browser/remote.contribution.ts`** — skip registering
  `RemoteStatusIndicator` (the `><` remote/SSH status-bar item).
- **`src/vs/workbench/contrib/markers/browser/markers.contribution.ts`** — skip registering
  `MarkersStatusBarContributions` (the Problems errors/warnings status-bar item).

### Default settings + config — `extensions/vednon-shell/`
A built-in extension that ships the blank-chassis defaults and the workspace config layer.

- **`contributes.configurationDefaults`**: `workbench.startupEditor: none`,
  `workbench.tips.enabled: false`, `workbench.layoutControl.enabled: false`,
  `workbench.editor.empty.hint: hidden`, `chat.commandCenter.enabled: false`,
  `git.enabled: false`, `workbench.activityBar.location: default`.
  > Note: extension `configurationDefaults` can only set window/resource/machine-overridable
  > settings. Application-scoped ones (telemetry, release notes, workspace trust) are
  > rejected — which is why workspace trust is handled by a core guard instead.
- **`src/extension.ts`**: loads/validates an optional `vednon.json` at the workspace root and
  registers the `Vednon: Reload Config` command. `vednon.json` shape:
  ```jsonc
  { "name": "My Workspace", "starterApp": "...", "agent": "..." }
  ```
  `starterApp` and `agent` are **parsed-but-unused hooks** reserved for later passes
  (loading a bundled starter app / preinstalling an AI coding agent like Claude Code or Codex).

### Build registration
- **`build/npm/dirs.ts`** and **`build/gulpfile.extensions.ts`** — register
  `extensions/vednon-shell` so it is installed and compiled as a built-in.

---

## Building & running (dev)

Requires **Node 24** (`.nvmrc` → 24.15.0).

```bash
npm install                 # once
npm run watch               # incremental build of client + extensions
./scripts/code.sh <folder>  # launch the dev build
```

After editing core (`src/vs/...`) or `product.json`, do a **full relaunch** — those are loaded
at startup and are not hot-reloaded (a window reload is not enough). Webview asset edits in an
extension's `media/` need the editor tab reopened.

---

## Notes

- The chassis intentionally keeps the **Extensions** panel — the engineer needs it to install
  AI agents and other tooling from Open VSX. Note that proprietary Microsoft extensions
  (official GitHub Copilot, Pylance, the C/C++ tools, Remote-*) are not on Open VSX and would
  need side-loading via VSIX.
- All core changes are additive guards, so merges from upstream are low-friction; the chat /
  onboarding files churn most, but re-applying a dropped guard is a few lines.
