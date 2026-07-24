---
baseline_commit: d76ee9e2329235345d0a24a10a65d7c0216335b9
---

# Story 4.3: Lazy texture load and unload

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want textures for far/off tiles managed and released on leave,
so that I practice TV memory discipline (FR-9, AD-6).

## Acceptance Criteria

1. **Given** Home rail with many posters  
   **When** I scroll Focus across the rail and then leave Home  
   **Then** load strategy avoids keeping all full-res images forever (documented)  
   **And** unmount disposes textures/images created by Home

2. **And** documentation of the strategy lives in `packages/home-blits/README.md` (extend the 4.1 ADR / add a “Texture lifecycle” section) — enough for an interview whiteboard, not a novel

3. **And** `hasActiveSideEffects()` is false after leave; remount does not accumulate orphan textures/contexts across Menu → Home → Back loops

4. **And** a practical interview study HTML exists at `docs/study/epic-4/4-3-lazy-texture-load-and-unload.html`, linked from `docs/index.md` (teaches TV texture RAM discipline — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Implement lazy / bounded texture strategy (AC: #1, #2)
  - [x] Define a concrete policy (pick one and implement it — document exactly which):
    - **Windowed:** keep textures for focus ± N neighbors; release or free far tiles when focus moves
    - **Bounds / margin:** rely on Lightning bounds-margin / renderer culling **plus** explicit dispose of off-window images if the API allows
    - **Placeholder → upgrade:** far tiles show cheap color/placeholder; full poster loads near focus; unload when far again
  - [x] “Avoids keeping all full-res forever” must be **true in behavior**, not only in comments — if MVP placeholders are tiny, still demonstrate unload on leave and document “full-res” as the production pattern you are practicing
  - [x] Prefer appropriately sized assets (domain research: don’t decode 4K for ~200px tiles)
  - [x] Do **not** require real CDN posters; generated or local placeholders OK (AD-3)

- [x] Task 2: Dispose on Surface leave (AC: #1, #3)
  - [x] On `unmount`: destroy Blits Application / free image textures / cancel pending loads; clear module state
  - [x] Prove with `hasActiveSideEffects()` false + optional `[home]` log listing disposed resource counts
  - [x] Shell cleanup probe path already wired from 4.1 — keep `probeBySurface.home` accurate
  - [x] Stress: Menu → Home → scrub rail → Back → Home → scrub → Back (≥3 cycles) without growing obvious leaks (DevTools Memory optional; required proof is dispose + probe)

- [x] Task 3: Document strategy (AC: #2)
  - [x] Update `packages/home-blits/README.md`:
    - Load policy (window size / placeholder rules)
    - Unload triggers (focus move + Surface leave)
    - What Lightning/Blits does automatically vs what you dispose explicitly
    - Honesty: desktop Chromium proxy ≠ OEM TV RAM
  - [x] Brief pointer from root README Status/Surfaces if useful — full Perf Note still **4.4**

- [x] Task 4: Docs index + study HTML (AC: #4)
  - [x] `docs/study/epic-4/4-3-lazy-texture-load-and-unload.html` — teach:
    - Why TV Home dies on unbounded poster decode (RAM class ~hundreds of MB usable)
    - Lazy/windowed textures vs Lab W atlas (`texImage2D` / `disposeGpu`) — same discipline, different API
    - Demo script: scrub rail → leave → remount; say what was freed
    - Foreshadow 4.4 measurement + 6.2 soak
  - [x] `docs/index.md`: link study; next → **4.4**
  - [x] Do **not** invent `docs/perf-notes/home-blits.md` yet (numbers belong in 4.4)

- [x] Task 5: Smoke verify (AC: #1–#3)
  - [x] `pnpm typecheck` + `pnpm --filter shell build`
  - [x] Manual: focus scrub across all 12+ tiles; far tiles don’t all stay “full” per documented policy; Back clears probe; remount works
  - [x] Confirm README texture section exists
  - [x] No React; no Vitest/Playwright install; no Live package

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-9 / AD-6 — bounded/lazy poster texture strategy on Home rail; document it; dispose on leave; study HTML.

**Out of scope:**

- Labeled Perf Note with env + metrics → **4.4**
- 30-minute Memory Soak report → **6.2**
- Multi-rail texture pools → non-goal
- Replacing Blits with raw WebGL Home → forbidden
- Expanding Epic 2 deferred polish → unless blocked

### Architecture compliance

| Decision | Implication |
| --- | --- |
| **AD-6** | Unmount must dispose textures/images Home created |
| **AD-3** | Placeholders/fixtures only — no production image CDN client |
| **AD-8** | Document strategy now; **measure** in 4.4 |
| **AD-9** | Cite Lab W dispose as cousin literacy — do not merge packages |
| **AD-1** | Stay inside `home-blits` + `shared` |

### What already exists

| Asset | Use |
| --- | --- |
| Focusable rail from **4.2** | Add lifecycle around existing tiles — don’t rebuild rail UX |
| Mount ADR from **4.1** | Extend README; don’t contradict mount decision |
| Lab W `disposeGpu` | Teaching parallel in study HTML only |
| Domain research § images | Lazy load, sized assets, debounce hero (we have no hero — skip) |

### UPDATE files — current / change / preserve

| File | Today | Change | Preserve |
| --- | --- | --- | --- |
| `packages/home-blits` rail/image code | May load all tile art eagerly | Windowed/lazy policy + unload | Focus affordance, shared fixtures, mount API |
| `packages/home-blits/README.md` | Mount ADR | Texture lifecycle section | Mount decision |
| Shell registry | home → home-blits | Likely unchanged | EPG/WebGL/Live wiring |

### Previous story intelligence

- 4.2 may have used eager placeholders for visibility — this story **must** introduce a real bounded policy + leave dispose proof
- Shell clears `hostEl.replaceChildren()` after unmount — still destroy Blits runtime explicitly (don’t rely on DOM clear alone for GPU textures)
- Epic 3 lesson: VRAM ≠ JS GC — say it for Lightning textures too

### Latest tech notes

- Blits/Lightning: image textures + `hooks.destroy`; Application teardown on Surface leave
- Renderer features (research): bounds margin, image workers, texture compression — use if available; don’t block MVP on compression
- `gpuMemory` settings exist on `Blits.Launch` — optional to tune; document if used

### Testing requirements

- Typecheck + build + manual scrub/leave/remount cycles
- Optional DevTools Memory screenshot — nice for 4.4, not required here if dispose + docs are solid

### References

- [Source: `epics.md` — Story 4.3 / FR-9]
- [Source: `prd.md` — FR-9; UJ-2 climax textures unload]
- [Source: ARCHITECTURE-SPINE.md — AD-6]
- [Source: domain + technical research — texture lazy-load]
- [Source: `epic-4/4-2-focusable-horizontal-home-rail.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Manual smoke: HUD showed `FULL 4 (peak 4)` at focus 2 and `FULL 5 (peak 5)` mid-rail — window bounded at ≤5
- Back returns to menu; `hasActiveSideEffects` includes texture registry

### Completion Notes List

- Shipped **placeholder→upgrade** with `TEXTURE_WINDOW = 2`: cheap color far; tile-sized SVG FULL near focus
- Focus move unloads far `src`; Surface leave calls `disposeAllTextures()` + `app.quit()`; `[home] dispose` / `[home] textures` logs
- `hasActiveSideEffects()` false when no app, no pending launch, and registry empty
- README Texture lifecycle section; study HTML updated to as-implemented; root README + docs index point to 4.4
- Smoke: typecheck, shell build, `story-4-3-smoke.mjs`, manual scrub + Back

### File List

- `packages/home-blits/src/texture-lifecycle.ts`
- `packages/home-blits/src/App.ts`
- `packages/home-blits/src/RailTile.ts`
- `packages/home-blits/src/index.ts`
- `packages/home-blits/src/placeholders.ts`
- `packages/home-blits/README.md`
- `packages/home-blits/tests/story-4-3-smoke.mjs`
- `README.md`
- `docs/index.md`
- `docs/study/epic-4/4-3-lazy-texture-load-and-unload.html`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/epic-4/4-3-lazy-texture-load-and-unload.md`

### Change Log

- 2026-07-24: Implemented FR-9 placeholder→upgrade texture window + dispose-on-leave; status → review

---

**Completion note:** Ultimate context engine analysis completed - comprehensive developer guide created
