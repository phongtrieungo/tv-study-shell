# Interview study HTML convention

**Owner decision (2026-07-22):** Study guides are part of delivery from Story **1.2** forward. Story **1.1** (scaffold) is exempt — setup only, no interview depth.

## Per-story guides (from 1.2+)

After a story is implemented and marked done (or during DoD before review):

1. Add a focused HTML study page under `docs/study/` (preferred) or extend `interview-study-plan.html` with a linked section.
2. Naming: `docs/study/{story-key}.html` (e.g. `docs/study/1-2-shared-fixtures-and-dpad-key-map.html`).
3. Content must be **practical interview knowledge** tied to what the story shipped: mental models, whiteboard talking points, key APIs/patterns, honesty bounds — not a changelog of files touched.
4. Skip only if the story is pure plumbing with no teachable concept (rare after 1.1). Prefer a short page over skipping when unsure.
5. Link new pages from `docs/index.md` and, when useful, from the root README study/plan area.

**create-story:** Include a DoD/task for the study HTML when story ≥ 1.2 (or epic ≥ 1 story ≥ 2).  
**dev-story:** Treat the study HTML as an AC/task to complete before marking the story ready for review (unless the story file explicitly waives it).

## Per-epic synthesis (after epic complete)

When an epic’s last story is done (or during `epic-N-retrospective`):

1. Create `docs/study/epic-{N}-{slug}.html` that **connects all stories in that epic** into one start→end big picture.
2. The epic page should narrate the learning arc: problem → building blocks → how pieces fit → demo/interview script → links to each story study HTML.
3. Update `docs/index.md` (and optionally `interview-study-plan.html`) to link the epic synthesis.

**retrospective:** Epic retrospective DoD includes creating/updating the epic synthesis HTML before closing the epic.
