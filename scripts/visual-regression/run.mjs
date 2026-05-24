#!/usr/bin/env node
/**
 * run.mjs — 視覺回歸 orchestrator
 *
 * 給一個元件 → 查 dep-map 找出用到它的頁面 → 元件層數值斷言 + 頁面層截圖回歸。
 *   orphan 元件（無頁面組裝）→ 明確告知「僅驗元件層」，不假裝頁面也驗了。
 *
 * 用法：
 *   node scripts/visual-regression/run.mjs --component Header          # 驗 Header + 受影響頁
 *   node scripts/visual-regression/run.mjs --pages all                 # 全頁面回歸（不含元件層）
 *   node scripts/visual-regression/run.mjs --component Header --update-baseline  # 認可：重寫受影響頁 baseline（mutating）
 *   node scripts/visual-regression/run.mjs --component Header --update-spec      # 認可：重寫元件 spec（mutating）
 *
 * exit：任一未過 → 1。
 */
import { DEP_MAP, readJSON, parseListArg, getArg, hasFlag } from "./_shared.mjs"
import { capture } from "./capture.mjs"
import { diffPages } from "./diff.mjs"
import { assertComponents } from "./assert-component.mjs"

const component = getArg("--component", null)
const updateBaseline = hasFlag("--update-baseline")
const updateSpec = hasFlag("--update-spec")
const maxDiffPx = parseInt(getArg("--max-diff-px", "10"), 10)
const depMap = readJSON(DEP_MAP, { components: {}, pages: {}, orphans: [] })

let failed = false

async function regressPages(slugs, label) {
  if (!slugs.length) return
  console.log(`\n▶ 頁面層回歸（${label}）：${slugs.join(", ")}`)
  await capture(slugs, "current")
  const results = diffPages(slugs, maxDiffPx)
  for (const r of results) {
    const px = r.diffPx == null ? "—" : `${r.diffPx}px`
    console.log(`  ${r.pass ? "✅" : "❌"} ${r.target} — ${r.status} ${px}${r.diffImage ? " → " + r.diffImage : ""}`)
    if (!r.pass) failed = true
  }
}

if (component) {
  const affected = depMap.components[component] ?? []
  const isOrphan = (depMap.orphans ?? []).includes(component)

  // 元件層
  if (updateSpec) {
    console.log(`▶ 更新 ${component} spec 快照（mutating）`)
    const r = await assertComponents([component], { updateSpec: true })
    console.log(`  ${r[0].pass ? "✅" : "❌"} ${component} — ${r[0].status}`)
    if (!r[0].pass) failed = true
  } else {
    console.log(`▶ 元件層數值斷言（≤1px）：${component}`)
    const r = await assertComponents([component])
    console.log(`  ${r[0].pass ? "✅" : "❌"} ${component} — ${r[0].status}`)
    for (const f of r[0].fails ?? []) console.log(`      ${f.field}: 期待 ${f.expected} / 實際 ${f.actual}（${f.rule}）`)
    if (!r[0].pass) failed = true
  }

  // 頁面層
  if (isOrphan || affected.length === 0) {
    console.log(`\nℹ️  ${component} 無頁面組裝（orphan）——頁面多半 inline 重寫，改此元件檔不影響任何頁面。`)
    console.log(`   ⇒ 僅驗元件層；若頁面有 inline 副本，請在對應頁面 task 手動處理。`)
  } else if (updateBaseline) {
    console.log(`\n▶ 重寫受影響頁 baseline（mutating）：${affected.join(", ")}`)
    await capture(affected, "baseline")
    console.log(`  ✅ baseline 已更新 ${affected.length} 頁`)
  } else {
    await regressPages(affected, `用到 ${component} 的頁`)
  }
} else {
  // 純頁面模式
  let pages = parseListArg("--pages")
  const allSlugs = Object.keys(depMap.pages)
  if (!pages || (pages.length === 1 && pages[0] === "all")) pages = allSlugs
  const valid = pages.filter((s) => allSlugs.includes(s))
  if (updateBaseline) {
    console.log(`▶ 重寫 baseline（mutating）：${valid.join(", ")}`)
    await capture(valid, "baseline")
    console.log(`  ✅ baseline 已更新 ${valid.length} 頁`)
  } else {
    await regressPages(valid, "指定頁")
  }
}

console.log(failed ? "\n❌ 視覺回歸未過" : "\n✅ 視覺回歸通過")
process.exit(failed ? 1 : 0)
