---
baseline_commit: a8dd356722f35374cd0bb3c41d75f587b1fff594
---

# Story 1.3: Safe Zone shell chrome and surface menu

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a Safe Zone inset and a Surface menu,
so that the app feels TV-shaped and I can choose Home / Live / EPG / WebGL Lab (FR-1, FR-3).

## Acceptance Criteria

1. **Given** Shell is running  
   **When** I view the entry screen  
   **Then** Safe Zone margins are visible  

2. **And** Home, Live, EPG, and WebGL Lab destinations are listed and focusable via keyboard

3. **And** a practical interview study HTML exists at `docs/study/1-3-safe-zone-shell-chrome-and-surface-menu.html`, linked from `docs/index.md` (teaches concepts — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Safe Zone chrome in `apps/shell` (AC: #1)
  - [x] Replace the text-only `#app` proof with thin DOM shell chrome (vanilla TypeScript — **AD-2**; no React/Solid/Blits)
  - [x] Apply a visible Safe Zone inset: prefer **~5% per edge** (at 1920×1080 ≈ **48px horizontal / 27px vertical**), matching domain research + Android TV / Fire TV guidance
  - [x] Make the Safe Zone **visually obvious** on the entry screen (e.g. inset padding on chrome + a subtle border/overlay guide). Decorative full-bleed background may extend to the viewport edge; **focusable items and labels must sit inside** the inset
  - [x] Use large-enough / lean-back readable chrome typography (FR-3 “10-foot”); keep visuals sparse — polish beyond Safe Zone is deferred
  - [x] Keep logging prefix `[shell]`

- [x] Task 2: Surface menu with four destinations (AC: #2)
  - [x] List exactly four destinations titled **Home / Live / EPG / WebGL Lab** (architecture naming; MVP includes WebGL Lab even if older FR-1 consequence text listed three)
  - [x] One primary visible focus at a time; never leave the menu with no visible focus
  - [x] Keyboard/D-pad: move focus with ArrowUp/ArrowDown (vertical list is fine); Select with Enter via `@tvshell/shared` helpers (`getDpadAction` / `normalizeDpadKey` / `KEY`) — **do not redefine keys**
  - [x] On Select: show a clear, non-destructive acknowledgment (e.g. status line / `[shell]` log with selected surface id). **Do not** implement real Surface mount/unmount (that is **Story 1.4**)
  - [x] Optional: handle Back on the menu as a no-op or mild log (full Back→menu from Surfaces lands in 1.4+)
  - [x] Prefer `data-testid` hooks on chrome/menu items for future Playwright (`docs/testing-strategy.md`) — keep names stable and boring

- [x] Task 3: Shell module structure (AC: #1, #2)
  - [x] Split chrome/menu into small modules under `apps/shell/src/` (e.g. `chrome/`, `menu/`, `styles.css`) rather than one giant `main.ts`
  - [x] `main.ts` bootstraps: mount chrome into `#app`, attach a single `keydown` listener (or focused element handlers), default focus to first menu item
  - [x] Update `index.html` only as needed (title, link stylesheet, minimal structure). Keep `#app` as the mount root unless you intentionally document a different host
  - [x] Optional: export a tiny `SurfaceId` union in shell (or shared) for the four labels — **do not** create Surface packages

- [x] Task 4: Docs honesty (AC: #1, #2)
  - [x] Update `README.md` Getting started / D-pad note: Safe Zone + menu now exist; clarify Select acknowledges choice but mount contract is still **1.4**
  - [x] Update `docs/index.md` next-step → Story **1.4** after this story lands

- [x] Task 5: Interview study HTML (AC: #3)
  - [x] Create `docs/study/1-3-safe-zone-shell-chrome-and-surface-menu.html`
  - [x] Cover: overscan vs Safe Zone (~5% / 48×27 at 1080p), why critical UI stays inside, thin DOM Shell vs Surface renderers, single visible Focus, shared D-pad consumption, honesty bounds (desktop mock ≠ OEM TV; Select ≠ mount yet)
  - [x] Link from `docs/index.md` Study guides section
  - [x] Follow the practical-interview pattern of the 1.2 study page (mental models + whiteboard points), not a changelog

- [x] Task 6: Smoke verify (AC: #1, #2)
  - [x] `pnpm --filter shell typecheck` (and root `pnpm typecheck`) green
  - [x] `pnpm --filter shell build` green
  - [x] Manual: open `http://localhost:5180`, confirm Safe Zone is visible, Tab/arrow focus moves across all four items, Enter selects, focus ring/state is obvious
  - [x] Confirm no `react` / `react-dom`; no Vitest/Playwright install required for this story’s AC
  - [x] Confirm no Surface packages created (`epg-canvas`, `webgl-lab`, `home-blits`, `live-solid` still absent)

### Review Findings

- [x] [Review][Patch] Wrap menu items in `<li>` (invalid `ul` > `button`) [`apps/shell/src/menu/render-menu.ts:17`]
- [x] [Review][Patch] Move Safe Zone teaching label inside the inset (currently above the frame) [`apps/shell/src/styles.css:59`]
- [x] [Review][Patch] Skip `preventDefault` when Ctrl/Meta/Alt modifiers are held on D-pad keys [`apps/shell/src/main.ts:36`]
- [x] [Review][Patch] Route click select through `handleAction('select')` after `setIndex` [`apps/shell/src/main.ts:46`]
- [x] [Review][Patch] Mark Safe Zone label `aria-hidden` (decorative guide) [`apps/shell/src/chrome/safe-zone.ts:16`]
- [x] [Review][Patch] Use `isSurfaceId` in `surfaceIdFromElement` (drop parallel validator) [`apps/shell/src/menu/render-menu.ts:48`]
- [x] [Review][Patch] Remove unused `length` option from focus controller (indexes `SURFACE_MENU` only) [`apps/shell/src/menu/focus-menu.ts:12`]
- [x] [Review][Patch] Register keydown/click with `AbortSignal` to avoid duplicate listeners on HMR re-eval [`apps/shell/src/main.ts:36`]
- [x] [Review][Patch] Change `font-weight: 650` to `600` for broader Chromium support [`apps/shell/src/styles.css`]
- [x] [Review][Patch] Remove `apps/shell/index.html` from story File List (unchanged; CSS via `main.ts` import)
- [x] [Review][Defer] No reserved Surface host DOM slot for 1.4 — deferred, pre-existing for next story
- [x] [Review][Defer] No unit tests for menu focus state machine — deferred, pre-existing (Story 7.1)
- [x] [Review][Defer] User-visible “Story 1.4” placeholder strings in chrome — deferred until mount lands

## Dev Notes

### Scope boundaries (critical)

**In scope:** Visible Safe Zone chrome + focusable four-item Surface menu in the thin DOM Shell; consume shared D-pad map; study HTML; README/docs honesty.

**Out of scope (later stories):**

- Surface host `mount` / `unmount` contract + stub Surface → **1.4**
- Real EPG / WebGL / Home / Live packages → **Epics 2–5**
- Back returns from Surface root to menu → **1.4+** (AD-4 full loop)
- Shared design tokens beyond Safe Zone / visual polish → deferred (architecture)
- Vitest / Playwright automation → **7.1 / 7.2** (optional `data-testid` now is fine)
- Production launchers, OEM remote key codes, React — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-2** Thin DOM Shell | Implement chrome + menu in `apps/shell` with Vite + TypeScript **DOM only**. No framework UI shell. |
| **AD-4** Shared D-pad map | Import `KEY` / `getDpadAction` / `normalizeDpadKey` / `isBackKey` from `@tvshell/shared`. Do not fork key strings. |
| **AD-6** Cleanup on leave | Not required yet (no real Surfaces). Leave room in DOM for a future host element / error banner (1.4). |
| **AD-7** React forbidden | Do not add React. |
| **AD-1** No cross-surface imports | Do not create or stub-import Surface packages. |
| **AD-10** Test ladder | Manual keyboard smoke + typecheck/build; Playwright later. |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-2, AD-4, Consistency Conventions]

### Files being modified (UPDATE) — read before coding

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `apps/shell/src/main.ts` | Imports fixtures + `DPAD_KEYS` + `SHARED_MARKER`; sets `#app` `textContent` to counts; `[shell]` log; **no keydown / focus / chrome** | Bootstrap Safe Zone chrome + Surface menu; wire keyboard via shared helpers | `#app` presence check / throw; `[shell]` log prefix; no framework UI; do not break Vite entry |
| `apps/shell/index.html` | Minimal `#app` + module script; no CSS | Link stylesheet and/or allow chrome to own DOM under `#app` | `lang`, charset, script module to `/src/main.ts` |
| `README.md` | Says menu / Safe Zone “still lands in later Epic 1 stories” | Document visible Safe Zone + focusable menu; honesty that mount is 1.4 | Getting started (`pnpm install` / `pnpm dev` → :5180); no-React non-goals |
| `docs/index.md` | Next step = create-story 1.3; study list has 1.2 only | Link 1.3 study HTML; next step → 1.4 | Existing planning links + study-guides convention |

### Suggested target structure (after this story)

```text
apps/shell/
  index.html                 # UPDATE — link CSS if needed
  src/
    main.ts                  # UPDATE — bootstrap only
    styles.css               # NEW — Safe Zone + focus + 10-foot chrome
    chrome/
      safe-zone.ts           # NEW — inset / guide helpers (optional split)
      render-chrome.ts       # NEW — shell chrome DOM
    menu/
      surfaces.ts            # NEW — SurfaceId + label list (4 items)
      focus-menu.ts          # NEW — focus index + key handling
      render-menu.ts         # NEW — menu DOM + data-testid
docs/study/1-3-safe-zone-shell-chrome-and-surface-menu.html  # NEW
docs/index.md                # UPDATE
README.md                    # UPDATE
```

Exact filenames may vary; keep modules small and vanilla DOM.

### Safe Zone implementation guidance

**Canonical numbers for this repo** (domain research + industry TV guidelines):

| Concept | Value |
| --- | --- |
| Margin | ~**5% per edge** (inner ~90% “safe”) |
| At 1920×1080 | ~**48px** left/right, ~**27px** top/bottom |
| CSS options | `padding: 2.7% 2.5%` **or** fixed `padding: 27px 48px` on chrome content; or CSS variables `--safe-zone-x` / `--safe-zone-y` |
| Background | May be full-bleed; do **not** crop critical UI to the outer 5% |
| Visibility | Learner must **see** the inset (guide border, labeled overlay, or contrasting chrome frame). Invisible padding alone fails AC #1 |

Interview talking point: overscan is manufacturer-dependent; 5% is a **portfolio convention**, not a guarantee on every TV.

[Source: domain research; Android TV layouts (48dp/27dp); Amazon Fire TV UX — outer 5%]

### Surface menu behavior (1.3 vs 1.4)

Architecture flow:

```text
menu[Surface menu] -->|select| host[Surface host]
host -->|mount| surface[Active Surface]
surface -->|Back| menu
```

**1.3 owns the menu (+ Safe Zone).** Selecting an item must be focusable and acknowledged, but **must not** invent a fake mount API or create Surface packages. Leave a clear TODO / status copy that mount lands in 1.4.

Suggested shell-local ids (illustrative):

```ts
export type SurfaceId = 'home' | 'live' | 'epg' | 'webgl-lab';

export const SURFACE_MENU = [
  { id: 'home', label: 'Home' },
  { id: 'live', label: 'Live' },
  { id: 'epg', label: 'EPG' },
  { id: 'webgl-lab', label: 'WebGL Lab' },
] as const;
```

Prefer keeping `SurfaceId` in `apps/shell` for now (shared package has no surface types yet). Promote to `@tvshell/shared` only if 1.4 needs the same union.

### Focus / keyboard patterns (reuse shared input)

Already shipped in `packages/shared/src/input/index.ts`:

- `KEY`, `DPAD_KEYS`, `DpadAction`
- `normalizeDpadKey(value)`, `getDpadAction(event)`, `isBackKey(value)`

Menu wiring sketch:

```ts
import { getDpadAction } from '@tvshell/shared';

window.addEventListener('keydown', (event) => {
  const action = getDpadAction(event);
  if (!action) return;
  event.preventDefault();
  // up/down → move focus index; select → acknowledge SURFACE_MENU[index]
});
```

**Visible focus:** use a high-contrast outline/background on the focused item (10-foot). Do not rely on browser `:focus` alone if the focused node is not focusable — either use real `tabIndex={0}` + `element.focus()` or an explicit `aria-selected` / `.is-focused` class driven by your index.

Preserve fixture imports only if still useful for a debug readout; they are **not** required for AC. Do not let fixture text replace the menu UI.

### Library / version pins (do not churn)

| Package | Pin in repo | Guidance |
| --- | --- | --- |
| TypeScript | **5.9.3** | Unchanged |
| Vite (shell) | **6.4.3** | Unchanged; port **5180** + `strictPort: true` |
| pnpm | **9.0.5** | Unchanged |
| `@tvshell/shared` | `workspace:*` | Consume input helpers |
| Vitest / Playwright / Blits / Solid / three | **Do not install** | Later epics |
| React | **Forbidden** | AD-7 |

### Anti-patterns (do not)

- Implement mount/unmount host API or stub Surface package (steals **1.4**)
- Build menu in React/Solid “just for chrome”
- Redefine Arrow/Enter/Back key strings instead of importing `@tvshell/shared`
- Invisible Safe Zone (padding with no visible guide) — fails AC #1
- Only three destinations (omit WebGL Lab) — fails architecture/MVP naming
- Create empty `packages/epg-canvas` etc. “for later”
- Claim OEM remote / overscan parity from a desktop Chromium mock
- Study HTML that only lists files changed
- Install Vitest/Playwright “to finish the story”

### Testing requirements (this story)

- Manual keyboard smoke on :5180 (Safe Zone visible + four focusable items + Enter)
- `pnpm typecheck` + shell `build`
- No Vitest/Playwright required for AC
- Optional: tiny shell-local smoke script is fine but not required; prefer not expanding the 1.2 shared smoke scope into chrome DOM

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear DOM modules over clever abstractions
- Study guides are **DoD from 1.2 forward** (persistent BMAD fact)

### Previous story intelligence (1.2)

- Delivered: typed fixtures (≥50 ch / ≥24h / ≥12 rail), immutable exports, shared D-pad map (`KEY`, `getDpadAction`, …), study HTML, shell proof still **text-only**
- Explicitly deferred: Safe Zone + Surface menu → **this story**; “Do not wire Shell menu focus”
- Review patches: offline `posterUrl`; readonly fixtures — unrelated to chrome; leave fixtures alone unless needed
- Testing pattern: typecheck + build + manual/Node smoke; no Vitest yet
- Downstream note from 1.2: “**1.3 menu** \| Shared arrow / Enter / Back constants” — consume them

[Source: `_bmad-output/implementation-artifacts/1-2-shared-fixtures-and-dpad-key-map.md`]

### Git intelligence

Recent commits:

- `a8dd356` — Add shared mock fixtures and D-pad key map for Story 1.2
- `baa282b` — Scaffold pnpm monorepo with Vite shell and shared package

Patterns to follow: small focused modules, workspace source exports, README honesty, vanilla shell, no React, study HTML as DoD.

### Latest tech notes (2026-07-22)

- TV Safe Zone / overscan: industry still recommends keeping critical UI inside ~5% margins (Android TV: 48 / 27 at 1080p; Fire TV: outer 5%). Modern panels vary; treat as a **visible teaching overlay** on desktop, not a measured OEM guarantee.
- Prefer CSS that scales with viewport (`%` or `vmin`) if you want the guide honest when the browser window is not exactly 1920×1080; fixed px is acceptable if you document the 1080p assumption (testing-strategy mentions fixed 1920×1080 + Safe Zone overlay).
- Continue using `KeyboardEvent.key` via shared helpers for Playwright friendliness later (`page.keyboard.press('ArrowDown')`).

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 1.3 |
| --- | --- |
| 1.4 mount host | Menu Select entry point + place to attach host element; surface id vocabulary |
| 2.2 / 4.2 / 5.1 focus | Visible-focus habit + shared key consumption pattern |
| 6.1 cross-surface nav | Menu as home of Back stack |
| 7.2 Playwright | `data-testid` on chrome/menu; D-pad key names unchanged |

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1 / Story 1.3]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-2, AD-4, AD-7, Consistency Conventions (Surface titles)]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-1, FR-3; Glossary Safe Zone / Focus; §4.1 Shell]
- [Source: `_bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md` — Safe Zone ~5% / ~48×27; 10-foot UI; focus rules]
- [Source: `docs/study-guides.md` — study HTML from 1.2+]
- [Source: `docs/testing-strategy.md` — `data-testid` on Shell chrome; 1920×1080 + Safe Zone overlay]
- [Source: `_bmad-output/implementation-artifacts/1-2-shared-fixtures-and-dpad-key-map.md`]
- [Source: Android TV Layouts — overscan 48dp / 27dp; Amazon Fire TV Design Guidelines — outer 5%]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `pnpm --filter shell typecheck` — pass
- `pnpm typecheck` — pass
- `pnpm --filter shell build` — pass (Vite production build)
- Manual browser smoke on `:5180`: Safe Zone guide visible; ArrowDown → Live; Enter updates status “Selected Live (live)… Story 1.4”
- Confirmed: only `packages/shared` exists; no react deps

### Completion Notes List

- Replaced text-only shell proof with vanilla DOM Safe Zone chrome (dashed inset guide + ~5% / min 48×27 padding) and 10-foot menu typography.
- Added four-item Surface menu (Home / Live / EPG / WebGL Lab) with shared `getDpadAction` focus/select; Select acknowledges only (no mount).
- Split modules under `apps/shell/src/chrome` and `menu`; `SurfaceId` kept shell-local; `data-testid` hooks added for later Playwright.
- Study HTML + README / docs/index honesty updates; next step points at Story 1.4.
- No Vitest/Playwright/React/Surface packages added (per story scope).
- Code review patches applied: valid `ul`>`li`>`button` menu markup; Safe Zone label inside chrome inset; modifier-key guard; click→`handleAction('select')`; `aria-hidden` label; `isSurfaceId` reuse; removed unused focus `length`; AbortSignal + HMR dispose; `font-weight: 600`; File List corrected.

### File List

- `README.md`
- `_bmad-output/implementation-artifacts/1-3-safe-zone-shell-chrome-and-surface-menu.md`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/shell/src/main.ts`
- `apps/shell/src/styles.css`
- `apps/shell/src/chrome/render-chrome.ts`
- `apps/shell/src/chrome/safe-zone.ts`
- `apps/shell/src/menu/focus-menu.ts`
- `apps/shell/src/menu/render-menu.ts`
- `apps/shell/src/menu/surfaces.ts`
- `docs/index.md`
- `docs/study/1-3-safe-zone-shell-chrome-and-surface-menu.html`

## Change Log

- 2026-07-22: Story context created (ready-for-dev) — ultimate context engine analysis completed
- 2026-07-22: Implemented Safe Zone chrome + Surface menu, study HTML, docs honesty; status → review
- 2026-07-22: Code review patches applied (menu `<li>`, Safe Zone label inside inset, modifier-key guard, click→handleAction, a11y/HMR cleanups); status → done
