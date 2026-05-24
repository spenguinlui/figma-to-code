#!/usr/bin/env node
/**
 * Cache Figma node data to local JSON files using the Figma REST API
 * (bypasses MCP rate limit). Reads `figma-nodes.json`, fetches each node's
 * raw design data, and saves to `.figma-cache/<nodeId>.json`.
 *
 * Usage:
 *   node --env-file=.env scripts/cache-figma-nodes.mjs           # incremental (skip cached)
 *   node --env-file=.env scripts/cache-figma-nodes.mjs --force   # re-fetch all
 *
 * Rate limit: Figma REST API ~2/sec recommended. Script throttles to 500ms.
 * On 429 (rate limited): sleeps 60s and retries.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE_DIR = join(ROOT, ".figma-cache")
const NODES_FILE = join(ROOT, "figma-nodes.json")

const TOKEN = process.env.FIGMA_ACCESS_TOKEN
const FILE_KEY = process.env.FIGMA_FILE_KEY
const FORCE = process.argv.includes("--force")
const THROTTLE_MS = 500

if (!TOKEN || !FILE_KEY) {
    console.error("[cache-figma] Missing FIGMA_ACCESS_TOKEN or FIGMA_FILE_KEY in env. Run with --env-file=.env")
    process.exit(1)
}

mkdirSync(CACHE_DIR, { recursive: true })

const nodesConfig = JSON.parse(readFileSync(NODES_FILE, "utf8"))

// Collect all node IDs from components + pages × variants
const targets = []
for (const [path, variants] of Object.entries(nodesConfig.components || {})) {
    for (const [bp, id] of Object.entries(variants)) {
        if (id) targets.push({ path, bp, id })
    }
}
for (const [path, variants] of Object.entries(nodesConfig.pages || {})) {
    for (const [bp, id] of Object.entries(variants)) {
        if (id) targets.push({ path, bp, id })
    }
}

const cacheFileFor = (id) => join(CACHE_DIR, `${id.replace(/[:/]/g, "_")}.json`)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchNode(nodeId) {
    const url = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(nodeId)}&geometry=paths`
    while (true) {
        const res = await fetch(url, { headers: { "X-Figma-Token": TOKEN } })
        if (res.status === 429) {
            const retryAfter = parseInt(res.headers.get("retry-after") || "60", 10)
            const waitMs = Math.min(retryAfter, 3600) * 1000  // cap at 1h per retry
            const tier = res.headers.get("x-figma-plan-tier") || "?"
            console.warn(`[cache-figma] 429 on ${nodeId} (plan=${tier}), retry-after=${retryAfter}s, sleeping ${Math.round(waitMs/1000)}s…`)
            if (retryAfter > 3600) {
                console.error(`[cache-figma] retry-after ${retryAfter}s (>1h) — Starter plan exhausted. Aborting.`)
                process.exit(2)
            }
            await sleep(waitMs)
            continue
        }
        if (!res.ok) {
            const body = await res.text()
            throw new Error(`Figma API ${res.status} for ${nodeId}: ${body.slice(0, 200)}`)
        }
        return await res.json()
    }
}

let done = 0, skipped = 0, fetched = 0, failed = 0
const total = targets.length
console.log(`[cache-figma] ${total} targets (force=${FORCE})`)

for (const { path, bp, id } of targets) {
    const file = cacheFileFor(id)
    if (!FORCE && existsSync(file)) {
        skipped++
        done++
        continue
    }
    try {
        const data = await fetchNode(id)
        writeFileSync(file, JSON.stringify(data, null, 2))
        fetched++
        done++
        console.log(`[cache-figma] (${done}/${total}) ${path} @ ${bp} → ${id}`)
        await sleep(THROTTLE_MS)
    } catch (err) {
        failed++
        done++
        console.error(`[cache-figma] FAIL ${path} @ ${bp} (${id}): ${err.message}`)
    }
}

console.log(`\n[cache-figma] done. fetched=${fetched} skipped=${skipped} failed=${failed} total=${total}`)
