---
baseline_commit: 15a2847510bb29db782f7bb86efb402773aa8cfd
---

# Story 1.4: Surface host mount/unmount contract

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a documented mount/unmount host API,
so that Surfaces clean up on leave (FR-2, AD-2, AD-6).

## Acceptance Criteria

1. **Given** a stub Surface package  
   **When** I enter and leave it from the menu  
   **Then** `mount` and `unmount` are invoked  

2. **And** unmount clears a test listener/timer registered by the stub

3. **And** a practical interview study HTML exists at `docs/study/1-4-surface-host-mount-unmount-contract.html`, linked from `docs/index.md` (teaches concepts — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Documented Surface module contract + stub package (AC: #1, #2)
  - [x] Add a **stub Surface workspace package** (suggested: `packages/surface-stub`, npm name `@tvshell/surface-stub`) — **do not** create real `epg-canvas` / `webgl-lab` / `home-blits` / `live-solid`
  - [x] Export a documented lifecycle API the Shell can call, e.g.:
    - `mount(host: HTMLElement, context?: { surfaceId: string }): void | Promise<void>`
    - `unmount(): void | Promise<void>`
  - [x] On `mount`: render a minimal stub UI into `host`; register **at least one** of: `window`/`document` event listener **or** `setInterval`/`setTimeout` (prefer both for teaching clarity — one listener + one timer is fine)
  - [x] On `unmount`: remove the listener, clear the timer, empty/detach stub DOM; leave **no** orphan side effects
  - [x] Expose a small inspectable proof for smoke (e.g. `hasActiveSideEffects(): boolean` or `getCleanupProbe()`), so manual/console verification is unambiguous
  - [x] Log with a Surface-ish prefix (e.g. `[surface-stub]`); Shell continues to use `[shell]`
  - [x] Package shape mirrors `@tvshell/shared`: `"type": "module"`, `exports["."] → ./src/index.ts`, `typescript` **5.9.3**, `workspace:*` from shell — no React

- [x] Task 2: Shell Surface host + chrome slots (AC: #1, #2)
  - [x] Add shell host module(s) under `apps/shell/src/host/` (e.g. `surface-host.ts`, optional `types.ts`) — keep `main.ts` as bootstrap only
  - [x] Extend chrome (`render-chrome.ts`) with:
    - A **reserved Surface host** element (`data-testid="surface-host"`) inside Safe Zone chrome (critical UI stays inset)
    - A **Shell-level error banner** slot (`data-testid="shell-error-banner"`, `role="alert"`) — show mount failures; no silent blank screens (architecture Errors convention)
  - [x] Host API responsibilities:
    - Resolve active Surface module for a `SurfaceId` (1.4: **all four menu ids may map to the same stub** via a registry — later epics swap registry entries)
    - On enter: if another Surface is active, `unmount` it first; then `mount` into the host element
    - On leave/Back from Surface: call `unmount`, clear host content ownership, restore menu mode
    - On mount throw/reject: show error banner + status; do not leave a half-mounted zombie
  - [x] Keep host API **generic** (`mount(el)` / `unmount()`) — Blits iframe vs embed is deferred to Story **4.1**; do not hard-code iframe now

- [x] Task 3: Wire menu Select / Back through the host (AC: #1, #2)
  - [x] Replace `acknowledgeSelect` in `main.ts` so Select calls the host enter path (not placeholder “Story 1.4” status)
  - [x] When a Surface is active: route **Back** (`getDpadAction` → `back`) to host leave → unmount → return focus to the menu (AD-4 partial loop). Menu Up/Down only when menu mode is active
  - [x] Preserve 1.3 menu/focus modules — extend hooks; do **not** rewrite Safe Zone or reinvent key maps
  - [x] Preserve: modifier-key guard; `AbortSignal` + HMR dispose; click → `setIndex` + `handleAction('select')`; valid `ul`>`li`>`button`; `[shell]` logs
  - [x] Scrub all user-visible “Story 1.4” / “not mounted yet” placeholder copy (subtitle, hint, status, Back-on-menu messaging) — clear deferred-work items when done
  - [x] Optional UX: hide or inert the menu list while Surface is active so focus ownership is obvious; restore on leave

- [x] Task 4: Docs honesty (AC: #1, #2)
  - [x] Update `README.md`: mount/unmount contract + stub now exist; real Surfaces still Epics 2–5; cleanup is proven on the stub
  - [x] Update `docs/index.md`: link 1.4 study HTML; next step → Epic 2 / Story **2.1** (create-story)
  - [x] Note in README or study: Memory Soak (6.2) still validates AD-6 for real Surfaces — stub is the contract proof, not a 30‑min soak report

- [x] Task 5: Interview study HTML (AC: #3)
  - [x] Create `docs/study/1-4-surface-host-mount-unmount-contract.html`
  - [x] Teach (interview-practical): thin Shell vs Surface ownership; why `mount`/`unmount` beats “just swap DOM”; AD-6 cleanup checklist (listeners, timers, RAF, textures); enter/leave flow from menu; error banner honesty; stub vs future real packages; what 4.1 may change (Blits mount strategy)
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow 1.2/1.3 study pattern (mental models + whiteboard points), not a changelog

- [x] Task 6: Smoke verify (AC: #1, #2)
  - [x] `pnpm --filter shell typecheck` (and root `pnpm typecheck`) green
  - [x] Stub package typecheck green if it has a script
  - [x] `pnpm --filter shell build` green
  - [x] Manual on `http://localhost:5180`: Enter on a menu item → stub mounts (visible UI + `[shell]`/`[surface-stub]` logs); Back → unmount; probe shows listener/timer cleared; remount works; Safe Zone still visible
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright install required for this story’s AC
  - [x] Confirm real Surface packages still absent (`epg-canvas`, `webgl-lab`, `home-blits`, `live-solid`)

### Review Findings

- [x] [Review][Patch] Serialize enter/leave so overlapping Back/Enter cannot interleave lifecycle [`apps/shell/src/host/surface-host.ts`, `apps/shell/src/main.ts`]
- [x] [Review][Patch] Keep Surface active until unmount finishes; on unmount failure still clear host DOM and do not proceed to mount [`apps/shell/src/host/surface-host.ts`]
- [x] [Review][Patch] On mount failure after partial side effects, call `unmount` before clearing host [`apps/shell/src/host/surface-host.ts`]
- [x] [Review][Patch] Move document focus off hidden menu when Surface is active; restore on leave [`apps/shell/src/main.ts`, `apps/shell/src/chrome/render-chrome.ts`]
- [x] [Review][Patch] Align leave status/probe logging with `hasActiveSideEffects()` (avoid claiming cleanup or logging probe on no-op leave) [`apps/shell/src/host/surface-host.ts`, `apps/shell/src/main.ts`]
- [x] [Review][Patch] Deduplicate `SurfaceMountContext` (host vs stub) to avoid contract drift [`apps/shell/src/host/types.ts`, `packages/surface-stub/src/index.ts`]
- [x] [Review][Defer] Lifecycle timeout if mount/unmount Promise never settles [`apps/shell/src/host/surface-host.ts`] — deferred, pre-existing hardening for Epic 6 / real async Surfaces

## Dev Notes

### Scope boundaries (critical)

**In scope:** Documented Shell host `mount`/`unmount`; stub Surface package that registers and clears a listener/timer; chrome host + error-banner slots; menu enter/leave wiring; scrub 1.4 placeholders; study HTML; README/docs honesty.

**Out of scope (later stories):**
- Real EPG / WebGL / Home / Live Surface implementations → **Epics 2–5**
- Blits iframe vs in-page mount strategy → **4.1** (keep host generic)
- Full cross-surface nav hardening / focus restore matrix → **6.1**
- Memory Soak procedure + report → **6.2**
- Vitest / Playwright automation → **7.1 / 7.2** (keep `data-testid`s stable)
- Unit tests for menu focus state machine → **7.1** (still deferred)
- Production launchers, OEM remote key codes, React — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-2** Thin DOM Shell hosts Surfaces | Shell stays Vite + TypeScript **DOM only**. Surfaces mount into a **host element**. Shell calls documented `mount`/`unmount` on enter/leave. |
| **AD-6** Resource cleanup on leave | Stub must prove dispose of listener/timer on `unmount`. Design so real Surfaces can dispose RAF/textures the same way later. |
| **AD-4** Shared D-pad + Back | Consume `@tvshell/shared` helpers. Back at Surface root returns to Shell menu (implement this loop for the stub). |
| **AD-1** No cross-surface imports | Stub may depend on `shared` only — never on another Surface package (none should exist yet). |
| **AD-7** React forbidden | Do not add React. |
| **AD-10** Test ladder | Manual smoke + typecheck/build; no Vitest/Playwright required for AC. |
| **Errors convention** | Mount failures → Shell error banner; no silent blank screens. |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-2, AD-4, AD-6, Consistency Conventions]

Canonical flow:

```text
menu[Surface menu] -->|select| host[Surface host]
host -->|mount| surface[Active Surface]
surface -->|Back| menu
```

### Files being modified (UPDATE) — read before coding

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `apps/shell/src/main.ts` | Select = acknowledge + “Story 1.4” status; Back on menu = no-op; single keydown + click via AbortSignal | Select → host enter; active-Surface Back → unmount → menu; optional menu/surface input modes | `#app` check; modifier guard; AbortSignal/HMR; `[shell]` prefix; no framework UI |
| `apps/shell/src/chrome/render-chrome.ts` | `menuHost` + status; subtitle/hint say mount is 1.4; **no** surface host / error banner | Add `surfaceHost` + error banner APIs; scrub placeholder copy | Safe Zone label inside inset; `role="status"` live region; `data-testid`s |
| `apps/shell/src/styles.css` | Safe Zone + menu focus styles | Host viewport + error banner + surface-active layout | Safe Zone vars (~5% / min 48×27); focus ring; `font-weight: 600` |
| `apps/shell/src/menu/*` | Focusable four-item menu; `SurfaceId` shell-local | Minimal hooks if needed (e.g. show/hide); prefer host owns mode | `SURFACE_MENU`, `isSurfaceId`, `ul`>`li`>`button`, focus controller indexing menu only |
| `apps/shell/package.json` | Depends on `@tvshell/shared` only | Add `@tvshell/surface-stub` (or chosen stub name) `workspace:*` | TS 5.9.3, Vite 6.4.3, scripts |
| `apps/shell/vite.config.ts` | `optimizeDeps.exclude: ['@tvshell/shared']` | Exclude stub package the same way if HMR/prebundle bites | Port **5180**, `strictPort: true` |
| `README.md` / `docs/index.md` | Mount still “next” | Honesty: contract + stub shipped; next = 2.1 | Getting started; no-React; study convention |

### Suggested target structure (after this story)

```text
apps/shell/
  src/
    main.ts                    # UPDATE — bootstrap + wire host
    styles.css                 # UPDATE — host + error + surface-active
    chrome/
      render-chrome.ts         # UPDATE — surfaceHost + error banner; scrub copy
      safe-zone.ts             # KEEP
    menu/                      # KEEP (minimal touch)
    host/
      types.ts                 # NEW — SurfaceModule contract types
      surface-host.ts          # NEW — enter/leave, registry, error handling
packages/
  surface-stub/                # NEW — @tvshell/surface-stub
    package.json
    tsconfig.json
    src/
      index.ts                 # mount / unmount / cleanup probe
docs/study/1-4-surface-host-mount-unmount-contract.html  # NEW
docs/index.md                  # UPDATE
README.md                      # UPDATE
```

Exact filenames may vary; keep modules small and vanilla DOM.

### Contract sketch (illustrative — adapt, don’t cargo-cult)

```ts
// packages/surface-stub/src/index.ts
export type SurfaceMountContext = { surfaceId: string };

let timerId: ReturnType<typeof setInterval> | null = null;
let onKey: ((e: Event) => void) | null = null;

export function mount(host: HTMLElement, ctx?: SurfaceMountContext): void {
  host.replaceChildren(/* stub title + “mounted” copy */);
  onKey = () => { /* no-op or log — proves listener exists */ };
  window.addEventListener('keydown', onKey);
  timerId = setInterval(() => { /* tick log or DOM heartbeat */ }, 1000);
  console.info('[surface-stub] mount', ctx?.surfaceId);
}

export function unmount(): void {
  if (onKey) window.removeEventListener('keydown', onKey);
  onKey = null;
  if (timerId != null) clearInterval(timerId);
  timerId = null;
  console.info('[surface-stub] unmount');
}

export function hasActiveSideEffects(): boolean {
  return onKey != null || timerId != null;
}
```

```ts
// apps/shell/src/host/surface-host.ts (shape)
export type SurfaceModule = {
  mount: (host: HTMLElement, ctx?: { surfaceId: string }) => void | Promise<void>;
  unmount: () => void | Promise<void>;
};

// Registry: every SurfaceId → stub for Story 1.4
// Later: epg → @tvshell/epg-canvas, etc.
```

**Switching Surfaces:** Select while mounted → `unmount` current → `mount` next. Never stack two active Surface side effects.

**Stub listener vs Shell keydown:** Prefer a dedicated stub listener (e.g. `resize`, `visibilitychange`, or a namespaced CustomEvent) **or** a timer-only proof if a second `keydown` listener confuses debugging. If using `keydown` in the stub, document that Shell still owns navigation Back in surface mode. Timer + non-keydown listener is the safest teaching combo.

### Library / version pins (do not churn)

| Package | Pin in repo | Guidance |
| --- | --- | --- |
| TypeScript | **5.9.3** | Unchanged (stub + shell) |
| Vite (shell) | **6.4.3** | Unchanged; port **5180** + `strictPort` |
| pnpm | **9.0.5** | Unchanged |
| `@tvshell/shared` | `workspace:*` | Keep consuming input helpers |
| Stub package | `workspace:*` | New; source export like shared |
| Vitest / Playwright / Blits / Solid / three | **Do not install** | Later epics |
| React | **Forbidden** | AD-7 |
| single-spa / Module Federation | **Do not add** | Overkill — explicit `mount`/`unmount` exports + workspace import are enough |

### Anti-patterns (do not)

- Create real Lab packages (`epg-canvas`, `webgl-lab`, `home-blits`, `live-solid`) “for later”
- Mount without a matching unmount path / leave timers or listeners alive after Back
- Silent mount failure (blank host, no banner/status)
- Rewrite Safe Zone chrome or redefine D-pad keys
- Build Shell or stub in React/Solid
- Hard-code Blits iframe strategy (steals **4.1**)
- Leave “Story 1.4” placeholder strings after mount ships
- Study HTML that only lists files changed
- Install Vitest/Playwright “to finish the story”
- Claim Memory Soak / OEM TV leak-proofing from a desktop stub demo
- Steal Epic 6 cross-surface hardening scope

### Testing requirements (this story)

- Manual keyboard smoke on :5180: Select → mount → Back → unmount + cleared side effects; remount; Safe Zone intact
- Console/probe proof that stub listener/timer is gone after unmount
- `pnpm typecheck` + shell `build`
- No Vitest/Playwright required for AC
- Keep `data-testid`s: existing menu/chrome + new `surface-host` / `shell-error-banner`

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear DOM modules over clever abstractions
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)

### Previous story intelligence (1.3)

- Delivered: Safe Zone (~5% / min 48×27) + four-item focusable menu; Select acknowledge only; `SurfaceId` shell-local; modules under `chrome/` + `menu/`
- Explicit handoffs into this story (also in `deferred-work.md`):
  1. Reserved Surface host + error-banner DOM slots
  2. Scrub user-visible “Story 1.4” deferral copy
  3. Real mount/unmount + stub Surface
- Review patches to **preserve** when editing shell: `ul`>`li`>`button`; Safe Zone label inside inset; modifier guard; click→`handleAction('select')`; `aria-hidden` decorative guide; `isSurfaceId` reuse; AbortSignal/HMR; `font-weight: 600`
- Testing pattern: typecheck + build + manual :5180 smoke; no Vitest yet
- Do not reinvent menu/focus — plug host into Select/Back

[Source: `_bmad-output/implementation-artifacts/1-3-safe-zone-shell-chrome-and-surface-menu.md`]
[Source: `_bmad-output/implementation-artifacts/deferred-work.md`]

### Git intelligence

Recent commits:
- `15a2847` — Add Safe Zone shell chrome and focusable Surface menu for Story 1.3
- `a8dd356` — Add shared mock fixtures and D-pad key map for Story 1.2
- `baa282b` — Scaffold pnpm monorepo with Vite shell and shared package

Patterns to follow: small focused modules, workspace source exports, README honesty, vanilla shell, no React, study HTML as DoD. Commit title style when asked later: `Add <capability> for Story X.Y.`

### Latest tech notes (2026-07-22)

- Industry micro-frontend hosts (single-spa, Vite remotes) converge on the same idea AD-2 already chose: **export `mount`/`unmount`, host owns enter/leave**. Do **not** add single-spa or Module Federation for a portfolio stub — a workspace package + explicit functions is the teaching surface.
- Prefer sync `mount`/`unmount` for the stub; if you use `async`, the host must `await` and still surface errors on the banner.
- Vite workspace packages: keep stub TS as source export (`exports: { ".": "./src/index.ts" }`) and add it to `optimizeDeps.exclude` alongside `@tvshell/shared` if prebundling interferes with HMR.
- Cleanup interview line: “Shell calls unmount; Surface disposes what it created” — ownership is the point of AD-6.

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 1.4 |
| --- | --- |
| 2.1+ EPG / 3.1 WebGL / 4.x Home / 5.1 Live | Stable host element + `mount`/`unmount` registry swap-in |
| 4.1 Blits mount spike | Generic host (element or route root) — not iframe-locked |
| 6.1 cross-surface nav | Enter/leave + Back→menu already exist; harden focus restore later |
| 6.2 Memory Soak | Real Surfaces must follow the same unmount dispose contract |
| 7.2 Playwright | `data-testid` on host/banner; menu → Surface → Back path |

### Deferred work to clear when done

From `_bmad-output/implementation-artifacts/deferred-work.md` (1.3 review):

- [ ] No reserved Surface host / error-banner DOM slot → **resolve in this story**
- [ ] User-visible “Story 1.4” deferral copy → **scrub in this story**
- [ ] Menu focus unit tests → **leave deferred for 7.1** (do not expand)

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1 / Story 1.4]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-2, AD-6, AD-4, Errors convention, Structural Seed flowchart, Deferred Blits mount]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-2 consequences (cleanup hooks); Shell hosting preference]
- [Source: `_bmad-output/implementation-artifacts/1-3-safe-zone-shell-chrome-and-surface-menu.md`]
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md`]
- [Source: `docs/study-guides.md` — study HTML from 1.2+]
- [Source: `docs/testing-strategy.md` — D-pad smoke later; app-owned hooks]
- [Source: `docs/study/1-3-safe-zone-shell-chrome-and-surface-menu.html` — Select ≠ mount teaching handoff]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `pnpm install --no-frozen-lockfile` — linked `@tvshell/surface-stub`
- `pnpm typecheck` — pass (shared, surface-stub, shell)
- `pnpm --filter shell build` — pass (Vite production build)
- Manual browser smoke on `:5180`: Enter → stub mounts (Home); Escape → unmount; `hasActiveSideEffects() === false`; remount works; Safe Zone frame still present
- Confirmed: only `packages/shared` + `packages/surface-stub`; no react deps; no real Lab packages

### Completion Notes List

- Added `@tvshell/surface-stub` with `mount`/`unmount`/`hasActiveSideEffects`; registers visibility listener + interval; clears both on unmount.
- Shell host (`apps/shell/src/host/`) uses a registry (all four `SurfaceId`s → stub); enter/leave with error banner on mount failure.
- Chrome gained `surface-host` + `shell-error-banner`; menu hides while Surface active; scrubbed Story 1.4 placeholder copy.
- Wired Select → `host.enter`, Surface Back → `host.leave`; preserved 1.3 menu/focus, modifier guard, AbortSignal/HMR.
- Study HTML + README / docs/index honesty; deferred-work items for host slot + placeholder copy marked resolved.
- No Vitest/Playwright/React/real Lab packages added (per story scope).

- Code review patches applied: serialized enter/leave queue; active id held until unmount completes; mount-failure calls unmount; surface-host focus; cleanupProbe-driven status; stub drops duplicate SurfaceMountContext export.

### File List

- `README.md`
- `_bmad-output/implementation-artifacts/1-4-surface-host-mount-unmount-contract.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/shell/package.json`
- `apps/shell/vite.config.ts`
- `apps/shell/src/main.ts`
- `apps/shell/src/styles.css`
- `apps/shell/src/chrome/render-chrome.ts`
- `apps/shell/src/host/types.ts`
- `apps/shell/src/host/surface-host.ts`
- `docs/index.md`
- `docs/study/1-4-surface-host-mount-unmount-contract.html`
- `packages/surface-stub/package.json`
- `packages/surface-stub/tsconfig.json`
- `packages/surface-stub/src/index.ts`
- `pnpm-lock.yaml`

## Change Log

- 2026-07-22: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-22: Implemented surface host mount/unmount + stub Surface, study HTML, docs honesty; status → review
- 2026-07-22: Code review patches applied (lifecycle serialize, cleanup honesty, focus); status → done
