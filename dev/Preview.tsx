/**
 * Preview — 元件預覽入口（localhost:3003 的 /）
 * 每個元件用 <ComponentPreview> 包一層；視覺回歸的元件層斷言靠它定位。
 */
import React from "react"
import ExampleButton from "../components/example/ExampleButton"

// 預覽容器：data-component / data-component-body 給視覺回歸定位元件根（勿刪這兩個屬性）。
// title 用 "元件名 — 變體說明" 格式，— 前段會被當 data-component 值。
function ComponentPreview({ title, children }: { title: string; children: React.ReactNode }) {
  const [name, ...rest] = title.split(" — ")
  const variant = rest.join(" — ")
  return (
    <section data-component={name} data-variant={variant || undefined} style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, fontFamily: "system-ui" }}>{title}</h3>
      <div
        data-component-body=""
        style={{ padding: 32, border: "1px solid #ddd", borderRadius: 12, background: "#fff" }}
      >
        {children}
      </div>
    </section>
  )
}

export default function Preview() {
  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "system-ui", marginBottom: 24 }}>
        元件預覽 · Component Preview
      </h1>

      {/* fork 後在這裡加你的元件 preview block */}
      <ComponentPreview title="ExampleButton — 範例">
        <ExampleButton text="Click me" />
      </ComponentPreview>
    </div>
  )
}
