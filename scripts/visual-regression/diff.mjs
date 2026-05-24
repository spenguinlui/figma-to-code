#!/usr/bin/env node
/**
 * diff.mjs — 比對 current/ vs baseline/，算差異像素佔比
 *
 * 用法：node scripts/visual-regression/diff.mjs --pages example --max-diff-px 10
 *
 * 通過線：差異像素數 ≤ max-diff-px（預設 10）。
 *   為何用絕對像素數而非整頁百分比：停動畫後同頁重截 = 0 px（確定性，實測雜訊地板 0），
 *   但整頁百分比會稀釋 localized 小元件位移——例：Pagination 間距放大 3.2× 只動 130px = 0.004%，
 *   會溜過 0.1% 門檻（這是設計初版的真實漏洞，2026-05-23 自驗抓到後改絕對像素）。
 *   維度不同（頁高變了）一律 fail。
 *
 * 輸出：console 表格 + tests/visual/diff/report-<ts>.md + 失敗的 diff PNG。
 * exit：任一頁 fail / 缺 baseline → 1；全 pass → 0。
 */
import { join } from "node:path"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"
import {
  BREAKPOINTS, DIRS, DEP_MAP, ROOT, readJSON, ensureDir, parseListArg, getArg,
} from "./_shared.mjs"

const maxDiffPx = parseInt(getArg("--max-diff-px", "10"), 10)

export function diffPages(slugs, maxPx = maxDiffPx) {
  ensureDir(DIRS.diff)
  const results = []
  for (const slug of slugs) {
    for (const bp of Object.keys(BREAKPOINTS)) {
      const name = `${slug}-${bp}.png`
      const basePath = join(DIRS.baseline, name)
      const curPath = join(DIRS.current, name)
      if (!existsSync(basePath)) {
        results.push({ target: name, status: "no-baseline", diffPct: null, pass: false })
        continue
      }
      if (!existsSync(curPath)) {
        results.push({ target: name, status: "no-current", diffPct: null, pass: false })
        continue
      }
      const base = PNG.sync.read(readFileSync(basePath))
      const cur = PNG.sync.read(readFileSync(curPath))
      if (base.width !== cur.width || base.height !== cur.height) {
        results.push({
          target: name, status: "dimension-changed", pass: false,
          detail: `${base.width}x${base.height} → ${cur.width}x${cur.height}`,
        })
        continue
      }
      const { width, height } = base
      const diff = new PNG({ width, height })
      const diffPx = pixelmatch(base.data, cur.data, diff.data, width, height, { threshold: 0.1 })
      const diffPct = diffPx / (width * height)
      const pass = diffPx <= maxPx
      if (!pass) {
        const dp = join(DIRS.diff, name)
        writeFileSync(dp, PNG.sync.write(diff))
        results.push({ target: name, status: "diff", diffPx, diffPct, pass, diffImage: `tests/visual/diff/${name}` })
      } else {
        results.push({ target: name, status: "ok", diffPx, diffPct, pass })
      }
    }
  }
  return results
}

function renderTable(results) {
  const rows = results.map((r) => {
    const px = r.diffPx == null ? "—" : String(r.diffPx)
    const pct = r.diffPct == null ? "—" : (r.diffPct * 100).toFixed(3) + "%"
    const mark = r.pass ? "✅" : "❌"
    const note = r.detail || r.diffImage || r.status
    return `| ${r.target} | ${r.status} | ${px} | ${pct} | ${mark} | ${note} |`
  })
  return [
    `| 目標 | 狀態 | 差異像素 | 佔比 | 通過 | 備註 |`,
    `|---|---|---|---|---|---|`,
    ...rows,
  ].join("\n")
}

// 直接執行時
if (import.meta.url === `file://${process.argv[1]}`) {
  let pages = parseListArg("--pages")
  const depMap = readJSON(DEP_MAP, { pages: {} })
  const allSlugs = Object.keys(depMap.pages)
  if (!pages || (pages.length === 1 && pages[0] === "all")) pages = allSlugs

  const results = diffPages(pages.filter((s) => allSlugs.includes(s)))
  const table = renderTable(results)
  console.log(table)

  const failed = results.filter((r) => !r.pass)
  const ts = new Date().toISOString().replace(/[:.]/g, "-")
  ensureDir(DIRS.diff)
  const reportPath = join(DIRS.diff, `report-${ts}.md`)
  writeFileSync(reportPath,
    `# 視覺回歸報告 ${ts}\n\nmax-diff-px = ${maxDiffPx}（差異像素數 ≤ 此值才通過；雜訊地板實測 0）\n\n${table}\n`)
  console.log(`\n報告：${reportPath.replace(ROOT + "/", "")}`)
  console.log(failed.length ? `\n❌ ${failed.length} 個未過` : `\n✅ 全部通過`)
  process.exit(failed.length ? 1 : 0)
}
