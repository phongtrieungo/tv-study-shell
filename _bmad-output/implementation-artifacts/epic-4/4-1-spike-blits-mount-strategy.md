---
baseline_commit: 1466f1b60bd9679ff5fa40cd0c549e325fe5acab
---

# Story 4.1: Spike Blits mount strategy in monorepo

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a decided mount approach (embed vs iframe) for Blits inside Shell,
so that Home integrates without violating AD-1.

## Acceptance Criteria

1. **Given** official Blits/Lightning starter constraints  
   **When** the spike completes  
   **Then** a short ADR note in `packages/home-blits/README.md` states the chosen mount strategy  
   **And** a hello-world Blits view renders from Shell navigation

2. **And** Shell registry-swaps **only** `home` off the stub onto `@tvshell/home-blits` (EPG stays `@tvshell/epg-canvas`; WebGL Lab stays `@tvshell/webgl-lab`; Live stays stub)

3. **And** `mount` / `unmount` honor the Shell `SurfaceModule` contract; unmount tears down the Blits/Lightning runtime so remount works and cleanup probe is false

4. **And** a practical interview study HTML exists at `docs/study/epic-4/4-1-spike-blits-mount-strategy.html`, linked from `docs/index.md` (teaches Lab W metal vs Blits scene graph + why mount strategy matters — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Spike options and pick mount strategy (AC: #1)
  - [x] Read once: official starter path `npm create @lightningjs/app` + Blits getting started; skim `docs/webgl-investment.md` and README WebGL vocabulary (Lab W contrast)
  - [x] Evaluate **at least two** options against AD-1 / AD-2 / AD-6 / AD-7:
    1. **In-page embed** — Blits/Lightning renderer targets a host element inside Shell’s surface host (preferred default if viable with Vite + workspace)
    2. **iframe** — home-blits as a separately served Blits Vite app; Shell mounts an iframe and posts focus/Back coordination
  - [x] Record decision in `packages/home-blits/README.md` as a short ADR: Context → Options → Decision → Consequences (focus/Back, Vite plugins, cleanup, AD-1)
  - [x] Pin concrete package versions used (`@lightningjs/blits` 2.x current, `@lightningjs/renderer` peer) in package.json + mention in ADR
  - [x] **Do not** rewrite Shell as Blits; Shell stays thin DOM (AD-2)

- [x] Task 2: Create `@tvshell/home-blits` hello-world Surface (AC: #1, #3)
  - [x] New workspace package `packages/home-blits` — npm name `@tvshell/home-blits`
  - [x] Package shape mirrors peers: `"type": "module"`, `exports["."] → ./src/index.ts` (or documented entry that Shell can import), TypeScript **5.9.3**, depend on `@tvshell/shared` `workspace:*` **plus** Blits/renderer — **never** on `epg-canvas` / `webgl-lab` / `live-solid` / React (AD-1, AD-7)
  - [x] Export `mount(host, ctx?)` / `unmount()` / `hasActiveSideEffects()` matching Shell `SurfaceModule` + existing probe pattern
  - [x] Hello-world minimum: Blits/Lightning canvas visibly renders inside the host (solid color / text / single component is enough — **no** rail required yet)
  - [x] Log with `[home]` prefix
  - [x] On unmount (AD-6): destroy/stop Blits Application / renderer; remove listeners; clear host children; `hasActiveSideEffects()` → false; remount must work without orphan WebGL contexts
  - [x] Mount failures → surface status or thrown error so Shell banner can show (no silent blank)

- [x] Task 3: Registry-swap `home` only in Shell (AC: #2)
  - [x] `apps/shell/package.json`: add `"@tvshell/home-blits": "workspace:*"`
  - [x] `apps/shell/vite.config.ts`: add `@tvshell/home-blits` to `optimizeDeps.exclude`; add any **required** Blits Vite plugin / asset config documented in the ADR (keep changes minimal)
  - [x] `apps/shell/src/main.ts`: import home-blits; set `registry.home` + `probeBySurface.home`; keep `epg` / `webgl-lab` / `live` unchanged
  - [x] Update chrome / stub honesty copy so Home is no longer “stub-only” (`apps/shell/src/chrome/render-chrome.ts`, stub body text if it still names Home as stub)
  - [x] Console host summary: `home → @tvshell/home-blits; epg → epg-canvas; webgl-lab → webgl-lab; live → stub`

- [x] Task 4: Docs honesty (AC: #1, #4)
  - [x] `README.md`: Home package exists with hello-world Blits mount; rail / lazy textures / Home Perf Note still **4.2 / 4.3 / 4.4**
  - [x] `docs/index.md`: link 4.1 study HTML; next step → **4.2**
  - [x] Do **not** invent rail focus, lazy texture essay, or `docs/perf-notes/home-blits.md` yet

- [x] Task 5: Interview study HTML (AC: #4)
  - [x] Create `docs/study/epic-4/4-1-spike-blits-mount-strategy.html`
  - [x] Teach (interview-practical):
    - Lab W = raw buffers/textures/shaders/draw calls; Home = Blits scene graph on Lightning 3 (applied WebGL)
    - Why mount strategy is an architecture decision (AD-1 isolation vs AD-2 thin host vs focus/Back)
    - Chosen strategy + one rejected alternative with trade-offs
    - Cleanup: destroy renderer on leave (VRAM / context ≠ JS GC) — foreshadow 4.3
    - Honesty: learning lab, not production Lightning employment years
  - [x] Link from `docs/index.md` Study guides
  - [x] Follow epic-3 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 6: Smoke verify (AC: #1–#3)
  - [x] `pnpm install` if lockfile needs workspace link; `pnpm typecheck` green (shared + epg-canvas + webgl-lab + home-blits + shell)
  - [x] `pnpm --filter shell build` green
  - [x] Manual on `http://localhost:5180`: Menu → **Home** → Blits hello-world visible; Back → unmount + menu; remount works; EPG + WebGL Lab unchanged; Live still stub
  - [x] Leave logs cleanup probe **false** for home (`hasActiveSideEffects`)
  - [x] Confirm ADR exists in `packages/home-blits/README.md`
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright required for this story’s AC (Epic 7)
  - [x] Confirm `live-solid` still absent

## Dev Notes

### Scope boundaries (critical)

**In scope:** Decide embed vs iframe; document ADR in `packages/home-blits/README.md`; ship `@tvshell/home-blits` hello-world that mounts from Shell; registry-swap **only** `home`; SurfaceModule + cleanup; study HTML; README/docs honesty.

**Out of scope (later stories):**

- Focusable ≥12-tile Home rail → **4.2**
- Lazy texture load/unload documentation + dispose proof → **4.3**
- `docs/perf-notes/home-blits.md` → **4.4**
- Solid Live → **Epic 5**
- Cross-surface hardening / soak → **Epic 6**
- Vitest / Playwright / emulator notes → **Epic 7**
- Epic 4 synthesis HTML → **epic-4-retrospective**
- Second Home rail / personalization → PRD non-goal
- Replacing Blits with custom WebGL UI → AD-9 / PRD forbid
- Expanding Epic 2 deferred polish (HiDPI / Date.parse / overlapping nav) → **do not** unless Home is blocked (Epic 3 retro)
- React / Three.js — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-1** No cross-surface framework imports | `home-blits` may use Blits + `shared` only — never import EPG/WebGL/Live packages |
| **AD-2** Thin DOM Shell hosts Surfaces | Shell stays DOM; only registry entry + minimal Vite config for Blits |
| **AD-3** Mock Data only | Hello-world may ignore fixtures; do not add fetch |
| **AD-4** Shared D-pad map | Shell still owns Back→leave; hello-world need not handle arrows yet |
| **AD-6** Cleanup on leave | Destroy Blits/Lightning resources on unmount; probe false |
| **AD-7** React forbidden | No React |
| **AD-8** Perf Notes | Do not invent Home Perf Note here — **4.4** |
| **AD-9** Raw WebGL Lab | Do **not** replace or gut `webgl-lab`; Home is applied Blits, Lab W stays metal practice |
| **AD-10** Test ladder | Manual smoke + typecheck/build; automated later Epic 7 |
| **Deferred** iframe vs embed | **This story resolves it** — write the ADR |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`]

Canonical map: **FR-8–FR-10 → `packages/home-blits`** (this story unlocks the package + mount; 4.2–4.4 complete FR-8–10).

### Mount strategy guidance (spike criteria)

Architecture explicitly deferred iframe vs in-page until this spike. Prefer **in-page embed** if you can:

1. Launch Blits into `host` (or a child canvas/div Shell provides)
2. Destroy cleanly on `unmount`
3. Keep Shell Back working (capture-phase Surface keys must not steal Back — Shell `main.ts` owns Back→`host.leave()`)
4. Avoid a second long-lived Vite process in everyday `pnpm --filter shell` workflow

Choose **iframe** only if embed fights Vite/Blits plugin / dual-renderer ownership so badly that cleanup or HMR is unsafe — document why in the ADR.

Official onboarding: `npm create @lightningjs/app` (Vite + Blits). Latest Blits line at research time: **v2.1.x** (pin whatever is current stable when implementing). Peer: `@lightningjs/renderer` (Lightning 3).

**Launch API (embed path):** apps typically call `Blits.Launch(App, targetId, settings)` where `targetId` is a DOM id string (e.g. `'app'`). For Shell embed: create a host child with a stable `id`, Launch into it on `mount`, and tear down on `unmount` (Application/`hooks.destroy` + remove canvas). Settings may include `w`/`h`, `keymap`, optional `gpuMemory`. Confirm destroy/cleanup against current Blits docs while spiking — do not leave orphan Launch instances across remounts.

Contrast talking point (must appear in study HTML / ADR briefly):

> Lab W taught buffers/textures/shaders/draw calls by hand. Home uses Blits on Lightning 3 — same GPU class of problems, scene-graph DX.

### What already exists — reuse, do not reinvent

| Asset | Location | Use |
| --- | --- | --- |
| SurfaceModule contract | `apps/shell/src/host/types.ts` | `mount` / `unmount` signatures |
| Surface host | `apps/shell/src/host/surface-host.ts` | Already queues enter/leave; clears host children after unmount |
| Registry pattern | `apps/shell/src/main.ts` | Swap **only** `home` like `webgl-lab` / `epg` were swapped |
| Probe pattern | `hasActiveSideEffects` on epg-canvas / webgl-lab / stub | Mirror for home |
| Menu id | `SurfaceId = 'home'` in `apps/shell/src/menu/surfaces.ts` | Already listed |
| Fixtures | `homeRails` in `packages/shared` | **Not required** for hello-world; reserved for 4.2 |
| Lab W vocabulary | README `#webgl-vocabulary-this-lab` | Contrast in study HTML |
| Package template | `packages/webgl-lab` / `epg-canvas` | Workspace + exports + typecheck shape |

### Files to create / update

| Path | Action |
| --- | --- |
| `packages/home-blits/**` | **NEW** package (src, package.json, tsconfig, README ADR) |
| `apps/shell/package.json` | **UPDATE** workspace dep |
| `apps/shell/vite.config.ts` | **UPDATE** optimizeDeps + Blits needs per ADR |
| `apps/shell/src/main.ts` | **UPDATE** registry + probe for `home` |
| `apps/shell/src/chrome/render-chrome.ts` | **UPDATE** honesty copy if needed |
| `packages/surface-stub/src/index.ts` | **UPDATE** stub text if it still claims Home is stub-only for all |
| `README.md`, `docs/index.md` | **UPDATE** honesty + study link |
| `docs/study/epic-4/4-1-spike-blits-mount-strategy.html` | **NEW** |

### Previous story intelligence (Epic 3)

- Registry-swap one Surface at a time; leave others on stub/real packages untouched
- Prefer `[prefix]` logs; coalesce RAF when painting; Back stays with Shell
- Docs-first stories (3.2/3.3) avoided Surface refactors — this story **is** a Surface package, but keep hello-world thin
- Study HTML is DoD from 1.2+
- Do not expand Epic 2 deferred polish into Epic 4 unless blocked
- Align story Status with sprint-status at closeout (housekeeping lesson from Epic 3)

### Git intelligence

Recent commits: Epic 3 complete (`1466f1b`), WebGL Lab package (`340b926`), Epic 2 closeout. Pattern: workspace package → Shell registry swap → study HTML → docs honesty. Follow the same for Home.

### Latest tech notes

- Blits: `@lightningjs/blits` **2.x** (v2.1.1 released 2026-04); Vite-first; optional template precompile via Blits Vite plugin
- Renderer: `@lightningjs/renderer` Lightning 3 — WebGL primary, Canvas fallback
- Starter: `npm create @lightningjs/app` — use as reference; **fold** into `packages/home-blits`, do not leave a disconnected demo app at repo root
- Docs: https://www.lightningjs.io/v3-docs/blits/getting_started/getting_started.html · https://github.com/lightning-js/blits

### Project context reference

- Study DoD: `docs/study-guides.md` — per-story HTML under `docs/study/epic-4/`
- No `project-context.md` in repo; follow architecture spine + this story file

### Testing requirements

- `pnpm typecheck` + `pnpm --filter shell build`
- Manual Menu → Home → visible Blits → Back → remount; EPG/WebGL Lab regression smoke
- No Vitest/Playwright install for this story

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 4 / Story 4.1]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — §4.4 Home, UJ-2]
- [Source: `_bmad-output/planning-artifacts/architecture/.../ARCHITECTURE-SPINE.md` — AD-1/2/6/7/9, Deferred mount]
- [Source: `_bmad-output/planning-artifacts/research/technical-tv-ui-stack-lightning-solidjs-canvas-webgl-research-2026-07-22.md`]
- [Source: `_bmad-output/implementation-artifacts/epic-3/epic-3-retro-2026-07-24.md` — Epic 4 prep]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

- Blits templates with `%` widths failed at runtime (`parent.node` undefined) until fixed to absolute sizes.
- Vite served a stale `App.ts` until force-restart; prefer absolute Element sizes for hello-world.

### Completion Notes List

- Chose **in-page embed**; ADR in `packages/home-blits/README.md`.
- Pinned `@lightningjs/blits@2.8.4` (renderer **3.1.4** via peer).
- Shell registry-swaps only `home`; Live remains stub.
- Manual smoke: Home Blits canvas mounts; Escape → “Side effects cleared”; remount OK.
- Study HTML + README / docs index honesty updated.
- Blits Vite precompile plugin not required (runtime template compile; documented in ADR).

### File List

- `packages/home-blits/package.json` (NEW)
- `packages/home-blits/tsconfig.json` (NEW)
- `packages/home-blits/README.md` (NEW — ADR)
- `packages/home-blits/src/App.ts` (NEW)
- `packages/home-blits/src/index.ts` (NEW)
- `apps/shell/package.json`
- `apps/shell/vite.config.ts`
- `apps/shell/src/main.ts`
- `apps/shell/src/chrome/render-chrome.ts`
- `apps/shell/src/styles.css`
- `packages/surface-stub/src/index.ts`
- `README.md`
- `docs/index.md`
- `docs/study/epic-4/4-1-spike-blits-mount-strategy.html` (NEW)
- `pnpm-lock.yaml`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/epic-4/4-1-spike-blits-mount-strategy.md`

### Change Log

- 2026-07-24: Implemented Story 4.1 — Blits in-page mount spike, registry-swap Home, study HTML, docs honesty.

---

**Completion note:** Ultimate context engine analysis completed - comprehensive developer guide created
