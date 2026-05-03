---
name: cargo-creation
description: Use when creating a new Vessel cargo — a zip-packaged static web app that runs sandboxed in the Vessel host with SDK access to storage, notifications, clipboard, and http
---

# Vessel Cargo Creation

## Overview

A Vessel **cargo** is a ZIP file containing one or more static web apps (`manifest.json` + `apps/` + bundled SDK). All apps in a cargo share a single `sdk/index.js`. Cargos run in sandboxed iframes inside the Vessel Electron host, communicating with native APIs via `@vessel-aircodr/sdk` through postMessage.

## File Structure

```
my-dist/
  manifest.json        ← required, must be at zip root
  sdk/
    index.js           ← bundled @vessel-aircodr/sdk (shared by all apps)
  apps/
    {appId}/
      index.html       ← entry point for this app
      assets/          ← optional: images, fonts, additional JS/CSS
```

## manifest.json

```json
{
  "id": "my-dist",
  "name": "My Distribution",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "What this cargo does",
  "apps": [
    { "id": "main",  "name": "Main App",  "permissions": ["storage"] },
    { "id": "extra", "name": "Extra App", "permissions": ["http"] }
  ]
}
```

| Field | Rule |
|-------|------|
| `id` | `/^[a-z0-9-]{1,64}$/` — lowercase alphanumeric + hyphens only |
| `version` | Valid semver — `1.0.0` not `v1.0.0` |
| `apps` | Required non-empty array. Each entry: `{ id, name, permissions }`. Permissions are a subset of `["storage", "notifications", "clipboard", "http"]` — declare only what you use |
| `icon` | Optional emoji or image URL |
| `description` | Optional, shown in Marketplace |

## SDK Integration

```html
<script type="module">
  import { ready, storage, notifications, clipboard, http } from '../../sdk/index.js'

  // REQUIRED: handshakes with host — must complete before any API call
  await ready()

  // APIs are now usable
  const count = await storage.get('count') ?? 0
  await storage.set('count', count + 1)
  await notifications.send({ title: 'Done', body: 'Count updated' })
  await clipboard.write(String(count + 1))
  const res = await http.fetch('https://api.example.com/data')
</script>
```

**`await ready()` is mandatory.** It performs the postMessage handshake with the host. Calling any API before it resolves throws immediately. If the host doesn't respond within 5 s, it throws `VesselHandshakeTimeout`.

## SDK API Reference

| API | Signature | Notes |
|-----|-----------|-------|
| `storage.get` | `(key: string) → unknown` | Per-app JSON store (`distId + appId`), 10 MB max |
| `storage.set` | `(key: string, value: unknown) → void` | Throws `VesselStorageQuotaExceeded` at limit |
| `notifications.send` | `({ title, body }) → void` | Requires `notifications` permission |
| `clipboard.write` | `(text: string) → void` | Requires `clipboard` permission |
| `http.fetch` | `(url: string, options?: HttpOptions) → HttpResponse` | Requires `http` permission. Direct `fetch()` is blocked — use this instead. `HttpOptions`: `{ method?, headers?, body? }`. `HttpResponse`: `{ status, headers, body, bodyEncoding: 'text'\|'base64' }` |

Calling an API without the matching permission throws `VesselPermissionDenied`.

## Packaging

```bash
# Preferred: uses scripts/pack.js (copies SDK bundle automatically)
node scripts/pack.js

# Manual alternative — must zip from inside the directory
cd my-dist/
zip -r ../my-dist.zip .
```

`scripts/pack.js` copies `node_modules/@vessel-aircodr/sdk/dist/bundle.js` → `sdk/index.js` before zipping. Update the `outFile` variable to match your cargo ID.

## Security Constraints

Cargos run in a sandboxed iframe with no direct network access:
- ❌ `fetch('https://...')` is blocked — use `http.fetch()` instead
- ❌ No loading scripts/styles from CDNs — bundle all assets locally
- ✅ Inline `<style>` and `<script>` blocks work
- ✅ `data:` URIs for images work
- ✅ ES module imports from relative paths work

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Calling any API before `await ready()` | Move all API calls after `await ready()` |
| `"version": "v1.0.0"` | Remove the `v` — must be bare semver |
| `"id": "My Cargo"` | Use `my-cargo` — lowercase, hyphens only |
| `fetch('https://...')` directly | Use `http.fetch(...)` and add `"http"` to permissions |
| Zipping the folder itself | `cd my-dist && zip -r ../x.zip .` not `zip -r x.zip my-dist/` |
| Top-level `await` outside a module | Add `type="module"` to your `<script>` tag |
| Importing SDK as `./sdk/index.js` from inside an app | Use `../../sdk/index.js` — apps live two levels deep |
| Putting `index.html` at the zip root | Place it in `apps/{appId}/index.html` |
| Top-level `"permissions"` in manifest | Permissions belong in each app entry, not at the cargo level |
| Single app with no `apps` array | Always use `"apps": [...]` — even single-app cargos require the array |
| Forgetting to run `pack.js` after editing SDK copy | `node scripts/pack.js` re-copies the SDK bundle on every build |
