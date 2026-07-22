---
title: TV Study Shell
status: forged
created: 2026-07-22
updated: 2026-07-22
slug: tv-study-shell
sources:
  - interview-study-plan.html
  - _bmad-output/planning-artifacts/research/technical-tv-ui-stack-lightning-solidjs-canvas-webgl-research-2026-07-22.md
  - _bmad-output/planning-artifacts/research/domain-smart-tv-home-live-epg-research-2026-07-22.md
  - docs/webgl-investment.md
---

# Forged Idea: TV Study Shell

## One-liner

A single portfolio monorepo that teaches Smart-TV frontend craft by shipping **Canvas EPG → raw WebGL Lab → Blits/Lightning Home → SolidJS Live**, with measured performance notes — WebGL literacy is first-class, not only implied by Lightning.

## Who it is for

- **Builder / learner:** Ngotrieuphong preparing for a Senior FE **WebGL** / TV Performance role.
- **Reviewer:** Interviewers who want proof of D-pad focus, virtualization, **GPU pipeline vocabulary**, Lightning/Blits, and Solid signals.

## Problem

JD stacks (Lightning V3, SolidJS, Blits, **WebGL**/Canvas, Smart TV constraints) cannot be learned as slideware. Canvas-only demos under-invest in the GPU story interviewers probe; framework-only demos hide the metal. The builder needs **one coherent product** with **explicit WebGL practice**.

## Solution (locked)

**TV Study Shell** — one app shell, four progressive surfaces:

| Surface | Stack | Proof |
| --- | --- | --- |
| EPG | Canvas 2D + virtualization + D-pad | Visible-window render, FPS/heap notes |
| **WebGL Lab** | **Raw WebGL (buffers/textures/shaders)** | Same Visible Window idea on GPU; Canvas vs WebGL note |
| Home | Blits + Lightning 3 Renderer | Focusable rails; applied WebGL scene graph |
| Live | SolidJS signals | Live strip without full rerender |
| Cross-cutting | Shell navigation + Lab D soak | 30-min heap discipline |

## Why one product (not several)

- Interview narrative: “I virtualized, then rendered on GPU, then used Lightning as the production-shaped layer.”
- Shared mock data, focus key map, Visible Window math, and perf helpers.
- Forces memory/GPU cleanup across route changes.

## Explicit non-goals (v1)

- React-based demo.
- Replacing Blits Home with a full custom WebGL UI framework.
- Real video DRM, tuners, store certification packages.
- Claiming WebGL/Lightning expert years from this repo alone.

## Assumptions

- Desktop Chromium + keyboard-as-D-pad is an acceptable learning proxy; label metrics accordingly.
- Synthetic JSON EPG/Home data is enough; no backend.
- TypeScript remains the app language; WebGL is the graphics API used from TS.

## Risks that survived pressure-testing

| Risk | Response |
| --- | --- |
| Four surfaces = chaos | Thin shell; hard package boundaries; WebGL after Canvas |
| Overscoped WebGL | Textured 2D Visible Window / tiles only — no engine rewrite |
| Fake confidence | Honesty section + `docs/webgl-investment.md` |
| Never finishing | MVP gate = Labs A + W + B + C + soak |

## Handoff

See updated PRD FR-15–17, AD-9, Epic 3. Justification: `docs/webgl-investment.md`.
