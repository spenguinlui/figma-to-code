#!/usr/bin/env node
/**
 * assert-component.mjs — 元件層數值斷言（嚴格 ≤1px）
 *
 * 在元件預覽頁（localhost:3003/）量元件實際渲染值，對 specs/<元件>.json 斷言。
 *   數值欄（寬/高/字級）差 >1px → fail；字串欄（色/字重/字體/圓角）需完全一致。
 *
 * 用法：
 *   node scripts/visual-regression/assert-component.mjs --components PillButton,TabButton
 *   node scripts/visual-regression/assert-component.mjs --components PillButton --update-spec  # 快照當前為 spec（mutating）
 *
 * spec 語意：凍結「已對齊認可」的渲染值 + 可追溯的 figmaNodeId。回歸 = 偵測偏離認可狀態。
 *   （對 Figma 的 ≤1px 在 refine-component 開發時達成並凍結；回歸守住不漂移。）
 * 副作用：read-only 量測；--update-spec 為 mutating（覆寫 spec）。前置：dev server 跑著。
 */
import { join } from "node:path"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import {
  BASE_URL, DIRS, ROOT, ensureDir, readJSON, assertServerUp, withBrowser, openPage,
  BREAKPOINTS, parseListArg, hasFlag,
} from "./_shared.mjs"

/** 從 figma-nodes.json 查元件 desktop nodeId（給 spec 的 figmaNodeId 追溯用） */
function figmaNodeIdFor(name) {
  const nodes = readJSON(join(ROOT, "figma-nodes.json"), { components: {} })
  for (const [path, ids] of Object.entries(nodes.components ?? {})) {
    if (path.split("/").pop() === `${name}.tsx`) return ids.desktop ?? null
  }
  return null
}

const NUMERIC_KEYS = new Set(["width", "height", "fontSize"]) // 走 ≤1px
const STRING_KEYS = ["color", "backgroundColor", "fontWeight", "fontFamily", "borderRadius", "gap", "padding"] // 走完全一致（含間距，補 localized 漏抓）

async function measure(browser, name) {
  const page = await openPage(browser, `${BASE_URL}/`, BREAKPOINTS.desktop)
  const metrics = await page.evaluate((compName) => {
    const blocks = [...document.querySelectorAll(`[data-component="${CSS.escape(compName)}"]`)]
    if (blocks.length === 0) return { __missing: true }

    // 某區塊內解析元件根：優先 [data-component-root]；否則第一個子元素 + 穿透「預覽版面包裝」。
    // 可靠訊號 = className 有無：preview 並排用「無 className 的 inline-style <div>」；
    // 元件根都有 className（Tailwind）或語意標籤。div+空className+有子 = 包裝，鑽進去。
    const resolveRoot = (block) => {
      const body = block.querySelector("[data-component-body]") || block
      let el = body.querySelector("[data-component-root]")
      if (!el) {
        el = body.firstElementChild
        let depth = 0
        while (el && el.tagName === "DIV" && !(el.getAttribute("class") || "").trim() && el.firstElementChild && depth < 3) {
          el = el.firstElementChild
          depth++
        }
      }
      return el
    }
    // 元素到 block 間有 transform scale = RWD 三版並排的縮放包裝，量到會是縮放後錯值。
    const isScaled = (el, block) => {
      for (let n = el; n && n !== block; n = n.parentElement) {
        const t = getComputedStyle(n).transform
        if (t && t !== "none") return true
      }
      return false
    }

    // 同名可能有多個預覽區塊（如「預設」+「RWD 三版並排」）：優先沒被縮放的；都縮放才退回第一個。
    let el = null
    for (const block of blocks) {
      const cand = resolveRoot(block)
      if (cand && !isScaled(cand, block)) { el = cand; break }
    }
    if (!el) el = resolveRoot(blocks[0])
    if (!el) return { __empty: true }

    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return {
      width: Math.round(r.width),
      height: Math.round(r.height),
      fontSize: parseFloat(s.fontSize),
      color: s.color,
      backgroundColor: s.backgroundColor,
      fontWeight: s.fontWeight,
      fontFamily: s.fontFamily,
      borderRadius: s.borderRadius,
      gap: s.gap,
      padding: s.padding,
    }
  }, name)
  await page.close()
  return metrics
}

function compare(spec, actual) {
  const fails = []
  for (const [k, expected] of Object.entries(spec)) {
    const got = actual[k]
    if (NUMERIC_KEYS.has(k)) {
      if (Math.abs(parseFloat(expected) - parseFloat(got)) > 1) {
        fails.push({ field: k, expected, actual: got, rule: "≤1px" })
      }
    } else if (STRING_KEYS.includes(k)) {
      if (String(expected) !== String(got)) {
        fails.push({ field: k, expected, actual: got, rule: "exact" })
      }
    }
  }
  return fails
}

export async function assertComponents(names, { updateSpec = false } = {}) {
  await assertServerUp()
  ensureDir(DIRS.specs)
  const results = []
  await withBrowser(async (browser) => {
    for (const name of names) {
      const actual = await measure(browser, name)
      const specPath = join(DIRS.specs, `${name}.json`)
      if (actual.__missing) { results.push({ name, status: "not-in-preview", pass: false }); continue }
      if (actual.__empty) { results.push({ name, status: "empty-preview", pass: false }); continue }

      if (updateSpec) {
        const prev = readJSON(specPath, {})
        const next = { figmaNodeId: prev.figmaNodeId ?? figmaNodeIdFor(name), metrics: actual }
        writeFileSync(specPath, JSON.stringify(next, null, 2) + "\n")
        results.push({ name, status: "spec-updated", pass: true })
        continue
      }

      if (!existsSync(specPath)) { results.push({ name, status: "no-spec", pass: false }); continue }
      const spec = readJSON(specPath, {})
      const fails = compare(spec.metrics ?? {}, actual)
      results.push({ name, status: fails.length ? "diff" : "ok", pass: fails.length === 0, fails })
    }
  })
  return results
}

// 直接執行時
if (import.meta.url === `file://${process.argv[1]}`) {
  const names = parseListArg("--components") || []
  if (!names.length) { console.error("✗ 需 --components <名稱[,名稱...]>"); process.exit(2) }
  const updateSpec = hasFlag("--update-spec")
  const results = await assertComponents(names, { updateSpec })
  for (const r of results) {
    const mark = r.pass ? "✅" : "❌"
    console.log(`${mark} ${r.name} — ${r.status}`)
    for (const f of r.fails ?? []) {
      console.log(`    ${f.field}: 期待 ${f.expected} / 實際 ${f.actual}（${f.rule}）`)
    }
  }
  process.exit(results.every((r) => r.pass) ? 0 : 1)
}
