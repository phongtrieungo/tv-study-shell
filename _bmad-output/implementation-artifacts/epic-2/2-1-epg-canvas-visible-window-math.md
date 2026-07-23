---
baseline_commit: 747b5c1Add Surface host mount/unmount contract and close Epic 1.
---

# Story 2.1: EPG canvas package with Visible Window math

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want `packages/epg-canvas` that computes and draws only the Visible Window,
so that large grids stay responsive (FR-4, AD-5).

## Acceptance Criteria

1. **Given** fixtures with ≥50×24h logical cells  
   **When** the EPG renders  
   **Then** a debug overlay or log shows drawn cell count ≪ logical cell count  

2. **And** scrolling/focus changes update the Visible Window

3. **And** a practical interview study HTML exists at `docs/study/2-1-epg-canvas-visible-window-math.html`, linked from `docs/index.md` (teaches Visible Window concepts — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Shared Visible Window math in `@tvshell/shared` (AC: #1, #2)
  - [x] Add pure helpers under `packages/shared/src/visible-window/` (name flexible; keep math framework-free)
  - [x] Export a small, testable API, e.g.:
    - Input: scroll/focus offsets + viewport size (channels × time span) + grid bounds (channel count, day start/end)
    - Output: Visible Window indices/ranges (`channelStart`/`channelEnd`, `timeStart`/`timeEnd` or equivalent)
    - Helper to count / iterate cells that fall inside the window (for draw + debug accounting)
  - [x] Clamp window to fixture bounds (no negative indices; do not overrun channel list or day schedule)
  - [x] Re-export from `packages/shared/src/index.ts` barrel
  - [x] **Do not** put Canvas drawing in `shared` — math only (AD-9 / Story 3.1 reuse)

- [x] Task 2: Create `@tvshell/epg-canvas` Surface package (AC: #1, #2)
  - [x] New workspace package `packages/epg-canvas` — npm name `@tvshell/epg-canvas`
  - [x] Package shape mirrors stub/shared: `"type": "module"`, `exports["."] → ./src/index.ts`, TypeScript **5.9.3**, depend on `@tvshell/shared` `workspace:*` only (AD-1)
  - [x] Export `mount(host, ctx?)` / `unmount()` matching Shell `SurfaceModule` contract
  - [x] On mount: create a `<canvas>` (or canvas + small HUD DOM sibling) inside host; size to host; get `CanvasRenderingContext2D`
  - [x] Load Mock Data from `@tvshell/shared` (`channels`, `programs`, `fixtureMeta`) — no fetch / no local duplicate fixtures (AD-3)
  - [x] Draw **only** cells in the Visible Window (program rects intersecting the window). Never create a DOM node per logical cell
  - [x] Debug HUD or `[epg]` log each draw (or on window change): `drawnCells`, `logicalCells`, and ideally window ranges. Logical count must use the full fixture grid (≥50 channels × ≥24h schedule — today **50×12 = 600** program cells). Assert drawn ≪ logical for the default viewport
  - [x] Minimal scroll/focus so AC #2 is demonstrable: arrow keys (or equivalent) change channel and/or time offset → recompute Visible Window → redraw. Visible focus ring / selected cell highlight is enough for 2.1; **full** FR-5 program detail panel is Story **2.2**
  - [x] Register EPG’s own `keydown` (or similar) for arrows while mounted; dispose on unmount (AD-6). Shell already owns **Back** → `host.leave()` when Surface active — do not steal Back
  - [x] On unmount: cancel RAF if any, remove listeners, release canvas/DOM; leave no orphan side effects. Prefer optional `hasActiveSideEffects()` for smoke honesty
  - [x] Log with `[epg]` prefix

- [x] Task 3: Registry-swap `epg` only in Shell (AC: #1, #2)
  - [x] `apps/shell/package.json`: add `"@tvshell/epg-canvas": "workspace:*"`
  - [x] `apps/shell/vite.config.ts`: add `@tvshell/epg-canvas` to `optimizeDeps.exclude`
  - [x] `apps/shell/src/main.ts`: import epg module; set `registry.epg` to epg `mount`/`unmount`; keep `home` / `live` / `webgl-lab` on stub
  - [x] Fix cleanup probe honesty: today `cleanupProbe: surfaceStub.hasActiveSideEffects` is wrong after leaving EPG. Options (pick one, keep simple):
    - Probe based on `host.getActiveId()` / last-left surface, **or**
    - EPG exports `hasActiveSideEffects` and shell selects probe by surface, **or**
    - Omit stub probe when leaving non-stub surfaces (status without false “side effects” warning)
  - [x] Soft UX: chrome/stub copy still says all destinations share the stub — update status/subtitle if it claims EPG is still a stub after swap (clear deferred honesty for EPG only; Home/Live/WebGL Lab remain stub)

- [x] Task 4: Docs honesty (AC: #1, #2, #3)
  - [x] Update `README.md`: EPG Canvas package exists with Visible Window math; D-pad focus detail / now-line / Perf Note still 2.2–2.4
  - [x] Update `docs/index.md`: link 2.1 study HTML; next step → **2.2** (create-story or already backlog)
  - [x] Do **not** invent `docs/perf-notes/epg.md` yet (Story 2.4)

- [x] Task 5: Interview study HTML (AC: #3)
  - [x] Create `docs/study/2-1-epg-canvas-visible-window-math.html`
  - [x] Teach (interview-practical): logical grid vs Visible Window; why draw accounting matters; scroll/focus → window recompute; Canvas 2D vs DOM cell forests; shared math for WebGL Lab (AD-9); honesty bounds (desktop Chromium proxy, not OEM TV memory)
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow 1.2–1.4 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 6: Smoke verify (AC: #1, #2)
  - [x] `pnpm install` if lockfile needs workspace link; `pnpm typecheck` (shared + epg-canvas + shell) green
  - [x] `pnpm --filter shell build` green
  - [x] Manual on `http://localhost:5180`: Menu → **EPG** → canvas grid mounts; HUD/log shows drawn ≪ logical; arrows change window and redraw; Back → unmount + menu; remount works; Home/Live/WebGL Lab still stub
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright required for this story’s AC (Epic 7 / 7.1 owns Vitest for Visible Window)
  - [x] Confirm other Lab packages still absent (`webgl-lab`, `home-blits`, `live-solid`)

### Review Findings

- [x] [Review][Patch] Derive canvas/viewport layout from host size (ResizeObserver optional) — was Decision: fit host [`packages/epg-canvas/src/index.ts`]
- [x] [Review][Patch] Draw path should use `programsInVisibleWindow` instead of re-filtering the full `programs` array [`packages/epg-canvas/src/render.ts:87`]
- [x] [Review][Patch] Align focus-time cursor X with cell time scale (`pxPerHour`), not `durationMs × (canvasW − gutter)` [`packages/epg-canvas/src/render.ts:136`]
- [x] [Review][Patch] Stub copy still claims all destinations share the stub — false now that EPG is real [`packages/surface-stub/src/index.ts:33`]
- [x] [Review][Patch] Set `cleanupProbeForActive` before mount attempt so failed-mount leave probe is not stale [`apps/shell/src/main.ts:56`]
- [x] [Review][Patch] Guard non-finite `fixtureMeta.dayStart` / schedule bounds at EPG mount [`packages/epg-canvas/src/index.ts:23`]
- [x] [Review][Patch] On `getContext('2d')` failure, surface HUD/status instead of silent empty canvas [`packages/epg-canvas/src/index.ts:82`]
- [x] [Review][Patch] Only assign `canvas.width`/`height` when layout changed to avoid wiping the bitmap every paint [`packages/epg-canvas/src/index.ts:92`]

- [x] [Review][Defer] Node smoke for Visible Window not wired to a package script [`packages/shared/tests/story-2-1-smoke.mjs`] — deferred, pre-existing process debt until 7.1
- [x] [Review][Defer] No `devicePixelRatio` canvas backing-store scaling [`packages/epg-canvas/src/index.ts`] — deferred, pre-existing polish
- [x] [Review][Defer] Repeated `Date.parse` on every filter/draw of fixtures [`packages/shared/src/visible-window/index.ts:114`] — deferred, pre-existing perf until measured need

## Dev Notes

### Scope boundaries (critical)

**In scope:** Shared Visible Window pure math; `@tvshell/epg-canvas` Canvas 2D Surface drawing only the window; debug draw vs logical accounting; minimal arrow-driven window updates; registry-swap **only** `epg`; study HTML; README/docs honesty.

**Out of scope (later stories):**

- Full FR-5 focus UX + Enter program detail panel → **2.2**
- Now-line independent of grid rebuild → **2.3**
- `docs/perf-notes/epg.md` FPS write-up → **2.4**
- WebGL Lab / shared math consumer → **3.1** (design API so 3.1 can import it)
- Vitest for Visible Window → **7.1** (keep functions pure and easy to test later)
- Playwright D-pad smoke → **7.2**
- Memory Soak / cross-surface hardening → **6.x**
- React, production APIs, OEM remotes — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-1** No cross-surface framework imports | `epg-canvas` depends on `shared` only — never on stub/home/live/webgl packages |
| **AD-2** Thin DOM Shell hosts Surfaces | Keep Shell host generic; only swap registry entry for `epg` |
| **AD-3** Mock Data only | Consume `channels` / `programs` / `fixtureMeta` from shared |
| **AD-4** Shared D-pad map | Use `getDpadAction` / `DPAD_KEYS` from shared for EPG arrows; Shell keeps Back→leave |
| **AD-5** Visible Window virtualization | Compute window from scroll/focus; draw only that subset |
| **AD-6** Cleanup on leave | Dispose listeners/RAF/canvas on `unmount` |
| **AD-7** React forbidden | No React |
| **AD-9** WebGL Lab reuses shared math | Put window math in `shared`, not buried inside canvas-only modules |
| **AD-10** Test ladder | Manual smoke + typecheck/build; Vitest later in 7.1 |
| **Errors / Logging** | Mount failures → Shell error banner; logs `[epg]` / `[shell]`; no RAF spam |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-1–AD-7, AD-9, Consistency Conventions, Structural Seed]

Canonical capability map: **FR-4–FR-7 → `packages/epg-canvas`** (this story delivers FR-4 foundation; 2.2–2.4 complete the epic).

### Fixture math (do not invent a second dataset)

Current shared fixtures ([Source: `packages/shared/src/fixtures/index.ts`]):

| Fact | Value |
| --- | --- |
| Channels | **50** (`channel-01` …) |
| Schedule | **24h** from `fixtureMeta.dayStart` (`2026-07-22T00:00:00.000Z`) |
| Program blocks | **2h** each → **12** programs per channel |
| Logical program cells | **600** (`fixtureMeta.programCount`) |

Use this as the **logical** denominator in the HUD. Visible Window for a typical viewport (e.g. ~8–12 channels × ~3–6 hours) should draw on the order of tens of cells, not hundreds — enough that `drawn ≪ 600` is obvious.

Programs have ISO `start`/`end`; window math should work in ms (or minutes) and filter programs that **intersect** the visible time range for channels in range — do not assume a uniform cell matrix if you iterate programs, but counting intersecting programs as “drawn cells” is acceptable for AC.

### Files being modified (UPDATE) — read before coding

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `apps/shell/src/main.ts` | All four ids → stub; arrows ignored while Surface active; Back → leave; cleanupProbe = stub | Import epg; `epg:` real module; fix probe honesty; optional status copy | Serialized host enter/leave; modifier guard; AbortSignal/HMR; menu click path; stub for other three ids |
| `apps/shell/package.json` | shared + surface-stub | Add `@tvshell/epg-canvas` | TS 5.9.3, Vite 6.4.3 |
| `apps/shell/vite.config.ts` | exclude shared + stub | exclude epg-canvas too | Port **5180**, `strictPort: true` |
| `packages/shared/src/index.ts` | fixtures + input + types | Re-export visible-window | Existing exports / `SHARED_MARKER` |
| `README.md` / `docs/index.md` | Next = create-story 2.1 | Honesty: 2.1 shipped; next = 2.2; study link | Getting started; no-React; study convention |
| `apps/shell/src/styles.css` | Stub + Safe Zone styles | Optional EPG canvas/host sizing helpers | Safe Zone vars; focus ring; stub styles still used by other Surfaces |
| `apps/shell/src/chrome/render-chrome.ts` | Generic host + stub-era status strings | Soft copy if it still claims every Surface is stub | `data-testid`s; Safe Zone; error banner |

### Files being created (NEW)

| Path | Purpose |
| --- | --- |
| `packages/shared/src/visible-window/*.ts` | Pure Visible Window compute + clamp + cell accounting |
| `packages/epg-canvas/package.json` | `@tvshell/epg-canvas` workspace package |
| `packages/epg-canvas/tsconfig.json` | Same TS pin as siblings |
| `packages/epg-canvas/src/index.ts` | `mount` / `unmount` (+ optional probe) |
| `packages/epg-canvas/src/*` | Canvas draw, input, HUD (split modules OK) |
| `docs/study/2-1-epg-canvas-visible-window-math.html` | Interview study DoD |

### Suggested target structure (after this story)

```text
packages/
  shared/
    src/
      visible-window/
        index.ts              # NEW — computeVisibleWindow, countLogicalCells, …
      index.ts                # UPDATE — re-export
  epg-canvas/                 # NEW — @tvshell/epg-canvas
    package.json
    tsconfig.json
    src/
      index.ts                # mount / unmount
      render.ts               # optional — ctx draw of window cells
      input.ts                # optional — arrow → scroll/focus offsets
apps/shell/
  src/main.ts                 # UPDATE — registry.epg → epg-canvas
  package.json                # UPDATE
  vite.config.ts              # UPDATE
docs/study/2-1-epg-canvas-visible-window-math.html
```

### Contract + API sketches (illustrative — adapt, don’t cargo-cult)

```ts
// packages/shared/src/visible-window/index.ts
export type VisibleWindow = {
  channelStart: number; // inclusive index into channels[]
  channelEnd: number;   // exclusive
  timeStartMs: number;  // inclusive, UTC ms
  timeEndMs: number;    // exclusive
};

export type VisibleWindowInput = {
  focusChannelIndex: number;
  focusTimeMs: number;
  viewportChannelCount: number;
  viewportDurationMs: number;
  totalChannels: number;
  dayStartMs: number;
  dayEndMs: number;
  /** Optional: keep focus near center of window (recommended for TV feel). */
  anchor?: 'start' | 'center';
};

export function computeVisibleWindow(input: VisibleWindowInput): VisibleWindow { /* clamp */ }

export function countLogicalProgramCells(programCount: number): number {
  return programCount; // or channels × slots if you define slots explicitly
}
```

```ts
// packages/epg-canvas/src/index.ts — SurfaceModule shape
export function mount(host: HTMLElement, ctx?: { surfaceId?: string }): void {
  // canvas + HUD; initial window; draw; keydown for arrows; [epg] log
}
export function unmount(): void {
  // remove listener; cancel RAF; replaceChildren / detach; clear module state
}
```

**Input ownership (preserve Shell Back):**

```text
Surface active + Back  → Shell keydown → host.leave() → epg.unmount()
Surface active + arrows → EPG keydown → update offsets → computeVisibleWindow → redraw
Menu mode              → Shell menu focus only (unchanged)
```

### Anti-patterns (do not)

- Draw all 600 programs every frame “and call it virtualization”
- Build a DOM `<div>` per program cell (violates FR-4 consequence)
- Duplicate channel/program fixtures inside `epg-canvas`
- Put Canvas/`getContext` code inside `packages/shared`
- Registry-swap all four Surfaces or delete the stub package
- Implement Enter program detail / now-line / Perf Note file (steals 2.2–2.4)
- Install Vitest/Playwright/React/Blits/Solid “to finish” this story
- Steal Shell Back handling into EPG without still returning to menu
- Leave stub `cleanupProbe` claiming EPG leaks (or falsely cleared) after leave
- Study HTML that only lists files changed
- RAF `console.log` spam every frame — log on window change or throttle HUD text

### Testing requirements (this story)

- Manual keyboard smoke on :5180: Enter on **EPG** → canvas + HUD; arrows move window; drawn ≪ logical visible; Back → menu; remount; other menu items still stub
- `pnpm typecheck` + shell `build`
- No Vitest required for AC (keep math pure for **7.1**)
- Keep Shell `data-testid`s stable (`surface-host`, `shell-error-banner`, menu)

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear modules over clever abstractions
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)
- Epic 1 retro action: on 2.1 implementation, add `epg-canvas` and registry-swap `epg` off the stub — this story **is** that work

### Previous story intelligence (1.4)

- Delivered: `SurfaceModule` + serialized host enter/leave; stub proves AD-6; registry maps all four ids → stub with comment `// Later: epg → @tvshell/epg-canvas`
- Review patches to **preserve**: enter/leave queue; hold activeId until unmount finishes; mount-failure calls unmount; menu focus restore; cleanupProbe-driven status honesty; no duplicate `SurfaceMountContext` type drift
- Patterns: workspace source exports; `optimizeDeps.exclude`; `[shell]` / Surface prefixes; study HTML DoD; no early Vitest
- Handoff into this story (sprint action + retro): create `packages/epg-canvas`, swap **only** `epg`
- Testing pattern: typecheck + build + manual :5180 — continue that here

[Source: `_bmad-output/implementation-artifacts/1-4-surface-host-mount-unmount-contract.md`]
[Source: `_bmad-output/implementation-artifacts/epic-1-retro-2026-07-22.md`]
[Source: `_bmad-output/implementation-artifacts/sprint-status.yaml` — action_items]

### Git intelligence

Recent commits:

- `747b5c1` — Add Surface host mount/unmount contract and close Epic 1
- `15a2847` — Add Safe Zone shell chrome and focusable Surface menu for Story 1.3
- `a8dd356` — Add shared mock fixtures and D-pad key map for Story 1.2
- `baa282b` — Scaffold pnpm monorepo with Vite shell and shared package

Patterns to follow: small focused modules, workspace `exports` → `./src/index.ts`, README honesty, vanilla TS, no React, study HTML as DoD. Commit title style when asked later: `Add <capability> for Story X.Y.`

### Latest tech notes (2026-07-23)

- **Visible Window math:** Compute start/end indices from scroll/focus offsets ÷ fixed row height / time scale; draw only that subset ([MDN Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)). Prefer integer coordinates to avoid sub-pixel blur.
- **Canvas 2D:** Use `CanvasRenderingContext2D` only (architecture Stack). Optional: `getContext('2d', { alpha: false })` if opaque EPG; not required for AC.
- **RAF:** Prefer `requestAnimationFrame` for redraws after input — not `setInterval` redraw loops. Cancel RAF on unmount (AD-6).
- **Do not** pull in OffscreenCanvas workers / chart libraries for this learning Surface — keep the teaching surface obvious.
- **Vitest:** Still deferred to Story **7.1** for shared Visible Window coverage — design pure functions now so 7.1 is trivial.

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 2.1 |
| --- | --- |
| 2.2 EPG focus + detail | Stable window + draw path; focus index already drives window |
| 2.3 Now-line | Grid model separable from a thin overlay pass |
| 2.4 EPG Perf Note | HUD already exposes drawn vs logical |
| 3.1 WebGL Lab | Import same `computeVisibleWindow` from `@tvshell/shared` |
| 7.1 Vitest | Pure shared math with clear edge cases (clamp, empty viewport, focus at ends) |

### Deferred work (do not expand into this story)

From `_bmad-output/implementation-artifacts/deferred-work.md`:

- Lifecycle timeout for hung mount/unmount Promises → Epic 6 / later
- Menu focus unit tests / fixture barrel smoke / full D-pad matrix → **7.1**
- Dual TS pins / root tooling catalog → process debt, not 2.1 scope

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2 / Story 2.1]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-4, UJ-1, Glossary Visible Window]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-5, AD-9, FR-4–7 map, Structural Seed]
- [Source: `_bmad-output/implementation-artifacts/1-4-surface-host-mount-unmount-contract.md`]
- [Source: `docs/testing-strategy.md` — L1 Visible Window in shared; Vitest later]
- [Source: `docs/study-guides.md` — study HTML from 1.2+]
- [Source: `docs/webgl-investment.md` — Canvas Visible Window first, then WebGL]
- [Source: `packages/shared/src/fixtures/index.ts` — 50×24h / 600 programs]
- [Source: `apps/shell/src/main.ts` — registry stub swap point]
- [Source: `apps/shell/src/host/types.ts` — `SurfaceModule` contract]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `pnpm typecheck` — pass (shared, surface-stub, epg-canvas, shell)
- `pnpm --filter shell build` — pass
- Node smoke `packages/shared/tests/story-2-1-smoke.mjs` — drawn 20 ≪ logical 600
- Manual browser `:5180`: EPG mount HUD `drawn 20 ≪ logical 600`; arrows moved window to `ch 19–28` / `05:00–09:00` (drawn 30); Escape → `Left epg. Side effects cleared.`

### Completion Notes List

- Added pure Visible Window math in `@tvshell/shared` (`computeVisibleWindow`, program intersection helpers) for FR-4 / AD-9 reuse.
- Created `@tvshell/epg-canvas` Canvas 2D Surface: mounts grid + HUD, draws only window cells, arrows update focus/window via capture keydown; Back stays with Shell; AD-6 cleanup + `hasActiveSideEffects`.
- Shell registry-swaps only `epg`; per-surface cleanup probe; chrome copy honesty for EPG vs remaining stubs.
- Study HTML + README/`docs/index.md` updated; no Vitest/Playwright/React; other Lab packages still absent.
- Optional Node smoke for Visible Window math (Vitest still deferred to 7.1).
- Code review patches applied: host-sized viewport + ResizeObserver; draw via `programsInVisibleWindow`; focus cursor px/hour scale; stub honesty copy; probe before mount; schedule/context guards; canvas resize only when layout changes.

### File List

- `README.md`
- `_bmad-output/implementation-artifacts/2-1-epg-canvas-visible-window-math.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/shell/package.json`
- `apps/shell/vite.config.ts`
- `apps/shell/src/main.ts`
- `apps/shell/src/chrome/render-chrome.ts`
- `apps/shell/src/styles.css`
- `docs/index.md`
- `docs/study/2-1-epg-canvas-visible-window-math.html`
- `packages/shared/src/index.ts`
- `packages/shared/src/visible-window/index.ts`
- `packages/shared/tests/story-2-1-smoke.mjs`
- `packages/epg-canvas/package.json`
- `packages/epg-canvas/tsconfig.json`
- `packages/epg-canvas/src/index.ts`
- `packages/epg-canvas/src/render.ts`
- `packages/surface-stub/src/index.ts`
- `pnpm-lock.yaml`

## Change Log

- 2026-07-23: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-23: Implemented EPG canvas Visible Window math + registry swap; status → review
- 2026-07-23: Code review patches applied (host-fit viewport, shared draw filter, probe/honesty guards); status → done
