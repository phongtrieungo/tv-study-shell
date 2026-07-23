---
baseline_commit: a1602f1Update README and sprint status for Epic 2 completion.
---

# Story 3.1: WebGL lab package with textured Visible Window

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want `packages/webgl-lab` that draws a D-pad-navigable textured tile or EPG-window grid with WebGL,
so that I practice buffers, textures, shaders, and draw calls (FR-15).

## Acceptance Criteria

1. **Given** shared Visible Window math (or documented equivalent)  
   **When** WebGL Lab mounts  
   **Then** rendering uses `WebGLRenderingContext` or `WebGL2RenderingContext` (not Canvas 2D)  
   **And** only the Visible Window is drawn  
   **And** unmount deletes buffers/textures/programs created by the lab

2. **And** D-pad arrows change focus / Visible Window and redraw (navigable textured tiles or EPG-window cells); Shell **Back** still leaves to menu

3. **And** Shell registry-swaps **only** `webgl-lab` off the stub onto `@tvshell/webgl-lab` (EPG stays on `@tvshell/epg-canvas`; Home/Live stay stub)

4. **And** a practical interview study HTML exists at `docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html`, linked from `docs/index.md` (teaches WebGL pipeline + Visible Window on GPU — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Create `@tvshell/webgl-lab` Surface package (AC: #1, #2)
  - [x] New workspace package `packages/webgl-lab` — npm name `@tvshell/webgl-lab`
  - [x] Package shape mirrors `epg-canvas` / `shared`: `"type": "module"`, `exports["."] → ./src/index.ts`, TypeScript **5.9.3**, depend on `@tvshell/shared` `workspace:*` **only** (AD-1)
  - [x] Export `mount(host, ctx?)` / `unmount()` / `hasActiveSideEffects()` matching Shell `SurfaceModule` + EPG probe pattern
  - [x] On mount: create a `<canvas>` inside host; size to host; obtain **`webgl2` first**, fall back to `webgl` (WebGL1). If both fail → surface HUD/status error (do not silently empty). Prefer documenting which context was acquired in an `[webgl]` log
  - [x] **Forbidden:** `getContext('2d')` for the grid; DOM node per cell; Three.js / regl / Pixi / any scene-graph lib (AD-9 = raw WebGL)
  - [x] Load Mock Data from `@tvshell/shared` (`channels`, `programs`, `fixtureMeta`) — no fetch / no local duplicate fixtures (AD-3)
  - [x] Reuse **shared** Visible Window API — do **not** reimplement window math:
    - `computeVisibleWindow`, `programsInVisibleWindow`, `countLogicalProgramCells`, `countProgramsInVisibleWindow`
  - [x] Draw **only** programs intersecting the Visible Window (textured quads / tiles). Logical denominator remains **600** (`fixtureMeta.programCount`). HUD or `[webgl]` log: `drawn ≪ logical` (parity with EPG teaching)
  - [x] At least **one** texture path that is real GPU texture work: texture atlas **or** per-tile / solid-color textures uploaded via `texImage2D` (fixtures have **no** poster URLs — generate colors/glyphs from `programId` / title hash is fine)
  - [x] Minimal GLSL: vertex + fragment shaders compiled/linked into a `WebGLProgram`; at least one VBO (positions and/or UVs); `drawArrays` / `drawElements` for Visible Window tiles
  - [x] D-pad: capture-phase `keydown` for arrows (and optional Select highlight) while mounted; use `getDpadAction` from shared (AD-4). **Do not** steal Back — Shell owns Back → `host.leave()`
  - [x] Coalesce paints with `requestAnimationFrame`; cancel pending RAF on unmount
  - [x] On unmount (AD-6 / AD-9): delete every buffer/texture/program created; unbind bind points; remove listeners; cancel RAF/ResizeObserver/timers; clear module state so `hasActiveSideEffects()` is false. Prefer tracking resources in a small registry list rather than hoping GC frees VRAM
  - [x] Log with `[webgl]` prefix (not `[epg]`)

- [x] Task 2: Registry-swap `webgl-lab` only in Shell (AC: #3)
  - [x] `apps/shell/package.json`: add `"@tvshell/webgl-lab": "workspace:*"`
  - [x] `apps/shell/vite.config.ts`: add `@tvshell/webgl-lab` to `optimizeDeps.exclude`
  - [x] `apps/shell/src/main.ts`: import webgl-lab; set `registry['webgl-lab']` + `probeBySurface['webgl-lab']`; keep `epg` on epg-canvas; keep `home` / `live` on stub
  - [x] Update chrome subtitle / stub honesty copy so it no longer claims WebGL Lab is stub-only (`apps/shell/src/chrome/render-chrome.ts`, `packages/surface-stub` body text if needed)
  - [x] Soft UX: console host summary should reflect `epg → epg-canvas; webgl-lab → webgl-lab; home/live → stub`

- [x] Task 3: Docs honesty (AC: #1–#4)
  - [x] Update `README.md`: WebGL Lab package exists with textured Visible Window; Canvas vs WebGL Perf Note / vocabulary README section still **3.2 / 3.3**
  - [x] Update `docs/index.md`: link 3.1 study HTML; next step → **3.2** (or create-story for 3.2)
  - [x] Do **not** invent `docs/perf-notes/canvas-vs-webgl.md` yet (Story 3.2)
  - [x] Do **not** write the full FR-17 vocabulary README section yet (Story 3.3) — a one-line “pipeline practice in Lab” pointer is enough

- [x] Task 4: Interview study HTML (AC: #4)
  - [x] Create `docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html`
  - [x] Teach (interview-practical, **assume zero prior WebGL**):
    - Why Lab W exists (`docs/webgl-investment.md`): Canvas virtualization ≠ GPU literacy; Blits hides metal
    - Pipeline: **buffer → texture → shader program → draw call**; what each means in *this* lab
    - Same Visible Window math as EPG, different renderer (CPU Canvas 2D vs GPU)
    - Why `deleteBuffer` / `deleteTexture` / `deleteProgram` matter (VRAM ≠ JS GC)
    - Honesty bounds: learning lab depth, not expert claim; desktop Chromium proxy ≠ OEM TV
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow epic-2 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 5: Smoke verify (AC: #1–#3)
  - [x] `pnpm install` if lockfile needs workspace link; `pnpm typecheck` green (shared + epg-canvas + webgl-lab + shell)
  - [x] `pnpm --filter shell build` green
  - [x] Manual on `http://localhost:5180`: Menu → **WebGL Lab** → WebGL canvas mounts; HUD/log shows drawn ≪ logical; arrows change window and redraw; Back → unmount + menu; remount works; EPG still works; Home/Live still stub
  - [x] Confirm leave logs cleanup probe **false** for webgl-lab (`hasActiveSideEffects`)
  - [x] Confirm no `react` / `react-dom`; no Three.js / regl / Pixi; no Vitest/Playwright required for this story’s AC (Epic 7)
  - [x] Confirm other Lab packages still absent (`home-blits`, `live-solid`)

## Dev Notes

### Scope boundaries (critical)

**In scope:** `@tvshell/webgl-lab` raw WebGL Surface; textured Visible Window (EPG-window or tile grid); shared math reuse; D-pad window navigation; GPU resource dispose on unmount; registry-swap **only** `webgl-lab`; study HTML; README/docs honesty.

**Out of scope (later stories):**

- `docs/perf-notes/canvas-vs-webgl.md` side-by-side note → **3.2**
- Full README WebGL vocabulary section (FR-17 depth) → **3.3**
- Blits Home / Lightning scene graph → **Epic 4**
- Vitest for Visible Window / UV helpers → **7.1**
- Playwright mounts WebGL Lab → **7.2**
- Cross-surface hardening / soak → **6.x**
- HiDPI `devicePixelRatio`, Date.parse precompute, overlapping ←→ nav polish → `deferred-work.md` (**do not expand into Epic 3 unless blocked** — Epic 2 retro)
- React, Three.js “to finish faster”, production schedule APIs, OEM remotes — **never for MVP**
- Advanced WebGL2 (MRT, lighting, 3D camera) — architecture deferred beyond textured 2D UI tiles

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-1** No cross-surface framework imports | `webgl-lab` depends on `shared` only — never on `epg-canvas` / stub / future home/live |
| **AD-2** Thin DOM Shell hosts Surfaces | Keep Shell host generic; only swap registry entry for `webgl-lab` |
| **AD-3** Mock Data only | Consume `channels` / `programs` / `fixtureMeta` from shared |
| **AD-4** Shared D-pad map | Use `getDpadAction` for Lab arrows; Shell keeps Back→leave |
| **AD-5** Visible Window virtualization | Same idea as EPG — compute window, draw only that subset (GPU path) |
| **AD-6** Cleanup on leave | Dispose listeners/RAF **and** GPU resources |
| **AD-7** React forbidden | No React |
| **AD-8** Perf Notes | Do not invent canvas-vs-webgl note here — leave for 3.2 |
| **AD-9** Raw WebGL Lab | Own context/buffers/textures/programs; reuse shared VW math; dispose on unmount; **do not replace Blits** |
| **AD-10** Test ladder | Manual smoke + typecheck/build; Vitest later in 7.1 |
| **Errors / Logging** | Mount / context failures → Shell error banner or in-surface status; logs `[webgl]` / `[shell]`; no RAF spam |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-1–AD-10, Stack table, Structural Seed]

Canonical capability map: **FR-15–FR-17 → `packages/webgl-lab`** (this story delivers FR-15; 3.2–3.3 complete the epic).

### WebGL literacy scaffolding (zero experience assumed)

Read once before coding: [`docs/webgl-investment.md`](../../../docs/webgl-investment.md). Interview line to earn:

> I virtualized an EPG in Canvas, then rendered the same Visible Window idea with WebGL textures/draw calls…

**Pipeline map (what you must touch in code):**

| Concept | What it is | Lab minimum |
| --- | --- | --- |
| **Context** | GPU API handle from canvas | `canvas.getContext('webgl2')` \|\| `getContext('webgl')` |
| **Buffer (VBO)** | GPU memory for vertex data (xy, uv) | `createBuffer` + `bufferData` + `bindBuffer` |
| **Texture** | GPU image sampler | `createTexture` + `texImage2D` (atlas or solid tiles) + `bindTexture` |
| **Shader / Program** | Vertex transforms + fragment colors/samples | Compile VS/FS, `createProgram`, `useProgram` |
| **Draw call** | Tell GPU to rasterize | `drawArrays` / `drawElements` for **visible** tiles only |
| **Dispose** | Free VRAM handles | `deleteBuffer` / `deleteTexture` / `deleteProgram` (+ unbind) on `unmount` |

**Suggested teaching-friendly render path (adapt, don’t cargo-cult):**

1. Compute `VisibleWindow` via shared helpers (same inputs style as EPG: focus channel + focus time + viewport channels/duration + day bounds).
2. Filter `programsInVisibleWindow(...)`.
3. For each visible program (or batched), upload/update geometry for a textured quad in channel×time layout.
4. One (or few) draw calls — batching is a plus for interviews; per-tile draws are OK if count stays ≪ 600 and you can explain the trade-off.
5. HUD text can be a small **DOM sibling** (like EPG) — do not require text rendering in GLSL for AC.

**Textures without fixture images:** Programs have titles only (`posterUrl` exists on Home rails as empty stubs for Epic 4 — **not** for Lab). Generate a small canvas/`Uint8Array` color (or glyph atlas) keyed by `programId` / channel — still counts as real `texImage2D` work.

**Context loss (awareness, not a mini-framework):** Optional `webglcontextlost` / `webglcontextrestored` handlers are nice; full rebuild is **not** required for AC. Do not claim production-grade recovery. Unmount dispose remains mandatory.

### What already exists — reuse, do not reinvent

| Piece | Path | Action |
| --- | --- | --- |
| Visible Window math | `packages/shared/src/visible-window/index.ts` | **Import** — already documented “WebGL Lab reuse (AD-9)” |
| Fixtures | `packages/shared/src/fixtures` | **Import** — 50×12 = 600 logical cells |
| D-pad map | `packages/shared/src/input` | **Import** `getDpadAction` |
| Surface contract | `apps/shell/src/host/types.ts` | Match `mount` / `unmount` |
| Registry seam | `apps/shell/src/main.ts` | Swap `'webgl-lab'` only (mirror Story 2.1 `epg` swap) |
| Menu id | `apps/shell/src/menu/surfaces.ts` | Already includes `'webgl-lab'` — **no menu work** |
| EPG patterns | `packages/epg-canvas/src/index.ts` | Mirror lifecycle / capture keydown / RAF / HUD accounting — **do not** import epg-canvas |
| Stub | `packages/surface-stub` | Remains for Home/Live |

**Do not copy into `shared`:** WebGL context setup, GLSL, texture upload, draw loops.

**Do not import from `epg-canvas`:** Would violate AD-1. If you want focus adjacency helpers later, either duplicate a tiny local helper or wait — simple channel/time offset stepping is enough for 3.1 AC.

### Fixture math (same denominator as EPG)

| Fact | Value |
| --- | --- |
| Channels | **50** |
| Schedule | **24h** from `fixtureMeta.dayStart` |
| Program blocks | **2h** → **12** per channel |
| Logical program cells | **600** |

Typical viewport should draw tens of cells, not hundreds — `drawn ≪ 600` must be obvious in HUD/log.

### Files being modified (UPDATE) — read before coding

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `apps/shell/src/main.ts` | `epg` → epg-canvas; `webgl-lab` → stub; probe map | Import webgl-lab; swap registry + probe for `webgl-lab` only | Serialized host; Back→leave; EPG path; AbortSignal/HMR; menu click |
| `apps/shell/package.json` | epg-canvas + shared + stub | Add `@tvshell/webgl-lab` | TS 5.9.3, Vite 6.4.3 |
| `apps/shell/vite.config.ts` | exclude shared, stub, epg-canvas | exclude webgl-lab too | Port **5180**, `strictPort: true` |
| `apps/shell/src/chrome/render-chrome.ts` | Subtitle says Home/Live/WebGL Lab still stub | Honesty: WebGL Lab is real | `data-testid`s; Safe Zone; error banner |
| `packages/surface-stub/src/index.ts` | Mentions EPG real, others stub | Soft copy if it still implies WebGL Lab is always stub | Timer/visibility AD-6 demo for Home/Live |
| `README.md` / `docs/index.md` | Next = create-story 3.1 | Honesty: 3.1 shipped; next = 3.2; study link | Getting started; no-React; study convention |

### Files being created (NEW)

| Path | Purpose |
| --- | --- |
| `packages/webgl-lab/package.json` | `@tvshell/webgl-lab` workspace package |
| `packages/webgl-lab/tsconfig.json` | Same TS pin / DOM lib as siblings |
| `packages/webgl-lab/src/index.ts` | `mount` / `unmount` / `hasActiveSideEffects` |
| `packages/webgl-lab/src/*` | GL bootstrap, shaders, textures, draw, input, HUD (split modules OK) |
| `docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html` | Interview study DoD |

### Suggested target structure (after this story)

```text
packages/
  webgl-lab/                      # NEW — @tvshell/webgl-lab
    package.json
    tsconfig.json
    src/
      index.ts                    # mount / unmount / hasActiveSideEffects
      gl.ts                       # optional — context acquire + dispose registry
      shaders.ts                  # optional — VS/FS source + compile/link
      texture.ts                  # optional — atlas / solid tile upload
      render.ts                   # optional — Visible Window → draw
      input.ts                    # optional — arrow → focus offsets
apps/shell/
  src/main.ts                     # UPDATE — registry['webgl-lab']
  package.json                    # UPDATE
  vite.config.ts                  # UPDATE
docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html
```

### Contract + API sketches (illustrative — adapt, don’t cargo-cult)

```ts
// packages/webgl-lab/src/index.ts — SurfaceModule shape
export function mount(host: HTMLElement, ctx?: { surfaceId?: string }): void {
  // canvas; getContext webgl2|webgl; compile program; create buffers/textures;
  // initial Visible Window; draw; keydown arrows; [webgl] log
}
export function unmount(): void {
  // deleteBuffer / deleteTexture / deleteProgram; unbind; remove listener;
  // cancel RAF; detach DOM; clear module state
}
export function hasActiveSideEffects(): boolean {
  // true while GL resources or listeners/RAF still held
}
```

```ts
// Paint core — mirror EPG data path, swap renderer
const window = computeVisibleWindow({ /* focus + viewport + day bounds */ });
const visiblePrograms = programsInVisibleWindow(channels, programs, window);
const logical = countLogicalProgramCells(fixtureMeta.programCount);
const drawn = visiblePrograms.length; // or countProgramsInVisibleWindow(...)
// upload/draw textured quads for visiblePrograms only
```

**Input ownership (preserve Shell Back):**

```text
Surface active + Back  → Shell keydown → host.leave() → webglLab.unmount()
Surface active + arrows → Lab keydown → update focus → computeVisibleWindow → redraw
Menu mode              → Shell menu focus only (unchanged)
EPG                    → unchanged (@tvshell/epg-canvas)
```

### Anti-patterns (do not)

- Use Canvas 2D (`getContext('2d')`) and call it “WebGL Lab”
- Install Three.js / OGL / regl / Pixi “because WebGL is hard” (violates AD-9 teaching goal)
- Draw all 600 programs every frame and call it virtualization
- Build a DOM `<div>` per program cell
- Duplicate channel/program fixtures inside `webgl-lab`
- Put WebGL/`getContext` / GLSL inside `packages/shared`
- Import `@tvshell/epg-canvas` from webgl-lab (AD-1)
- Registry-swap Home/Live or delete the stub package
- Steal Shell Back handling into the Lab
- Skip `delete*` on unmount and hope GC frees VRAM
- Leave `cleanupProbe` pointing at stub after swap (false leak / false clear)
- Implement canvas-vs-webgl Perf Note or FR-17 vocabulary essay (steals 3.2–3.3)
- Expand Epic 2 deferred polish (HiDPI / Date.parse / overlapping nav) unless blocked
- Claim expert WebGL depth in study HTML / README
- RAF `console.log` spam every frame — log on window change or throttle HUD text
- Study HTML that only lists files changed

### Testing requirements (this story)

- Manual keyboard smoke on :5180: Enter on **WebGL Lab** → WebGL canvas + HUD; arrows move window; drawn ≪ logical; Back → menu; remount; EPG still works; Home/Live still stub
- After leave: `[shell] cleanup probe` reports no active side effects for Lab
- `pnpm typecheck` + shell `build`
- No Vitest required for AC (GPU path is manual; shared math already smoke-tested in Epic 2 / reserved for **7.1**)
- Keep Shell `data-testid`s stable (`surface-host`, `shell-error-banner`, menu)

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md` + `docs/webgl-investment.md`
- User skill level: intermediate — clear modules over clever abstractions; **zero WebGL experience** → prefer readable lab code over clever engine abstractions
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact); prefer `docs/study/epic-3/` folder convention
- Epic 2 retro action: create-story for 3.1 with extra WebGL teaching context — this story **is** that work
- Before implement: skim `docs/webgl-investment.md` once (sprint action item)

### Previous story intelligence (Epic 2 → 3.1)

Epic 2 delivered the staircase this Lab consumes:

- **2.1** — shared `computeVisibleWindow` + EPG Canvas draw accounting + registry-swap pattern
- **2.2** — capture-phase D-pad ownership while Surface active; Shell keeps Back
- **2.3** — AD-6 timer/chrome dispose discipline (apply same rigor to GPU deletes)
- **2.4** — Perf Note honesty template (foreshadow only — 3.2 owns Canvas vs WebGL)

**Patterns to copy from EPG (behavior), not Canvas APIs:**

- `mount` remount-safety dispose-before-attach
- Coalesced RAF paints; ResizeObserver optional for host sizing
- HUD `drawn N ≪ logical 600`
- `hasActiveSideEffects` for shell cleanup probe honesty
- Workspace package shape + `optimizeDeps.exclude`

**Review lessons from 2.1 to bake in on first pass:**

- Set `cleanupProbeForActive` before mount (already in `main.ts` — keep it)
- Surface status on context acquire failure (don’t silent-fail)
- Only resize canvas backing store when layout changes
- Don’t leave honesty copy claiming Lab is still stub

[Source: `_bmad-output/implementation-artifacts/epic-2/2-1-epg-canvas-visible-window-math.md`]
[Source: `_bmad-output/implementation-artifacts/epic-2/epic-2-retro-2026-07-23.md`]
[Source: `_bmad-output/implementation-artifacts/sprint-status.yaml` — action_items]

### Git intelligence

Recent commits:

- `a1602f1` — Update README and sprint status for Epic 2 completion
- `02365fa` — Add EPG now-line indicator for Story 2.3
- `f5ae4e6` — Add EPG D-pad focus and program select for Story 2.2
- `6a9635c` / `75fd96d` — EPG canvas + Visible Window math (2.1)
- `723cf16` — Surface host mount/unmount contract; close Epic 1

Patterns to follow: small focused modules, workspace `exports` → `./src/index.ts`, README honesty, vanilla TS, no React, study HTML as DoD, registry-swap one Surface at a time. Commit title style when asked later: `Add <capability> for Story X.Y.`

### Latest tech notes (2026-07-23)

- **Raw WebGL from TypeScript** — WebGL is a browser API; GLSL is string source compiled at runtime. No C++ toolchain.
- **Prefer WebGL2**, fall back to WebGL1; log which one you got (architecture Stack table in `ARCHITECTURE-SPINE.md`).
- **Delete eagerly** — JS GC does **not** free GPU memory. Call `deleteBuffer` / `deleteTexture` / `deleteProgram`; unbind active bind points. MDN: [WebGL best practices — Delete objects eagerly](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).
- **Optional:** `WEBGL_lose_context` for teaching demos later — not required for AC.
- **Do not** pull Three.js skills into the Lab path — project research treats Three.js as vocabulary helpers only; Lab is textured **2D UI tiles**.
- **Vitest** still deferred to **7.1** — keep shared math imports pure; optional pure UV/atlas helpers inside webgl-lab are fine if they stay testable later.

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 3.1 |
| --- | --- |
| 3.2 Canvas vs WebGL Perf Note | Runnable Lab + draw accounting HUD for same-machine compare |
| 3.3 Vocabulary README | Real buffers/textures/shaders/draw calls in this package to cite |
| 6.1 Cross-surface nav | Clean unmount — no orphan WebGL resources after leave |
| 6.3 Portfolio README | Stack map includes WebGL Lab |
| 7.1 Vitest | Shared VW math unchanged / still pure |
| 7.2 Playwright | Mountable `webgl-lab` surface id already in menu |

### Deferred work (do not expand into this story)

From `_bmad-output/implementation-artifacts/deferred-work.md` + Epic 2 retro:

- HiDPI `devicePixelRatio` canvas/WebGL backing-store scaling
- `Date.parse` precompute on fixtures
- Overlapping program ←→ navigation stickiness
- Vitest / Playwright / emulator notes → Epic 7
- Async mount lifecycle timeout → Epic 6 / later
- Dual TS pins / empty root tooling → process debt

## References

- Epics Story 3.1: `_bmad-output/planning-artifacts/epics.md` (Epic 3 / FR-15)
- Architecture AD-9 + Stack: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`
- PRD FR-15 / UJ-3: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md`
- WebGL investment: `docs/webgl-investment.md`
- Testing strategy: `docs/testing-strategy.md`
- Study convention: `docs/study-guides.md`
- EPG Perf Note template (honesty): `docs/perf-notes/epg.md`
- Epic 2 retro: `_bmad-output/implementation-artifacts/epic-2/epic-2-retro-2026-07-23.md`
- Prior story pattern: `_bmad-output/implementation-artifacts/epic-2/2-1-epg-canvas-visible-window-math.md`
- Shared VW API: `packages/shared/src/visible-window/index.ts`
- Shell registry: `apps/shell/src/main.ts`

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Browser smoke `:5180`: mount WebGL Lab → HUD `drawn 24 ≪ logical 600` · `context webgl2`; ArrowDown → focus ch 2; Escape → `[shell] cleanup probe after leave { hasActiveSideEffects: false }`; EPG remount still shows `drawn ≪ logical 600`.

### Completion Notes List

- Shipped `@tvshell/webgl-lab`: WebGL2-first (WebGL1 fallback), color atlas via `texImage2D`, VS/FS program, batched `drawArrays` for Visible Window quads only; shared VW math reused (AD-9).
- GPU dispose registry deletes buffers/textures/programs/shaders on unmount; Shell registry-swapped only `webgl-lab`.
- Study HTML + README/docs honesty; deferred 3.2 Perf Note and 3.3 vocabulary essay.
- Quality gate: `pnpm typecheck` + `pnpm --filter shell build` green; no React/Three/Vitest.

### File List

- packages/webgl-lab/package.json (NEW)
- packages/webgl-lab/tsconfig.json (NEW)
- packages/webgl-lab/src/index.ts (NEW)
- packages/webgl-lab/src/gl.ts (NEW)
- packages/webgl-lab/src/shaders.ts (NEW)
- packages/webgl-lab/src/texture.ts (NEW)
- packages/webgl-lab/src/render.ts (NEW)
- apps/shell/package.json
- apps/shell/vite.config.ts
- apps/shell/src/main.ts
- apps/shell/src/chrome/render-chrome.ts
- apps/shell/src/styles.css
- packages/surface-stub/src/index.ts
- README.md
- docs/index.md
- docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html (NEW)
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/epic-3/3-1-webgl-lab-textured-visible-window.md
- pnpm-lock.yaml

## Change Log

- 2026-07-23: Story context created (ready-for-dev) — Ultimate context engine analysis completed
- 2026-07-23: Implemented WebGL Lab textured Visible Window; status → review
