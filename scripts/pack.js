#!/usr/bin/env node
import { execSync } from 'child_process'
import { mkdirSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'dist')
const outFile = resolve(outDir, 'my-app-dist.zip') // rename: replace my-app-dist with your cargo ID (also update the log below)

if (!existsSync(outDir)) mkdirSync(outDir)

if (existsSync(outFile)) unlinkSync(outFile)

execSync(
  `zip -r "${outFile}" manifest.json sdk/ apps/`,
  { cwd: root, stdio: 'inherit' }
)

console.log(`\nBuilt: dist/my-app-dist.zip`)
