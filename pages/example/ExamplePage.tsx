/**
 * ExamplePage — 範例頁面
 * Purpose: 組裝 ExampleButton，示範「改元件 → 頁面層回歸驗證」的依賴關係。
 * 改 ExampleButton 後跑 /visual-regression，會因為這頁 import 了它而驗到這頁。
 */
import React from "react"
import ExampleButton from "../../components/example/ExampleButton"

export default function ExamplePage() {
  return (
    <div className="font-sans" style={{ padding: 64, maxWidth: 1440, margin: "0 auto" }}>
      <h1 className="text-ink" style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
        Example Page
      </h1>
      <p className="text-gray" style={{ marginBottom: 24, fontSize: 14 }}>
        這頁組裝了 ExampleButton。改 ExampleButton → 視覺回歸會驗到這頁。
      </p>
      <div style={{ display: "flex", gap: 16 }}>
        <ExampleButton text="Primary" />
        <ExampleButton text="Accent" accentColor="#B6D56A" />
      </div>
    </div>
  )
}
