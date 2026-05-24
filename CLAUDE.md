# Figma → React Component Harness

把 Figma 設計稿轉成 React 19 + Tailwind v4 元件的本地開發 + 像素級視覺對齊 harness。
目錄結構見 `README.md`；完整樣式規則見 `docs/styling.md`。

## 核心原則
- **Designer-Friendly**：元件透過 props 控制所有視覺面向，頁面組裝層直接傳值。
- **設計 token 單一真相** = `config/tokens.ts`（與 `dev/index.css @theme` 同步）——改色 / 改字從這裡。
- **框架無關**：元件以 React + Tailwind 撰寫，可搬 Next.js 等（僅需替換 `next/image` 等少數 API）。

## 樣式（摘要，完整見 `docs/styling.md`）
- 靜態樣式用 Tailwind utility class；設計 px 值用任意值語法 `w-[266px]`。
- 動態值（props 傳入的顏色 / 尺寸）用 `style={{...}}` inline，**不要**動態字串拼 className（JIT 偵測不到）。
- 元件根元素必接受 `className` + `style={{...style}}` 外部覆寫。
- 響應式用 `md:` / `lg:` / `xl:`，桌機基準 1440px → `xl:`。

## Code Style
- TypeScript + React，functional components only，每檔 < 300 行。
- 檔頭註解：`Purpose`（一行）+ `For Designer`（中文，怎麼用）。
- 元件 props interface 用 `?` 標可選並給 default。
- console.log 用 `[ComponentName]` 前綴。

## 外部連線（`.env`，不進 git）
`FIGMA_FILE_KEY` / `FIGMA_CANVAS_NODE_ID` / `FIGMA_ACCESS_TOKEN`。
圖檔素材必用 Figma REST API 匯出真實 SVG / PNG，**不可**截圖拼湊。

## 工作流程
- `npm run dev` → preview http://localhost:3003 ；`npm run build` 建構驗證。
- **單元件視覺收斂**（實作 → 截圖比對 → 調整，收斂到 ≤1px）：用 `/refine-component`。
- **視覺比對 7 步 SOP**（禁止只用縮圖；差異 > 1px 就修）：見 `/figma-compare` skill。
- **回歸驗證**（改共用元件後自動驗受影響頁）：用 `/visual-regression`。
- 元件 / 頁面完成後在 `dev/Preview.tsx` / `dev/main.tsx` 加 preview，更新 `VISUAL_CHECK_PROGRESS.md`。
