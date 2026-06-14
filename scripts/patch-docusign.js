#!/usr/bin/env node
/**
 * Removes the AMD define() branch from docusign-esign source files.
 * Turbopack's externals-tracing can't parse AMD define() calls with undefined
 * entries, so we strip that branch and keep only the CJS branch.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const srcDir = path.join(__dirname, '..', 'node_modules', 'docusign-esign', 'src')

if (!fs.existsSync(srcDir)) {
  console.log('docusign-esign not found, skipping patch')
  process.exit(0)
}

function removeAmdBlock(content) {
  if (!content.includes('define.amd')) return content

  const lines = content.split('\n')
  const out = []
  let inAmd = false

  for (const line of lines) {
    // Detect start of AMD block
    if (!inAmd && line.includes('define.amd')) {
      inAmd = true
      continue // drop the "if define.amd {" line
    }

    if (inAmd) {
      // Look for the closing "} else if (typeof module ..." that ends the AMD block
      if (/^\s*\}\s*else\s+if\s*\(\s*typeof\s+module/.test(line)) {
        // Keep this line but remove the "} else" prefix so it becomes the first if-branch
        const indent = (line.match(/^(\s*)/) ?? ['', ''])[1]
        out.push(line.replace(/^\s*\}\s*else\s+if/, indent + 'if'))
        inAmd = false
      }
      // else: skip all lines inside the AMD block (comment, define(...) call, etc.)
      continue
    }

    out.push(line)
  }

  return out.join('\n')
}

const files = execSync(`find "${srcDir}" -name "*.js"`, { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)

let patched = 0
for (const file of files) {
  const original = fs.readFileSync(file, 'utf8')
  const fixed = removeAmdBlock(original)
  if (fixed !== original) {
    fs.writeFileSync(file, fixed)
    patched++
  }
}

console.log(`✅ docusign-esign patched: ${patched}/${files.length} files updated (AMD branch removed)`)
