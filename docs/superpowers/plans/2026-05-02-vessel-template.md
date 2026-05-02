# Vessel Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a minimal single-app Vessel cargo template that developers can clone and build on top of.

**Architecture:** Mirror the vessel-sample project structure but strip it to one placeholder app (`my-app`) that calls `ready()` and displays "Hello, Vessel!". Files that are reusable infrastructure (SDK, packager, CI workflow) are copied from vessel-sample with only name references updated.

**Tech Stack:** Vanilla HTML/JS (ES modules), Node.js (build script), GitHub Actions (CI/CD)

**Source of truth for copied files:** `/Users/icode/Documents/projects/vessel-sample/`

---

## File Map

| File | Action | Notes |
|------|--------|-------|
| `manifest.json` | Create | Placeholder id/name/author, single app entry |
| `package.json` | Create | ES module, `build` script |
| `sdk/index.js` | Copy from vessel-sample | Verbatim |
| `apps/my-app/index.html` | Create | Hello-world entry point |
| `scripts/pack.js` | Copy + edit from vessel-sample | Update hardcoded `sample-dist` → `my-app-dist` |
| `.github/workflows/release.yml` | Copy + edit from vessel-sample | Update hardcoded `sample-dist.zip` → `my-app-dist.zip` |
| `.gitignore` | Create | Ignore `dist/` |
| `README.md` | Create | Template usage docs |

---

### Task 1: manifest.json + package.json

**Files:**
- Create: `manifest.json`
- Create: `package.json`

- [ ] **Step 1: Create manifest.json**

```json
{
  "id": "my-app-dist",
  "name": "My App",
  "version": "0.1.0",
  "author": "",
  "description": "",
  "apps": [
    { "id": "my-app", "name": "My App", "permissions": [] }
  ]
}
```

Note: no `entry` field on the app object — the Vessel host resolves `apps/{id}/index.html` by convention (matches vessel-sample's actual manifest format).

- [ ] **Step 2: Create package.json**

```json
{
  "name": "my-app",
  "version": "0.1.0",
  "description": "A Vessel cargo",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "node scripts/pack.js"
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add manifest.json package.json
git commit -m "feat: add manifest and package.json"
```

---

### Task 2: Copy SDK

**Files:**
- Create: `sdk/index.js` (copied from vessel-sample)

- [ ] **Step 1: Copy the SDK verbatim**

```bash
mkdir -p sdk
cp /Users/icode/Documents/projects/vessel-sample/sdk/index.js sdk/index.js
```

- [ ] **Step 2: Verify the copy**

```bash
wc -l sdk/index.js
```

Expected: `155 sdk/index.js`

- [ ] **Step 3: Commit**

```bash
git add sdk/index.js
git commit -m "feat: add Vessel SDK"
```

---

### Task 3: Hello-world app

**Files:**
- Create: `apps/my-app/index.html`

- [ ] **Step 1: Create the app directory and HTML file**

```bash
mkdir -p apps/my-app
```

Create `apps/my-app/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My App</title>
</head>
<body>
  <script type="module">
    import { ready } from '../../sdk/index.js'
    await ready()
    document.body.innerText = 'Hello, Vessel!'
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add apps/my-app/index.html
git commit -m "feat: add hello-world app"
```

---

### Task 4: Build script

**Files:**
- Create: `scripts/pack.js` (based on vessel-sample, name references updated)

- [ ] **Step 1: Create scripts directory and pack.js**

```bash
mkdir -p scripts
```

Create `scripts/pack.js`:

```js
#!/usr/bin/env node
import { execSync } from 'child_process'
import { mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'dist')
const outFile = resolve(outDir, 'my-app-dist.zip')

if (!existsSync(outDir)) mkdirSync(outDir)

if (existsSync(outFile)) execSync(`rm "${outFile}"`)

execSync(
  `zip -r "${outFile}" manifest.json sdk/ apps/`,
  { cwd: root, stdio: 'inherit' }
)

console.log(`\nBuilt: dist/my-app-dist.zip`)
```

- [ ] **Step 2: Verify the build works**

```bash
npm run build
```

Expected output ends with: `Built: dist/my-app-dist.zip`

Also verify the zip contents:

```bash
unzip -l dist/my-app-dist.zip
```

Expected: entries for `manifest.json`, `sdk/index.js`, `apps/my-app/index.html`

- [ ] **Step 3: Commit**

```bash
git add scripts/pack.js
git commit -m "feat: add build script"
```

---

### Task 5: GitHub Actions release workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create workflow directory and file**

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - '[0-9]*.[0-9]*.[0-9]*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm run build
      - uses: softprops/action-gh-release@v2
        with:
          files: dist/my-app-dist.zip
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "feat: add release workflow"
```

---

### Task 6: .gitignore + README

**Files:**
- Create: `.gitignore`
- Create: `README.md`

- [ ] **Step 1: Create .gitignore**

```
dist/
```

- [ ] **Step 2: Create README.md**

```markdown
# vessel-template

Minimal starter template for a [Vessel](https://vessel.app) cargo — a sandboxed static web app distributed as a ZIP file.

## Getting Started

1. **Clone this repo** and rename it for your project
2. **Edit `manifest.json`:**
   - Set `id` to a unique cargo ID (e.g. `"my-project-dist"`)
   - Set `name`, `author`, and `description`
   - Rename the app entry `id` from `"my-app"` to your app name
3. **Rename the app folder:** `apps/my-app/` → `apps/<your-app-name>/`
4. **Edit `apps/<your-app-name>/index.html`** — this is your app entry point
5. **Add permissions** in `manifest.json` if your app needs SDK APIs:
   - `"storage"` — persistent key/value storage
   - `"network"` — proxied HTTP requests
   - `"notifications"` — native system notifications
   - `"clipboard"` — write to system clipboard
6. **Update `scripts/pack.js`** — replace `my-app-dist` with your cargo ID

## Build

Requires Node.js 18+.

```bash
npm run build
```

Produces `dist/<cargo-id>.zip`.

## Install

Drag the zip file into the Vessel app.

## SDK Usage

```js
import { ready, storage, http, notifications, clipboard } from '../../sdk/index.js'

// Always call ready() first
await ready()

// Then use whichever APIs your app declared in manifest.json
await storage.set('key', 'value')
const value = await storage.get('key')
```

See `sdk/index.js` for the full API.
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore README.md
git commit -m "feat: add gitignore and README"
```

---

### Task 7: Final verification

- [ ] **Step 1: Verify complete file structure**

```bash
find . -not -path './.git/*' -not -path './dist/*' | sort
```

Expected output:
```
.
./.github
./.github/workflows
./.github/workflows/release.yml
./.gitignore
./apps
./apps/my-app
./apps/my-app/index.html
./docs
./docs/superpowers
./docs/superpowers/plans
./docs/superpowers/plans/2026-05-02-vessel-template.md
./docs/superpowers/specs
./docs/superpowers/specs/2026-05-02-vessel-template-design.md
./manifest.json
./package.json
./README.md
./scripts
./scripts/pack.js
./sdk
./sdk/index.js
```

- [ ] **Step 2: Clean build from scratch**

```bash
rm -rf dist && npm run build
```

Expected: `Built: dist/my-app-dist.zip` with no errors

- [ ] **Step 3: Verify zip contents match spec**

```bash
unzip -l dist/my-app-dist.zip
```

Expected entries: `manifest.json`, `sdk/index.js`, `apps/my-app/index.html`

- [ ] **Step 4: Final commit (if any stragglers)**

```bash
git status
```

If clean, done. If there are uncommitted changes:

```bash
git add -A
git commit -m "chore: finalize vessel-template"
```
