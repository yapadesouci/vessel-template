# Vessel Template Design

**Date:** 2026-05-02  
**Status:** Approved

## Overview

A minimal single-app starter template for building Vessel cargos. Mirrors the structure of vessel-sample stripped to one placeholder app that calls `ready()` and renders "Hello, Vessel!".

## Goals

- Give developers a correct, runnable starting point for a new Vessel cargo
- Keep the structure identical to the established vessel-sample convention
- Contain no app-specific logic — only scaffolding and a hello-world entry point

## File Structure

```
vessel-template/
├── manifest.json
├── sdk/
│   └── index.js
├── apps/
│   └── my-app/
│       └── index.html
├── scripts/
│   └── pack.js
├── .github/
│   └── workflows/
│       └── release.yml
├── .gitignore
└── README.md
```

## File Details

### manifest.json

Single-app cargo descriptor with placeholder values:

- `id`: `"my-app-dist"` (developer replaces)
- `name`: `"My App"` (developer replaces)
- `version`: `"0.1.0"`
- `author`: `""` (developer fills in)
- `description`: `""` (developer fills in)
- `apps`: one entry — `id: "my-app"`, `entry: "apps/my-app/index.html"`, `permissions: []`

### apps/my-app/index.html

Minimal HTML file with an inline ES module script that:
1. Imports `ready` from `../../sdk/index.js`
2. Calls `await ready()`
3. Sets `document.body.innerText = "Hello, Vessel!"`

No external CSS, no framework, no additional SDK API usage.

### sdk/index.js

Pre-compiled Vessel SDK copied verbatim from vessel-sample. Not modified.

### scripts/pack.js

Packaging script copied verbatim from vessel-sample. Produces `dist/<cargo-id>.zip` containing `manifest.json`, `sdk/`, and `apps/`.

### .github/workflows/release.yml

GitHub Actions workflow copied verbatim from vessel-sample. Triggers on version tags, builds the zip, uploads to GitHub Releases.

### .gitignore

Ignores `dist/` directory.

### README.md

Documents:
- What this template is
- What to replace: cargo id, name, author, app folder name
- How to add SDK permissions in manifest
- How to build: `npm run build`
- How to install: drag the zip into the Vessel app

## Non-Goals

- No styling or UI framework
- No example SDK API calls (storage, network, notifications, clipboard)
- No multi-app structure
- No test setup
