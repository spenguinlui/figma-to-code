#!/usr/bin/env node
/**
 * converge-guard.mjs — refine-component 收斂迴圈的逃生閥（預算護欄）
 *
 * 把「每斷點上限 N 輪 / 連 2 輪無進展即停損」從 skill prose 變成可執行 wiring，
 * 不靠 agent 自律（靠 prompt 的規則等於沒有規則）。
 *
 * 每輪量完殘差後呼叫，傳該斷點目前的殘差序列（px，舊→新）：
 *   node converge-guard.mjs --component Header --viewport mobile --residuals 8,5,4,4,4
 *
 * 輸出 verdict（stdout 第一行）+ exit code：
 *   done      (exit 0)  最新殘差 ≤1px，收斂成功
 *   continue  (exit 0)  還在預算內且有進展，繼續下一輪
 *   stop:max-rounds      (exit 3) 達 --max-rounds（預設 5）仍未 ≤1px
 *   stop:no-progress     (exit 3) 連 2 輪殘差沒下降
 * stop 時自動 append 一行到 tests/visual/known-diffs.md（停損紀錄）。
 *
 * 副作用：read-only 判定；stop 時 mutating（append known-diffs.md）。
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..")
const KNOWN_DIFFS = join(ROOT, "tests", "visual", "known-diffs.md")

function getArg(flag, dflt) {
  const i = process.argv.indexOf(flag)
  return i === -1 || !process.argv[i + 1] ? dflt : process.argv[i + 1]
}

const component = getArg("--component", null)
const viewport = getArg("--viewport", "desktop")
const maxRounds = parseInt(getArg("--max-rounds", "5"), 10)
const reason = getArg("--reason", "字體反鋸齒 / 字體 metric") // 停損疑因，可由 agent 覆寫
const residuals = (getArg("--residuals", "") || "")
  .split(",").map((s) => parseFloat(s.trim())).filter((n) => !Number.isNaN(n))

if (!component || residuals.length === 0) {
  console.error("✗ 需 --component <名> 與 --residuals <px,px,...>（舊→新）")
  process.exit(2)
}

const latest = residuals[residuals.length - 1]
const rounds = residuals.length

function appendKnownDiff(residualPx, why) {
  const date = new Date().toISOString().slice(0, 10)
  const row = `| ${component} | ${viewport} | ${residualPx}px | ${reason}（${why}） | ${date} | 待人工 |\n`
  const prev = existsSync(KNOWN_DIFFS) ? readFileSync(KNOWN_DIFFS, "utf8") : "# Known Visual Diffs\n\n"
  writeFileSync(KNOWN_DIFFS, prev.replace(/\n*$/, "\n") + row)
}

// 1) 收斂成功
if (latest <= 1) {
  console.log("done")
  process.exit(0)
}

// 2) 無進展：連 2 輪殘差沒下降（最近 3 個值，後兩步都沒改善）
const noProgress = rounds >= 3 && residuals[rounds - 1] >= residuals[rounds - 3]
if (noProgress) {
  appendKnownDiff(latest, "no-progress")
  console.log("stop:no-progress")
  process.exit(3)
}

// 3) 達輪數上限
if (rounds >= maxRounds) {
  appendKnownDiff(latest, "max-rounds")
  console.log("stop:max-rounds")
  process.exit(3)
}

// 4) 還有預算且有進展
console.log("continue")
process.exit(0)
