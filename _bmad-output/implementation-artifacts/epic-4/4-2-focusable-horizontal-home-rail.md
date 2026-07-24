---
baseline_commit: d76ee9e2329235345d0a24a10a65d7c0216335b9
---

# Story 4.2: Focusable horizontal Home rail

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a horizontal rail of ≥12 posters with D-pad Focus,
so that I can demo TV Home navigation (FR-8).

## Acceptance Criteria

1. **Given** Home Surface is active  
   **When** I press Left/Right  
   **Then** Focus moves along tiles with a clear focus affordance  
   **And** rail uses shared Mock Data rail fixtures

2. **And** the rail shows ≥12 items from `@tvshell/shared` `homeRails` (fixture already has `HOME_RAIL_ITEM_COUNT = 12` on `rail-featured`)

3. **And** Shell **Back** still leaves Home to the menu; Left/Right do not steal Back; remount restores a predictable initial focus (index 0 is OK for MVP — full cross-surface focus memory is Epic 6)

4. **And** a practical interview study HTML exists at `docs/study/epic-4/4-2-focusable-horizontal-home-rail.html`, linked from `docs/index.md` (teaches 10-foot rail focus + Blits input — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Bind rail to shared fixtures (AC: #1, #2)
  - [x] Consume `homeRails` / `fixtureMeta` from `@tvshell/shared` — **no** local duplicate rail arrays, **no** fetch (AD-3)
  - [x] Render **one** horizontal rail (`rail-featured`) with **all** ≥12 items as poster tiles (title from `RailItem.title`)
  - [x] Fixtures ship `posterUrl: ''` today — provide **visible** tile art without inventing a backend:
    - Prefer generated placeholder images (data-URL / tiny static assets under `packages/home-blits` / hashed color tiles) keyed by `itemId`
    - Or fill `posterUrl` in shared fixtures with stable placeholder paths **only if** Home needs real URLs for Blits Image — keep Mock Data in `shared` (AD-3)
  - [x] Do **not** add a second rail (PRD non-goal)

- [x] Task 2: D-pad focus along the rail (AC: #1, #3)
  - [x] Left/Right move focus one tile; wrap **or** clamp at ends — pick one and document in study HTML (clamp is fine for MVP)
  - [x] Visible focus affordance mandatory (scale, border, glow-free high-contrast ring — must read at 10-foot / Safe Zone)
  - [x] Keep focused tile in view (scroll/offset rail so focus is not clipped off-canvas)
  - [x] Use Blits `input` handlers and/or shared `getDpadAction` at the Surface boundary — key codes must stay aligned with AD-4 (`ArrowLeft`/`ArrowRight`)
  - [x] **Do not** steal Back / Escape / Backspace — Shell `main.ts` owns Back → `host.leave()`
  - [x] Up/Down: no-op or stay on rail (single-rail MVP); do not navigate to missing rows
  - [x] Enter/Select: optional title highlight / log — **not** required by FR-8; skip detail panels

- [x] Task 3: Preserve mount contract from 4.1 (AC: #3)
  - [x] Keep ADR mount strategy; do not flip embed↔iframe without updating `packages/home-blits/README.md`
  - [x] `unmount` still destroys Blits app + clears probe
  - [x] Registry stays: `home → home-blits`; Live stub; EPG/WebGL unchanged

- [x] Task 4: Docs honesty (AC: #4)
  - [x] `README.md`: Home has focusable rail from shared fixtures; lazy textures / Perf Note still **4.3 / 4.4**
  - [x] `docs/index.md`: link 4.2 study HTML; next → **4.3**
  - [x] Do **not** invent `docs/perf-notes/home-blits.md` yet

- [x] Task 5: Interview study HTML (AC: #4)
  - [x] Create `docs/study/epic-4/4-2-focusable-horizontal-home-rail.html`
  - [x] Teach:
    - Home = horizontal rail + one visible focus (domain research 10-foot / D-pad)
    - Why focus affordance must be unmistakable at distance
    - Blits scene-graph focus vs Canvas EPG custom focus / WebGL Lab focus (same AD-4 keys, different renderer)
    - Pivot/scroll so focused tile stays on-screen
    - Foreshadow 4.3: posters are GPU textures — don’t keep every full-res forever
  - [x] Link from `docs/index.md`

- [x] Task 6: Smoke verify (AC: #1–#3)
  - [x] `pnpm typecheck` + `pnpm --filter shell build` green
  - [x] Manual: Menu → Home → see ≥12 tiles → hold Left/Right → focus moves with clear affordance + rail scrolls → Back → menu → remount OK
  - [x] Confirm tiles sourced from shared `homeRails` (titles match Featured Tile N)
  - [x] Confirm EPG / WebGL Lab still work; Live stub; no React

## Dev Notes

### Scope boundaries (critical)

**In scope:** FR-8 — one focusable horizontal Home rail (≥12) from shared fixtures; clear focus affordance; Left/Right; Shell Back preserved; study HTML.

**Out of scope:**

- Lazy texture lifecycle + documented unload → **4.3** (may load all placeholders for now if needed for visibility; do not claim lazy strategy yet)
- Home Perf Note → **4.4**
- Multi-rail / focus memory across surfaces → PRD polish / **Epic 6**
- Solid Live → **Epic 5**
- Vitest/Playwright → **Epic 7**
- OEM launcher clone / personalization → non-goal

### Architecture compliance

| Decision | Implication |
| --- | --- |
| **AD-1** | Blits + `shared` only |
| **AD-3** | `homeRails` from shared |
| **AD-4** | Arrow Left/Right; Shell Back |
| **AD-6** | Keep destroy-on-unmount from 4.1 |
| **AD-7** | No React |
| **AD-9** | Do not replace Home with raw WebGL Lab |

[Source: ARCHITECTURE-SPINE.md]

### What already exists

| Asset | Notes |
| --- | --- |
| `packages/home-blits` from **4.1** | Extend hello-world — do not recreate package |
| `homeRails` / `RailItem` | `packages/shared/src/fixtures/index.ts` + `types/index.ts` — 12 items, empty `posterUrl` |
| `getDpadAction` | `packages/shared/src/input` |
| Shell Back ownership | `apps/shell/src/main.ts` — Surface arrows handled inside Home; Back bubbles to leave |
| Domain research | Horizontal rails, focus lattice, Safe Zone — `_bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md` §3 |

### UPDATE files — current state / change / preserve

| File | Today | This story changes | Preserve |
| --- | --- | --- | --- |
| `packages/home-blits/src/**` | Hello-world Blits | Rail component + focus input + scroll | Mount ADR, `mount`/`unmount`/`hasActiveSideEffects` |
| `packages/shared` fixtures | `posterUrl: ''` | Optional placeholder URLs **only if** required | Channel/program fixtures; counts ≥12 |
| `README.md` / `docs/index.md` | 4.1 honesty | Rail shipped; point to 4.3 | Lab W / EPG claims |

### Previous story intelligence (4.1)

- Mount strategy ADR is law until deliberately revised
- `Blits.Launch(App, targetId, settings)` needs a stable host target id/element inside Shell host
- Cleanup probe must stay false after leave
- Contrast Lab W vocabulary vs Blits DX in teaching materials

### Latest tech notes

- Blits components: `input` map for `left`/`right`; `hooks.focus` / visual state for affordance
- Prefer keymap aligned with Shell: `ArrowLeft`/`ArrowRight` (Blits settings `keymap` if used)
- Image/texture nodes: use Blits/Lightning image elements sized for TV tiles (not 4K posters)

### Testing requirements

- Typecheck + shell build + manual D-pad rail smoke
- No new test framework

### References

- [Source: `epics.md` — Story 4.2 / FR-8]
- [Source: `prd.md` — FR-8, UJ-2]
- [Source: domain research — Home rails / focus]
- [Source: `epic-4/4-1-spike-blits-mount-strategy.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- Vite HMR served stale 4.1 hello-world until forced restart (`--force` on port 5180)
- Manual browser smoke: focus moves Tile 1→5 with amber ring; Escape → “Side effects cleared.”

### Completion Notes List

- Featured rail from shared `homeRails` with hashed color placeholders (fixtures keep empty `posterUrl`)
- Blits `input` left/right with **clamp** at ends; amber ring + scale affordance; rail `x` scroll keeps focus on-stage
- Shell Back preserved (no Blits back/escape handlers); remount resets focus to 0
- Study HTML for 4.2 (as implemented) plus study-ahead pages for 4.3 / 4.4 in the same epic-4 style as 4.1
- Smoke: `pnpm typecheck`, `pnpm --filter shell build`, `node packages/home-blits/tests/story-4-2-smoke.mjs`, manual D-pad

### File List

- `packages/home-blits/src/App.ts`
- `packages/home-blits/src/RailTile.ts`
- `packages/home-blits/src/placeholders.ts`
- `packages/home-blits/src/index.ts`
- `packages/home-blits/README.md`
- `packages/home-blits/tests/story-4-2-smoke.mjs`
- `apps/shell/src/chrome/render-chrome.ts`
- `README.md`
- `docs/index.md`
- `docs/study/epic-4/4-2-focusable-horizontal-home-rail.html`
- `docs/study/epic-4/4-3-lazy-texture-load-and-unload.html`
- `docs/study/epic-4/4-4-home-perf-note.html`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/epic-4/4-2-focusable-horizontal-home-rail.md`

### Change Log

- 2026-07-24: Implemented FR-8 focusable Featured rail; study HTML for 4.2–4.4; status → review

---

**Completion note:** Ultimate context engine analysis completed - comprehensive developer guide created
