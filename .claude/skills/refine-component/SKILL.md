---
name: refine-component
description: 對單一元件執行「實作→截圖比對→調整→再比對」的視覺收斂流程，直到 Desktop / Tablet / Mobile（有的版型）都對齊 Figma，並在 dev/Preview.tsx 加入三欄 side-by-side preview。觸發時機：用戶說「優化某元件」「對齊 Figma」「跑下一個元件」「跑視覺收斂」「refine」「視覺收斂」，或被 /loop 反覆呼叫處理 task list 上的元件。
---

# 元件視覺收斂流程

對「單一元件」執行完整的實作+視覺對齊+三版預覽，每次呼叫處理一個元件。
搭配 `/loop /refine-component` 可自動推進整個 task list。

## 前置條件

- `.env` 已設定 `FIGMA_FILE_KEY` 與 `FIGMA_ACCESS_TOKEN`
- `npm run dev` 已啟動，Chrome extension 已連線
- Task list 上有 pending 的元件 task（subject 含元件名稱）

## 執行步驟

### Step 1: 選定目標元件

依優先順序：
1. 用戶在 args 指定的元件名稱
2. Task list 第一個 status=pending 且名稱含「元件」「Component」「建立」「優化」的 task
3. 若 task list 沒有可選 → 回報「所有元件都已完成」並結束

把選定 task 標 `in_progress`。

### Step 2: 從 Figma 抓 Design Context（D / T / M 三版）

呼叫 Figma REST API 抓元件的 COMPONENT_SET 結構：

```bash
curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/files/$FILE_KEY/nodes?ids=$NODE_ID&depth=4"
```

判斷三種情況：
- **有 `device=desktop/tablet/mobile` variants** → 三版都做
- **只有 desktop variant** → 只做 desktop（用戶指示：「沒 RWD variant 的元件只要做有的 size 就好」）
- **無 device 維度的 COMPONENT_SET**（例如圖標、互動元件）→ 視為單一版型，只做一次

把每個 variant 的 `absoluteBoundingBox`、`fills`、`characters`、`style`、`cornerRadius`、子節點結構記下來。圖檔素材用 `/v1/images?ids=...&format=svg|png` 匯出到 `components/{category}/assets/`。

### Step 3: 實作或更新元件檔案

- 新建：`components/{category}/{ComponentName}.tsx`，含 PropertyControls
- 已存在：對照 Figma 數值更新（顏色、間距、字體、圓角）

每個檔案頭加註解：
```tsx
/**
 * ComponentName — 中文說明
 * Source: Figma node {NODE_ID}
 *
 * 給設計師：使用情境說明
 */
```

PropertyControls 必要：每個 viewport 的版型差異透過 `viewport: ControlType.Enum` 切換，或拆成 `<Component.Desktop>` `<Component.Tablet>` `<Component.Mobile>` 子元件。

### Step 4: 視覺收斂迴圈（每斷點上限 5 輪，目標 ≤1px）

對每個版型 `viewport ∈ {desktop=1440, tablet=768, mobile=375}`：

每輪：
1. **resize 瀏覽器** 到該 viewport 寬度
2. **localhost 截圖** 該元件的 preview block
3. **Figma prototype 截圖** 該 viewport 對應 variant 的同一區域（用 `figma.com/proto/...?node-id={variantNodeId}&page-id={canvasNodeId}` URL 載入）
4. **量測精確值**：localhost 用 `javascript_tool` 取 `getComputedStyle` + `getBoundingClientRect`，Figma 用 `get_design_context` 已取的數值對照
5. **差異列表**：寫成 markdown 表格 — 區域 / Figma 值 / Preview 值 / 狀態 / 修正內容
6. **修正程式碼**：任何差異（含 1px、字重、色號、間距、圓角）都要改
7. **再截圖再比對**：跑到 guard 判 `done` 為止
8. **每輪呼叫逃生閥 guard**（不靠自律，靠 wiring）— 傳該斷點目前殘差序列（px，舊→新）：
   ```
   node scripts/visual-regression/converge-guard.mjs --component {元件} --viewport {desktop|tablet|mobile} --residuals 8,5,4,4
   ```
   照它的判定走：
   - `done`（殘差 ≤1px）→ 該斷點完成，做下一斷點
   - `continue` → 跑下一輪
   - `stop:no-progress` / `stop:max-rounds`（exit 3）→ guard **已自動寫 `tests/visual/known-diffs.md`**；該斷點停損、做下一斷點，task 留 in_progress、回報用戶。不無限燒 token。

每輪不可省略截圖。逃生閥門檻：上限 5 輪（`--max-rounds` 可調）、連 2 輪殘差沒下降即停。

### Step 5: 加入 Side-by-Side Preview Block

在 `dev/Preview.tsx` 的「第 1 批：新元件」區段下方（或對應分區下方）插入新的三欄並排 preview：

```tsx
<ComponentPreview title="ComponentName — RWD 三版並排">
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ width: 1440, transform: "scale(0.4)", transformOrigin: "top left" }}>
            <ComponentName viewport="desktop" />
        </div>
        <div style={{ width: 768, transform: "scale(0.5)", transformOrigin: "top left" }}>
            <ComponentName viewport="tablet" />
        </div>
        <div style={{ width: 375 }}>
            <ComponentName viewport="mobile" />
        </div>
    </div>
</ComponentPreview>
```

Scale 比例可調，目的是讓三版能在同一螢幕看到。沒有 RWD 變體的元件就只放一格。

### Step 5.5: 回歸驗證受影響頁（標完成前必跑）

元件收斂完，標 complete 前先確認**沒弄壞用到它的頁面**：

```
node scripts/visual-regression/run.mjs --component {ComponentName}
```

- **元件層 fail** → 你剛改的值跟認可的 spec 不一致；若這次是「刻意改設計」，重 `--update-spec` 認可新值；若非刻意，修回去。
- **頁面層 fail** → 看 `tests/visual/diff/` 紅色差異圖定位，修到全綠。
- **orphan 元件**（script 印「無頁面組裝」）→ 只驗元件層即可；但若該元件在某些頁面是 inline 副本，記得那些頁面要另外手動對齊。
- 首次處理某元件、還沒有 spec / baseline → 對齊認可後跑 `--update-spec` / `--update-baseline` 建基準。

### Step 6: 收尾

- TaskUpdate 該元件 task → status=completed（**Step 5.5 全綠或殘差已記 known-diffs 才可標**）
- 在最後回應給用戶寫一行：「✅ {ComponentName} 完成（D/T/M）+ 回歸 {N} 頁通過 — 剩餘 {M} 個元件」
- **如果還在 /loop 中**：不需要再做別的，runtime 會排下一次觸發處理下一個元件

## 收斂硬規則

1. **像素完美 + 逃生閥（wiring 強制）** — 目標差異 ≤1px、色號 / 字體完全一致；每輪呼叫 `converge-guard.mjs`（Step 4 第 8 點），它判 `stop:*` 時已自動寫 `tests/visual/known-diffs.md`，該斷點停損（task 留 in_progress、回報用戶），不無限燒 token。逃生閥是 script 強制，不是自律。
2. **不擅自跳過 viewport** — Figma 有的 variant 都要做。
3. **每輪都要實際截圖比對** — 不可只看 console 數值或結構推論就宣稱完成。即使是「width-flexible 元件」也要在 1440/768/375 三個 viewport 各自截圖。
4. **不可批次標完成** — 一次只處理一個元件，做完一個才動下一個。
5. **遇阻直接停** — Chrome 沒連、dev server 掛、Figma API 失敗 → 標 task 為 in_progress（不要 complete），回報用戶處理後再繼續。
6. **不影響其他元件** — 修正只能改該元件檔案 + Preview.tsx 的對應 block，不要重構別的程式碼。
7. **每輪呼叫 ScheduleWakeup** — 處理完一個元件就排下一輪，給上下文喘息空間。

## 觸發範例

- `/refine-component Header2` — 指定處理 Header2
- `/refine-component` — 自動挑 task list 上下一個 pending
- `/loop /refine-component` — 自我節奏輪詢處理整個清單
