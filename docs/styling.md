# 樣式規則（Tailwind v4）

CLAUDE.md 樣式段的完整版。設計 token 的**單一真相**在 `config/tokens.ts`（與 `dev/index.css` 的 `@theme` 同步）——改色 / 改字從那裡，不要在這份文件複製值。

## 語意 token（定義於 dev/index.css 的 @theme）

模板附的範例 token（fork 後換成你的）：

| Token | 範例值 | 用途 |
|---|---|---|
| `font-sans` | Montserrat + Noto fallback | 全站字體 |
| `text-ink` / `bg-ink` | #414040 | 主要文字色 |
| `text-gray` | #9E9E9F | 次級文字 |
| `text-brand-yellow` / `bg-brand-yellow` | #FFD900 | 主色（範例） |
| `text-brand-green` / `bg-brand-green` | #B6D56A | 輔色（範例） |

> 新增 / 修改 token 以 `config/tokens.ts` + `dev/index.css @theme` 為準。

## 樣式撰寫規則

- **靜態樣式** 一律用 Tailwind utility class
- **設計規格 px 值** 用任意值語法：`w-[266px]`、`leading-7`、`tracking-[0.5px]`、`rounded-[10px]`
- **動態值**（透過 props 傳入的顏色、尺寸）→ 用 `style={{...}}` inline 覆寫，**不要**用 `className={`text-[${color}]`}`（Tailwind JIT 偵測不到動態字串）
- **Hover / 狀態**：簡單的優先用 `hover:` 前綴；需要 JS state 控制的用 React state + 條件 className
- **Spread style prop**：根元素一定要 `style={{...style}}` 接受外部覆寫
- **className prop**：根元素接受 `className` prop 讓使用端能加 utility

## 命名

- 元件 prop 命名用語意化英文（`accentColor` 不是 `bgColor`）
- 元件檔名 PascalCase（如 `ExampleButton.tsx`）

## 響應式（Responsiveness）

- 用 Tailwind 響應式前綴：`md:`、`lg:`，斷點預設 `sm 640 / md 768 / lg 1024 / xl 1280`
- 設計稿基準寬度 1440px → 用 `xl:` 對應桌機
- 視覺收斂三斷點：D=1440px / T=768px / M=375px
