---
name: visual-regression
description: 改了共用元件後，自動回頭驗證「用到它的頁面」有沒有跑版。兩層驗證——元件層數值斷言（≤1px）+ 頁面層截圖比對。觸發時機：用戶說「跑回歸」「驗有沒有弄壞別頁」「改完 X 元件檢查影響」「visual regression」「回歸驗證」，或 refine-component 收斂完一個元件後自動呼叫。
---

# 視覺回歸驗證

改一個共用元件後，回頭確認所有「用到它的頁面」沒被弄壞。兩層：

- **元件層（嚴格 ≤1px）**：量元件實際渲染值（含 width/height/字級/色/字體/圓角/**gap/padding**），對 `tests/visual/specs/<元件>.json` 斷言。數值差 >1px / 色號 / 字體 / 間距不符就 fail。
  - 量測對象自動解析：`[data-component-root]`（若有標，最高優先）→ 否則穿透「預覽版面包裝」找元件根。可靠訊號 = className 有無（預覽並排用無 className 的 inline-style div；元件根都有 Tailwind className 或語意標籤）；並**優先選沒被 `transform:scale` 縮放的區塊**（避開 RWD 三版並排的縮放錯值）。實測 38 元件皆量到真元件根。極少數結構特異的（如 HotWeatherProblem 量到子元素）仍可在該 preview 加 `data-component-root` 覆寫。
- **頁面層（catch-all）**：截「受影響頁 × 3 斷點」全頁圖，用 pixelmatch 對 `tests/visual/baseline/` 比，**差異像素數 > 10 就 fail**（絕對像素，非整頁百分比）。
  - 為何絕對像素：停動畫後同頁重截 = 0 px（確定性）。若用整頁百分比，localized 小元件位移會被稀釋——例 Pagination 間距放大 3.2× 只動 130px = 0.004%，會溜過百分比門檻。絕對像素門檻才抓得到。門檻用 `--max-diff-px N` 調。

## 前置條件

- `npm run dev` 已在 `localhost:3003` 跑著（script 會先檢查，沒起會明確報錯）。
- 依賴表是最新的：改過 import 關係就先 `npm run build:depmap` 重建 `tests/visual/dep-map.json`。
- 該元件 / 頁面已有 baseline / spec（首次要先認可，見下方「認可」）。

## 怎麼跑

| 意圖 | 命令 |
|---|---|
| 驗某元件 + 受影響頁 | `node scripts/visual-regression/run.mjs --component <元件名>` |
| 全頁面回歸 | `npm run test:visual` |
| 只驗某元件數值 | `npm run test:component <元件名>` |
| 指定頁面回歸 | `node scripts/visual-regression/run.mjs --pages <page-a>,<page-b>` |

### 結果怎麼讀

- ✅ 全綠 → 沒跑版，結束。
- ❌ 元件層 fail → 報告印「哪個欄位 期待 X / 實際 Y」，按數值修元件 → 重跑。
- ❌ 頁面層 fail → 看 `tests/visual/diff/<頁>-<斷點>.png`（紅色像素 = 差異處），定位 → 修 → 重跑。

## Orphan 元件（重要 — 不可誤判）

`tests/visual/dep-map.json` 的 `orphans` 列出「沒有任何頁面 import」的元件。

- 對 orphan 元件跑 `run.mjs --component`：**只驗元件層**，並明印「此元件無頁面組裝，改它不影響任何頁面」。
- **不可把「0 頁受影響、全綠」當成頁面安全** — 頁面用的是 inline 副本，改元件檔沒進頁面。若頁面有對應 inline 區塊要改，得在該頁面 task 手動處理。

## 認可（建 / 更新 baseline 與 spec，mutating）

只有在「該元件 / 頁面已對齊設計、owner 認可」時才跑（會覆寫對照基準）：

- 更新元件 spec：`node scripts/visual-regression/run.mjs --component <元件> --update-spec`
- 更新受影響頁 baseline：`node scripts/visual-regression/run.mjs --component <元件> --update-baseline`
- 全頁面 baseline：`npm run baseline:update`

> spec 凍結「已對齊認可」的渲染值 + 可追溯 `figmaNodeId`。Figma 改版後要重 `--update-spec` / `--update-baseline`，否則回歸對的是過期基準。

## 遇阻直接停

dev server 沒起 / Chromium 跑不動 / baseline 缺 → 回報用戶，不要把缺基準當通過。
