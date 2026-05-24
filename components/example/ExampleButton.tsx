/**
 * ExampleButton — 範例膠囊按鈕
 * Purpose: 模板附的唯一範例元件，讓視覺回歸 / 收斂流程開箱即跑。
 * For Designer: text 改文字、accentColor 改主色；根元素吃 className / style 可外部覆寫。
 *
 * fork 後你可以刪掉這個，換成從 Figma 生成的真元件（用 /refine-component）。
 */
import React from "react"

interface ExampleButtonProps {
  text?: string
  accentColor?: string
  className?: string
  style?: React.CSSProperties
}

export default function ExampleButton({
  text = "Click me",
  accentColor = "#FFD900",
  className = "",
  style,
}: ExampleButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-[20px] py-[10px] rounded-[8px] font-sans font-semibold text-[14px] text-ink cursor-pointer ${className}`}
      style={{ backgroundColor: accentColor, border: "none", ...style }}
    >
      {text}
    </button>
  )
}
