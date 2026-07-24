# TV Study Shell

Portfolio Smart TV study monorepo: thin shell + **Canvas EPG → raw WebGL Lab → Blits/Lightning Home → SolidJS Live**, with D-pad focus and measured FPS/heap notes.

> **Status:** Shell hosts Surfaces via `mount`/`unmount`. **EPG** is a real Canvas Surface with Visible Window math, D-pad focus, Enter program detail, a separated demo now-line (`packages/epg-canvas`), and a labeled Perf Note ([docs/perf-notes/epg.md](docs/perf-notes/epg.md)). **WebGL Lab** is a raw WebGL Surface with the same shared Visible Window math + textured tiles (`packages/webgl-lab`) — pipeline practice with a same-machine Canvas vs WebGL Perf Note ([docs/perf-notes/canvas-vs-webgl.md](docs/perf-notes/canvas-vs-webgl.md)) and an honest [WebGL vocabulary](#webgl-vocabulary-this-lab) section (buffers / textures / shaders / draw calls). Home / Live still use the stub until Epics 4–5. See [docs/index.md](docs/index.md).  
> **WebGL focus:** Raw WebGL is an MVP lab (not only Lightning-under-the-hood). See [docs/webgl-investment.md](docs/webgl-investment.md).

## Why this exists

Interview stacks (Lightning / Blits, SolidJS, **WebGL** / Canvas, Smart TV constraints) do not stick as slideware. This repo is a single coherent TV-shaped app so study time produces **demoable code + labeled measurements**, not disconnected toys.

**Positioning:** hands-on learning and portfolio evidence for Senior FE / **WebGL** / TV performance interviews — not a claim of years of production Lightning or WebGL employment.

## Surfaces

| Surface | Stack | What it proves |
| --- | --- | --- |
| **EPG** | Canvas 2D + visible-window virtualization + D-pad | Large channel × time grid without drawing everything; FPS / draw notes |
| **WebGL Lab** | Raw WebGL (buffers, textures, shaders, draw calls) | Same Visible Window / tile idea on the GPU; Canvas vs WebGL comparison |
| **Home** | Blits on Lightning 3 Renderer | Focusable poster rail; applied WebGL scene graph + texture lifecycle |
| **Live** | SolidJS signals | Now-playing / clock strip updates without remounting the whole tree |
| **Shell** | Vite + TypeScript DOM host | Surface switch + shared D-pad map + cleanup on leave |

## Stack

| Piece | Choice |
| --- | --- |
| Language | TypeScript 5.x (WebGL is a browser API used from TS) |
| Shell | Vite + DOM |
| EPG | Canvas 2D (`CanvasRenderingContext2D`) |
| WebGL Lab | WebGL1 / WebGL2 |
| Home | `@lightningjs/blits` + Lightning 3 renderer |
| Live | `solid-js` |
| Workspaces | pnpm (preferred) |
| Data | Synthetic fixtures only (no production API) |

**Explicit non-goals (v1):** React, real DRM / tuners, Tizen / webOS store packages, full custom WebGL UI framework replacing Blits, pixel-perfect OEM launcher clones.

## Honesty (read this first)

- **Desktop proxy:** Development and metrics use **desktop Chromium + keyboard-as-D-pad**. That is an intentional learning proxy, not a certified TV runtime.
- **Perf claims** will always name browser, OS, and machine class under `docs/perf-notes/` — do not treat unlabeled numbers as TV hardware truth.
- **WebGL Lab depth** is a learning lab (textured 2D UI tiles / Visible Window), not a claim of graphics-engine expertise.
- **Video is mocked** on Live (poster / color field). Focus, reactivity, GPU literacy, and memory matter more for this study than playback pipelines.

## Repo layout (target)

```text
apps/
  shell/              # Vite TS host + surface menu + mount/unmount host
packages/
  shared/             # fixtures, D-pad map, Visible Window math, types
  surface-stub/       # Story 1.4 stub Surface (cleanup proof)
  epg-canvas/         # Lab A — Canvas EPG
  webgl-lab/          # Lab W — raw WebGL
  home-blits/         # Lab B — Home (Lightning/Blits)
  live-solid/         # Lab C — Live
docs/
  webgl-investment.md # Why WebGL is MVP
  perf-notes/         # Lab metrics + memory soak (Lab D)
interview-study-plan.html
_bmad-output/         # PRD, architecture, research, sprint artifacts
```

## Getting started

**Requirements:** Node.js **≥ 20**, and **pnpm 9.x** matching the root `packageManager` field (enable via [Corepack](https://nodejs.org/api/corepack.html): `corepack enable`, or install pnpm globally). Scaffold pins **TypeScript 5.9.3** and **Vite 6.4.3**.

```bash
pnpm install
pnpm dev
# equivalent: pnpm --filter shell dev
```

Shell serves at `http://localhost:5180`. You should see a visible Safe Zone guide and a focusable menu listing **Home / Live / EPG / WebGL Lab**.

Use arrow keys as D-pad and Enter to **mount**. **EPG** opens the Canvas Program Grid: Visible Window HUD (drawn ≪ logical), a red **NOW** line driven by a demo clock (fixture-day remap; ticks move chrome without rebuilding the logical model), ↑↓/←→ move focus across channels and programs, Enter opens a minimal title/time detail, Back closes detail then returns to the menu. Measured draw/FPS notes: [docs/perf-notes/epg.md](docs/perf-notes/epg.md). **WebGL Lab** opens the same Visible Window idea on the GPU (atlas textures + shaders; HUD shows drawn ≪ logical + context webgl2/webgl). Same-machine Canvas vs WebGL compare: [docs/perf-notes/canvas-vs-webgl.md](docs/perf-notes/canvas-vs-webgl.md). Home / Live still mount the stub. Story **6.2** Memory Soak validates cleanup across real Surfaces.

## Testing (UT / E2E / Emulator)

TV apps need a **ladder**, not a single tool. Full write-up: [docs/testing-strategy.md](docs/testing-strategy.md).

| Layer | Tool | Role |
| --- | --- | --- |
| UT | Vitest | Shared Visible Window math, D-pad map (CI) |
| E2E | Playwright + Arrow keys as D-pad | Shell smoke across Surfaces (CI) |
| Proxy | Chrome CPU throttle + 1080p | Catch jank before OEM tools |
| OEM | **Tizen TV Simulator → Tizen TV Emulator**; optional **webOS Simulator** | Packaging + remote UX dry-runs (dev machine) |
| Device | Physical TV | Memory / DRM / store truth — not claimed for portfolio MVP |

**Honesty:** Simulator ≠ Emulator ≠ real TV. Emulators often lack DRM/AVPlay and understate memory pain.

## Perf notes & memory soak

| Artifact | Purpose | Status |
| --- | --- | --- |
| [`docs/perf-notes/epg.md`](docs/perf-notes/epg.md) | EPG FPS / draw accounting | **Measured** (2026-07-23) |
| [`docs/perf-notes/canvas-vs-webgl.md`](docs/perf-notes/canvas-vs-webgl.md) | Canvas EPG vs WebGL Lab | **Measured** (2026-07-24) |
| `docs/perf-notes/home.md` | Home focus scroll + texture cleanup | Planned |
| `docs/perf-notes/memory-soak.md` | ~30 min navigate + heap before/after | Planned |

Procedure outline (Lab D): navigate across all surfaces for ~30 minutes, take heap snapshots before/after, record growth or “no growth,” fix leaks, re-measure.

## Learning order (calendar investment)

1. Canvas EPG (virtualization)  
2. **WebGL Lab (invest more time here — [GPU vocabulary](#webgl-vocabulary-this-lab))**  
3. Blits Home (applied WebGL)  
4. Solid Live + memory soak  

## WebGL vocabulary (this lab)

**Depth:** learning lab — textured 2D Visible Window tiles in `packages/webgl-lab` (WebGL2 preferred, WebGL1 fallback via `acquireContext`). Not a claim of graphics-engine or production WebGL expertise.

| Term | In this lab |
| --- | --- |
| **Buffer** | `createVbo` allocates a VBO; each paint `drawVisibleWindow` uploads Visible Window quads with `bufferData(..., DYNAMIC_DRAW)` (`packages/webgl-lab/src/render.ts`) |
| **Texture** | `createColorAtlas` builds a 64×64 RGBA color atlas and uploads it with `texImage2D` (`packages/webgl-lab/src/texture.ts`) |
| **Shader** | `createShaderProgram` compiles/links `VS_SOURCE` (pixel → clip via `u_resolution`) + `FS_SOURCE` (sample `u_tex`) (`packages/webgl-lab/src/shaders.ts`) |
| **Draw call** | `drawVisibleWindow` issues **one** batched `drawArrays(TRIANGLES, …)` for all visible quads — no `drawElements` in this lab |

**Pipeline in one line:** context → program + VBO + atlas → upload verts → `drawArrays` → on leave `disposeGpu` (VRAM ≠ JS GC).

Interleaved VBO layout: `x, y, u, v, focus` (`FLOATS_PER_VERT = 5`); six verts per quad. Paints coalesce on focus/resize — not a continuous full-grid RAF loop.

See also: [WebGL investment](docs/webgl-investment.md) (why Lab W) · [Canvas vs WebGL Perf Note](docs/perf-notes/canvas-vs-webgl.md) (measured trade-offs) · [Story 3.1 study](docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html) (deep pipeline walkthrough)

## Live strip vs React-style rerender

Solid’s Live strip is meant to update **fine-grained signal subscribers** (now-playing text / clock) without remounting the whole surface. Contrast with a typical React pattern where parent state updates can rerender a larger subtree unless carefully memoized.

## Planning docs

| Doc | Path |
| --- | --- |
| Knowledge index | [docs/index.md](docs/index.md) |
| WebGL investment | [docs/webgl-investment.md](docs/webgl-investment.md) |
| Forged idea | [_bmad-output/forge/tv-study-shell/forged-idea.md](_bmad-output/forge/tv-study-shell/forged-idea.md) |
| PRD | [_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md](_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md) |
| Architecture | [_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md](_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md) |
| Epics | [_bmad-output/planning-artifacts/epics.md](_bmad-output/planning-artifacts/epics.md) |
| Study plan | [interview-study-plan.html](interview-study-plan.html) |

## License

Personal portfolio / study project. Add a license file if you open it for reuse.
