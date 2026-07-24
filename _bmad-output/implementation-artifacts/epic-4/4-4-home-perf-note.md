# Story 4.4: Home Perf Note

Status: ready-for-dev

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

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

- [ ] Task 1: Same-machine measure Home (AC: #1, #2)
  - [ ] Run Shell, Menu → **Home**, record **one** Environment block first: browser + version, OS, machine class, viewport/DPR, proxy honesty, date
  - [ ] Focus-scroll Left/Right across the rail; note subjective smoothness + any hitching
  - [ ] Capture at least one quantitative or semi-quantitative signal:
    - Optional Chrome **Frame rendering stats** while holding arrows
    - And/or texture window size / loaded-tile counts from `[home]` logs or a tiny HUD
    - And/or cleanup probe false after Back + optional heap snapshot delta across 3 enter/leave cycles
  - [ ] Prefer reusing env shape from `docs/perf-notes/epg.md` / `canvas-vs-webgl.md` if still accurate; else remeasure Home fresh and label honestly
  - [ ] Do **not** invent a continuous full-rail RAF “FPS mill” that Home does not actually run

- [ ] Task 2: Write `docs/perf-notes/home-blits.md` (AC: #1, #2)
  - [ ] **Canonical path is epic AC:** `docs/perf-notes/home-blits.md` (not `home.md`)
  - [ ] Mirror peer Perf Note skeleton:
    - Title + **Measured** date + Surface (`packages/home-blits`) + Requirement (**FR-10 / AD-8**)
    - **Environment** table
    - **Method** (Menu → Home; scrub; leave; tools used)
    - **Results** (scroll feel / frame stats / loaded-tile band / cleanup probe)
    - **Interpretation** — applied WebGL via Blits; contrast Lab W metal + Canvas EPG virtualization talking points without rewriting those notes
    - **Honesty bounds** — desktop proxy ≠ OEM TV; learning lab; no production Lightning years claim
    - **Follow-ons** — 6.2 soak; 7.2 Playwright; 7.3 emulator
    - **Reproduce** bash/dev steps
  - [ ] Cite texture strategy from `packages/home-blits/README.md` (Story 4.3)

- [ ] Task 3: Wire README + docs index (AC: #1)
  - [ ] `README.md` Perf notes table: add/fix row for `docs/perf-notes/home-blits.md` → **Measured**
  - [ ] **Fix drift:** table currently lists `docs/perf-notes/home.md` (Planned) — replace with **`home-blits.md`** to match epic AC
  - [ ] Status blurb: Home rail + lazy textures + Perf Note shipped; Live still Epic 5
  - [ ] `docs/index.md`: link Perf Note + 4.4 study HTML; next → Epic 5 create-story / `5-1` (or optional epic-4 retrospective / synthesis per `docs/study-guides.md`)
  - [ ] Do **not** invent epic-4 synthesis HTML here unless running retrospective

- [ ] Task 4: Interview study HTML (AC: #3)
  - [ ] Create `docs/study/epic-4/4-4-home-perf-note.html`
  - [ ] Teach:
    - Why AD-8 wants labeled Home evidence after FR-8/FR-9
    - What to measure on a scene-graph Home (focus scroll + texture window + leave dispose) vs EPG drawn≪logical vs WebGL drawArrays
    - Demo script: Menu → Home scrub → quote env → Back → probe false → point at note
    - Honesty bounds for interviews
  - [ ] Link from `docs/index.md`

- [ ] Task 5: Prefer zero Surface refactors (AC: #1–#3)
  - [ ] Default: **docs-only** (+ study HTML) unless measurement is blocked by missing HUD/log — then minimal `[home]` loaded-tile log/HUD only
  - [ ] Do **not** install Vitest/Playwright/React
  - [ ] Do **not** expand Epic 2 deferred polish

- [ ] Task 6: Smoke verify
  - [ ] Confirm `docs/perf-notes/home-blits.md` exists with labeled environment + focus-scroll/cleanup evidence
  - [ ] Confirm README links + table path `home-blits.md` (not stale `home.md`)
  - [ ] Confirm study HTML linked
  - [ ] `pnpm typecheck` + `pnpm --filter shell build` green
  - [ ] Manual: Home still mounts; scrub + Back unchanged

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-10 / AD-8 — labeled `docs/perf-notes/home-blits.md`; README link; study HTML; measure already-shipped Home.

**Out of scope:**

- Rebuilding rail / remount strategy → 4.1–4.3
- Memory soak 30-min report → **6.2**
- Solid vs VDOM README → **5.2**
- Portfolio README finalization → **6.3**
- Vitest / Playwright / emulator → **Epic 7**
- Epic 4 synthesis HTML → **epic-4-retrospective**

### Architecture compliance

| Decision | Implication |
| --- | --- |
| **AD-8** | Perf Notes under `docs/perf-notes/` with env labeled; README links |
| **AD-6** | Note should mention cleanup evidence from 4.3 |
| **AD-10** | Manual measure OK; CI automation later |
| **AD-9** | Link canvas-vs-webgl / vocabulary for contrast — don’t redefine Lab W |

### Path conflict to fix

| Source | Path |
| --- | --- |
| Epic AC / this story | `docs/perf-notes/home-blits.md` |
| Current README table | `docs/perf-notes/home.md` (Planned) — **update to home-blits.md** |

### Peer templates to mirror

- `docs/perf-notes/epg.md`
- `docs/perf-notes/canvas-vs-webgl.md`

Team agreement (Epic 3 retro): prefer docs-only for Perf Note stories unless measurement is blocked.

### Previous story intelligence

- 4.3 README already documents texture policy — cite it; don’t duplicate the essay into the Perf Note
- Same-machine env labeling pattern from 3.2
- Study HTML DoD continues

### Testing requirements

- Docs + typecheck/build smoke + Home still works
- No new frameworks

### References

- [Source: `epics.md` — Story 4.4 / FR-10]
- [Source: `prd.md` — FR-10]
- [Source: ARCHITECTURE-SPINE.md — AD-8]
- [Source: `docs/perf-notes/epg.md`, `canvas-vs-webgl.md`]
- [Source: `epic-3/epic-3-retro-2026-07-24.md` — docs-first Perf Notes]
- [Source: `epic-4/4-3-lazy-texture-load-and-unload.md`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

**Completion note:** Ultimate context engine analysis completed - comprehensive developer guide created
