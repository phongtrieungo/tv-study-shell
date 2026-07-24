---
baseline_commit: d76ee9e2329235345d0a24a10a65d7c0216335b9
---

# Story 4.4: Home Perf Note

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a learner,
I want a Home Perf Note,
so that focus scroll and cleanup are evidenced (FR-10).

## Acceptance Criteria

1. **Given** Home Surface  
   **When** I record qualitative/quantitative notes  
   **Then** `docs/perf-notes/home-blits.md` exists with environment labeled  
   **And** README links to it

2. **And** the note covers focus-scroll behavior and texture/cleanup evidence (ties FR-8/FR-9 work) — FPS **and/or** qualitative scroll feel + dispose proof is enough (mirror EPG / canvas-vs-webgl honesty)

3. **And** a practical interview study HTML exists at `docs/study/epic-4/4-4-home-perf-note.html`, linked from `docs/index.md` (teaches how to defend Home measurements — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Same-machine measure Home (AC: #1, #2)
  - [x] Run Shell, Menu → **Home**, record **one** Environment block first: browser + version, OS, machine class, viewport/DPR, proxy honesty, date
  - [x] Focus-scroll Left/Right across the rail; note subjective smoothness + any hitching
  - [x] Capture at least one quantitative or semi-quantitative signal:
    - Optional Chrome **Frame rendering stats** while holding arrows
    - And/or texture window size / loaded-tile counts from `[home]` logs or a tiny HUD
    - And/or cleanup probe false after Back + optional heap snapshot delta across 3 enter/leave cycles
  - [x] Prefer reusing env shape from `docs/perf-notes/epg.md` / `canvas-vs-webgl.md` if still accurate; else remeasure Home fresh and label honestly
  - [x] Do **not** invent a continuous full-rail RAF “FPS mill” that Home does not actually run

- [x] Task 2: Write `docs/perf-notes/home-blits.md` (AC: #1, #2)
  - [x] **Canonical path is epic AC:** `docs/perf-notes/home-blits.md` (not `home.md`)
  - [x] Mirror peer Perf Note skeleton
  - [x] Cite texture strategy from `packages/home-blits/README.md` (Story 4.3)

- [x] Task 3: Wire README + docs index (AC: #1)
  - [x] `README.md` Perf notes table: `home-blits.md` → **Measured**
  - [x] Fix drift: `home.md` → `home-blits.md`
  - [x] Status blurb: Home rail + lazy textures + Perf Note shipped
  - [x] `docs/index.md`: link Perf Note + 4.4 study HTML; next → Epic 5
  - [x] Epic synthesis deferred to retrospective (shipped with epic-4 retro)

- [x] Task 4: Interview study HTML (AC: #3)
  - [x] Create/update `docs/study/epic-4/4-4-home-perf-note.html`
  - [x] Link from `docs/index.md`

- [x] Task 5: Prefer zero Surface refactors (AC: #1–#3)
  - [x] Docs-only (+ study HTML)
  - [x] No Vitest/Playwright/React
  - [x] No Epic 2 deferred polish

- [x] Task 6: Smoke verify
  - [x] Perf note exists with env + evidence
  - [x] README links `home-blits.md`
  - [x] Study HTML linked
  - [x] `pnpm typecheck` + build green
  - [x] Manual: Home mounts; scrub + Back unchanged

## Dev Notes

(See original story context — implementation followed docs-first Perf Note path.)

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Measured in Cursor Chromium 144 / Electron 40.10.3; viewport ~850×958; DPR 2
- HUD FULL band ≤5 while scrubbing; Back left Home

### Completion Notes List

- Wrote `docs/perf-notes/home-blits.md` with env, method, FULL window results, dispose proof
- Fixed README table drift to `home-blits.md` (Measured)
- Study HTML 4.4 as-implemented; epic synthesis + doc-only retro accompany closeout

### File List

- `docs/perf-notes/home-blits.md`
- `docs/study/epic-4/4-4-home-perf-note.html`
- `docs/study/epic-4/epic-4-blits-home-surface.html`
- `docs/index.md`
- `docs/perf-notes/epg.md`
- `docs/perf-notes/canvas-vs-webgl.md`
- `README.md`
- `packages/home-blits/README.md`
- `_bmad-output/implementation-artifacts/epic-4/4-4-home-perf-note.md`
- `_bmad-output/implementation-artifacts/epic-4-retro-2026-07-24.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-07-24: Home Perf Note + Epic 4 synthesis/retro (HTML, no discussion); status → done

---

**Completion note:** Ultimate context engine analysis completed
