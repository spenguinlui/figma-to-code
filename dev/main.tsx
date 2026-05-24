import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppShell from "./AppShell"
import Preview from "./Preview"
import ExamplePage from "../pages/example/ExamplePage"

// fork 後：每新增一個頁面，import 它並在下方加一條 <Route path="/pages/<slug>" />。
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Preview />} />
          <Route path="/pages/example" element={<ExamplePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  </React.StrictMode>
)
