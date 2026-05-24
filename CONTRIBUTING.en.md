> 🌐 [繁體中文](CONTRIBUTING.md) | **English**

# Maintaining / Extending figma-to-code

For people who **modify the harness itself**. Users (who fork it to build a site) should read [`README.md`](README.md); this covers **the architecture and how to change it**.

## Architecture Overview

```
Figma design
   │ get_design_context (MCP) + REST API for assets
   ▼
components/<category>/*.tsx   components (props control all visuals)
   │ assemble
   ▼
pages/<page>/*.tsx            pages
   │ register route
   ▼
dev/{Preview,main}.tsx        local preview (Vite, port 3003)
```

- Single source of truth for design tokens = `config/tokens.ts` (synced with `dev/index.css @theme`).
- Visual correctness is guarded by a **two-layer regression** (see `docs/visual-regression-overview.md`).

## How the Wiring Works

| Piece | What it does |
|---|---|
| `.claude/skills/refine-component/` | Single-component visual convergence loop; each round calls the escape valve `converge-guard.mjs`; runs regression when done |
| `.claude/skills/figma-compare/` | The 7-step visual comparison SOP |
| `.claude/skills/visual-regression/` | Two-layer regression front door: component-layer numeric assertion + page-layer screenshot diff |
| `scripts/build-dep-map.mjs` | Static import analysis → component→page dependency map |
| `scripts/visual-regression/` | `capture` (screenshots) / `diff` (pixelmatch absolute-pixel threshold) / `assert-component` (numeric assertion) / `run` (orchestrator) / `converge-guard` (escape valve) |
| `.claude/settings.json` | Enables the figma plugin |

## How to Extend

- **Add a component**: create `components/<category>/<Name>.tsx` (header Purpose + For Designer; props use `?` + defaults) → add a `<ComponentPreview>` block in `dev/Preview.tsx` (auto-carries `data-component` for regression).
- **Add a page**: create `pages/<slug>/` + add a route in `dev/main.tsx` → run `npm run build:depmap`.
- **Component layer measures the wrong element** (hidden behind a preview wrapper): add `data-component-root` to the target component in that preview block.
- **Approve a new baseline**: after aligning, `npm run baseline:update` / `... --update-spec`.

## Design Rationale

- Page-layer regression uses an **absolute-pixel threshold** (not full-page percentage) — percentage dilutes localized small-element shifts (the noise floor is 0px after freezing animations).
- The convergence loop has an **escape valve** (max rounds per breakpoint / stop on no-progress, recorded to `tests/visual/known-diffs.md`).
- Anti-scope: no cross-browser / interaction-animation / CI verification.

## How to Verify Changes

- Changing a script / skill: run `npm run test:visual` + spot-check `npm run test:component <component>`; confirm all green when nothing changed (noise 0px).
- Intentionally break a component → regression should go red → revert → green.
- Before touching wiring, ask: is this automating a good habit or fossilizing a current bad flow? Self-verify machine-checkable changes before handing them off.
