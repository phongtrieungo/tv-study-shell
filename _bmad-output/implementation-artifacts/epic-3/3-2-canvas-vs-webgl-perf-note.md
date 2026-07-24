---
baseline_commit: 340b926Add WebGL Lab package and update related documentation.
---

# Story 3.2: Canvas vs WebGL Perf Note

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a side-by-side Perf Note for Canvas EPG vs WebGL Lab,
so that I can defend GPU vs CPU trade-offs in interviews (FR-16).

## Acceptance Criteria

1. **Given** both EPG Canvas and WebGL Lab run on the same machine  
   **When** I capture FPS and/or CPU/draw framing while scrolling  
   **Then** `docs/perf-notes/canvas-vs-webgl.md` exists with environment labeled  

2. **And** README links to it (Perf Notes table status flips from Planned → Measured / Done for the canvas-vs-webgl row)

3. **And** a practical interview study HTML exists at `docs/study/epic-3/3-2-canvas-vs-webgl-perf-note.html`, linked from `docs/index.md` (teaches how to compare Canvas vs WebGL honestly — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Same-machine measure — EPG Canvas + WebGL Lab (AC: #1)
  - [x] Run Shell (`pnpm dev` / `:5180`), record **one** Environment block **before** numbers: browser + version, OS, machine class, viewport/DPR, proxy honesty, date
  - [x] **EPG path** (Menu → **EPG**):
    - Read HUD `drawn N ≪ logical 600` (and optional `[epg] visible window` log)
    - Arrow-scroll ↑↓/←→; record drawn band while the Visible Window moves
    - Optional: Chrome DevTools → Command Menu → **Show Rendering** → **Frame rendering stats** while holding arrows; optional CPU throttle **4×–6×** per `docs/testing-strategy.md`
  - [x] **WebGL Lab path** (Menu → **WebGL Lab**) on the **same** browser/OS/machine session (or immediate remeasure — do not mix machines):
    - Read HUD `drawn N ≪ logical 600` + `context webgl2|webgl`
    - Arrow-scroll; record drawn band
    - Note draw-call / CPU framing: one batched `drawArrays` per coalesced paint vs Canvas 2D per-cell ops (see `packages/webgl-lab/src/render.ts`)
    - Optional: same Frame rendering stats / throttle as EPG
  - [x] Prefer reusing the 2.4 env shape (`docs/perf-notes/epg.md`) if still accurate on this machine; otherwise remeasure **both** Surfaces fresh in one session so the compare is apples-to-apples
  - [x] Do **not** invent a continuous full-grid RAF loop “for FPS” on either Surface

- [x] Task 2: Write `docs/perf-notes/canvas-vs-webgl.md` (AC: #1)
  - [x] Mirror `docs/perf-notes/epg.md` section skeleton, extended to **side-by-side**:
    - Title + **Measured** date + Surfaces + Requirement (**FR-16 / AD-8**)
    - **Environment** (shared — one table for both Surfaces)
    - **Method** — EPG steps + WebGL Lab steps (Menu IDs, HUD/logs, DevTools path)
    - **Results** — comparison table (logical 600 both; drawn ranges; context API; paint model; optional FPS/frame stats; optional throttle)
    - **Interpretation** — interview defense of GPU vs CPU trade-offs; same VW math / different renderer; batching vs Canvas 2D ops
    - **Honesty bounds** — desktop proxy ≠ OEM TV; learning lab depth; do not claim “WebGL always faster on this laptop”
    - **Follow-ons** — 3.3 vocabulary; 4.4 Home; 6.2 soak; 7.3 emulator
    - **Reproduce** bash block (Menu → EPG then Menu → WebGL Lab)
  - [x] Prefer real measured numbers from Task 1. Draw accounting alone still satisfies FR-16 (“FPS and/or draw-call / CPU-time framing”) — say so if FPS overlay is blocked
  - [x] Do **not** invent `home.md` / `memory-soak.md` content; do **not** write FR-17 vocabulary essay (3.3)

- [x] Task 3: Wire README + docs index (AC: #2)
  - [x] `README.md` Perf notes table: `docs/perf-notes/canvas-vs-webgl.md` status → **Measured** (keep `epg.md` Measured; keep home/soak Planned)
  - [x] Update Status / Getting started honesty: Canvas vs WebGL note shipped; vocabulary README section still **3.3**
  - [x] `docs/index.md`: link study HTML + perf note; next step → **3.3** (WebGL vocabulary)
  - [x] Do **not** invent epic-3 synthesis HTML here (epic retrospective / closeout)

- [x] Task 4: Interview study HTML (AC: #3)
  - [x] Create `docs/study/epic-3/3-2-canvas-vs-webgl-perf-note.html`
  - [x] Teach (interview-practical):
    - Why AD-8 side-by-side exists (`docs/webgl-investment.md` trade-off line)
    - Same Visible Window math (`@tvshell/shared`) — windowing is a data problem; Canvas vs WebGL is a **renderer** choice
    - What to measure on each Surface: HUD `drawn ≪ logical` + optional Frame rendering stats + WebGL draw-call framing (1× `drawArrays` / paint)
    - How to measure both in one session (Menu switch; same env labels)
    - What the numbers prove vs don’t (virtualization on both paths; laptop ceiling ≠ TV SoC; not “GPU always wins”)
    - Demo script: Menu → EPG HUD → arrows → Menu → WebGL Lab HUD → arrows → quote env + drawn bands
    - Foreshadow **3.3** vocabulary (buffers/textures/shaders/draw calls) using the lab as example
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow 2.4 / 3.1 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 5: Optional measurement aid (only if Task 1 is painful — not required by epic AC)
  - [x] Default: **skip** — both Surfaces already ship draw-accounting HUDs
  - [x] If somehow blocked: tiny optional paint-timing note in the Perf Note method only — do **not** add continuous RAF paint loops or new deps
  - [x] Do **not** install Vitest/Playwright/React/Three.js

- [x] Task 6: Smoke verify (AC: #1, #2, #3)
  - [x] Confirm `docs/perf-notes/canvas-vs-webgl.md` exists, has labeled environment, and contains FPS **and/or** draw-call / CPU-time framing from a real same-machine run
  - [x] Confirm README links and table status updated
  - [x] Confirm study HTML linked from `docs/index.md`
  - [x] `pnpm typecheck` + `pnpm --filter shell build` green (even if code unchanged)
  - [x] Manual: Menu → EPG and Menu → WebGL Lab still mount; HUDs still show `drawn ≪ logical`; Back / remount unchanged
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright install; no Surface package refactors “for perf”

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-16 / AD-8 — labeled side-by-side Perf Note at `docs/perf-notes/canvas-vs-webgl.md`; same-machine measurement of already-shipped EPG + WebGL Lab; README link + status; study HTML; docs honesty.

**Out of scope (later stories):**

- WebGL vocabulary README / companion section (FR-17) → **3.3**
- Home Perf Note → **4.4**
- Memory soak → **6.2**
- Vitest / Playwright → **7.1 / 7.2**
- Emulator notes → **7.3**
- Epic 3 synthesis HTML → **epic-3-retrospective** (optional) per `docs/study-guides.md`
- HiDPI / Date.parse / overlapping ←→ polish → `deferred-work.md` (**do not expand into Epic 3 unless blocked**)
- React, Three.js, continuous RAF “FPS mills”, OEM TV certification — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-5** Visible Window | Cite `drawn ≪ logical` on **both** Surfaces as virtualization evidence |
| **AD-8** Perf Notes first-class | Artifact under `docs/perf-notes/`; environment labeled; README links |
| **AD-9** Raw WebGL Lab | Measure `packages/webgl-lab` as-is; do not replace Blits or rewrite Lab |
| **AD-1** Package boundaries | Do not import `epg-canvas` from `webgl-lab` or vice versa “to unify metrics” |
| **AD-7** React forbidden | Chrome DevTools + existing HUDs only |
| **AD-10** Test ladder | Documented measurements, **not** CI gates; no Vitest/Playwright install |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`]

Canonical map: **FR-16 → `docs/perf-notes/canvas-vs-webgl.md`** measuring `packages/epg-canvas` + `packages/webgl-lab`.

### What “environment labeled” means (must not skip)

Every result block needs at least:

| Field | Example |
| --- | --- |
| Browser | Chromium / Chrome **version** |
| OS | macOS / Windows / Linux + version class |
| Machine class | laptop / desktop; CPU/GPU class in plain language |
| Proxy honesty | “Desktop Chromium + keyboard-as-D-pad — not OEM TV hardware” |
| Scenario | “same session: Menu→EPG then Menu→WebGL Lab; arrow scroll; HUD draw counts” |
| Date | measurement date |

PRD NFR: “Perf Notes must label environment (browser, machine class).” Unlabeled “60 FPS” is a counter-metric / anti-pattern.

### What already exists to measure (do not reinvent)

| Evidence | EPG (`epg-canvas`) | WebGL Lab (`webgl-lab`) |
| --- | --- | --- |
| Logical cells | HUD → **600** | HUD → **600** (same `fixtureMeta`) |
| Drawn cells | `drawn N ≪ logical 600` | same shape + `context webgl2\|webgl` |
| Console | `[epg] visible window` | `[webgl] visible window` |
| Paint model | Coalesced RAF on focus/resize/detail | Coalesced RAF on focus/resize |
| GPU/CPU framing | Many Canvas 2D ops per paint | **One** batched `drawArrays(TRIANGLES, …)` per Visible Window paint |
| Nav differences (honesty) | Program-boundary ←→ (2.2); now-line ticks | Fixed 2h `TIME_STEP_MS`; focus cursor quad; no now-line; atlas colors (no `fillText`) |

[Source: `packages/epg-canvas/src/index.ts`, `packages/webgl-lab/src/index.ts`, `packages/webgl-lab/src/render.ts`, `docs/perf-notes/epg.md`]

**Reuse 2.4 numbers only if same machine/session class.** Prefer one fresh dual-Surface run so FR-16 “same machine” is literal.

### Suggested `docs/perf-notes/canvas-vs-webgl.md` skeleton

```markdown
# Canvas vs WebGL Perf Note

**Measured:** YYYY-MM-DD  
**Surfaces:** `packages/epg-canvas` (2.1–2.4) vs `packages/webgl-lab` (3.1)  
**Requirement:** FR-16 / AD-8

## Environment

| Field | Value |
| --- | --- |
| Browser | … |
| OS | … |
| Machine class | … |
| Viewport | … |
| Scenario | Same session: Menu → EPG → arrows; Menu → WebGL Lab → arrows |
| Honesty | Desktop Chromium proxy (keyboard-as-D-pad). Not Tizen/webOS device FPS. |

## Method

1. `pnpm dev` → Menu → **EPG** → HUD + optional Frame rendering stats
2. Menu → **WebGL Lab** → HUD (`context …`) + same DevTools path
3. Optional: CPU 4×–6× throttle; repeat both

## Results

| Metric | Canvas EPG | WebGL Lab |
| --- | --- | --- |
| Logical program cells | 600 | 600 |
| Drawn cells (observed) | … | … |
| Context / API | Canvas 2D | webgl2 / webgl |
| Draw-call framing / paint | many 2D ops | 1× drawArrays (batched quads) |
| Idle compositor rAF (if sampled) | … (display cadence only) | … |
| Grid paint model | Coalesced RAF | Coalesced RAF |
| Subjective scroll | … | … |

**FR-16 coverage:** Draw accounting + draw-call framing are primary; FPS overlay optional.

## Interpretation

- Same VW math (`@tvshell/shared`) — virtualization is renderer-agnostic.
- Canvas teaches CPU path simplicity; WebGL teaches GPU pipeline + batching.
- Numbers defend trade-offs — not “WebGL always faster on this laptop.”

## Honesty bounds

- Learning / portfolio evidence, not store certification.
- Desktop Chromium ≠ OEM TV Chromium year / GPU / memory.
- Do not quote unlabeled “60 FPS forever.”

## Follow-ons

| Story | Artifact |
| --- | --- |
| 3.3 | WebGL vocabulary README / companion |
| 4.4 | Home Perf Note |
| 6.2 | memory-soak.md |
| 7.3 | Emulator dry-run notes |

## Reproduce

```bash
pnpm install
pnpm dev
# Menu → EPG → HUD → arrows; then Menu → WebGL Lab → HUD → arrows
```
```

Adapt freely; keep shared environment + dual method + comparison numbers + honesty.

### Files being created (NEW)

| Path | Purpose |
| --- | --- |
| `docs/perf-notes/canvas-vs-webgl.md` | **Primary deliverable** — labeled same-machine compare |
| `docs/study/epic-3/3-2-canvas-vs-webgl-perf-note.html` | Interview study DoD |

### Files being modified (UPDATE)

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `README.md` | Perf table: `canvas-vs-webgl.md` **Planned**; Status says 3.2/3.3 still pending | Flip canvas-vs-webgl → Measured; honesty → 3.3 next | Surfaces table; no-React; `epg.md` Measured; other Planned rows |
| `docs/index.md` | Next = implement 3.2; study links through 3.1 | Link 3.2 study + perf note; next → **3.3** | Planning artifact table; study-guides convention |
| `packages/epg-canvas/**` | Full EPG + HUD | **Prefer no change** | Focus / now-line / detail / AD-6 |
| `packages/webgl-lab/**` | FR-15 Lab + HUD | **Prefer no change** | Context acquire, disposeGpu, batched draw |
| `apps/shell/**` | Registry: epg + webgl-lab live | Prefer no change | Registry / Safe Zone / Back |

### Files NOT to touch (unless fixing a blocker)

- `packages/shared/**` — VW math/fixtures already correct
- `docs/webgl-investment.md` — orientation only; do not rewrite as FR-17 essay
- `docs/perf-notes/epg.md` — may add a one-line “see also canvas-vs-webgl” if useful; do not rewrite 2.4 results
- Other Perf Note files / Home / Live / Vitest packages

### Anti-patterns (do not)

- Ship `canvas-vs-webgl.md` with placeholder “TBD” and no draw counts (fails FR-16)
- Publish FPS **without** browser/OS/machine labels (fails AD-8 / NFR)
- Compare Surfaces measured on **different** machines without saying so (violates AC Given)
- Claim OEM TV or “production 60 FPS” / “WebGL always wins” from a laptop Chrome run
- Add a continuous full-grid RAF loop just to mint FPS on either Surface
- Confuse idle compositor rAF (~120 on ProMotion) with grid paint rate
- Invent FR-17 vocabulary essay, `home.md`, or soak procedure here
- Study HTML that only lists files changed
- Import across Surfaces or add React/Three.js “for profiling”
- Expand Epic 2 deferred polish (HiDPI / Date.parse / overlapping nav) into this story

### Testing requirements (this story)

- Measurement procedure **is** the test — document it in the Perf Note
- `pnpm typecheck` + `pnpm --filter shell build` (recommended even if docs-only)
- Manual: both Surfaces still demoable after docs work
- No new automated test framework (Epic 7)

[Source: `docs/testing-strategy.md`]

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear docs + honest numbers over clever tooling
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)
- On-disk study/story paths use **`docs/study/epic-N/`** and **`_bmad-output/implementation-artifacts/epic-N/`**

### Previous story intelligence (3.1 + 2.4)

**3.1 delivered:** `@tvshell/webgl-lab` — WebGL2-first (WebGL1 fallback), color atlas via `texImage2D`, VS/FS, one batched `drawArrays` for Visible Window quads; shared VW math; HUD `drawn ≪ logical` + `context`; coalesced RAF; registry-swap **only** `webgl-lab`. Explicit handoff: do **not** invent `canvas-vs-webgl.md` → **3.2**. Smoke sample: `drawn 24 ≪ logical 600 · context webgl2`.

**2.4 delivered:** First Perf Note template at `docs/perf-notes/epg.md` + study HTML; README Measured flip; optional in-app FPS **skipped** (draw accounting satisfied FR-7). Explicit handoff: 3.2 mirrors env-label + method shape.

**Patterns to reuse:**

- Docs-first ship; prefer **zero** Surface code changes
- Environment → Method → Results → Interpretation → Honesty → Follow-ons → Reproduce
- Study HTML: mental model → how to measure → whiteboard → proves/doesn’t → demo script
- `[epg]` / `[webgl]` log prefixes; HUD as teaching surface
- Commit title style when asked later: `Add <capability> for Story X.Y.`

**Comparison caveats to document in honesty/interpretation:**

| Dimension | EPG | WebGL Lab |
| --- | --- | --- |
| ←→ nav | Program-boundary focus | Fixed 2h time step |
| Extra chrome | Now-line DOM + 1s ticks | Focus cursor quad; no now-line |
| Text | Canvas `fillText` | Atlas colors only |

[Source: `_bmad-output/implementation-artifacts/epic-3/3-1-webgl-lab-textured-visible-window.md`]
[Source: `_bmad-output/implementation-artifacts/epic-2/2-4-epg-perf-note.md`]
[Source: `docs/perf-notes/epg.md`]

### Git intelligence

Recent commits:

- `340b926` — Add WebGL Lab package and update related documentation (3.1)
- `a1602f1` — Update README and sprint status for Epic 2 completion (includes 2.4 `epg.md`)
- `02365fa` — Add EPG now-line indicator for Story 2.3
- `f5ae4e6` — Add EPG D-pad focus and program select for Story 2.2
- `6a9635c` / `75fd96d` — EPG canvas Visible Window (2.1)

Patterns: focused modules, vanilla TS, README honesty, study HTML as DoD, docs-heavy stories still smoke typecheck/build.

### Latest tech notes (2026-07-24)

- **Chrome Frame rendering stats:** Command Menu (`Cmd/Ctrl+Shift+P`) → **Show Rendering** → enable **Frame rendering stats**. Overlay shows successful / partial / dropped frames — DevTools-only, not readable from page JS. Prefer documenting overlay + HUD draw counts over inventing a production FPS API. [Source: https://developer.chrome.com/docs/devtools/rendering/performance]
- **Optional in-app FPS:** counting `requestAnimationFrame` callbacks/sec is a teaching aid for **display cadence**, not spare frame budget. Do not force a continuous paint loop.
- **FR-16 framing:** “FPS and/or draw-call / CPU-time framing” — WebGL’s one batched `drawArrays` per paint is valid draw-call framing even without a FPS number.
- **Domain research:** stable **~30 FPS** UI floor on constrained TV; **60** aspirational. Laptop ProMotion idle ≠ TV claim.
- **Stack pins:** Vite **6.4.3**, TypeScript **5.9.3**, pnpm **9.0.5**. SolidJS / Vitest / Playwright **not installed** — do not add them here.
- **Interview one-liner to enable** (`docs/webgl-investment.md`): Canvas 2D (simpler CPU path) vs WebGL (GPU path, more control, more footguns) — **measured both**.

### Downstream consumers (do not implement, but design the note for)

| Consumer | Needs from 3.2 |
| --- | --- |
| 3.3 WebGL vocabulary | Measured numbers + lab citations strengthen whiteboard talk; vocabulary essay still 3.3’s job |
| 4.4 / 6.2 other notes | Same folder + template + honesty rules |
| 6.3 README finalization | Perf table already links a real `canvas-vs-webgl.md` |
| Epic 3 retrospective | Synthesis HTML can link this study + Perf Note |

### Deferred work (do not expand into this story)

From `_bmad-output/implementation-artifacts/deferred-work.md` + Epic 2 retro:

- HiDPI `devicePixelRatio`, Date.parse precompute, overlapping ←→ stickiness
- Automated tests → **7.1**
- Dual TS pins / root tooling catalog → process debt

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 3 / Story 3.2]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-16, NFR environment labeling, UJ-3]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-8, AD-9]
- [Source: `docs/webgl-investment.md` — Canvas vs WebGL trade-off framing]
- [Source: `docs/perf-notes/epg.md` — template + Follow-on to 3.2]
- [Source: `docs/testing-strategy.md` — Chrome throttle checklist]
- [Source: `docs/study-guides.md` — study HTML DoD]
- [Source: `README.md` — Perf notes table Planned row]
- [Source: `packages/epg-canvas/src/index.ts` — EPG HUD / paint]
- [Source: `packages/webgl-lab/src/index.ts` — WebGL HUD / paint]
- [Source: `packages/webgl-lab/src/render.ts` — batched `drawArrays`]
- [Source: `_bmad-output/implementation-artifacts/epic-3/3-1-webgl-lab-textured-visible-window.md`]
- [Source: `_bmad-output/implementation-artifacts/epic-2/2-4-epg-perf-note.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Same-machine dual-Surface run via Chrome 150 headless + CDP against Vite `:5180` (WebGL required GPU flags — `--disable-gpu` fails context acquire).
- EPG HUD: stable `drawn 60 ≪ logical 600` across ↑↓/←→ on stage ~1100×540.
- WebGL HUD: stable `drawn 60 ≪ logical 600 · context webgl2` on the same stage/session.
- Idle rAF ~121–122/s documented as display cadence only.
- `pnpm typecheck` + `pnpm --filter shell build` green; no Surface code changes.

### Completion Notes List

- Created `docs/perf-notes/canvas-vs-webgl.md` with labeled Environment + side-by-side Results (FR-16 / AD-8).
- Primary evidence: draw accounting on both Surfaces + WebGL 1× `drawArrays` framing; optional FPS overlay skipped (same pattern as 2.4).
- README Perf table → **Measured**; Status/Getting started honesty; study HTML + `docs/index.md` links; next → 3.3.
- Optional measurement aid skipped; no React/Vitest/Playwright/Three.js; no continuous RAF paint loops.
- Noted stage-size difference vs 2.4 (20–30 drawn on smaller stage vs 60 here) so interviewers don’t confuse renderer with viewport.

### File List

- docs/perf-notes/canvas-vs-webgl.md (new)
- docs/study/epic-3/3-2-canvas-vs-webgl-perf-note.html (new)
- docs/perf-notes/epg.md
- README.md
- docs/index.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/epic-3/3-2-canvas-vs-webgl-perf-note.md

## Change Log

- 2026-07-24: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-24: Implemented FR-16 Canvas vs WebGL Perf Note (measured docs + study HTML) — status → review
