---
baseline_commit: 340b926Add WebGL Lab package and update related documentation.
---

# Story 3.3: WebGL vocabulary README section

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a clear README (or linked) explanation of the WebGL pipeline using this lab,
so that I can whiteboard buffers/textures/shaders/draw calls honestly (FR-17).

## Acceptance Criteria

1. **Given** WebGL Lab works  
   **When** I open README or `docs/webgl-investment.md` companion section  
   **Then** buffers, textures, shaders, and draw calls are explained with this lab as example  

2. **And** depth is labeled as learning lab, not expert claim

3. **And** a practical interview study HTML exists at `docs/study/epic-3/3-3-webgl-vocabulary-readme-section.html`, linked from `docs/index.md` (teaches how to whiteboard the four terms from the README — not a file changelog, and not a clone of the 3.1 pipeline SVG essay)

## Tasks / Subtasks

- [x] Task 1: Choose FR-17 home + draft vocabulary content (AC: #1, #2)
  - [x] **Preferred:** add a dedicated README section (pattern: peer teaching section like “Live strip vs React-style rerender”) titled e.g. **WebGL vocabulary (this lab)**
  - [x] **Optional companion:** if README would get too long, put the full write-up in `docs/webgl-vocabulary.md` (NEW) and keep a short README summary + link — epic AC allows README **or** linked note
  - [x] **Do not** rewrite `docs/webgl-investment.md` into the FR-17 essay — it stays “why invest”; link it as orientation
  - [x] Explain **all four** terms with **concrete lab citations** (symbols below) — slogans in the Surfaces table do **not** satisfy FR-17
  - [x] Label depth explicitly: learning lab / textured 2D UI tiles / Visible Window practice — **not** graphics-engine expertise
  - [x] Mention dispose / VRAM ≠ JS GC (`disposeGpu`) in one sentence (ties AD-6 / AD-9 honesty)
  - [x] Link measured trade-offs: `docs/perf-notes/canvas-vs-webgl.md` (Story 3.2) for draw-call framing
  - [x] Link deep walkthrough: `docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html` (do not duplicate its SVG diagram)

- [x] Task 2: Wire README honesty + docs index (AC: #1, #2)
  - [x] Flip Status blurb: vocabulary section **shipped** (remove “still Story 3.3”)
  - [x] Ensure Surfaces / Getting started still accurate; Learning order can point at the new section
  - [x] `docs/index.md`: link study HTML + vocabulary home; next step → **Epic 4** (or optional `epic-3-retrospective` / epic synthesis per `docs/study-guides.md`)
  - [x] Do **not** invent epic-3 synthesis HTML here (retrospective / closeout)

- [x] Task 3: Interview study HTML (AC: #3)
  - [x] Create `docs/study/epic-3/3-3-webgl-vocabulary-readme-section.html`
  - [x] Teach (interview-practical, distinct from 3.1):
    - How to whiteboard the four terms in ≤2 minutes using README + lab symbols
    - One batching talking point: one `drawArrays` per coalesced Visible Window paint
    - What to say when asked “do you know WebGL or only frameworks?” (honest learning-lab bound)
    - Point to Perf Note for measured Canvas vs WebGL compare
    - Foreshadow Epic 4 Blits as **applied** WebGL / scene graph — not a redo of Lab W
  - [x] Link from `docs/index.md` Study guides
  - [x] Do **not** re-ship the full 3.1 pipeline SVG / process diagram as this page’s body

- [x] Task 4: Prefer zero Surface code changes
  - [x] Do **not** refactor `packages/webgl-lab` “to make docs nicer” unless a citation is factually wrong
  - [x] Do **not** install Vitest/Playwright/React/Three.js
  - [x] Do **not** invent `drawElements` / indexed draws in docs — this lab uses `drawArrays` only

- [x] Task 5: Smoke verify (AC: #1–#3)
  - [x] Confirm README (and/or linked companion) explains buffers, textures, shaders, draw calls with lab examples + learning-lab label
  - [x] Confirm study HTML linked from `docs/index.md`
  - [x] `pnpm typecheck` + `pnpm --filter shell build` green (even if docs-only)
  - [x] Manual skim: Menu → WebGL Lab still mounts; citations still match shipped code
  - [x] Confirm no `react` / `react-dom`; no new Surface packages

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-17 / AD-9 — honest WebGL vocabulary write-up (README and/or linked companion) using `packages/webgl-lab` as the concrete example; learning-lab depth label; study HTML; docs honesty / index updates.

**Out of scope (later stories):**

- Rebuilding / expanding WebGL Lab features → already **3.1**
- New / remeasure Perf Notes → already **3.2**
- Blits Home / texture lifecycle essay → **Epic 4**
- Solid vs VDOM README → **5.2**
- Portfolio README *finalization* polish → **6.3** (builds on this)
- Memory soak / cross-surface hardening → **Epic 6**
- Vitest / Playwright / emulator notes → **Epic 7**
- Epic 3 synthesis HTML → **epic-3-retrospective** (optional)
- Advanced WebGL2 (MRT, lighting, 3D camera) → architecture deferred / MVP non-goal
- Replacing Blits with custom WebGL UI → AD-9 forbid
- HiDPI / Date.parse / overlapping nav polish → `deferred-work.md`
- React / Three.js / regl / Pixi — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-9** Raw WebGL Lab | Cite `packages/webgl-lab` ownership of context / buffers / textures / programs; do not replace Blits |
| **AD-8** Perf Notes | Link `canvas-vs-webgl.md`; do not move vocabulary into the Perf Note |
| **AD-6** Cleanup on leave | Document `disposeGpu` / VRAM ≠ GC; do not re-implement |
| **AD-1** Package boundaries | Docs only — no cross-package imports “for docs” |
| **AD-7** React forbidden | No React profiler / Three.js “to illustrate” |
| **AD-10** Test ladder | Docs story; typecheck/build smoke; no Vitest install |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`]

Canonical map: **FR-17 → README (or linked note)** citing **`packages/webgl-lab`**.

### Must-cite lab symbols (do not invent APIs)

| Term | Cite | WebGL APIs in this lab |
| --- | --- | --- |
| **Context** | `acquireContext` in `packages/webgl-lab/src/gl.ts` | `getContext('webgl2')` → fallback `'webgl'` |
| **Buffer** | `createVbo` + `drawVisibleWindow` buffer upload in `render.ts` | `createBuffer`, `bindBuffer(ARRAY_BUFFER)`, `bufferData(..., DYNAMIC_DRAW)` |
| **Texture** | `createColorAtlas` in `texture.ts` | `createTexture`, `texImage2D` (64×64 RGBA atlas), `atlasUv` |
| **Shader / program** | `createShaderProgram`, `VS_SOURCE`, `FS_SOURCE` in `shaders.ts` | `createShader` / `compileShader` / `createProgram` / `linkProgram` |
| **Draw call** | `drawVisibleWindow` in `render.ts` | **One** `drawArrays(TRIANGLES, 0, vertexCount)` per paint — **no `drawElements`** |
| **Dispose** | `disposeGpu` in `gl.ts` (called from `disposeSideEffects` in `index.ts`) | `deleteBuffer` / `deleteTexture` / `deleteProgram` / `deleteShader` |

Interleaved VBO layout (for whiteboard honesty): `FLOATS_PER_VERT = 5` → `x, y, u, v, focus`; 6 verts per quad.

### Suggested README section skeleton

```markdown
## WebGL vocabulary (this lab)

**Depth:** learning lab — textured 2D Visible Window tiles in `packages/webgl-lab`.
Not a claim of graphics-engine or production WebGL expertise.

| Term | In this lab |
| --- | --- |
| Buffer | `createVbo` + per-paint `bufferData` of Visible Window quads |
| Texture | `createColorAtlas` uploads a color atlas via `texImage2D` |
| Shader | `createShaderProgram` links VS (pixel→clip) + FS (sample atlas) |
| Draw call | `drawVisibleWindow` issues **one** batched `drawArrays` for visible quads |

Pipeline in one line: context → program + VBO + atlas → upload verts → `drawArrays` → on leave `disposeGpu`.

See also: [WebGL investment](docs/webgl-investment.md) · [Canvas vs WebGL Perf Note](docs/perf-notes/canvas-vs-webgl.md) · [Story 3.1 study](docs/study/epic-3/3-1-webgl-lab-textured-visible-window.html)
```

Adapt freely; keep all four terms + lab examples + learning-lab label.

### Files being created (NEW)

| Path | Purpose |
| --- | --- |
| `docs/study/epic-3/3-3-webgl-vocabulary-readme-section.html` | Interview study DoD |
| `docs/webgl-vocabulary.md` | **Optional** companion if README stays thin |

### Files being modified (UPDATE)

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `README.md` | Status says vocabulary still **3.3**; Surfaces names terms only; no vocabulary section | Add FR-17 section (or short summary + link); flip Status honesty | Perf table Measured rows; no-React; Surfaces table |
| `docs/index.md` | Next = implement **3.3** | Link 3.3 study + vocab home; next → Epic 4 / optional epic-3 retro | Planning artifact table; study convention |
| `docs/webgl-investment.md` | Why-invest orientation | Prefer **link only** (optional one-line “see vocabulary”) | Do not turn into FR-17 essay |
| `docs/perf-notes/canvas-vs-webgl.md` | Follow-ons lists 3.3 | Optional “see also” when vocabulary ships | Do not rewrite Results |
| `packages/webgl-lab/**` | FR-15 Lab | **Prefer no change** | Context, dispose, batched draw |

### Anti-patterns (do not)

- Treat Surfaces-table slogans (“buffers, textures…”) as FR-17 complete
- Claim expert / production WebGL depth from this lab
- Duplicate the entire 3.1 study SVG essay into README
- Rewrite `docs/webgl-investment.md` into a long pipeline tutorial
- Document `drawElements` / indexed draws this lab does not use
- Invent continuous RAF FPS mills or unlabeled “60 FPS”
- Refactor Surface code or add React/Three.js “for illustration”
- Invent epic-3 synthesis HTML / Home / soak content here
- Study HTML that only lists files changed

### Testing requirements (this story)

- Content accuracy vs lab symbols is the test
- `pnpm typecheck` + `pnpm --filter shell build` (recommended even if docs-only)
- Manual: WebGL Lab still demoable; citations still match
- No new automated test framework (Epic 7)

[Source: `docs/testing-strategy.md`]

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear interview citable prose over encyclopedic WebGL manuals
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)
- On-disk paths: `docs/study/epic-N/` and `_bmad-output/implementation-artifacts/epic-N/`

### Previous story intelligence (3.1 + 3.2)

**3.1 delivered:** `@tvshell/webgl-lab` with real buffers/textures/shaders/draw calls + dispose; study HTML already teaches pipeline deeply. Explicit handoff: full FR-17 vocabulary README → **3.3**.

**3.2 delivered:** `docs/perf-notes/canvas-vs-webgl.md` Measured; README Status pointed vocabulary still **3.3**; study foreshadowed 3.3 whiteboard of the four terms. Prefer docs-only ship pattern.

**Patterns to reuse:**

- Docs-first; prefer **zero** Surface code changes
- README honesty Status flip when shipped
- Study HTML under `docs/study/epic-3/` with whiteboard + honesty — not changelog
- Commit title style when asked later: `Add <capability> for Story X.Y.`

**Do not poorly duplicate 3.1 study:** investment pitch, full SVG process diagram, file→responsibility cheat sheet at essay length. README should be the **citable short form**; 3.1 study remains the deep walkthrough.

[Source: `_bmad-output/implementation-artifacts/epic-3/3-1-webgl-lab-textured-visible-window.md`]
[Source: `_bmad-output/implementation-artifacts/epic-3/3-2-canvas-vs-webgl-perf-note.md`]

### Git intelligence

Recent commits:

- `340b926` — Add WebGL Lab package and update related documentation (3.1)
- `a1602f1` — Update README and sprint status for Epic 2 completion
- Earlier: `Add <capability> for Story X.Y.`

Note: Story 3.2 is marked **done** in sprint-status; ensure `docs/perf-notes/canvas-vs-webgl.md` exists before linking from vocabulary (it should). Prefer committing/stacking cleanly if 3.2 docs were local-only when this story starts.

Patterns: vanilla TS, README honesty, study HTML as DoD, docs-heavy stories still smoke typecheck/build.

### Latest tech notes (2026-07-24)

- MDN still defines the same core verbs this lab uses: `bufferData`, `texImage2D`, `createProgram`, `drawArrays` — cite MDN only if helpful; **prefer citing this repo’s symbols**.
- Lab is WebGL2-first with WebGL1 fallback (`acquireContext`) — vocabulary should say “WebGL2 preferred; WebGL1 fallback,” not “WebGL2-only.”
- `DYNAMIC_DRAW` on the VBO matches “verts rebuilt when Visible Window changes” — good whiteboard honesty.
- UJ-3 climax wants vocabulary **with** measured numbers — point at 3.2 Perf Note; do not remeasure here.
- Stack pins unchanged: Vite **6.4.3**, TypeScript **5.9.3**, pnpm **9.0.5**.

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 3.3 |
| --- | --- |
| Epic 3 retrospective | Synthesis HTML can link vocabulary + 3.1 study + Perf Note |
| 4.x Blits Home | “Applied WebGL” contrast — Lab W vocabulary already named |
| 6.3 README finalization | Vocabulary section already present to polish |
| Interviews (UJ-3) | ≤5 min whiteboard path: terms → lab symbols → Perf Note |

### Deferred work (do not expand into this story)

From `_bmad-output/implementation-artifacts/deferred-work.md` + Epic 2 retro:

- HiDPI, Date.parse precompute, overlapping ←→ stickiness
- Automated tests → **7.1**

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 3 / Story 3.3]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-17, UJ-3]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-9]
- [Source: `docs/webgl-investment.md` — orientation (not FR-17 essay)]
- [Source: `docs/perf-notes/canvas-vs-webgl.md` — measured compare]
- [Source: `docs/study-guides.md` — study HTML DoD]
- [Source: `README.md` — Status placeholder for 3.3]
- [Source: `packages/webgl-lab/src/{gl,shaders,texture,render,index}.ts`]
- [Source: `_bmad-output/implementation-artifacts/epic-3/3-1-webgl-lab-textured-visible-window.md`]
- [Source: `_bmad-output/implementation-artifacts/epic-3/3-2-canvas-vs-webgl-perf-note.md`]
- [Source: MDN WebGL `drawArrays` / `bufferData` / `texImage2D` / `createProgram`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- FR-17 home: README section `## WebGL vocabulary (this lab)` (no separate companion — README stayed concise).
- Citations verified against `packages/webgl-lab/src/{gl,shaders,texture,render}.ts` (`createVbo`, `createColorAtlas`, `createShaderProgram`, `drawArrays` only).
- `pnpm typecheck` + `pnpm --filter shell build` green; no Surface code changes; no optional `docs/webgl-vocabulary.md`.

### Completion Notes List

- Shipped FR-17 vocabulary in README with learning-lab depth label + dispose/`disposeGpu` honesty.
- Study HTML teaches ≤2-min whiteboard path (not a 3.1 SVG clone); linked from `docs/index.md`.
- Status flipped; Learning order links vocabulary; light see-also on `webgl-investment.md` + Perf Note Follow-ons.
- Next pointed at optional epic-3 retrospective or Epic 4.

### File List

- README.md
- docs/study/epic-3/3-3-webgl-vocabulary-readme-section.html (new)
- docs/index.md
- docs/webgl-investment.md
- docs/perf-notes/canvas-vs-webgl.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- _bmad-output/implementation-artifacts/epic-3/3-3-webgl-vocabulary-readme-section.md

## Change Log

- 2026-07-24: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-24: Implemented FR-17 WebGL vocabulary README + study HTML — status → review
