# Deferred Work

## Deferred from: code review of 2-1-epg-canvas-visible-window-math.md (2026-07-23)

- Node smoke for Visible Window (`packages/shared/tests/story-2-1-smoke.mjs`) requires manual `tsc` emit + `SHARED_BUILD_DIR` and is not wired to a package script — fold into Story 7.1 Vitest or add a documented script later.
- No `devicePixelRatio` backing-store scaling on EPG canvas — fine for MVP teaching; revisit if demo looks soft on HiDPI.
- Shared Visible Window helpers / EPG draw re-`Date.parse` ISO strings on every filter — acceptable at 600 programs; precompute ms if profiling shows cost.

## Deferred from: code review of 1-4-surface-host-mount-unmount-contract.md (2026-07-22)

- Lifecycle timeout if mount/unmount Promise never settles — add when real Surfaces use async mount; current stub is sync. Epic 6 / later host hardening.

## Deferred from: code review of 1-3-safe-zone-shell-chrome-and-surface-menu.md (2026-07-22)

- ~~No reserved Surface host / error-banner DOM slot in shell chrome — add when implementing Story 1.4 mount/unmount.~~ **Resolved in Story 1.4.**
- No unit tests for menu focus state machine (`move` / clamp / select / back) — cover under Story 7.1 Vitest.
- ~~User-visible “Story 1.4” deferral copy in shell status/subtitle — scrub when mount contract ships.~~ **Resolved in Story 1.4.**

## Deferred from: code review of 1-2-shared-fixtures-and-dpad-key-map.md (2026-07-22)

- Smoke test imports compiled internal modules (`fixtures/index.js`, `input/index.js`) instead of the public `@tvshell/shared` barrel — strengthen in Story 7.1 Vitest coverage.
- Smoke trusts `fixtureMeta.scheduleHoursPerChannel` and does not independently assert continuous per-channel 24h coverage or that every `program.channelId` exists in `channels` — strengthen in Story 7.1.
- Smoke omits full D-pad matrix coverage (`getDpadAction`, all seven keys → semantic actions, unknown keys → null) — strengthen in Story 7.1.

## Deferred from: code review of 1-1-scaffold-monorepo-and-shell-app.md (2026-07-22)

- Dual TypeScript pins in `apps/shell` and `packages/shared` with no pnpm `catalog:` / root single source — risk of version drift as packages grow.
- Root lockfile importer is empty (`.: {}`); no shared root tooling package yet — each package re-declares TypeScript (and later ESLint/Vitest).

## Process notes (owner, 2026-07-22)

- Study HTML convention locked in `docs/study-guides.md` + BMAD custom overrides for create-story / dev-story / retrospective.
- Story 1.1: no study HTML (scaffold exempt).
- Story 1.2+: per-story `docs/study/{story-key}.html` with interview-practical content.
- Epic complete: `docs/study/epic-{N}-*.html` big-picture synthesis linking all stories in the epic.
