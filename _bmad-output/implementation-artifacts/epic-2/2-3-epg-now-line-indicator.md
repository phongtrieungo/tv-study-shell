---
baseline_commit: f5ae4e6Add EPG D-pad focus and program select for Story 2.2.
---

# Story 2.3: EPG now-line indicator

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a now-line that updates without full grid rebuilds,
so that I can explain separated animation vs grid draw (FR-6).

## Acceptance Criteria

1. **Given** EPG is visible  
   **When** time advances  
   **Then** the now-line position updates  

2. **And** the logical program model is not fully reconstructed each tick

3. **And** a practical interview study HTML exists at `docs/study/epic-2/2-3-epg-now-line-indicator.html`, linked from `docs/index.md` (teaches separated chrome vs grid draw + demo-clock mapping — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Demo clock + now-line position math (AC: #1, #2)
  - [x] Add a small pure helper (prefer `packages/epg-canvas/src/now-line.ts`) that maps wall time into the **fixture schedule day** so the line is demoable:
    - Fixtures are locked to `fixtureMeta.dayStart` = `2026-07-22T00:00:00.000Z` (24h). Raw `Date.now()` will usually fall **outside** that day → line never visible.
    - **Required:** `demoNowMs` ∈ `[dayStartMs, dayEndMs)` (e.g. `dayStartMs + (Date.now() % scheduleMs)`, or wall clock’s time-of-day remapped onto the fixture day). Document the choice in hint + study HTML.
    - Optional acceleration for teaching (e.g. 1s tick advances demo time faster) is fine if honesty bounds say so — production EPGs typically tick every 30–60s / minute-aligned (domain research now-line section).
  - [x] Reuse the **same ms→px scale** as program cells / focus cursor:
    - `nowX = gutterPx + ((nowMs - window.timeStartMs) / MS_PER_HOUR) * pxPerHour`
  - [x] Clip/hide when `nowMs` is outside the Visible Window time range (or `nowX` outside `[gutterPx, canvasW]`). Do **not** auto-scroll the window to now (out of scope).

- [x] Task 2: Distinct now-line chrome + separated update path (AC: #1, #2)
  - [x] Draw a **distinct** vertical now-line (FR-6). Must not be confused with the existing **cyan focus-time cursor** (`rgba(125, 211, 252, 0.7)` in `render.ts`) or amber focus cell ring.
    - Suggested look: thicker stroke (2px) in a contrasting color (e.g. `#f87171` / soft red) and/or a tiny “NOW” label in HUD — pick one clear affordance.
  - [x] **Preferred (interview-strong — matches research “separate animated chrome”):** DOM/CSS absolute overlay on `.epg-canvas__stage` (sibling of canvas, under or above detail as needed) whose `left`/`transform` tracks `nowX`. Grid canvas repaints only on focus/resize/detail — now-line ticks move the overlay without calling `programsInVisibleWindow` / rebuilding fixtures.
  - [x] **Acceptable minimum:** Pass `nowMs` into `drawEpgGrid` and stroke on canvas after cells; on timer tick call `schedulePaint()`, but **prove** AC #2: never recreate `programs`/`channels`, never re-run fixture builders, never rebuild a 600-cell logical model. Prefer a HUD cue like `now … · model stable` / tick counter that does **not** imply model rebuilds.
  - [x] Do **not** invent OffscreenCanvas / ImageData caching unless it stays tiny — AD-5 means **logical model** separation, not a mandatory second bitmap layer.
  - [x] Keep focus cursor + amber focus cell behavior from 2.2 unchanged.

- [x] Task 3: Timer lifecycle (AD-6) + HUD/copy (AC: #1, #2)
  - [x] Start now-line timer (or light scheduled update) in `mount`; clear it in `disposeSideEffects` / `unmount`
  - [x] Include timer in `hasActiveSideEffects()` so Shell cleanup probes stay honest (today checks keydown/keyup/RAF/ResizeObserver only)
  - [x] No `[epg]` console spam on every tick — log at most on mount / first visible now / unmount
  - [x] Update hint text: mention now-line (demo clock) + keep arrows / Enter detail / Back layering
  - [x] Optional: HUD shows demo-now time (UTC slice) so the learner can see it advance
  - [x] Styles in `apps/shell/src/styles.css` if using DOM overlay (`.epg-canvas__now-line`); Safe Zone friendly; no React / new design system
  - [x] `README.md` / `docs/index.md`: honesty that FR-6 now-line shipped; next = **2.4** EPG Perf Note; study link under epic-2 folder
  - [x] Do **not** invent Perf Note file (`docs/perf-notes/epg.md` → **2.4**) or jump-to-now control

- [x] Task 4: Interview study HTML (AC: #3)
  - [x] Create `docs/study/epic-2/2-3-epg-now-line-indicator.html` (match epic-folder convention)
  - [x] Teach (interview-practical):
    - Why now-line is **chrome**, not another program cell
    - Separated update paths: grid dirty (focus/window) vs clock tick (position only)
    - Demo clock vs wall clock when fixtures are a frozen schedule day
    - Same px-per-hour scale as cells; hide when outside Visible Window
    - AD-6: clear timers on Surface leave (tie to soak story later)
    - Honesty bounds: not live schedule sync / OEM EPG; jump-to-now deferred
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow 1.2–2.2 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 5: Smoke verify (AC: #1, #2)
  - [x] `pnpm typecheck` (shared + epg-canvas + shell) green
  - [x] `pnpm --filter shell build` green
  - [x] Manual on `http://localhost:5180`: Menu → **EPG** → distinct now-line visible (demo clock); wait for tick → position moves; arrows/Enter/Back still work; leave Surface → timer gone (`hasActiveSideEffects` false / status “Side effects cleared”); remount works
  - [x] Confirm fixtures/`programs` array is not regenerated on ticks (stable import from `@tvshell/shared`)
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright install (Epic 7)
  - [x] Confirm capture listener remove parity + new timer cleared

### Review Findings

- [x] [Review][Decision→Patch] Mount seeds focus to demo-now — **Keep seed**; document honesty (demo convenience, not a jump-to-now control). Patch: clarify hint + study HTML.
- [x] [Review][Decision→Patch] Teaching tick barely moves the line — **Accelerate** demo clock (N× wall per tick) so motion is obvious; document honesty vs production 30–60s ticks.
- [x] [Review][Patch] Document demo-now focus seed honesty in hint + study HTML [`packages/epg-canvas/src/index.ts` + `docs/study/epic-2/2-3-epg-now-line-indicator.html`]
- [x] [Review][Patch] Accelerate demo clock on tick (visible motion) + honesty in hint/study [`packages/epg-canvas/src/index.ts` + study HTML]
- [x] [Review][Patch] Stop 1s aria-live HUD spam [`packages/epg-canvas/src/index.ts`:401]
- [x] [Review][Patch] Guard non-finite `nowX` / `canvasW <= 0` before setting overlay `left` [`packages/epg-canvas/src/index.ts`:203]
- [x] [Review][Patch] Align now-line height/overflow to canvas stage (clip NOW chip; avoid full-stage stretch past grid) [`apps/shell/src/styles.css`:251]
- [x] [Review][Defer] Automated tests for `demoNowMs` / `nowXPx` — deferred, pre-existing Epic 7.1 ladder
- [x] [Review][Defer] Inject clock / `wallMs` at Surface boundary for deterministic smoke — deferred, pre-existing Epic 7 ladder

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-6 / AD-5 — distinct now-line that moves when time advances; logical program model not fully reconstructed each tick; demo-clock mapping into fixture day; AD-6 timer cleanup; study HTML; README/docs honesty.

**Out of scope (later stories):**

- `docs/perf-notes/epg.md` FPS write-up → **2.4**
- Jump-to-now / auto-scroll window to now → stretch / later (domain mentions it; **not** in Story 2.3 ACs)
- WebGL Lab → **3.1**
- Vitest for now-line helpers → **7.1**
- Playwright smoke → **7.2**
- HiDPI `devicePixelRatio`, Date.parse precompute → deferred-work (do not expand)
- React, production schedule APIs, OEM remotes — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-1** No cross-surface framework imports | Stay in `epg-canvas` + `@tvshell/shared` only |
| **AD-3** Mock Data only | Demo clock over shared fixtures — no live EPG API |
| **AD-4** Shared D-pad map | Do not change focus/select/Back layering from 2.2 |
| **AD-5** Visible Window + now-line | Now-line updates **without** rebuilding the full logical grid model |
| **AD-6** Cleanup on leave | Clear now-line **timer**/RAF; honest `hasActiveSideEffects` |
| **AD-7** React forbidden | Vanilla TS + Canvas 2D + optional DOM chrome overlay |
| **AD-10** Test ladder | Manual smoke + typecheck/build; automated tests later |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`]

Canonical map: **FR-6 → `packages/epg-canvas`**. FR-4/FR-5 already shipped in 2.1/2.2.

### What “not fully reconstructed” means (AC #2)

**Must not on each tick:**

- Recreate or mutate the shared `programs` / `channels` fixture arrays into a new 600-cell model
- Re-run fixture generators
- Build a DOM-per-cell forest
- Treat a clock tick as a reason to change focus / Visible Window / detail state

**Allowed on each tick:**

- Update `demoNowMs`
- Reposition overlay or redraw a thin chrome stroke
- Optionally call existing `paint()` if using canvas stroke path — filtering Visible Window programs for a redraw is OK as long as the **logical model** (fixture data) is untouched; prefer the DOM overlay path so ticks skip `programsInVisibleWindow` entirely (stronger interview story)

### Input ownership (preserve — no change required)

```text
Menu mode                    → Shell menu focus
Surface + arrows             → EPG capture → focus/window → redraw
Surface + Enter (select)     → EPG capture → detail
Surface + Back, detail open  → EPG capture → dismiss detail
Surface + Back, detail shut  → Shell bubble → host.leave() → unmount
Now-line timer               → EPG-owned; clear on unmount          ← NEW
```

Shell `main.ts`: prefer **no change**.

### Files being modified (UPDATE) — read before coding

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `packages/epg-canvas/src/index.ts` | Focus/detail/paint; RAF coalesce; AD-6 dispose; `hasActiveSideEffects` without timer | Demo `nowMs` state; start/clear timer; pass now into draw or position overlay; HUD/hint; include timer in probe | Capture remove parity; focus/detail/Back; Visible Window math; `[epg]` no RAF spam; Shell Back when detail closed |
| `packages/epg-canvas/src/render.ts` | Cells + amber focus + cyan focus-time cursor | Optional: accept `nowMs` and stroke now-line **distinct** from focus cursor — **or** leave canvas unchanged if DOM overlay owns now-line | `programsInVisibleWindow` input; gutter/row/`pxPerHour`; focus affordances |
| `apps/shell/src/styles.css` | `.epg-canvas*`, detail overlay | Now-line overlay styles if DOM approach | Safe Zone vars; menu/stub/detail |
| `apps/shell/src/main.ts` | Registry `epg`; Back → leave | **Prefer no change** | Host serialization; probes |
| `README.md` / `docs/index.md` | Next = create-story 2.3 | Honesty: 2.3 shipped; next 2.4; study link | Getting started; no-React; study convention |

### Files being created (NEW)

| Path | Purpose |
| --- | --- |
| `packages/epg-canvas/src/now-line.ts` (or equivalent) | Pure `demoNowMs` / `nowXFromWindow` helpers |
| `docs/study/epic-2/2-3-epg-now-line-indicator.html` | Interview study DoD |

### Suggested target structure (after this story)

```text
packages/epg-canvas/src/
  index.ts      # UPDATE — timer + now state + dispose/probe
  render.ts     # UPDATE only if canvas draws now-line
  now-line.ts   # NEW — demo clock + ms→px helpers
  focus.ts      # UNCHANGED
  detail.ts     # UNCHANGED
apps/shell/src/styles.css               # UPDATE if DOM overlay
docs/study/epic-2/2-3-….html            # NEW
docs/index.md                           # UPDATE — link + next step
```

### Contract sketches (illustrative — adapt, don’t cargo-cult)

```ts
// packages/epg-canvas/src/now-line.ts
export function demoNowMs(dayStartMs: number, scheduleMs: number, wallMs = Date.now()): number {
  // Remap wall time into the fixture day so the line is visible in demos.
  return dayStartMs + (wallMs % scheduleMs);
}

export function nowXPx(
  nowMs: number,
  window: { timeStartMs: number; timeEndMs: number },
  gutterPx: number,
  pxPerHour: number,
  msPerHour: number,
): number | null {
  if (nowMs < window.timeStartMs || nowMs >= window.timeEndMs) return null;
  return gutterPx + ((nowMs - window.timeStartMs) / msPerHour) * pxPerHour;
}
```

```ts
// Lifecycle (conceptual)
let nowTimer: ReturnType<typeof setInterval> | null = null;
let demoNow = demoNowMs(dayStartMs, dayEndMs - dayStartMs);

function startNowLineTimer(): void {
  nowTimer = setInterval(() => {
    demoNow = demoNowMs(dayStartMs, dayEndMs - dayStartMs);
    // Preferred: positionNowLineOverlay(demoNow, currentWindow(), layout)
    // Acceptable: schedulePaint() with nowMs passed into drawEpgGrid
  }, 1000); // teaching tick; document honesty vs 30–60s production
}

// disposeSideEffects: clearInterval(nowTimer); nowTimer = null;
// hasActiveSideEffects: … || nowTimer != null
```

### Visual distinction checklist

| Element | Role | Keep distinct |
| --- | --- | --- |
| Amber cell ring / bright fill | Focused **program** | 2.2 — do not replace with now-line |
| Cyan vertical cursor | Focus **time** column | 2.2 — not the now-line |
| Now-line (new) | Demo / “wall” **current time** | Thicker / different color / labeled |

### Fixture facts (do not invent a second dataset)

| Fact | Value |
| --- | --- |
| Channels | **50** |
| Schedule | **24h** from `fixtureMeta.dayStart` (`2026-07-22T00:00:00.000Z`) |
| Blocks | **2h** → **12** programs/channel → **600** logical cells |
| Layout constants | `GUTTER_PX=112`, `ROW_H=36`, `PX_PER_HOUR=160` |

[Source: `packages/shared/src/fixtures/index.ts`, `packages/epg-canvas/src/render.ts`]

### Anti-patterns (do not)

- Use raw `Date.now()` without remapping → invisible now-line on a 2026-07-22 fixture day
- Conflate now-line with focus-time cursor (same color/width)
- Rebuild fixtures or clone all 600 programs on every tick
- Auto-scroll / jump-to-now “to finish” the story
- Forget `clearInterval` / leave timer running after leave (AD-6 leak; Shell probe lies)
- Spam `console.info` every tick
- Steal Shell Back or break detail Back latch from 2.2
- Implement Perf Note / Vitest / Playwright / React / WebGL “to finish”
- Study HTML that only lists files changed
- Change Shell registry / other Surfaces

### Testing requirements (this story)

- Manual keyboard + watch-the-line smoke on `:5180` (tick moves line; focus/detail/Back intact; leave clears timer)
- `pnpm typecheck` + `pnpm --filter shell build`
- Optional tiny Node assert for `demoNowMs` / `nowXPx` — **not** required; Vitest still **7.1**
- Keep existing `data-testid`s; if DOM now-line, add `data-testid="epg-now-line"` for future Playwright (7.2)

[Source: `docs/testing-strategy.md`]

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear modules over clever abstractions
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)
- On-disk study/story paths use **`docs/study/epic-N/`** and **`_bmad-output/implementation-artifacts/epic-N/`**

### Previous story intelligence (2.1 + 2.2)

**2.1 delivered:** `@tvshell/epg-canvas` + shared Visible Window math; HUD `drawn ≪ logical`; RAF paint; registry-swap only `epg`. Explicit handoff: now-line → **2.3**; “grid model separable from a thin overlay pass.”

**2.2 delivered:** `focus.ts` / `detail.ts`; program-boundary ←→; ↑↓ column affinity; Enter detail; nested Back with `stopPropagation` + Back-repeat latch; stronger amber focus. Explicit handoff: do **not** invent now-line in 2.2; “detail/focus state separable from a thin overlay pass.”

**Patterns to reuse:**

- Module split (`focus.ts`, `detail.ts` → add `now-line.ts`)
- Capture `keydown` + matching remove (`true`); RAF coalesce; ResizeObserver
- `programsInVisibleWindow` for grid draws only
- Detail as absolute stage overlay (does not shrink Visible Window)
- `[epg]` prefix; study HTML under `docs/study/epic-2/`
- No Vitest/Playwright/React this epic

**Preserve review patches from 2.2:** detail overlay sizing; Back-repeat latch; HUD flash for no-program Enter.

**Deferred (do not expand):** overlapping ←→ stickiness; Node smoke package script → 7.1; HiDPI; Date.parse precompute.

[Source: `_bmad-output/implementation-artifacts/epic-2/2-1-epg-canvas-visible-window-math.md`]
[Source: `_bmad-output/implementation-artifacts/epic-2/2-2-epg-dpad-focus-and-program-select.md`]
[Source: `_bmad-output/implementation-artifacts/deferred-work.md`]

### Git intelligence

Recent commits:

- `f5ae4e6` — Add EPG D-pad focus and program select for Story 2.2
- `6a9635c` / `75fd96d` — Add EPG canvas package with Visible Window math for Story 2.1
- `723cf16` — Surface host mount/unmount (Epic 1 close)
- `15a2847` — Safe Zone shell chrome + menu (1.3)

Patterns: small focused modules, workspace `exports` → `./src/index.ts`, README honesty, vanilla TS, no React, study HTML as DoD. Commit title style when asked later: `Add <capability> for Story X.Y.`

### Latest tech notes (2026-07-23)

- **Industry pattern:** Android TV Live TV `ProgramGuide` positions a **separate** current-time indicator on a ~1s Handler tick without rebuilding program rows ([ProgramGuide.java](https://android.googlesource.com/platform/packages/apps/TV/+/android-live-tv/src/com/android/tv/guide/ProgramGuide.java) — `positionCurrentTimeIndicator` + `TIME_INDICATOR_UPDATE_FREQUENCY`).
- **Domain research:** Vertical now-line; timer 30–60s or minute-aligned; no whole-grid rebuild; jump-to-now is common but **out of scope** here.
- **Technical research:** “Separate animated chrome (now-line) from static grid redraw.”
- **Stack:** Vite **6.4.3**, TypeScript **5.9.3**, pnpm **9.0.5**. SolidJS / Vitest **not installed** — do not add them here. No EPG/canvas libraries.

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 2.3 |
| --- | --- |
| 2.4 Perf Note | Demo path: now-line ticking while scrolling/focusing without model rebuild lies |
| 6.2 Memory Soak | Timer cleared on leave; probe honesty |
| 7.2 Playwright | Optional `data-testid="epg-now-line"` |

### Deferred work (do not expand into this story)

From `_bmad-output/implementation-artifacts/deferred-work.md`:

- Overlapping programs ←→ stickiness → later / 7.x
- Visible Window Node smoke package script / HiDPI / Date.parse precompute → later / 7.1
- Menu FSM / full D-pad Vitest → **7.1**
- Dual TS pins / root tooling catalog → process debt

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2 / Story 2.3]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-6]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-5, AD-6]
- [Source: `_bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md` — Now-line]
- [Source: `_bmad-output/planning-artifacts/research/technical-tv-ui-stack-lightning-solidjs-canvas-webgl-research-2026-07-22.md` — separate animated chrome]
- [Source: `_bmad-output/implementation-artifacts/epic-2/2-2-epg-dpad-focus-and-program-select.md`]
- [Source: `packages/epg-canvas/src/index.ts` — paint / dispose / probe]
- [Source: `packages/epg-canvas/src/render.ts` — focus cursor ms→px]
- [Source: `packages/shared/src/fixtures/index.ts` — frozen demo day]
- [Source: `docs/study-guides.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Stale Vite on `:5180` served pre-2.3 transform; smoke verified on fresh Vite `:5181`.
- Browser smoke: now-line `left%` moved across ticks; HUD `ticks` increased; `hasActiveSideEffects()` false after leave.

### Completion Notes List

- Pure `demoNowMs` / `nowXPx` in `now-line.ts` — remap `dayStart + (wallMs % scheduleMs)`.
- Preferred DOM overlay path: 1s timer repositions `.epg-canvas__now-line` without `programsInVisibleWindow` / fixture rebuild; canvas paint stays focus/resize/detail.
- Soft-red 2px + NOW label; HUD `now … · ticks N · model stable`; mount seeds focus near demo-now so the line is visible (not jump-to-now control).
- AD-6: `clearInterval` in `disposeSideEffects`; timer included in `hasActiveSideEffects()`.
- Study HTML + docs/README honesty; next step 2.4 Perf Note.
- Code review patches: ~60× demo accel; removed HUD `aria-live`; finite/`canvasW` guards; overlay aligned to canvas box + stage `overflow:hidden`; honesty copy updated.

### File List

- packages/epg-canvas/src/now-line.ts (new)
- packages/epg-canvas/src/index.ts
- apps/shell/src/styles.css
- docs/study/epic-2/2-3-epg-now-line-indicator.html (new)
- docs/index.md
- README.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/epic-2/2-3-epg-now-line-indicator.md
- _bmad-output/implementation-artifacts/deferred-work.md

## Change Log

- 2026-07-23: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-23: Implemented FR-6 now-line (DOM chrome + demo clock) — status → review
- 2026-07-23: Code review patches applied (accel, a11y, guards, overlay align) — status → done
