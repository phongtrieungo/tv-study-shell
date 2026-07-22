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
---

# Forged Idea: TV Study Shell

## One-liner

A single portfolio monorepo that teaches Smart-TV frontend craft by shipping three real surfaces — virtualized Canvas EPG, Blits/Lightning Home rails, and a SolidJS Live strip — with measured performance notes instead of theory-only study.

## Who it is for

- **Builder / learner:** Ngotrieuphong preparing for a Senior FE WebGL / TV Performance role.
- **Reviewer:** Interviewers and hiring managers who open a GitHub README and want proof of D-pad focus, virtualization, Lightning/Blits, and Solid signals literacy.

## Problem

JD stacks (Lightning V3, SolidJS, Blits, WebGL/Canvas, Smart TV constraints) cannot be learned as slideware. Half-finished disconnected demos also fail interviews. The builder needs **one coherent product story** with **hands-on depth** on the hardest TV UI problems.

## Solution (locked)

**TV Study Shell** — one app shell, three progressive surfaces:

| Surface | Stack | Proof |
| --- | --- | --- |
| EPG | Canvas 2D + virtualization + D-pad | Visible-window render, FPS/heap notes |
| Home | Blits + Lightning 3 Renderer | Focusable rails, texture load/unload |
| Live | SolidJS signals | Live “now playing” strip without full rerender |
| Cross-cutting | Shell navigation + Lab D soak | 30-min heap discipline |

## Why one product (not several)

- Interview narrative: “I built a TV-shaped app and optimized it.”
- Shared mock data, focus key map, and perf helpers.
- Forces memory cleanup across route changes (the real TV failure mode).

## Explicit non-goals (v1)

- React-based demo.
- Real video DRM, tuners, store certification packages.
- Pixel-perfect OEM launcher clones.
- Claiming production Lightning years of experience.

## Assumptions

- Desktop Chromium + keyboard-as-D-pad is an acceptable learning proxy; label metrics accordingly.
- Synthetic JSON EPG/Home data is enough; no backend.
- TypeScript preferred; Blits packages may start from official JS scaffold typed at boundaries.

## Risks that survived pressure-testing

| Risk | Response |
| --- | --- |
| Three frameworks = chaos | Thin shell; hard package boundaries |
| Overscoped Home | One horizontal rail + focus scroll first |
| Fake confidence | Honesty section in README + study-plan positioning phrase |
| Never finishing | MVP gate = Labs A–C working + Lab D soak doc |

## Handoff

Ready for `bmad-prd` → architecture → epics. Memlog: `_bmad-output/forge/tv-study-shell/.memlog.md`.
