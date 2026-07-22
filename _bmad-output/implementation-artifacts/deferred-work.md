# Deferred Work

## Deferred from: code review of 1-1-scaffold-monorepo-and-shell-app.md (2026-07-22)

- Dual TypeScript pins in `apps/shell` and `packages/shared` with no pnpm `catalog:` / root single source — risk of version drift as packages grow.
- Root lockfile importer is empty (`.: {}`); no shared root tooling package yet — each package re-declares TypeScript (and later ESLint/Vitest).

## Process notes (owner, 2026-07-22)

- Study HTML convention locked in `docs/study-guides.md` + BMAD custom overrides for create-story / dev-story / retrospective.
- Story 1.1: no study HTML (scaffold exempt).
- Story 1.2+: per-story `docs/study/{story-key}.html` with interview-practical content.
- Epic complete: `docs/study/epic-{N}-*.html` big-picture synthesis linking all stories in the epic.
