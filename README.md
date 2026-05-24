> 🌐 **繁體中文** | [English](README.en.md)

# figma-to-code

把 Figma 設計稿轉成 React + Tailwind 元件的 **harness 模板**,核心是**像素級視覺對齊 + 自動回歸**。工作流以 AI 驅動(Claude Code)——你描述任務,AI 生成元件、視覺對齊、回歸驗證。

- **技術棧**:Vite + React 19 + Tailwind v4 + TypeScript
- **設計來源**:Figma(MCP + REST API)
- **視覺驗證**:Playwright 兩層回歸(元件層 ≤1px 數值斷言 + 頁面層截圖比對)

> 這是**模板**,附一個範例元件讓整套開箱即跑。fork 後填 `.env`、換設計 token、刪範例、放你自己的元件。
> 工作規範見 [`CLAUDE.md`](./CLAUDE.md);改 harness 本身見 [`CONTRIBUTING.md`](./CONTRIBUTING.md);視覺回歸細節見 [`docs/visual-regression-overview.md`](./docs/visual-regression-overview.md)。

## 能做什麼

從 Figma 生成元件 → 組裝頁面 → 像素級視覺對齊(≤1px)→ **改共用元件後自動回歸驗證受影響頁**。附範例 `ExampleButton` + `ExamplePage`,`npm run dev` / `test:visual` / `/visual-regression` 開箱即跑。

## 工作流程:你做什麼 / AI 自動循環什麼

這個 harness 最大的特點:**視覺對齊是一個 AI 自動跑的迴圈**,不是一次性生成。你描述任務後,AI 自己在「生成 / 改 code → 截圖視覺檢查 → 再改」之間循環,直到 ≤1px 或停損才回報——你不用逐輪盯。

```
你(工程師)                      AI(Claude Code)
──────────                     ────────────────
描述任務 ─────────────────────▶ 從 Figma 取規格、生成 code
「做 X / 對齊到 ≤1px」                  │
                                      ▼
                        ┌──▶ 截圖 ↔ 設計稿 視覺檢查
                        │           │
                        │      差異 > 1px?
                        │      ├─ 是 → 改 code ──┘   ← 自動循環,你不介入
                        │      └─ 否 → 收斂完成
                        │      (N 輪不收斂 → 停損記 known-diffs.md)
                        ▼
驗收結果 ◀───────────────── 回報「✅ 完成 / ⚠️ 停損待人工」
```

- **你**:描述任務 + 最後驗收。不在迴圈裡逐輪盯。
- **AI**:擁有內層「生成 → 視覺檢查 → 改」迴圈,自動跑到 ≤1px 或撞逃生閥(每斷點上限輪數)才回報。
- 改**共用元件**時 AI 再往外擴一圈:查依賴表 → 回歸驗證受影響的頁面(`/visual-regression`)。

## 快速開始

### 前置
- Node.js ≥ 20
- Claude Code + Figma MCP server 設定
- Chrome + **Claude in Chrome** 擴充(視覺比對需要)

### 跑起來
```bash
npm install
npx playwright install chromium     # 視覺回歸用的無頭瀏覽器
npm run dev                         # → http://localhost:3003
```

### 試跑回歸(範例開箱即跑)
```bash
npm run baseline:update             # 對現有畫面建回歸基準
npm run test:visual                 # 全站回歸 → 應全綠
```

## .env 參數

`cp .env.example .env` 後填:

| 變數 | 用途 | 怎麼拿 |
|---|---|---|
| `FIGMA_FILE_KEY` | Figma 檔案 key | Figma URL `figma.com/design/<FILE_KEY>/...` |
| `FIGMA_CANVAS_NODE_ID` | 畫布根節點 ID | Figma URL `?node-id=<ID>` |
| `FIGMA_ACCESS_TOKEN` | Personal Access Token(匯出真實 SVG/PNG) | Figma → Settings → Account → Personal access tokens |

## 怎麼用:常見任務

| 我想做 | 這樣說 |
|---|---|
| 從 Figma 生成元件 | 「幫我做 `<元件>`,Figma node `<id>`」 |
| 視覺對齊到像素 | 「`<元件>` 跟設計稿不一致,修到 ≤1px」 |
| 改完確認沒弄壞別頁 | 「改了 `<元件>`,跑回歸確認沒影響到頁面」 |

## 可用指令 / Skill

| 指令 | 何時用 |
|---|---|
| `/refine-component <元件>` | 單元件視覺收斂(收斂到 ≤1px;收斂完自動回歸受影響頁) |
| `/figma-compare` | 視覺比對 7 步 SOP |
| `/visual-regression <元件>` | 改共用元件後自動驗用到它的頁面 |

| npm 指令 | 用途 |
|---|---|
| `npm run dev` / `build` | preview / 建構驗證 |
| `npm run test:visual` | 全站視覺回歸 |
| `npm run test:component <元件>` | 單元件數值斷言 |
| `npm run build:depmap` | 重建元件→頁面依賴表 |
| `npm run baseline:update` | 認可當前畫面為基準(會覆寫) |

## fork 之後

1. `cp .env.example .env` 填你的 Figma 設定。
2. `config/tokens.ts` + `dev/index.css @theme` 換成你的設計 token。
3. 刪 `components/example`、`pages/example`,移除 `dev/Preview.tsx` / `dev/main.tsx` 對應的 import 與 route。
4. 用 `/refine-component` 從 Figma 生成你的第一個元件。

## License

MIT
