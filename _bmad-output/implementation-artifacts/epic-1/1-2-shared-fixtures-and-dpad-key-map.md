---
baseline_commit: baa282bbcb5f6bb7af3f19b266b944a00f0e99bc
---

# Story 1.2: Shared fixtures and D-pad key map

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want Mock Data fixtures and a shared input key map,
so that every Surface uses the same channels/rails vocabulary and keys (AD-3, AD-4).

## Acceptance Criteria

1. **Given** `packages/shared`  
   **When** I import fixtures  
   **Then** I get ≥50 channels and ≥24h synthetic programs plus ≥1 Home rail of ≥12 items  

2. **And** key constants exist for arrows, Enter, Back

3. **And** a practical interview study HTML exists at `docs/study/1-2-shared-fixtures-and-dpad-key-map.html`, linked from `docs/index.md` (teaches concepts — not a file changelog)

## Tasks / Subtasks

- [x] Task 1: Shared types for fixtures (AC: #1)
  - [x] Add minimal typed shapes under `packages/shared/src/types/` (or colocated with fixtures): `Channel`, `Program`, `Rail`, `RailItem`
  - [x] Use string slug IDs: `channelId`, `programId`, `railId` (and item ids as needed)
  - [x] Use ISO-8601 strings for program `start` / `end`

- [x] Task 2: Mock Data fixtures in `@tvshell/shared` (AC: #1)
  - [x] Implement under `packages/shared/src/fixtures/` (JSON and/or TS modules — AD-3)
  - [x] Export ≥50 channels
  - [x] Export synthetic programs covering ≥24h of schedule (prefer continuous coverage per channel so Epic 2 can treat the grid as ≥50×24h logical cells)
  - [x] Export ≥1 Home rail with ≥12 items (poster-tile vocabulary for FR-8 / Story 4.2)
  - [x] Prefer a small generator over hand-authoring ~50×24h rows so the repo stays lean and counts stay easy to assert later
  - [x] Keep fixture data immutable (no mutation APIs)

- [x] Task 3: Shared D-pad key map under `packages/shared/src/input/` (AC: #2)
  - [x] Export `KeyboardEvent.key` string constants for `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `Enter`
  - [x] Treat Back as both `Backspace` and `Escape` (AD-4)
  - [x] Prefer a semantic layer (e.g. `Up | Down | Left | Right | Select | Back`) plus pure helpers (`isBackKey`, `normalizeKey` / `fromKeyboardEvent`) so Surfaces do not re-branch Escape vs Backspace
  - [x] Do **not** wire Shell menu focus or Back→menu behavior (Stories 1.3–1.4)

- [x] Task 4: Package public API (AC: #1, #2)
  - [x] Re-export fixtures + input (+ types) from `packages/shared/src/index.ts`
  - [x] Keep `SHARED_MARKER` export (shell / smoke still use it) unless you deliberately replace the proof string
  - [x] Optional: add package.json subpath exports (`./fixtures`, `./input`) — nice-to-have; main `.` export is enough if barrel is complete
  - [x] `pnpm --filter @tvshell/shared typecheck` (and root `pnpm typecheck`) green

- [x] Task 5: Optional Shell import proof (AC: #1, #2)
  - [x] Optionally update `apps/shell/src/main.ts` to import fixture counts / key names and show them in the proof UI or a single `[shell]` log
  - [x] Do **not** build Safe Zone, Surface menu, or key handlers that navigate (1.3)

- [x] Task 6: Interview study HTML (AC: #3)
  - [x] Create `docs/study/1-2-shared-fixtures-and-dpad-key-map.html`
  - [x] Cover: why shared fixtures (AD-3), D-pad desktop proxy + `KeyboardEvent.key` (not `keyCode`), Back = Backspace|Escape, slug IDs + ISO times, interview talking points / honesty bounds
  - [x] Link from `docs/index.md` (and README study area only if it already points at study guides)

- [x] Task 7: Smoke verify (AC: #1, #2)
  - [x] From workspace: import fixtures + keys from `@tvshell/shared` resolves in shell (dev or typecheck)
  - [x] Manually confirm channel count ≥50, rail items ≥12, program schedule spans ≥24h, key constants present
  - [x] Confirm no `react` / `react-dom` added; no Vitest/CI required for this story’s AC

### Review Findings

- [x] [Review][Patch] Use offline-safe Home rail `posterUrl` placeholders (no third-party hosts) [`packages/shared/src/fixtures/index.ts:65`]
- [x] [Review][Patch] Type frozen fixture exports as readonly [`packages/shared/src/fixtures/index.ts:92`]
- [x] [Review][Defer] Smoke test imports compiled internal modules instead of `@tvshell/shared` barrel [`packages/shared/tests/story-1-2-smoke.mjs:10`] — deferred, pre-existing
- [x] [Review][Defer] Smoke trusts `fixtureMeta.scheduleHoursPerChannel` and does not independently assert per-channel 24h span or `channelId` membership [`packages/shared/tests/story-1-2-smoke.mjs:22`] — deferred, pre-existing
- [x] [Review][Defer] Smoke omits full D-pad matrix (`getDpadAction`, all seven keys → actions, unknown key → null) [`packages/shared/tests/story-1-2-smoke.mjs:23`] — deferred, pre-existing
- [x] [Review][Decision] Home rail `posterUrl` third-party hosts — resolved: use offline-safe placeholders (option 1)

## Dev Notes

### Scope boundaries (critical)

**In scope:** Mock Data fixtures + shared D-pad key map in `@tvshell/shared`; types; barrel exports; study HTML.

**Out of scope (later stories):**
- Safe Zone chrome + Surface menu → **1.3**
- Mount/unmount Surface host contract → **1.4**
- Visible Window math / EPG canvas → **Epic 2**
- WebGL Lab / Home Blits / Live Solid packages → **Epics 3–5**
- Vitest for key map / fixture generators → **7.1** (design APIs pure/testable now; do not block 1.2 on installing Vitest)
- Playwright D-pad smoke → **7.2**
- Production API clients, XMLTV parse, React — **never for MVP**

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-1** No cross-surface framework imports | Only touch `shared` (+ optional shell proof). Do not create Surface packages. |
| **AD-3** Mock Data only | All channels / programs / rails live in `packages/shared` fixtures (JSON/TS). No fetch clients. |
| **AD-4** Shared D-pad map | Define Arrow*/Enter/Back(Backspace\|Escape) under `packages/shared/input` (implement as `src/input/`). |
| **AD-5** Visible Window | Do **not** implement VW math here — fixtures must *support* later virtualization (scale + consistent times). |
| **AD-7** React forbidden | Do not add React. |
| **AD-10** Test ladder | Vitest/Playwright not required for 1.2 AC; keep helpers pure for 7.1. |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-3, AD-4, Consistency Conventions, Structural Seed]

### Files being modified (UPDATE) — read before coding

| File | Current state | This story changes | Must preserve |
| --- | --- | --- | --- |
| `packages/shared/src/index.ts` | Exports only `SHARED_MARKER` with comment that fixtures/input come later | Re-export fixtures + input (+ types); update comment | Keep a stable root export shell can import; ESM source export |
| `packages/shared/package.json` | `"exports": { ".": "./src/index.ts" }`, TS 5.9.3 | Optional subpath exports; no new runtime deps | `type: module`, workspace package name `@tvshell/shared`, source export (no prebuild) |
| `apps/shell/src/main.ts` | Imports `SHARED_MARKER`, text proof on `#app`, `[shell]` log | Optional richer proof using fixture counts / key names | `#app` mount, `[shell]` log prefix, no framework UI |
| `docs/index.md` | Points “next step” at create-story 1.2 | Link new study HTML; update next-step when done | Existing planning links |
| `README.md` | Says D-pad keys “land in later Epic 1 stories” | Optionally note fixtures/keys now exist in shared | Honesty / Getting started / no React non-goals |

### Suggested target structure (after this story)

```text
packages/shared/
  package.json
  tsconfig.json
  src/
    index.ts                 # UPDATE — barrel
    types/
      epg.ts                 # NEW — Channel, Program
      home.ts                # NEW — Rail, RailItem
      index.ts
    fixtures/
      generate.ts            # NEW — preferred generator
      channels.ts            # NEW — or generated export
      programs.ts
      rails.ts
      index.ts
    input/
      keys.ts                # NEW — constants + normalize/isBack
      index.ts
apps/shell/src/main.ts       # OPTIONAL light proof UPDATE
docs/study/1-2-shared-fixtures-and-dpad-key-map.html   # NEW
docs/index.md                # UPDATE — link study page
```

### Minimal data shapes (invent typed contracts — docs have no frozen schema)

Docs specify IDs + ISO times and scale, not full interfaces. Use something close to:

```ts
export type Channel = {
  channelId: string; // slug
  name: string;
  number?: number;
};

export type Program = {
  programId: string;
  channelId: string;
  title: string;
  start: string; // ISO-8601
  end: string;   // ISO-8601
};

export type RailItem = {
  itemId: string;
  title: string;
  posterUrl?: string; // placeholder URL or empty OK for now
};

export type Rail = {
  railId: string;
  title: string;
  items: RailItem[]; // length >= 12
};
```

**Program integrity:** every `Program.channelId` must reference a channel; `end > start`; prefer non-overlapping contiguous blocks per channel so EPG cell math later is honest. [Source: domain research — schedule accuracy / `start`/`end`/`channelId`]

**≥24h meaning:** schedule coverage of at least 24 hours of wall-clock time on the grid (FR-4 / Story 2.1 expect ≥50×24h logical cells). Generating ~24h continuous programs **per channel** for all ≥50 channels satisfies downstream EPG stories without ambiguity.

**Anchoring time:** pick a fixed ISO “day origin” (or generate relative to a documented `FIXTURE_DAY_START`) so fixtures are deterministic across runs — do not call `Date.now()` inside generators unless you inject a clock.

### D-pad API guidance (latest web standards)

Use **`event.key`** string values — not deprecated `keyCode` / `which`:

| Semantic | `KeyboardEvent.key` |
| --- | --- |
| Up / Down / Left / Right | `ArrowUp` / `ArrowDown` / `ArrowLeft` / `ArrowRight` |
| Select | `Enter` |
| Back | `Backspace` **and** `Escape` |

Desktop Chromium + keyboard-as-D-pad is an intentional PRD assumption. Real TV remotes may emit platform-specific codes later; keep the shared map as the **app vocabulary** and map platform keys into it in future stories if needed.

Example shape (illustrative — name as you prefer):

```ts
export const Key = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Enter: 'Enter',
  Backspace: 'Backspace',
  Escape: 'Escape',
} as const;

export type DpadAction = 'up' | 'down' | 'left' | 'right' | 'select' | 'back';

export function normalizeKey(key: string): DpadAction | null { /* ... */ }
export function isBackKey(key: string): boolean {
  return key === Key.Backspace || key === Key.Escape;
}
```

[Source: MDN KeyboardEvent.key / UI Events key values; AD-4]

### Library / version pins (already scaffolded — do not churn)

| Package | Pin in repo | Guidance |
| --- | --- | --- |
| TypeScript | **5.9.3** | Stay on 5.x |
| Vite (shell) | **6.4.3** | Unchanged |
| pnpm | **9.0.5** via `packageManager` | Unchanged |
| Vitest / Playwright / Blits / Solid / three | **Do not install** | Later epics |
| React | **Forbidden** | AD-7 |

`tsconfig.base.json` already has `resolveJsonModule: true` — JSON fixtures are OK if preferred.

### pnpm / Vite consumption pattern (unchanged from 1.1)

- Shell already depends on `"@tvshell/shared": "workspace:*"`
- Shared exports TS **source** — no prebuild
- Shell Vite excludes `@tvshell/shared` from `optimizeDeps` for HMR — keep that
- After export surface changes, if HMR acts odd: `vite --force` once

### Anti-patterns (do not)

- Put fixtures or key maps only in `apps/shell`
- Hand-author thousands of opaque duplicated program objects without a generator
- Implement Visible Window / EPG draw / focus navigation chrome
- Use `keyCode` / `which` as the primary API
- Map only `Escape` or only `Backspace` for Back (AD-4 requires both)
- Add empty Surface packages “for later”
- Add React, Turborepo, Nx, Vitest CI “because architecture mentions them”
- Claim Tizen/webOS remote parity from desktop keys
- Study HTML that only lists files changed (must teach interview concepts)

### Testing requirements (this story)

- Manual / typecheck smoke: counts + imports resolve
- No Vitest install required for AC (Story 7.1 owns shared UT)
- If you optionally add colocated `*.test.ts`, do not fail the story on missing Vitest runner — prefer deferring runner wiring to 7.1 unless you intentionally set it up early

### Project context reference

- No `project-context.md` exists yet — follow architecture spine + this story + `docs/study-guides.md`
- User skill level: intermediate — clear typed modules over clever abstractions
- Study guides are **DoD from 1.2 forward** (1.1 exempt)

### Previous story intelligence (1.1)

- Scaffold delivered: pnpm workspaces, `apps/shell` vanilla Vite DOM on **:5180**, `@tvshell/shared` with `SHARED_MARKER`
- Pins: TypeScript **5.9.3**, Vite **6.4.3**, `pnpm@9.0.5`
- Review deferred: dual TS pins / empty root lockfile importer — **do not expand into catalog work** in 1.2 unless trivial
- 1.1 explicitly deferred fixtures / D-pad to **1.2** — this story owns that gap
- Logging prefix `[shell]` already established

[Source: `_bmad-output/implementation-artifacts/1-1-scaffold-monorepo-and-shell-app.md`]

### Git intelligence

Recent commit: `Scaffold pnpm monorepo with Vite shell and shared package.` (Story 1.1). Patterns to follow: small focused modules, workspace source exports, README honesty, no React. No prior fixture/input code — invent from AD-3/AD-4, not from old app leftovers.

### Latest tech notes (2026-07-22)

- Prefer `KeyboardEvent.key` per MDN / UI Events; Android TV `KEYCODE_DPAD_*` maps to Arrow*/Enter conceptually — desktop proxy uses the Arrow*/Enter/Backspace/Escape set from AD-4
- Do not introduce TV-only key codes (`10009` Samsung Back, etc.) into the shared map in 1.2 — keep the desktop-proxy vocabulary stable for Playwright later (`page.keyboard.press('ArrowDown')`)
- Generate synthetic JSON/TS — skip XMLTV parse in v1 (technical research)

### Downstream consumers (do not implement, but design for)

| Consumer | Needs from 1.2 |
| --- | --- |
| 1.3 menu | Shared arrow / Enter / Back constants |
| 2.1 EPG VW | ≥50 channels × ≥24h program coverage |
| 2.2 EPG focus | Key map + program select vocabulary |
| 4.2 Home rail | Shared rail fixtures ≥12 items |
| 7.1 Vitest | Pure key helpers + fixture generators |
| 7.2 Playwright | Same `KeyboardEvent.key` strings |

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1 / Story 1.2]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-3, AD-4, Consistency Conventions, Structural Seed]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — Glossary Mock Data/D-pad; FR-4, FR-8; Assumptions desktop proxy]
- [Source: `_bmad-output/planning-artifacts/research/technical-tv-ui-stack-lightning-solidjs-canvas-webgl-research-2026-07-22.md` — JSON fixtures; no XMLTV v1]
- [Source: `_bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md` — D-pad baseline; `start`/`end`/`channelId`]
- [Source: `docs/study-guides.md` — study HTML from 1.2+]
- [Source: `docs/testing-strategy.md` — L1 Vitest deferred; L2 key names]
- [Source: `_bmad-output/implementation-artifacts/1-1-scaffold-monorepo-and-shell-app.md`]
- [Source: MDN — KeyboardEvent.key / key values]

## Dev Agent Record

### Agent Model Used

GPT-5.4

### Debug Log References

- `git rev-parse HEAD` → `baa282bbcb5f6bb7af3f19b266b944a00f0e99bc`
- `pnpm --filter @tvshell/shared typecheck`
- `pnpm typecheck`
- `pnpm build`
- `pnpm --filter @tvshell/shared exec tsc --project packages/shared/tsconfig.json --noEmit false --outDir .tmp/story-1-2-check`
- `SHARED_BUILD_DIR=.tmp/story-1-2-check node packages/shared/tests/story-1-2-smoke.mjs`

### Completion Notes List

- Added typed shared contracts for channels, programs, rails, and rail items.
- Implemented deterministic, immutable fixtures with 50 channels, 600 programs, and a featured rail with 12 items.
- Added shared D-pad key constants and pure helpers for Back normalization and semantic action mapping.
- Updated the shell proof UI/logging to consume real shared fixtures without introducing navigation behavior early.
- Added the required story study HTML and linked it from `docs/index.md`.
- Validation passed: shared typecheck, repo typecheck, shell production build, and persisted smoke validation for Story 1.2 exports.
- No new dependencies added; React/Vitest/Playwright remain out of scope for this story.

### File List

- `README.md`
- `_bmad-output/implementation-artifacts/1-2-shared-fixtures-and-dpad-key-map.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/shell/src/main.ts`
- `docs/index.md`
- `docs/study/1-2-shared-fixtures-and-dpad-key-map.html`
- `packages/shared/src/fixtures/index.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/input/index.ts`
- `packages/shared/src/types/index.ts`
- `packages/shared/tests/story-1-2-smoke.mjs`

## Change Log

- 2026-07-22: Story context created (ready-for-dev)
- 2026-07-22: Implemented shared fixtures, D-pad key map, shell proof update, study HTML, and smoke validation; status → review
- 2026-07-22: Code review patches applied (offline posterUrl, readonly fixture exports); status → done
