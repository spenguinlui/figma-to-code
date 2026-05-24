---
name: figma-compare
description: 用 Figma prototype 預覽模式比對設計稿與 localhost preview，確保 1:1 視覺還原。使用時機：完成元件或頁面組裝後、修正視覺差異時、用戶說「比對」「對齊設計稿」「跑版」「設計稿」「視覺比對」「檢查」時。
---

# Figma 設計比對流程

你正在比對 Figma 設計稿與 localhost preview 的視覺一致性。
必須嚴格按照以下 7 步驟執行，不可跳過任何一步。

## 核心原則

- **永遠不要只用 `get_screenshot` 比對** — 縮圖會隱藏佈局和配色差異
- **永遠用 Figma prototype 預覽模式** — 在瀏覽器中開啟 prototype URL 看真實渲染
- **不只看「有沒有」，要看「對不對」** — 位置、大小、顏色、間距都要驗證
- **用精確數值，不要猜** — 用 `get_design_context` 取得 Figma 的 px 值

## 7 步驟比對流程

### Step 1: 開啟 Figma Prototype 預覽

在瀏覽器中導航到 Figma prototype URL：
```
https://www.figma.com/proto/{fileKey}/?node-id={nodeId}&scaling=min-zoom&content-scaling=fixed&page-id={canvasNodeId}&starting-point-node-id={startNodeId}
```

- fileKey 和 canvasNodeId 從 `.env` 取得
- nodeId 從頁面 README.md 或元件註解取得
- 截圖確認 prototype 已載入

### Step 2: 開啟 localhost Preview

在另一個 tab 導航到 `http://localhost:3003/pages/{page-path}`。
用 `resize_window` 將視窗設為 **1440x900**（跟 Figma 設計稿寬度一致）。

### Step 3: Zoom 同區域 Side-by-Side 比對

對 Figma prototype 和 localhost 的**同一區域**分別用 `zoom` 截圖：

```
// Figma prototype tab
zoom region [x0, y0, x1, y1] on tabId_figma

// localhost preview tab
zoom region [x0, y0, x1, y1] on tabId_preview
```

逐區域比對：Header → Hero → 內容區段 → Footer。
每個區段都要 zoom 進去看，不能只看整頁縮圖。

### Step 4: 用 `get_design_context` 取精確數值

對關鍵元件取得 Figma 的精確 CSS 值：

```
get_design_context(nodeId, fileKey)
```

記下：
- `position` (left, top, right, bottom)
- `size` (width, height)
- `colors` (backgroundColor, color)
- `typography` (fontSize, fontWeight, lineHeight, letterSpacing)
- `spacing` (padding, margin, gap)
- `borderRadius`

### Step 5: JS Computed Style 驗證

在 localhost preview 中用 `javascript_tool` 驗證實際渲染值：

```javascript
const el = document.querySelector('目標選擇器');
const s = window.getComputedStyle(el);
const r = el.getBoundingClientRect();
JSON.stringify({
  width: Math.round(r.width),
  height: Math.round(r.height),
  left: Math.round(r.left),
  top: Math.round(r.top),
  padding: s.padding,
  backgroundColor: s.backgroundColor,
  fontSize: s.fontSize,
  borderRadius: s.borderRadius,
})
```

比對 Figma 數值 vs 實際渲染數值，差異超過 1px 就要修正。

### Step 6: 互動狀態測試

對有互動的元件，觸發所有狀態並截圖：

- **hover**: `computer action=hover coordinate=[x,y]` → 截圖
- **click**: `computer action=left_click` → 截圖展開/收合狀態
- **dropdown**: hover 觸發 → zoom 進去看下拉內容
- **scroll**: 捲動到每個區段都截圖比對

### Step 7: 發現差異 → 修正 → 再比對

1. 列出差異清單（表格形式）
2. 用 `get_design_context` 取正確數值
3. 修改程式碼，使用精確的 Figma px 值
4. `npm run build` 確認無錯誤
5. 重新載入頁面，再次 zoom 同區域截圖
6. 確認修正後跟 Figma 一致

## 常見陷阱

| 陷阱 | 正確做法 |
|---|---|
| `get_screenshot` 看起來差不多就通過 | 必須用 prototype 預覽 + zoom 比對 |
| 深灰 vs 淺灰在縮圖上分不清 | 用 `get_design_context` 取精確色值 |
| 只看頂部就標 ✅ | 完整捲動，每個區段都截圖比對 |
| 「有這個元件」就通過 | 要驗證位置、大小、顏色都正確 |
| 猜測 padding/margin 值 | 用 Figma 的精確 px 值 |
| 忘記檢查互動狀態 | hover/click/展開都要測 |

## 比對結果記錄格式

```markdown
| 區域 | Figma | Preview | 狀態 | 修正 |
|---|---|---|---|---|
| Hero 背景 | #F0F0F0 圓角卡片 | ✅ 一致 | ✅ | — |
| 標題位置 | left:72 top:36 | left:72 top:36 | ✅ | — |
| 插圖位置 | center+220px | 偏右截斷 | ❌ | 修正 transform |
```
