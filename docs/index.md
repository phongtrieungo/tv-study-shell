# TV Study Shell — Project Knowledge Index

Generated: 2026-07-22 · Updated: 2026-07-23 (Story 3.1 WebGL Lab)

## Product

- **Name:** TV Study Shell
- **Purpose:** Portfolio monorepo for hands-on Smart TV FE learning — Canvas EPG, **raw WebGL Lab**, Blits/Lightning Home, SolidJS Live

## Canonical planning artifacts

| Kind | Path |
| --- | --- |
| WebGL investment rationale | [webgl-investment.md](webgl-investment.md) |
| Testing strategy (UT / E2E / emulator) | [testing-strategy.md](testing-strategy.md) |
| Agent skills research (stack-related) | [agent-skills-research.md](agent-skills-research.md) |
| Skills lock (project installs) | `../skills-lock.json` |
| Forged idea | `../_bmad-output/forge/tv-study-shell/forged-idea.md` |
| PRD | `../_bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md` |
| Architecture | `../_bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md` |
| Epics | `../_bmad-output/planning-artifacts/epics.md` |
| Readiness | `../_bmad-output/planning-artifacts/implementation-readiness-report-2026-07-22.md` |
| Sprint status | `../_bmad-output/implementation-artifacts/sprint-status.yaml` |
| Technical research | `../_bmad-output/planning-artifacts/research/technical-tv-ui-stack-lightning-solidjs-canvas-webgl-research-2026-07-22.md` |
| Domain research | `../_bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md` |
| Study plan | `../interview-study-plan.html` |
| Study HTML convention | [study-guides.md](study-guides.md) |

## Study guides

- **Epic 1:** [Monorepo Shell Foundation](study/epic-1/epic-1-monorepo-shell-foundation.html) (synthesis)
- Story 1.2: [Shared fixtures and D-pad key map](study/epic-1/1-2-shared-fixtures-and-dpad-key-map.html)
- Story 1.3: [Safe Zone shell chrome and surface menu](study/epic-1/1-3-safe-zone-shell-chrome-and-surface-menu.html)
- Story 1.4: [Surface host mount/unmount contract](study/epic-1/1-4-surface-host-mount-unmount-contract.html)
- **Epic 2:** [Canvas EPG Surface](study/epic-2/epic-2-canvas-epg-surface.html) (synthesis)
- Story 2.1: [EPG canvas Visible Window math](study/epic-2/2-1-epg-canvas-visible-window-math.html)
- Story 2.2: [EPG D-pad focus and program select](study/epic-2/2-2-epg-dpad-focus-and-program-select.html)
- Story 2.3: [EPG now-line indicator](study/epic-2/2-3-epg-now-line-indicator.html)
- Story 2.4: [EPG Perf Note](study/epic-2/2-4-epg-perf-note.html)
- Perf Note: [EPG measured draw / FPS](perf-notes/epg.md)
- Story 3.1: [WebGL Lab textured Visible Window](study/epic-3/3-1-webgl-lab-textured-visible-window.html)

## Next implementation step

Story **3.1** shipped (`packages/webgl-lab` — raw WebGL textured Visible Window). Next: create-story / implement **3.2 Canvas vs WebGL Perf Note** (`docs/perf-notes/canvas-vs-webgl.md`). Orientation: [webgl-investment.md](webgl-investment.md). From 1.2 on, each done story gets a practical interview study HTML under `docs/study/epic-N/`; each finished epic gets a synthesis HTML — see [study-guides.md](study-guides.md).
