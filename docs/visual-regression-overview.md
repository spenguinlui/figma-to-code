# 視覺回歸系統 — 一頁式總覽

> 本 harness 的視覺回歸系統概覽：它是什麼、怎麼用、邊界在哪。

## 解決什麼

「視覺比對」若靠人肉眼開瀏覽器截圖比，有三個問題：改一個共用元件無法自動回頭驗其他頁、比對標準不一致、收斂迴圈無上限會燒 token。本系統升級成**可自動化、可回歸**的兩層驗證。

## 兩層各管什麼

- **元件層（嚴格 ≤1px）**：量元件渲染值（寬高 / 色 / 字 / 圓角 / gap / padding）對 `tests/visual/specs/<元件>.json` 斷言。精準、可指出哪欄變了。
- **頁面層（catch-all）**：截全頁圖對 `tests/visual/baseline/`，**差異像素 > 10 即 fail**（絕對像素，非整頁百分比——百分比會稀釋 localized 小元件位移；停動畫後雜訊地板為 0px，絕對門檻才抓得到）。

## 怎麼用

| 你做 | 系統行為 |
|---|---|
| 改某共用元件想確認沒弄壞頁面 | `/visual-regression <元件>` → 元件層斷言 + 只驗用到它的頁 |
| 全站回歸 | `npm run test:visual` |
| 單元件數值檢查 | `npm run test:component <元件>` |
| 認可新狀態為基準 | `... --update-baseline` / `... --update-spec` |

## 邊界

- **元件層量測對象自動解析**：靠 className 訊號穿透預覽的版面包裝、並優先選沒被 `transform:scale` 縮放的區塊。結構特異的元件可在預覽加 `data-component-root` 覆寫。
- **不驗**：跨瀏覽器差異、互動 / 動畫狀態、CI / 遠端——皆只本機 Chromium。
- **baseline 機器相依**：在哪台機器 / 哪版 Chromium 截的就對哪個比；換機器要重建基準。

## 檔案地圖

```
scripts/build-dep-map.mjs                  元件→頁面依賴表
scripts/visual-regression/
  _shared.mjs        共用（斷點 / 停動畫 / 開瀏覽器）
  capture.mjs        截圖
  diff.mjs           頁面層 pixelmatch（絕對像素門檻）
  assert-component.mjs  元件層數值斷言
  converge-guard.mjs    收斂逃生閥（每斷點上限輪數 / 無進展停損）
  run.mjs            orchestrator（查依賴表只驗受影響頁）
tests/visual/{baseline,specs}/             基準（git tracked）
.claude/skills/visual-regression/SKILL.md  前門 /visual-regression
```
