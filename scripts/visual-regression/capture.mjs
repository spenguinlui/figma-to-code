#!/usr/bin/env node
/**
 * capture.mjs — 對頁面 × 斷點截全頁圖
 *
 * 用法：
 *   node scripts/visual-regression/capture.mjs --pages example        # 截到 current/
 *   node scripts/visual-regression/capture.mjs --pages all                        # 全部頁面
 *   node scripts/visual-regression/capture.mjs --pages all --out baseline         # 寫 baseline（mutating！）
 *
 * 副作用：read-only 渲染 + 寫 PNG。--out baseline 為 mutating（覆寫認可基準），預設 current。
 * 前置：dev server 在 localhost:3003 跑著。
 */
import { join } from "node:path"
import {
  BASE_URL, BREAKPOINTS, DIRS, DEP_MAP, readJSON, ensureDir,
  assertServerUp, withBrowser, openPage, parseListArg, getArg,
} from "./_shared.mjs"

const out = getArg("--out", "current") // "current" | "baseline"
if (!["current", "baseline"].includes(out)) {
  console.error(`✗ --out 只能是 current 或 baseline，收到：${out}`)
  process.exit(2)
}
const outDir = DIRS[out]

let pages = parseListArg("--pages")
const depMap = readJSON(DEP_MAP, { pages: {} })
const allSlugs = Object.keys(depMap.pages)
if (!pages || (pages.length === 1 && pages[0] === "all")) pages = allSlugs
const unknown = pages.filter((s) => !allSlugs.includes(s))
if (unknown.length) console.warn(`⚠ 未知頁面 slug（dep-map 沒有）：${unknown.join(", ")}`)

export async function capture(slugs, target = "current") {
  await assertServerUp()
  ensureDir(DIRS[target])
  const written = []
  await withBrowser(async (browser) => {
    for (const slug of slugs) {
      for (const [bp, width] of Object.entries(BREAKPOINTS)) {
        const page = await openPage(browser, `${BASE_URL}/pages/${slug}`, width)
        const file = join(DIRS[target], `${slug}-${bp}.png`)
        await page.screenshot({ path: file, fullPage: true })
        await page.close()
        written.push(`${slug}-${bp}.png`)
      }
    }
  })
  return written
}

// 直接執行時
if (import.meta.url === `file://${process.argv[1]}`) {
  const valid = pages.filter((s) => allSlugs.includes(s))
  const written = await capture(valid, out)
  console.log(`[capture] 寫入 ${written.length} 張到 ${out}/：${valid.length} 頁 × ${Object.keys(BREAKPOINTS).length} 斷點`)
}
