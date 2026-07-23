---
baseline_commit: 6a9635cAdd EPG canvas package with Visible Window math for Story 2.1.
---

# Story 2.2: EPG D-pad focus and program select

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want arrow-key Focus across channels and time with Enter detail,
so that I can demo remote-style navigation (FR-5).

## Acceptance Criteria

1. **Given** EPG is focused  
   **When** I press arrows  
   **Then** Focus moves within the grid with a visible focus indicator  

2. **And** Enter opens a minimal program detail (title/time)

3. **And** a practical interview study HTML exists at `docs/study/epic-2/2-2-epg-dpad-focus-and-program-select.html`, linked from `docs/index.md` (teaches app-owned canvas focus + select/back layering — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Resolve focused program + harden focus UX (AC: #1)
  - [x] Keep existing focus model: `(focusChannelIndex, focusTimeMs)` driving `computeVisibleWindow(..., anchor: 'center')` → `programsInVisibleWindow` → `drawEpgGrid` — do **not** invent a second focus system or DOM cell forest
  - [x] Add a small pure helper (prefer `packages/epg-canvas/src/` or optional export from shared if trivially reusable) e.g. `findProgramAt(channelId, timeMs, programs)` → `Program | null` using half-open `[start, end)` like the focus highlight in `render.ts`
  - [x] Arrow behavior (pick one; document in hint + study HTML):
    - **Recommended (interview-strong):** ←/→ jump to **adjacent program** on the focused channel (program-boundary nav); ↑/↓ change channel while keeping the same focus time (column affinity — program under the new channel at `focusTimeMs`)
    - **Acceptable minimum:** keep Story 2.1’s 30-minute `TIME_STEP_MS` steps if program-boundary nav is deferred — still must show a clear focus ring on the program containing `focusTimeMs`
  - [x] Ensure every arrow move: clamp → recompute Visible Window → RAF redraw; focus cell always has a **visible** affordance (existing amber stroke is a start — strengthen if needed: thicker ring, brighter fill, and/or HUD `focused: {title}`)
  - [x] Never leave the grid with no focused cell while EPG is mounted (clamp to schedule; if no program at time, still show time cursor + HUD focus coords)

- [x] Task 2: Enter → minimal program detail panel (AC: #2)
  - [x] Wire `getDpadAction` → `select` in EPG’s **capture** `keydown` (today `select` is explicitly ignored — that comment is the hook)
  - [x] On `select`: resolve program at current focus; if none, no-op (optionally HUD flash); if found, open a **minimal DOM** detail panel (not a second canvas): show at least **title** + **start/end** (format readable UTC or local — stay consistent with HUD ISO slice style)
  - [x] Panel lives under the EPG root (e.g. `.epg-canvas__detail`); add `data-testid="epg-detail"` for future Playwright (7.2)
  - [x] While detail is open: arrows may no-op or still move focus under the panel (pick one; prefer **no-op** so Select→detail is a clear modal step); Enter may refresh/keep same detail or no-op
  - [x] **Back layering (critical — AD-4):**
    - Detail **open** → EPG capture handles `back`: dismiss detail, `preventDefault` + `stopPropagation` so Shell does **not** leave
    - Detail **closed** → EPG must **not** consume `back` (current behavior) so Shell bubble `keydown` still calls `host.leave()`
  - [x] On `unmount` / `disposeSideEffects`: remove detail DOM, clear detail state, remove any detail-related listeners; `hasActiveSideEffects()` stays honest (listener + RAF + ResizeObserver; detail-only DOM without listeners is fine if cleared in unmount)

- [x] Task 3: Copy, styles, docs honesty (AC: #1, #2, #3)
  - [x] Update EPG hint text: arrows + Enter detail + Back (detail closes first, then menu)
  - [x] Styles in `apps/shell/src/styles.css` (or EPG-owned inline classes consumed by shell CSS): Safe Zone friendly, 10-foot readable type, use existing `--focus` / amber language — no React, no new design system
  - [x] `README.md` / `docs/index.md`: honesty that FR-5 focus+detail shipped; next = **2.3** now-line; fix study links to **epic-folder** paths if still pointing at flat `docs/study/{key}.html`
  - [x] Do **not** invent now-line (2.3) or `docs/perf-notes/epg.md` (2.4)

- [x] Task 4: Interview study HTML (AC: #3)
  - [x] Create `docs/study/epic-2/2-2-epg-dpad-focus-and-program-select.html` (match on-disk epic-folder convention used by 2.1)
  - [x] Teach (interview-practical):
    - App-owned focus vs DOM `:focus` / `activeElement` on canvas grids
    - Axes: ↑↓ channels, ←→ time/programs; one visible focus indicator
    - `getDpadAction('select')` / Enter → detail; Back stack (detail → Surface root → Shell menu)
    - Why Visible Window must follow focus (reuse 2.1 math; don’t redraw 600 cells)
    - Honesty bounds: desktop Chromium keyboard proxy, not OEM remote / TV focus engine
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow 1.2–2.1 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 5: Smoke verify (AC: #1, #2)
  - [x] `pnpm typecheck` (shared + epg-canvas + shell) green
  - [x] `pnpm --filter shell build` green
  - [x] Manual on `http://localhost:5180`: Menu → **EPG** → arrows move focus with visible ring; Enter opens detail (title/time); Back closes detail (stays on EPG); Back again → menu + unmount; remount works; Home/Live/WebGL Lab still stub
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright install for this story (Epic 7)
  - [x] Confirm capture listener still removed with `{ capture: true }` / third-arg `true` parity (Epic 1 leak lesson)

### Review Findings

- [x] [Review][Patch] Detail panel as absolute overlay over stage (preserve Visible Window) [apps/shell/src/styles.css:250]
- [x] [Review][Patch] Holding Back while detail is open dismisses then leaves Surface [packages/epg-canvas/src/index.ts:332]
- [x] [Review][Patch] Enter with no program corrupts/wipes HUD flash [packages/epg-canvas/src/index.ts:262]
- [x] [Review][Defer] Overlapping programs can stick ←→ neighbor nav [packages/epg-canvas/src/focus.ts:102] — deferred, pre-existing

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-5 — visible D-pad focus across the EPG grid; Enter opens minimal program detail (title/time); Back dismisses detail before Shell leave; study HTML; README/docs honesty.

**Out of scope (later stories):**

- Now-line independent of grid rebuild → **2.3**
- `docs/perf-notes/epg.md` FPS write-up → **2.4**
- WebGL Lab → **3.1**
- Vitest for focus helpers / D-pad matrix → **7.1**
- Playwright D-pad smoke → **7.2**
- Cross-surface focus restore / soak → **6.x**
- React, production APIs, OEM remotes — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-1** No cross-surface framework imports | Stay in `epg-canvas` + `@tvshell/shared` only |
| **AD-3** Mock Data only | Resolve detail from shared `programs` / `channels` — no fetch |
| **AD-4** Shared D-pad map | Use `getDpadAction`; Enter=`select`; Back at Surface root → Shell; **detail open** is a nested Back layer owned by EPG |
| **AD-5** Visible Window | Focus moves must keep updating the window + redraw subset only |
| **AD-6** Cleanup on leave | Detail DOM + capture listener + RAF + ResizeObserver cleared on unmount |
| **AD-7** React forbidden | Vanilla TS + Canvas 2D + minimal DOM overlay |
| **AD-10** Test ladder | Manual smoke + typecheck/build; automated tests later |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`]

Canonical map: **FR-5 → `packages/epg-canvas`** (this story). FR-4 foundation already shipped in 2.1.

### Input ownership (preserve + extend)

```text
Menu mode                    → Shell menu focus
Surface + arrows             → EPG capture keydown → focus/window → redraw
Surface + Enter (select)     → EPG capture → open/update detail          ← NEW
Surface + Back, detail open  → EPG capture → dismiss detail (stop prop) ← NEW
Surface + Back, detail shut  → Shell bubble → host.leave() → unmount     ← PRESERVE
```

Shell today (`apps/shell/src/main.ts`): when Surface active, bubble handler only acts on `back` → `leave()`; it does not handle `select`. EPG must handle `select` itself. For nested Back, EPG must `stopPropagation` only while detail is open.

### Files being modified (UPDATE) — read before coding

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `packages/epg-canvas/src/index.ts` | Arrows move focus; **ignores `select`/`back`**; HUD; capture keydown; AD-6 dispose | Handle `select`; nested `back` when detail open; detail open/close; hint copy; optional program-boundary nav | Capture remove parity; Visible Window paint path; Shell Back when detail closed; `hasActiveSideEffects`; `[epg]` logs; no RAF spam |
| `packages/epg-canvas/src/render.ts` | Amber focus stroke when `focusTimeMs ∈ [start,end)` on focused channel | Stronger focus affordance if AC #1 needs it | `programsInVisibleWindow` input; gutter/row/`pxPerHour` scales; focus time cursor |
| `apps/shell/src/styles.css` | `.epg-canvas*` + `--focus: #fbbf24` | Detail panel styles | Safe Zone vars; menu/stub styles |
| `apps/shell/src/main.ts` | Back → leave when Surface active; arrows ignored by Shell | **Prefer no change** — nested Back stays inside EPG capture | Serialized host; registry; probes; modifier guard |
| `README.md` / `docs/index.md` | Next = create-story 2.2; study links may be flat/broken after epic-folder move | Honesty: 2.2 shipped; next 2.3; epic-2 study links | Getting started; no-React; study convention |

### Files being created (NEW)

| Path | Purpose |
| --- | --- |
| `packages/epg-canvas/src/detail.ts` (or equivalent) | Optional — open/close/render minimal title/time panel |
| `packages/epg-canvas/src/focus.ts` (or equivalent) | Optional — `findProgramAt` + adjacent-program helpers |
| `docs/study/epic-2/2-2-epg-dpad-focus-and-program-select.html` | Interview study DoD |

### Suggested target structure (after this story)

```text
packages/epg-canvas/src/
  index.ts     # UPDATE — select + nested back + detail lifecycle
  render.ts    # UPDATE — stronger focus if needed
  detail.ts    # NEW (optional module split)
  focus.ts     # NEW (optional — findProgramAt / neighbors)
apps/shell/src/styles.css          # UPDATE — detail panel
docs/study/epic-2/2-2-….html       # NEW
docs/index.md                      # UPDATE — link + next step
```

### Contract sketches (illustrative — adapt, don’t cargo-cult)

```ts
// Resolve program under focus (same half-open rule as render highlight)
function findProgramAt(
  channelId: string,
  timeMs: number,
  list: readonly Program[],
): Program | null {
  for (const p of list) {
    if (p.channelId !== channelId) continue;
    const start = Date.parse(p.start);
    const end = Date.parse(p.end);
    if (timeMs >= start && timeMs < end) return p;
  }
  return null;
}
```

```ts
// Inside EPG capture keydown (conceptual)
const action = getDpadAction(event);
if (!action) return;

if (detailOpen) {
  if (action === 'back') {
    event.preventDefault();
    event.stopPropagation();
    closeDetail();
    return;
  }
  if (action === 'select') { /* refresh or no-op */ return; }
  // Prefer ignore arrows while detail open
  return;
}

if (action === 'back') return; // Shell owns leave
if (action === 'select') {
  event.preventDefault();
  event.stopPropagation();
  openDetail(findProgramAt(...));
  return;
}
// arrows → handleAction (existing)
```

### Fixture facts (do not invent a second dataset)

| Fact | Value |
| --- | --- |
| Channels | **50** |
| Schedule | **24h** from `fixtureMeta.dayStart` (`2026-07-22T00:00:00.000Z`) |
| Blocks | **2h** → **12** programs/channel → **600** logical cells |
| Program fields for detail | `title`, `start`, `end` (+ `programId` / `channelId` if useful in HUD) |

[Source: `packages/shared/src/fixtures/index.ts`, `packages/shared/src/types/index.ts`]

### Anti-patterns (do not)

- Reinvent a D-pad key map or hardcode `event.key === 'Enter'` instead of `getDpadAction`
- Steal Shell Back when detail is **closed** (breaks leave → menu)
- Forget `stopPropagation` when detail is open (Back would leave + dismiss race / skip dismiss)
- Build DOM-per-cell grid or React detail route stack
- Open detail that survives `unmount` (AD-6 leak)
- Duplicate fixtures inside `epg-canvas`
- Implement now-line / Perf Note / Vitest / Playwright / Solid / React “to finish”
- Study HTML that only lists files changed
- Change Shell registry / other Surfaces

### Testing requirements (this story)

- Manual keyboard smoke on `:5180` (arrows, Enter detail, Back dismiss, Back leave, remount)
- `pnpm typecheck` + `pnpm --filter shell build`
- Optional tiny Node assert for `findProgramAt` (mirror 2.1 smoke style) — **not** required; Vitest still **7.1**
- Keep EPG `data-testid`s: `epg-canvas`, `epg-hud`, `epg-stage`, `epg-grid`; add `epg-detail`

[Source: `docs/testing-strategy.md` — Canvas focus via HUD/hooks, not `document.activeElement`]

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear modules over clever abstractions
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)
- On-disk study/story paths use **`docs/study/epic-N/`** and **`_bmad-output/implementation-artifacts/epic-N/`** even if older docs still show flat paths

### Previous story intelligence (2.1)

- Delivered: `@tvshell/epg-canvas` + shared Visible Window math; HUD `drawn ≪ logical`; minimal arrow focus (30 min); Shell registry-swaps only `epg`; Back stays with Shell
- Explicit handoff: “Full FR-5 focus UX + Enter program detail panel → **2.2**”
- Patterns to reuse: capture `keydown` + matching remove; RAF-coalesced paint; ResizeObserver; `programsInVisibleWindow`; `[epg]` prefix; study HTML DoD
- Review patches already applied (preserve): host-sized viewport; shared draw filter; focus cursor `pxPerHour`; probe honesty; schedule/context guards; canvas resize only when layout changes
- Deferred (do **not** expand into 2.2): Node smoke package script → 7.1; `devicePixelRatio`; precompute `Date.parse`

[Source: `_bmad-output/implementation-artifacts/epic-2/2-1-epg-canvas-visible-window-math.md`]
[Source: `_bmad-output/implementation-artifacts/deferred-work.md`]

### Git intelligence

Recent commits:

- `6a9635c` / `75fd96d` — Add EPG canvas package with Visible Window math for Story 2.1
- `723cf16` — Add Surface host mount/unmount contract and close Epic 1
- `15a2847` — Safe Zone shell chrome + focusable menu (1.3)
- `a8dd356` — Shared fixtures + D-pad key map (1.2)

Patterns: small focused modules, workspace `exports` → `./src/index.ts`, README honesty, vanilla TS, no React, study HTML as DoD. Commit title style when asked later: `Add <capability> for Story X.Y.`

### Latest tech notes (2026-07-23)

- **App-owned focus:** Canvas grids cannot rely on DOM focus traversal; keep one `(channel, time)` cursor and paint a high-contrast ring ([Android TV navigation](https://developer.android.com/training/tv/get-started/navigation) — always one clear focused target).
- **2D EPG axes:** Vertical = channels; horizontal = time/program cells (program-boundary **or** fixed time step both valid; Roku TimeGrid keeps focus time when changing channel).
- **Virtualized focus:** After each move, recompute Visible Window then redraw — do not search recycled DOM nodes.
- **Back:** TV users expect Back to peel one layer (detail → grid → menu), not jump straight out while a panel is open.
- **Stack:** Vite **6.4.3**, TypeScript **5.9.3**, pnpm **9.0.5**. SolidJS / Vitest **not installed** — do not add them here. No canvas/spatial-nav libraries.

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 2.2 |
| --- | --- |
| 2.3 Now-line | Detail/focus state separable from a thin overlay pass |
| 2.4 Perf Note | Demo path: arrows + select without breaking draw accounting |
| 6.1 Nav hardening | Predictable Back stack; focus restore hooks later |
| 7.2 Playwright | `data-testid="epg-detail"` + HUD focus text |

### Deferred work (do not expand into this story)

From `_bmad-output/implementation-artifacts/deferred-work.md`:

- Visible Window Node smoke package script / HiDPI / Date.parse precompute → later / 7.1
- Menu FSM unit tests / full D-pad matrix Vitest → **7.1**
- Dual TS pins / root tooling catalog → process debt

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2 / Story 2.2]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-5, UJ-1]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-4–AD-7, AD-10]
- [Source: `_bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md` — D-pad / focus-first]
- [Source: `_bmad-output/implementation-artifacts/epic-2/2-1-epg-canvas-visible-window-math.md`]
- [Source: `packages/epg-canvas/src/index.ts` — select deferred hook]
- [Source: `packages/epg-canvas/src/render.ts` — focus highlight rule]
- [Source: `packages/shared/src/input/index.ts` — Enter → `select`]
- [Source: `apps/shell/src/main.ts` — Surface Back → leave]
- [Source: `docs/testing-strategy.md`]
- [Source: `docs/study-guides.md`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `pnpm typecheck` — pass (shared, surface-stub, epg-canvas, shell)
- `pnpm --filter shell build` — pass
- Browser `:5180`: EPG HUD `focused: Channel 1 Show 1`; arrows → `Channel 2 Show 2`; Enter → detail `02:00–04:00 UTC`; Escape → detail closed, EPG stays; Escape → `Left epg. Side effects cleared.`

### Completion Notes List

- Added pure focus helpers (`findProgramAt`, `adjacentProgramFocusTime`) and program-boundary ←→ nav with ↑↓ column affinity.
- Wired `select` → minimal DOM detail panel (title/time); nested Back dismisses detail via capture `stopPropagation`; Surface-root Back still Shell-owned.
- Strengthened canvas focus affordance (thicker amber ring, brighter fill, HUD `focused: {title}`).
- Study HTML + README/`docs/index.md` honesty (epic-folder study links); no Vitest/Playwright/React; now-line/Perf Note deferred.

### File List

- `packages/epg-canvas/src/index.ts`
- `packages/epg-canvas/src/focus.ts`
- `packages/epg-canvas/src/detail.ts`
- `packages/epg-canvas/src/render.ts`
- `apps/shell/src/styles.css`
- `README.md`
- `docs/index.md`
- `docs/study/epic-2/2-2-epg-dpad-focus-and-program-select.html`
- `_bmad-output/implementation-artifacts/epic-2/2-2-epg-dpad-focus-and-program-select.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-23: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-23: Code review patches applied (detail overlay, Back repeat latch, HUD flash); status → done
