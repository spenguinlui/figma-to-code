/**
 * 環境變數讀取 — Design To Code 系統專用
 * 讀取 .env 中的 Figma 設定
 */

import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")

function parseEnv() {
    const envPath = resolve(ROOT, ".env")
    let content
    try {
        content = readFileSync(envPath, "utf-8")
    } catch {
        console.error("❌ 找不到 .env 檔案")
        console.error("   cp .env.example .env")
        process.exit(1)
    }

    const env = {}
    for (const line of content.split("\n")) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const [key, ...rest] = trimmed.split("=")
        env[key.trim()] = rest.join("=").trim()
    }
    return env
}

/**
 * 取得 Figma 設定
 */
export function getFigmaConfig() {
    const env = parseEnv()
    const fileKey = env.FIGMA_FILE_KEY
    const canvasNodeId = env.FIGMA_CANVAS_NODE_ID

    if (!fileKey || fileKey === "your-file-key") {
        console.error("❌ 請在 .env 設定 FIGMA_FILE_KEY")
        process.exit(1)
    }

    return { fileKey, canvasNodeId }
}
