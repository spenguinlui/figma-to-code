/**
 * _shared.mjs — 視覺回歸共用設定與工具
 *
 * 斷點、路徑、瀏覽器啟動、截圖前置（停動畫）集中於此，
 * capture / diff / assert-component / run 共用。
 */
import { readFileSync, mkdirSync, existsSync } from "node:fs"
import { dirname, resolve, join } from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..")
export const BASE_URL = "http://localhost:3003"

/** 視覺收斂三斷點（與 VISUAL_CHECK_PROGRESS.md / refine-component 一致） */
export const BREAKPOINTS = { desktop: 1440, tablet: 768, mobile: 375 }
export const VIEWPORT_HEIGHT = 900

export const DIRS = {
  baseline: join(ROOT, "tests", "visual", "baseline"),
  current: join(ROOT, "tests", "visual", "current"),
  diff: join(ROOT, "tests", "visual", "diff"),
  specs: join(ROOT, "tests", "visual", "specs"),
}
export const DEP_MAP = join(ROOT, "tests", "visual", "dep-map.json")

export function ensureDir(d) {
  mkdirSync(d, { recursive: true })
}

export function readJSON(path, fallback = null) {
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, "utf8"))
}

/** 截圖前注入：停掉所有 animation/transition + 隱藏游標，否則跑馬燈/輪播令 diff 永遠不穩 */
export const FREEZE_CSS = `
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
    caret-color: transparent !important;
    scroll-behavior: auto !important;
  }
`

/** 確認 dev server 起著；沒起就明確報錯（回歸前置 = npm run dev 在跑） */
export async function assertServerUp() {
  try {
    const res = await fetch(BASE_URL, { method: "HEAD" })
    if (!res.ok && res.status !== 405) throw new Error(`status ${res.status}`)
  } catch (e) {
    console.error(`✗ dev server 沒回應 ${BASE_URL}。請先在另一個終端機跑 \`npm run dev\` 再重試。`)
    process.exit(2)
  }
}

export async function withBrowser(fn) {
  const browser = await chromium.launch()
  try {
    return await fn(browser)
  } finally {
    await browser.close()
  }
}

/** 開新 page、設 viewport、導航、等字體與網路靜止、停動畫。回傳 page。 */
export async function openPage(browser, url, width) {
  const page = await browser.newPage({ viewport: { width, height: VIEWPORT_HEIGHT } })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.addStyleTag({ content: FREEZE_CSS })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(200) // 給 layout / 字體上屏一點餘裕
  return page
}

/** 解析 --pages a,b,c → ["a","b","c"]；沒給回 null（呼叫端決定預設） */
export function parseListArg(flag) {
  const i = process.argv.indexOf(flag)
  if (i === -1 || !process.argv[i + 1]) return null
  return process.argv[i + 1].split(",").map((s) => s.trim()).filter(Boolean)
}

export function hasFlag(flag) {
  return process.argv.includes(flag)
}

export function getArg(flag, dflt) {
  const i = process.argv.indexOf(flag)
  return i === -1 || !process.argv[i + 1] ? dflt : process.argv[i + 1]
}
