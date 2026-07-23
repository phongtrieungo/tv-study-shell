---
baseline_commit: 02365faAdd EPG now-line indicator for Story 2.3.
---

# Story 2.4: EPG Perf Note

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a documented Perf Note for EPG,
so that interview claims are measured (FR-7, AD-8).

## Acceptance Criteria

1. **Given** EPG running in a named browser  
   **When** I capture FPS and/or draw counts while scrolling  
   **Then** `docs/perf-notes/epg.md` exists with environment labeled  

2. **And** README links to it (Perf Notes table status flips from Planned → done / measured)

3. **And** a practical interview study HTML exists at `docs/study/epic-2/2-4-epg-perf-note.html`, linked from `docs/index.md` (teaches how to measure and talk about EPG virtualization evidence — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Measure EPG on a named desktop Chromium proxy (AC: #1)
  - [x] Run Shell (`pnpm dev` / `:5180`), Menu → **EPG**
  - [x] Record **environment** before numbers: browser + version, OS, machine class (e.g. “Apple Silicon laptop / discrete GPU / mid-range Chromebook”), viewport ~1920×1080 if practical
  - [x] Capture **draw accounting** already shipped by 2.1:
    - HUD: `drawn N ≪ logical 600` (and/or `[epg] visible window` console log with `drawnCells` / `logicalCells`)
    - Note typical drawn range while idle and while holding ↑↓/←→ (window changes)
  - [x] Capture **FPS and/or frame smoothness** while scrolling/focusing:
    - Preferred: Chrome DevTools → Command Menu → **Show Rendering** → enable **Frame rendering stats** (FPS overlay); observe while holding arrows across channels/time
    - Optional companion: Performance panel short recording during arrow spam; note long tasks if any
    - Optional stress: CPU throttle **4×–6×** per `docs/testing-strategy.md` “Chrome poor man’s TV” — record both unthrottled and throttled if useful
  - [x] Observe (and note) that **now-line ticks** (2.3) do **not** imply full grid rebuilds — chrome moves with `model stable` / tick counter while fixtures stay the imported `@tvshell/shared` arrays. Do not invent a second measurement that contradicts this.

- [x] Task 2: Write `docs/perf-notes/epg.md` (AC: #1)
  - [x] Create directory `docs/perf-notes/` if missing
  - [x] Follow a reusable template (this is the **first** Perf Note — later 3.2 / 4.4 / 6.2 will mirror it):
    - Title + date of measurement
    - **Environment** block (required by NFR / AD-8)
    - **Method** (how FPS/draw were captured — DevTools path, throttle, scenario)
    - **Results** table or bullets: logical cells, drawn cells (range), FPS / smoothness notes, throttle notes
    - **Interpretation** (interview-facing): Visible Window virtualization evidence; coalesced RAF paints on focus/resize; separated now-line chrome
    - **Honesty bounds**: desktop Chromium proxy ≠ OEM TV memory/FPS; not a certification claim; no unlabeled “60 FPS forever”
  - [x] Prefer real measured numbers from Task 1 over placeholders. If a machine quirk blocks FPS overlay, draw counts alone still satisfy FR-7 (“FPS **and/or** draw counts”) — say so explicitly.
  - [x] Do **not** claim physical-TV or Tizen/webOS numbers (those belong later under emulator/device notes).

- [x] Task 3: Wire README + docs index (AC: #2)
  - [x] `README.md` Perf notes table: `docs/perf-notes/epg.md` status → **Done** (or “Measured”) with a short phrase; keep other rows Planned
  - [x] Ensure Getting started / Surfaces honesty still matches shipped EPG (2.1–2.3) + this note
  - [x] `docs/index.md`: link the study HTML; next step → **Epic 3 / Story 3.1** (create-story), mention optional `epic-2-retrospective` + epic synthesis HTML per `docs/study-guides.md`
  - [x] Do **not** invent `canvas-vs-webgl.md` / `home.md` / `memory-soak.md` content here

- [x] Task 4: Interview study HTML (AC: #3)
  - [x] Create `docs/study/epic-2/2-4-epg-perf-note.html` (match epic-folder convention)
  - [x] Teach (interview-practical):
    - Why Perf Notes are first-class (AD-8) — unlabeled FPS is a credibility fail
    - What to measure on EPG: **draw accounting** (logical 600 vs drawn ≪) + **interaction FPS** under D-pad scroll
    - How to measure in Chrome (Frame rendering stats / Performance) + throttle checklist
    - What the numbers prove vs what they don’t (desktop proxy; 30 FPS floor vs aspirational 60 from domain research)
    - Separated paths: focus→Visible Window→paint vs now-line chrome ticks (ties 2.1–2.3 together)
    - Foreshadow: Canvas vs WebGL note (3.2), Home note (4.4), memory soak (6.2) — same folder, same honesty rules
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow 2.1–2.3 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 5: Optional measurement aid (only if Task 1 is painful — not required by epic AC)
  - [x] Skipped — Task 1 draw accounting + labeled idle rAF cadence were sufficient; no in-app FPS HUD added
  - [x] Did **not** add a continuous RAF render loop for FPS
  - [x] Did **not** install Vitest/Playwright/React or new deps

- [x] Task 6: Smoke verify (AC: #1, #2, #3)
  - [x] Confirm `docs/perf-notes/epg.md` exists, has labeled environment, and contains FPS **and/or** draw-count evidence from a real run
  - [x] Confirm README links and table status updated
  - [x] Confirm study HTML linked from `docs/index.md`
  - [x] `pnpm typecheck` + `pnpm --filter shell build` green (even if code unchanged — prove no accidental break)
  - [x] Manual: EPG still mounts; HUD draw counts still make sense; now-line / focus / detail / Back unchanged
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright install; no new Surface packages

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-7 / AD-8 — labeled EPG Perf Note under `docs/perf-notes/epg.md`; README link + status; measurement procedure using the **already shipped** EPG (2.1–2.3); study HTML; docs honesty; optional tiny measurement aid only if needed.

**Out of scope (later stories):**

- Canvas vs WebGL comparison note → **3.2** (`docs/perf-notes/canvas-vs-webgl.md`)
- Home Perf Note → **4.4** (README says `home.md`; epics say `home-blits.md` — **not this story’s problem**)
- Memory soak → **6.2**
- Vitest / Playwright → **7.1 / 7.2**
- Emulator notes → **7.3**
- Epic 2 synthesis HTML → **epic-2-retrospective** (optional in sprint-status) per `docs/study-guides.md`
- HiDPI `devicePixelRatio`, Date.parse precompute, overlapping ←→ stickiness → `deferred-work.md` (do not expand)
- React, production schedule APIs, OEM remotes, physical-TV certification — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-5** Visible Window | Perf Note must cite draw accounting (`drawn ≪ logical`) as primary virtualization evidence |
| **AD-6** Cleanup on leave | Optional mention only — soak ownership is 6.2; do not invent soak procedure here |
| **AD-7** React forbidden | No React profiler stories; Chrome DevTools + Canvas Surface |
| **AD-8** Perf Notes first-class | Artifact lives in `docs/perf-notes/`; environment labeled; README links |
| **AD-10** Test ladder | Perf Notes are documented measurements, **not** CI E2E gates |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`]

Canonical map: **FR-7 → `docs/perf-notes/epg.md`** (with EPG Surface in `packages/epg-canvas` as the thing measured). FR-4–FR-6 already shipped.

### What “environment labeled” means (must not skip)

Every result block needs at least:

| Field | Example |
| --- | --- |
| Browser | Chromium / Chrome **version** |
| OS | macOS / Windows / Linux + version class |
| Machine class | laptop / desktop; CPU/GPU class in plain language |
| Proxy honesty | “Desktop Chromium + keyboard-as-D-pad — not OEM TV hardware” |
| Scenario | e.g. “hold ArrowDown across ~20 channels; viewport ~1080p Safe Zone stage” |
| Date | measurement date |

PRD NFR: “Perf Notes must label environment (browser, machine class).” Unlabeled FPS is explicitly called out as an anti-pattern in the PRD (“60 FPS claims without measurement environment”).

### What already exists to measure (do not reinvent)

| Evidence | Where | Notes |
| --- | --- | --- |
| Logical cell count | HUD + `countLogicalProgramCells` → **600** | 50 channels × 12 programs (2h blocks / 24h) |
| Drawn cell count | HUD `drawn N ≪ logical 600`; `[epg] visible window` log | Updates on window key change |
| Coalesced paints | `schedulePaint` / `requestAnimationFrame` in `index.ts` | Not a continuous render loop |
| Now-line chrome | DOM overlay + 1s timer; HUD `model stable` / ticks | Tick path skips `programsInVisibleWindow` |
| Focus scroll | ↑↓/←→ → Visible Window recompute → paint | Primary “while scrolling” load |

[Source: `packages/epg-canvas/src/index.ts`, `packages/shared/src/fixtures/index.ts`]

### Suggested `docs/perf-notes/epg.md` skeleton

```markdown
# EPG Perf Note (Canvas Visible Window)

**Measured:** YYYY-MM-DD  
**Surface:** `packages/epg-canvas` (Stories 2.1–2.3)

## Environment

- Browser:
- OS:
- Machine class:
- Viewport / notes:
- Honesty: desktop Chromium proxy (keyboard-as-D-pad). Not Tizen/webOS device FPS.

## Method

1. `pnpm dev` → Menu → EPG
2. Read HUD draw counts (and optional `[epg] visible window` logs)
3. DevTools → Rendering → Frame rendering stats; hold arrows to change Visible Window
4. Optional: CPU 4×–6× throttle; repeat

## Results

| Metric | Value |
| --- | --- |
| Logical program cells | 600 |
| Drawn cells (typical) | … |
| FPS / frame stats (idle) | … |
| FPS / frame stats (arrow scroll) | … |
| Throttled (if run) | … |

## Interpretation

- Drawn ≪ logical demonstrates Visible Window virtualization (FR-4 / AD-5).
- Paints coalesce on focus/resize; now-line ticks are chrome-only (FR-6).
- Numbers are learning evidence for interviews — not OEM certification.

## Follow-ons

- Canvas vs WebGL: Story 3.2
- Memory soak across Surfaces: Story 6.2
```

Adapt freely; keep environment + method + numbers + honesty.

### Files being created (NEW)

| Path | Purpose |
| --- | --- |
| `docs/perf-notes/epg.md` | **Primary deliverable** — labeled FPS and/or draw counts |
| `docs/study/epic-2/2-4-epg-perf-note.html` | Interview study DoD |

### Files being modified (UPDATE)

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `README.md` | Perf table: `epg.md` **Planned**; Getting started mentions 2.4 next | Flip epg row to Done/Measured; link stays `docs/perf-notes/epg.md`; next-step honesty → Epic 3 | Surfaces table; no-React; other Planned rows |
| `docs/index.md` | Next = create-story 2.4; study links through 2.3 | Link 2.4 study; next → 3.1 / optional epic-2 retro | Planning artifact table; study-guides convention |
| `packages/epg-canvas/src/index.ts` | Full EPG Surface 2.1–2.3 | **Prefer no change**; optional tiny paint-timing HUD only if needed | Capture remove parity; now-line chrome path; focus/detail; AD-6 dispose/probe |
| `apps/shell/src/styles.css` | EPG + now-line styles | Prefer no change | Safe Zone; menu; detail |

### Files NOT to touch (unless fixing a blocker)

- `packages/epg-canvas/src/{render,focus,now-line,detail}.ts` — feature-complete for Epic 2
- `packages/shared/**` — math/fixtures already done
- `apps/shell/src/main.ts` — registry already swapped for `epg`
- Other Perf Note files / WebGL Lab / Home / Live packages

### Anti-patterns (do not)

- Ship `epg.md` with placeholder “TBD FPS” and no draw counts either (fails FR-7)
- Publish FPS **without** browser/OS/machine labels (fails AD-8 / NFR)
- Claim OEM TV or “production 60 FPS” from a laptop Chrome run
- Add a continuous full-grid RAF loop just to generate FPS numbers
- Rebuild fixtures or change Visible Window math “for perf”
- Invent Canvas vs WebGL / soak / Vitest / Playwright “to finish”
- Study HTML that only lists files changed
- Change Shell registry / other Surfaces
- Rename README’s future `home.md` vs epics’ `home-blits.md` in this story

### Testing requirements (this story)

- Measurement procedure is the test — document it in the Perf Note
- `pnpm typecheck` + `pnpm --filter shell build` if any code touched (and recommended even if docs-only)
- Manual: EPG still demoable after docs work
- No new automated test framework (Epic 7)

[Source: `docs/testing-strategy.md`]

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear docs + honest numbers over clever tooling
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)
- On-disk study/story paths use **`docs/study/epic-N/`** and **`_bmad-output/implementation-artifacts/epic-N/`**

### Previous story intelligence (2.1–2.3)

**2.1 delivered:** `@tvshell/epg-canvas` + shared Visible Window math; HUD `drawn ≪ logical`; RAF-coalesced paint; registry-swap `epg` only. Explicit handoff: do **not** invent Perf Note yet → **2.4**.

**2.2 delivered:** `focus.ts` / `detail.ts`; program-boundary ←→; Enter detail; nested Back latch; stronger amber focus.

**2.3 delivered:** `now-line.ts` + DOM overlay; demo clock remap into fixture day; ~60× teaching accel; chrome-only ticks (`model stable`); AD-6 timer in `hasActiveSideEffects`. Explicit handoff: Perf Note → **2.4**.

**Patterns to reuse:**

- Honesty-first README / `docs/index.md` updates
- Study HTML under `docs/study/epic-2/` with interview mental models
- `[epg]` log prefix; HUD as teaching surface
- No Vitest/Playwright/React this epic
- Commit title style when asked later: `Add <capability> for Story X.Y.`

**Deferred (do not expand):** overlapping ←→ stickiness; Node smoke package script; HiDPI; Date.parse precompute; `demoNowMs` Vitest → 7.1.

[Source: `_bmad-output/implementation-artifacts/epic-2/2-1-epg-canvas-visible-window-math.md`]
[Source: `_bmad-output/implementation-artifacts/epic-2/2-2-epg-dpad-focus-and-program-select.md`]
[Source: `_bmad-output/implementation-artifacts/epic-2/2-3-epg-now-line-indicator.md`]
[Source: `_bmad-output/implementation-artifacts/deferred-work.md`]

### Git intelligence

Recent commits:

- `02365fa` — Add EPG now-line indicator for Story 2.3
- `f5ae4e6` — Add EPG D-pad focus and program select for Story 2.2
- `6a9635c` / `75fd96d` — Add EPG canvas package with Visible Window math for Story 2.1
- `723cf16` — Surface host mount/unmount (Epic 1 close)

Patterns: focused modules, vanilla TS, README honesty, study HTML as DoD, docs-heavy stories still get typecheck/build smoke when code is touched.

### Latest tech notes (2026-07-23)

- **Chrome Frame rendering stats:** Command Menu → Show Rendering → enable Frame rendering stats (FPS overlay). Overlay is DevTools-only — not readable from page JS. Prefer documenting the overlay + HUD draw counts over inventing a production FPS API.
- **Optional in-app FPS:** counting `requestAnimationFrame` callbacks per second is a teaching aid only; it measures compositor cadence ceiling, not spare frame budget. Do not force a continuous paint loop.
- **Domain research:** target **stable ~30 FPS** UI floor on constrained hardware; **60 FPS** aspirational for interactions; prefer RAF; document desktop numbers honestly.
- **Technical research:** “Measure → fix → verify” with Performance + Memory panels; EPG lore = virtualize / custom-draw / pool — already implemented; this story **documents** it.
- **Stack pins:** Vite **6.4.3**, TypeScript **5.9.3**, pnpm **9.0.5**. SolidJS / Vitest / Playwright **not installed** — do not add them here.

### Downstream consumers (do not implement, but design the note for)

| Consumer | Needs from 2.4 |
| --- | --- |
| 3.2 Canvas vs WebGL | Same env-label + method shape so comparison is apples-to-apples |
| 4.4 / 6.2 other notes | Folder + template convention established |
| 6.3 README finalization | Perf table already links a real `epg.md` |
| Epic 2 retrospective | Synthesis HTML can link this study + Perf Note |

### Deferred work (do not expand into this story)

From `_bmad-output/implementation-artifacts/deferred-work.md`:

- Automated tests for `demoNowMs` / `nowXPx` → **7.1**
- Overlapping programs ←→ stickiness → later / 7.x
- Visible Window Node smoke package script / HiDPI / Date.parse precompute → later / 7.1
- Dual TS pins / root tooling catalog → process debt

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 2 / Story 2.4]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-7, NFR environment labeling]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-8]
- [Source: `_bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md` — FPS budgets]
- [Source: `_bmad-output/planning-artifacts/research/technical-tv-ui-stack-lightning-solidjs-canvas-webgl-research-2026-07-22.md` — measure → verify]
- [Source: `docs/testing-strategy.md` — Chrome throttle checklist]
- [Source: `docs/study-guides.md` — study HTML DoD]
- [Source: `README.md` — Perf notes table]
- [Source: `packages/epg-canvas/src/index.ts` — HUD / paint / now-line]
- [Source: `_bmad-output/implementation-artifacts/epic-2/2-3-epg-now-line-indicator.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Measured on Vite `:5181` (existing Shell); Menu → EPG mount.
- HUD samples: `drawn 30 ≪ logical 600` (ch 1–10) and `drawn 20 ≪ logical 600` (ch 15–24); now-line ticks advanced with `model stable`.
- Idle rAF ~120–122/s on ProMotion — documented as display cadence, not grid paint rate.
- `pnpm typecheck` + `pnpm --filter shell build` green; no Surface code changes.

### Completion Notes List

- Created first Perf Note at `docs/perf-notes/epg.md` with labeled environment (Cursor Chromium 144 / macOS 26.5.2 / M3 Pro) and real draw counts 20–30 ≪ 600.
- README Perf table → **Measured**; status/getting-started honesty updated; study HTML + docs/index links.
- Optional in-app FPS aid skipped — draw accounting satisfies FR-7; avoided continuous RAF paint loop.
- Epic 2 feature stories complete; next = optional epic-2-retrospective or create-story 3.1.

### File List

- docs/perf-notes/epg.md (new)
- docs/study/epic-2/2-4-epg-perf-note.html (new)
- README.md
- docs/index.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/epic-2/2-4-epg-perf-note.md

## Change Log

- 2026-07-23: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-23: Implemented FR-7 EPG Perf Note (measured docs + study HTML) — status → review
- 2026-07-23: Epic 2 retrospective closed — status → done
