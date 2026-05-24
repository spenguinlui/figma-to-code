#!/usr/bin/env node
/**
 * build-dep-map.mjs — 建「元件 → 用到它的頁面」依賴表
 *
 * Purpose: 回歸驗證要知道「改了某共用元件，該回頭驗哪幾頁」。
 *   靜態解析 pages/ 與 components/ 的 import，算出（含遞移）每個元件被哪些頁面用到。
 *   遞移 = 頁面用 Header、Header 內含 DropdownMenu → 改 DropdownMenu 也標該頁。
 *
 * 副作用：read-only 掃檔 + 寫 tests/visual/dep-map.json（generated，可重建）。
 * 用法：node scripts/build-dep-map.mjs        # 寫檔
 *      node scripts/build-dep-map.mjs --check # 只印、不寫（給 CI / 自驗用）
 *
 * 輸出 schema:
 * {
 *   "generatedAt": "<ISO>",
 *   "components": { "<ComponentName>": ["<page-slug>", ...], ... },  // 含遞移
 *   "pages":      { "<page-slug>": ["<ComponentName>", ...], ... },  // 含遞移
 *   "orphans":    ["<ComponentName>", ...]                            // 沒被任何頁用到
 * }
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs"
import { dirname, resolve, relative, basename, extname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const COMPONENTS_DIR = join(ROOT, "components")
const PAGES_DIR = join(ROOT, "pages")
const OUT = join(ROOT, "tests", "visual", "dep-map.json")

/** 遞迴列出某目錄下所有 .tsx 檔（絕對路徑） */
function listTsx(dir) {
  const out = []
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name)
      const st = statSync(p)
      if (st.isDirectory()) walk(p)
      else if (extname(p) === ".tsx") out.push(p)
    }
  }
  walk(dir)
  return out
}

/** 抽出檔內所有 import 來源字串（"..." / '...'） */
function importSources(file) {
  const src = readFileSync(file, "utf8")
  const re = /import\s+(?:[^"';]+\s+from\s+)?["']([^"']+)["']/g
  const out = []
  let m
  while ((m = re.exec(src)) !== null) out.push(m[1])
  return out
}

// 1) 建元件清單：ComponentName -> 絕對路徑
const componentFiles = listTsx(COMPONENTS_DIR)
const compPathByName = new Map() // name -> absPath
const compNameByPath = new Map() // absPath -> name
for (const f of componentFiles) {
  const name = basename(f, ".tsx")
  compPathByName.set(name, f)
  compNameByPath.set(f, name)
}

/** 把某檔的 import 來源解析成它直接依賴的「元件名」集合 */
function directComponentDeps(file) {
  const deps = new Set()
  for (const spec of importSources(file)) {
    if (!spec.startsWith(".")) continue // 跳過 react / 第三方 / framer shim
    // 解析相對路徑 → 嘗試 .tsx
    const resolved = resolve(dirname(file), spec)
    const candidate = extname(resolved) ? resolved : resolved + ".tsx"
    if (compNameByPath.has(candidate)) deps.add(compNameByPath.get(candidate))
  }
  return deps
}

// 2) 元件 → 元件 直接依賴圖
const compGraph = new Map() // name -> Set(name)
for (const f of componentFiles) {
  compGraph.set(compNameByPath.get(f), directComponentDeps(f))
}

/** 給一組起始元件，回傳含遞移的全部元件名 */
function expand(seed) {
  const seen = new Set()
  const stack = [...seed]
  while (stack.length) {
    const n = stack.pop()
    if (seen.has(n)) continue
    seen.add(n)
    for (const child of compGraph.get(n) ?? []) if (!seen.has(child)) stack.push(child)
  }
  return seen
}

// 3) 頁面 → 元件（含遞移）。page slug = pages/ 下第一層目錄名
const pageFiles = listTsx(PAGES_DIR)
const pages = {} // slug -> [components]
for (const f of pageFiles) {
  const rel = relative(PAGES_DIR, f) // e.g. "example/ExamplePage.tsx"
  const slug = rel.split("/")[0]
  const direct = directComponentDeps(f)
  const all = expand(direct)
  pages[slug] = [...new Set([...(pages[slug] ?? []), ...all])].sort()
}

// 4) 反轉：元件 → [頁面]
const components = {}
for (const name of compPathByName.keys()) components[name] = []
for (const [slug, comps] of Object.entries(pages)) {
  for (const c of comps) (components[c] ??= []).push(slug)
}
for (const c of Object.keys(components)) components[c] = [...new Set(components[c])].sort()

const orphans = Object.keys(components)
  .filter((c) => components[c].length === 0)
  .sort()

// 不寫 generatedAt：此檔 git tracked 且可重建，省略時間戳讓 diff 穩定（新鮮度看 git log）
const result = { components, pages, orphans }

if (process.argv.includes("--check")) {
  const total = Object.keys(components).length
  const used = total - orphans.length
  console.log(`[dep-map] ${total} 元件 / ${Object.keys(pages).length} 頁面；${used} 元件被頁面用到，${orphans.length} 個 orphan`)
  console.log(JSON.stringify(result, null, 2))
} else {
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n")
  console.log(`[dep-map] 寫入 ${relative(ROOT, OUT)}：${Object.keys(components).length} 元件 / ${Object.keys(pages).length} 頁面，${orphans.length} orphan`)
}
