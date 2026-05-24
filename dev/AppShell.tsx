/**
 * AppShell — preview 站的頂部導覽 + 內容容器。
 * fork 後在 NAV 加你的頁面。
 */
import React from "react"
import { Link, useLocation } from "react-router-dom"

const NAV = [
  { path: "/", label: "元件預覽" },
  { path: "/pages/example", label: "Example Page" },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation()
  return (
    <div style={{ fontFamily: "system-ui" }}>
      <nav style={{ display: "flex", gap: 16, padding: "12px 24px", borderBottom: "1px solid #eee" }}>
        {NAV.map((n) => (
          <Link
            key={n.path}
            to={n.path}
            style={{
              color: loc.pathname === n.path ? "#005DE9" : "#666",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
