> 🌐 **繁體中文** | [English](CONTRIBUTING.en.md)

# 維護 / 擴充 figma-to-code

給**改這個 harness 本身**的人。使用者(fork 來建網站的人)看 [`README.md`](README.md);這裡講**架構與怎麼動它**。

## 架構概覽

```
Figma 設計稿
   │ get_design_context (MCP) + REST API 匯素材
   ▼
components/<分類>/*.tsx   元件(props 控制所有視覺面向)
   │ 組裝
   ▼
pages/<頁>/*.tsx          頁面
   │ 註冊 route
   ▼
dev/{Preview,main}.tsx    本地 preview(Vite, port 3003)
```

- 設計 token 單一真相 = `config/tokens.ts`(與 `dev/index.css @theme` 同步)。
- 視覺正確性由**兩層回歸**守(見 `docs/visual-regression-overview.md`)。

## wiring 怎麼運作

| 元件 | 做什麼 |
|---|---|
| `.claude/skills/refine-component/` | 單元件視覺收斂迴圈;每輪呼叫逃生閥 `converge-guard.mjs`;收斂完跑回歸 |
| `.claude/skills/figma-compare/` | 視覺比對 7 步 SOP |
| `.claude/skills/visual-regression/` | 兩層回歸前門:元件層數值斷言 + 頁面層截圖比對 |
| `scripts/build-dep-map.mjs` | 靜態解析 import → 元件→頁面依賴表 |
| `scripts/visual-regression/` | `capture`(截圖)/ `diff`(pixelmatch 絕對像素門檻)/ `assert-component`(數值斷言)/ `run`(orchestrator)/ `converge-guard`(逃生閥) |
| `.claude/settings.json` | 啟用 figma plugin |

## 怎麼擴充

- **加元件**:建 `components/<分類>/<Name>.tsx`(檔頭 Purpose + For Designer;props 用 `?` + default)→ 在 `dev/Preview.tsx` 加 `<ComponentPreview>` block(自動帶 `data-component` 給回歸用)。
- **加頁面**:建 `pages/<slug>/` + 在 `dev/main.tsx` 加 route → `npm run build:depmap` 更新依賴表。
- **元件層量錯**(被預覽包裝遮住):在該 preview 區塊目標元件加 `data-component-root`。
- **認可新基準**:對齊後 `npm run baseline:update` / `... --update-spec`。

## 設計依據

- 頁面層回歸用**絕對像素門檻**(非整頁百分比)——百分比會稀釋 localized 小元件位移(停動畫後雜訊地板為 0px)。
- 收斂迴圈有**逃生閥**(每斷點上限輪數 / 無進展即停損寫 `tests/visual/known-diffs.md`)。
- anti-scope:不驗跨瀏覽器 / 互動動畫 / CI。

## 怎麼驗證改動

- 改 script / skill:跑 `npm run test:visual` + 抽測 `npm run test:component <元件>`,確認無改動時全綠(雜訊 0px)。
- 故意改壞一個元件 → 回歸該紅 → 還原該綠。
- 動 wiring 前先想:這是把好習慣自動化、還是把當下的壞流程固化?可機驗的改動先自己跑過再交付。
