> 🌐 [繁體中文](README.md) | **English**

# figma-to-code

A **harness template** that turns Figma designs into React + Tailwind components, centered on **pixel-accurate visual alignment + automated regression**. The workflow is AI-driven (Claude Code) — you describe tasks, the AI generates components, aligns them visually, and verifies via regression.

- **Stack**: Vite + React 19 + Tailwind v4 + TypeScript
- **Design source**: Figma (MCP + REST API)
- **Visual verification**: Playwright two-layer regression (component-layer ≤1px numeric assertion + page-layer screenshot diff)

> This is a **template** with one example component so the whole flow runs out of the box. After forking: fill `.env`, swap design tokens, delete the example, add your own components.
> Working rules: [`CLAUDE.md`](./CLAUDE.md); modifying the harness itself: [`CONTRIBUTING.md`](./CONTRIBUTING.md); regression details: [`docs/visual-regression-overview.md`](./docs/visual-regression-overview.md).

## What it does

Generate components from Figma → assemble pages → pixel-accurate alignment (≤1px) → **after changing a shared component, automatically run regression on affected pages**. Ships with `ExampleButton` + `ExamplePage`; `npm run dev` / `test:visual` / `/visual-regression` run out of the box.

## Workflow: What You Do vs What the AI Loops On

This harness's defining trait: **visual alignment is a loop the AI runs autonomously**, not a one-shot generation. After you describe a task, the AI cycles through "generate / edit code → screenshot visual check → edit again" on its own until ≤1px or stop-loss — you don't babysit each round.

```
You (engineer)                  AI (Claude Code)
──────────                      ────────────────
describe a task ──────────────▶ pull spec from Figma, generate code
"build X / align to ≤1px"              │
                                       ▼
                        ┌──▶ screenshot ↔ design visual check
                        │           │
                        │      diff > 1px?
                        │      ├─ yes → edit code ──┘   ← autonomous loop, you stay out
                        │      └─ no  → converged
                        │      (no convergence after N rounds → stop-loss to known-diffs.md)
                        ▼
review result ◀──────────── reports "✅ done / ⚠️ stop-loss, needs human"
```

- **You**: describe the task + review at the end. You don't watch every round.
- **AI**: owns the inner "generate → visual check → edit" loop; reports back only when it hits ≤1px or the escape valve (max rounds per breakpoint).
- For a **shared component**, the AI loops one level wider: look up the dependency map → run regression on affected pages (`/visual-regression`).

## Quick Start

### Prerequisites
- Node.js ≥ 20
- Claude Code + Figma MCP server configured
- Chrome + the **Claude in Chrome** extension (needed for visual comparison)

### Run it
```bash
npm install
npx playwright install chromium     # headless browser for visual regression
npm run dev                         # → http://localhost:3003
```

### Try regression (example runs out of the box)
```bash
npm run baseline:update             # build regression baselines from the current render
npm run test:visual                 # full-site regression → should be all green
```

## .env Parameters

After `cp .env.example .env`, fill in:

| Variable | Purpose | How to get it |
|---|---|---|
| `FIGMA_FILE_KEY` | Figma file key | Figma URL `figma.com/design/<FILE_KEY>/...` |
| `FIGMA_CANVAS_NODE_ID` | Canvas root node ID | Figma URL `?node-id=<ID>` |
| `FIGMA_ACCESS_TOKEN` | Personal Access Token (for exporting real SVG/PNG) | Figma → Settings → Account → Personal access tokens |

## How to Use: Common Tasks

| I want to | Say this |
|---|---|
| Generate a component from Figma | "Make `<Component>`, Figma node `<id>`" |
| Align to the pixel | "`<Component>` doesn't match the design, fix to ≤1px" |
| Confirm a change broke nothing | "I changed `<Component>`, run regression on affected pages" |

## Commands / Skills

| Command | When to use |
|---|---|
| `/refine-component <component>` | Single-component visual convergence (to ≤1px; auto-runs regression on affected pages when done) |
| `/figma-compare` | The 7-step visual comparison SOP |
| `/visual-regression <component>` | After changing a shared component, auto-verify pages that use it |

| npm command | Purpose |
|---|---|
| `npm run dev` / `build` | preview / build verification |
| `npm run test:visual` | full-site visual regression |
| `npm run test:component <component>` | single-component numeric assertion |
| `npm run build:depmap` | rebuild the component→page dependency map |
| `npm run baseline:update` | approve the current render as baseline (overwrites) |

## After You Fork

1. `cp .env.example .env` and fill in your Figma config.
2. Swap `config/tokens.ts` + `dev/index.css @theme` for your design tokens.
3. Delete `components/example`, `pages/example`, and remove their import/route in `dev/Preview.tsx` / `dev/main.tsx`.
4. Use `/refine-component` to generate your first component from Figma.

## License

MIT
