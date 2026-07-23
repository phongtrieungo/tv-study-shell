---
baseline_commit: a47924f73f9b2ee9921347de5de75c86b2967466
---

# Story 1.1: Scaffold monorepo and Shell app

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->
<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a learner,
I want a Vite TypeScript monorepo with `apps/shell` and `packages/shared`,
so that I can run a single entrypoint for all Surfaces.

## Acceptance Criteria

1. **Given** a clean checkout  
   **When** I follow README install/start  
   **Then** the Shell app serves locally without errors  

2. **And** workspace packages resolve (`shared` importable from shell)

## Tasks / Subtasks

- [x] Task 1: Root pnpm workspace (AC: #1, #2)
  - [x] Add root `package.json` (`private: true`, `packageManager` exact pin)
  - [x] Add `pnpm-workspace.yaml` with `apps/*` and `packages/*`
  - [x] Add root scripts: `dev` → shell, optional `typecheck`
  - [x] Commit `pnpm-lock.yaml` after install (do not gitignore it)

- [x] Task 2: `packages/shared` stub (AC: #2)
  - [x] Create package `@tvshell/shared` with `src/index.ts` exporting a tiny proof constant/function (e.g. `PACKAGE_NAME` or `helloShared()`)
  - [x] Set `exports` / `type: module` so Vite can import source
  - [x] Do **not** add fixtures, D-pad map, or Visible Window math yet (Story 1.2+)

- [x] Task 3: `apps/shell` Vite + TypeScript DOM host (AC: #1, #2)
  - [x] Scaffold vanilla Vite TS app (no React plugin, no Solid, no Blits)
  - [x] Depend on `@tvshell/shared` via `workspace:*`
  - [x] `src/main.ts` mounts minimal DOM proof that imports from shared and renders text to `#app`
  - [x] `vite.config.ts` with `defineConfig`; ensure workspace package resolves (see Dev Notes)
  - [x] `tsconfig` extends shared base; include `vite/client` types

- [x] Task 4: Shared TS baseline (AC: #1)
  - [x] Root `tsconfig.base.json` (or `packages/tsconfig`) with Vite-required flags: `isolatedModules`, `useDefineForClassFields`, `skipLibCheck`, `moduleResolution` bundler-compatible
  - [x] Per-package `tsconfig.json` extending base

- [x] Task 5: README run instructions (AC: #1)
  - [x] Update root README “Getting started” with exact commands that work after this story
  - [x] Document Node/pnpm expectation briefly (Corepack or global pnpm matching `packageManager`)

- [x] Task 6: Smoke verify (AC: #1, #2)
  - [x] From clean tree: `pnpm install` → `pnpm --filter shell dev` (or root `pnpm dev`) serves without console/build errors
  - [x] Browser shows Shell proof UI that proves shared import worked
  - [x] Confirm no `react` / `react-dom` in any `package.json` or lockfile

### Review Findings

- [x] [Review][Decision] Dev server port policy — resolved: keep `strictPort: true` on 5180 (predictable URL; fail if busy)
- [x] [Review][Patch] Stale smoke URL in Dev Agent Record still cites `:5173` while config/README use `:5180` [`_bmad-output/implementation-artifacts/1-1-scaffold-monorepo-and-shell-app.md:244`]
- [x] [Review][Patch] Restore blank line before `## Testing` after Getting started edit [`README.md:76`]
- [x] [Review][Patch] Add trailing newline to `apps/shell/vite.config.ts` [`apps/shell/vite.config.ts:13`]
- [x] [Review][Patch] Document pinned Vite/TypeScript majors in Getting started [`README.md:66`]
- [x] [Review][Defer] Dual TypeScript pins in shell + shared with no catalog — deferred, pre-existing pattern risk for later packages [`apps/shell/package.json` / `packages/shared/package.json`]
- [x] [Review][Defer] Root lockfile importer empty (no shared root tooling) — deferred, pre-existing scaffold choice [`pnpm-lock.yaml`]

## Dev Notes

### Scope boundaries (critical)

**In scope:** Greenfield monorepo scaffold — root workspace, `apps/shell`, `packages/shared` stub, README start commands.

**Out of scope (later stories):**

- Fixtures / D-pad map → **1.2**
- Safe Zone chrome + Surface menu → **1.3**
- Mount/unmount Surface host contract → **1.4**
- EPG / WebGL Lab / Home / Live packages → Epics 2–5
- Vitest / Playwright / CI → Epic 7
- Turborepo / Nx — skip until CI/cache pain; architecture never requires them for MVP

### Architecture compliance

| Decision | Implication for this story |
| --- | --- |
| **AD-1** No cross-surface framework imports | Only create `shell` + `shared`. Do not create Surface packages yet (or leave empty dirs only if you document them as placeholders — prefer **not** adding empty packages). |
| **AD-2** Thin DOM Shell | Shell = Vite + TypeScript **vanilla DOM**. No framework UI in Shell. |
| **AD-3** Mock Data in shared | Stub only; fixtures land in 1.2. |
| **AD-7** React forbidden | Never add `react` / `react-dom`. Do not use `npm create vite` React template. Use **vanilla-ts**. |
| **AD-10** Test ladder | Do not block 1.1 on Vitest/Playwright. Leave room for `packages/*/src/**/*.test.ts` and `tests/e2e` later. |

[Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md`]

### Target structure after this story

```text
tv-products/
  package.json                 # private, packageManager pin, scripts
  pnpm-workspace.yaml
  pnpm-lock.yaml
  tsconfig.base.json           # recommended
  apps/
    shell/
      package.json             # name: shell or @tvshell/shell
      index.html
      vite.config.ts
      tsconfig.json
      src/main.ts
      src/vite-env.d.ts
  packages/
    shared/
      package.json             # name: @tvshell/shared
      src/index.ts
      tsconfig.json
  README.md                    # updated Getting started
  docs/                        # existing — do not relocate
  _bmad-output/                # leave alone
```

Future packages (do **not** implement now): `epg-canvas`, `webgl-lab`, `home-blits`, `live-solid`.

[Source: ARCHITECTURE-SPINE Structural Seed; README Repo layout]

### Library / version pins (resolve at install; record what you pin)

Architecture: TypeScript **5.x**, Vite **6.x or current stable**, pnpm preferred.

| Package | Guidance (as of 2026-07-22 research) | Why |
| --- | --- | --- |
| **TypeScript** | Pin latest **5.x** (e.g. `5.9.x`), not `latest` if that is 7.x | Spine + README say 5.x; safer for upcoming Blits/Solid tooling |
| **Vite** | Prefer **6.x latest** (`6.4.x`) to match spine primary line; **or** current stable if you verify vanilla-ts works | Spine allows “6.x or current stable”; Blits epic may constrain later |
| **pnpm** | Exact pin via `"packageManager": "pnpm@X.Y.Z"` | Skill + Corepack; machine currently has 9.x — prefer **9.x or 10.x** LTS-compatible, not forcing upgrade mid-story |
| **@types/node** | Optional on shell if needed for `path`/`url` in vite config | Only if vite config uses Node APIs |
| React / Solid / Blits / three | **Do not install** | Later epics |

Confirm versions at scaffold time with `npm view <pkg> version` / dist-tags, then pin what you install in lockfile.

### pnpm workspace patterns

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// apps/shell/package.json (excerpt)
{
  "dependencies": {
    "@tvshell/shared": "workspace:*"
  }
}
```

- Put pnpm settings in `pnpm-workspace.yaml` (camelCase) if needed; keep `.npmrc` for auth only.
- Root: `"private": true`.
- Internal deps: always `workspace:*`.
- Optional later: `catalog:` for shared Vite/TS versions — nice-to-have, not required for 1.1.

[Source: `.agents/skills/pnpm/SKILL.md`, `references/core-workspaces.md`]

### Vite + workspace package resolution

- Shell imports TypeScript **source** from `@tvshell/shared` (no prebuild of shared required for 1.1).
- Prefer package.json `"exports": { ".": "./src/index.ts" }` (or dual conditions) so Node/Vite resolve clearly.
- If Vite prebundles the workspace link oddly: `optimizeDeps.include: ['@tvshell/shared']` or `server.fs.allow` / `resolve.dedupe` as needed; after link changes, `vite --force` once.
- Do **not** add `@vitejs/plugin-react`.
- Typecheck is separate from Vite: add `tsc --noEmit` script when practical (Vite does not typecheck).

[Source: `.agents/skills/vite/SKILL.md`, `references/core-config.md`]

### Minimal Shell proof (suggested)

```ts
// packages/shared/src/index.ts
export const SHARED_MARKER = '@tvshell/shared';

// apps/shell/src/main.ts
import { SHARED_MARKER } from '@tvshell/shared';

const root = document.querySelector('#app');
if (!root) throw new Error('[shell] #app missing');
root.textContent = `TV Study Shell — ${SHARED_MARKER}`;
```

Log prefix convention for later: `[shell]` (architecture logging table). Keep RAF spam out of scope.

### Files that already exist (UPDATE carefully)

| File | Guidance |
| --- | --- |
| `README.md` | **UPDATE** Getting started only; preserve honesty / stack / layout narrative |
| `.gitignore` | Already anticipates `node_modules/`, `dist/`, `.vite/`, lock caches — **keep**; ensure `pnpm-lock.yaml` is **not** ignored |
| `docs/*` | Do not move; testing-strategy / webgl-investment are reference only |
| `_bmad-output/*` | Do not modify as part of implementation |

There are **no** existing `package.json`, `apps/`, or `packages/` — full greenfield.

### Anti-patterns (do not)

- Scaffold with Turborepo/Nx “because monorepos use them”
- Use React Vite template then “remove React”
- Implement Surface menu / Safe Zone / mount API early (steals 1.3–1.4)
- Add empty stub packages for all Surfaces just to fill the tree
- Put fixtures in shell instead of shared
- Claim Tizen/webOS packaging readiness
- Skip proving the shared import (AC #2 fails)

### Testing requirements (this story)

- Manual smoke only: install + `dev` + visible proof of shared import.
- No Vitest/Playwright required for AC.
- Do not invent CI workflows yet.

### Project context reference

- No `project-context.md` exists yet. Follow architecture spine + this story file.
- User skill level: intermediate — prefer clear structure over over-automation.

### Git intelligence

Recent commits are planning/docs only (`Elevate WebGL…`, README baseline). No prior scaffold attempts — invent nothing from old app code.

### Latest tech notes (2026-07-22)

- npm `typescript@latest` may be **7.x**; architecture requires **5.x** — pin 5.x deliberately.
- npm `vite@latest` may be **8.x**; spine prefers 6.x or current stable — document chosen major in README Getting started if it differs from “Vite 6”.
- pnpm workspaces + `workspace:*` remain the standard; Turborepo optional later.

## References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 1 / Story 1.1]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` — AD-1, AD-2, AD-7, Stack, Structural Seed]
- [Source: `_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` — FR-1, non-goals (no React)]
- [Source: `README.md` — target layout, Getting started]
- [Source: `docs/testing-strategy.md` — defer UT/E2E to Epic 7]
- [Source: `.agents/skills/pnpm/SKILL.md`]
- [Source: `.agents/skills/vite/SKILL.md`]
- [Source: `.agents/skills/monorepo-management/SKILL.md` — prefer simple pnpm workspaces for this size]

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- `pnpm install` succeeded (workspace: root + shell + shared)
- `pnpm typecheck` green for shared + shell
- `pnpm --filter shell build` green (Vite 6.4.3)
- Dev server: `http://localhost:5180/` served HTML; `/src/main.ts` resolved `@tvshell/shared` → `packages/shared/src/index.ts`
- Lockfile scan: no `react` / `react-dom`

### Completion Notes List

- Scaffolded pnpm workspaces with `apps/shell` (vanilla Vite + TS DOM) and `@tvshell/shared` exporting `SHARED_MARKER`
- Pinned TypeScript **5.9.3**, Vite **6.4.3**, `packageManager` **pnpm@9.0.5** (matches local toolchain; Corepack can upgrade later)
- Excluded `@tvshell/shared` from Vite `optimizeDeps` so workspace TS source HMR works
- README Getting started documents Node ≥20, pnpm pin, `pnpm install` / `pnpm dev`
- Manual smoke only per story (no Vitest/Playwright in 1.1)
- No React, Turborepo, Nx, or Surface packages added

### File List

- `package.json` (new)
- `pnpm-workspace.yaml` (new)
- `pnpm-lock.yaml` (new)
- `tsconfig.base.json` (new)
- `apps/shell/package.json` (new)
- `apps/shell/index.html` (new)
- `apps/shell/vite.config.ts` (new)
- `apps/shell/tsconfig.json` (new)
- `apps/shell/src/main.ts` (new)
- `apps/shell/src/vite-env.d.ts` (new)
- `packages/shared/package.json` (new)
- `packages/shared/tsconfig.json` (new)
- `packages/shared/src/index.ts` (new)
- `README.md` (modified)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)
- `_bmad-output/implementation-artifacts/1-1-scaffold-monorepo-and-shell-app.md` (modified)

## Change Log

- 2026-07-22: Implemented Story 1.1 monorepo scaffold (shell + shared); status → review
- 2026-07-22: Code review findings added
- 2026-07-22: Applied review patches; status → done
