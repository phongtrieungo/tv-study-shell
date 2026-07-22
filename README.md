# TV Study Shell

Portfolio Smart TV study monorepo: one thin shell, three surfaces — virtualized Canvas EPG, Blits/Lightning Home rails, and a SolidJS Live strip — with D-pad focus and measured FPS/heap notes.

> **Status:** Planning complete (PRD, architecture, epics). App scaffold and surfaces are next — see [docs/index.md](docs/index.md).

## Why this exists

Interview stacks (Lightning / Blits, SolidJS, Canvas / WebGL thinking, Smart TV constraints) do not stick as slideware. This repo is a single coherent TV-shaped app so study time produces **demoable code + labeled measurements**, not disconnected toys.

**Positioning:** hands-on learning and portfolio evidence for Senior FE / TV performance interviews — not a claim of years of production Lightning employment.

## Surfaces

| Surface | Stack | What it proves |
| --- | --- | --- |
| **EPG** | Canvas 2D + visible-window virtualization + D-pad | Large channel × time grid without drawing everything; FPS / draw notes |
| **Home** | Blits on Lightning 3 Renderer | Focusable poster rail; texture load / unload discipline |
| **Live** | SolidJS signals | Now-playing / clock strip updates without remounting the whole tree |
| **Shell** | Vite + TypeScript DOM host | Surface switch + shared D-pad map + cleanup on leave |

## Stack

| Piece | Choice |
| --- | --- |
| Language | TypeScript 5.x |
| Shell | Vite + DOM |
| Home | `@lightningjs/blits` + Lightning 3 renderer |
| Live | `solid-js` |
| EPG | Canvas 2D (`CanvasRenderingContext2D`) |
| Workspaces | pnpm (preferred) |
| Data | Synthetic fixtures only (no production API) |

**Explicit non-goals (v1):** React, real DRM / tuners, Tizen / webOS store packages, pixel-perfect OEM launcher clones.

## Honesty (read this first)

- **Desktop proxy:** Development and metrics use **desktop Chromium + keyboard-as-D-pad**. That is an intentional learning proxy, not a certified TV runtime.
- **Perf claims** will always name browser, OS, and machine class under `docs/perf-notes/` — do not treat unlabeled numbers as TV hardware truth.
- **Video is mocked** on Live (poster / color field). Focus, reactivity, and memory matter more for this study than playback pipelines.

## Repo layout (target)

```text
apps/
  shell/              # Vite TS host + surface menu
packages/
  shared/             # fixtures, D-pad map, types, perf helpers
  epg-canvas/         # Lab A — EPG
  home-blits/         # Lab B — Home
  live-solid/         # Lab C — Live
docs/
  perf-notes/         # Lab metrics + memory soak (Lab D)
interview-study-plan.html
_bmad-output/         # PRD, architecture, research, sprint artifacts
```

## Getting started

Scaffold is not committed yet. After the monorepo story lands, expect roughly:

```bash
pnpm install
pnpm --filter shell dev
```

Use arrow keys as D-pad, Enter to select, Backspace / Escape for Back. Exact scripts will be filled in when `apps/shell` exists.

## Perf notes & memory soak

| Artifact | Purpose | Status |
| --- | --- | --- |
| `docs/perf-notes/epg.md` | EPG FPS / draw accounting | Planned |
| `docs/perf-notes/home.md` | Home focus scroll + texture cleanup | Planned |
| `docs/perf-notes/memory-soak.md` | ~30 min navigate + heap before/after | Planned |

Procedure outline (Lab D): navigate Home ↔ Live ↔ EPG for ~30 minutes, take heap snapshots before/after, record growth or “no growth,” fix leaks, re-measure.

## Live strip vs React-style rerender

Solid’s Live strip is meant to update **fine-grained signal subscribers** (now-playing text / clock) without remounting the whole surface. Contrast with a typical React pattern where parent state updates can rerender a larger subtree unless carefully memoized. The running strip + a short note in `docs/perf-notes/` (once written) are the talking point for interviews — not a React vs Solid flame war.

## Planning docs

| Doc | Path |
| --- | --- |
| Knowledge index | [docs/index.md](docs/index.md) |
| Forged idea | [_bmad-output/forge/tv-study-shell/forged-idea.md](_bmad-output/forge/tv-study-shell/forged-idea.md) |
| PRD | [_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md](_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md) |
| Architecture | [_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md](_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md) |
| Epics | [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) |
| Study plan | [interview-study-plan.html](interview-study-plan.html) |

## License

Personal portfolio / study project. Add a license file if you open it for reuse.
