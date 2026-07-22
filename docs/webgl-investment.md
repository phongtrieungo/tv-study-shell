# Why WebGL deserves more investment (TV Study Shell)

**Date:** 2026-07-22  
**Decision:** Promote raw WebGL from “post-MVP note” to an **MVP lab surface**, without dropping Canvas EPG or Blits Home.

## Justification (interview + job)

The role title and JD cluster around **WebGL / canvas / graphics thinking on constrained devices**. Interviewers rarely stop at “I used a framework that uses WebGL.” They probe:

1. **Why not DOM?** — layout/style cost, node count, memory on weak TVs.  
2. **GPU pipeline vocabulary** — buffers, textures, shaders, draw calls, batching.  
3. **What Lightning abstracts** — scene graph + WebGL (or Canvas fallback) so you can debug when FPS dies.  
4. **Trade-offs** — Canvas 2D (simpler CPU path) vs WebGL (GPU path, more control, more footguns).

Canvas-only EPG teaches **virtualization** (essential) but leaves a gap on **GPU literacy**. Blits/Lightning teaches **applied** WebGL but can hide the metal. Raw WebGL closes the gap so you can say:

> “I virtualized an EPG in Canvas, then rendered the same Visible Window idea with WebGL textures/draw calls, measured both, and used Lightning/Blits as the production-shaped scene graph on Home.”

That is stronger than theory slides *or* framework-only demos.

## How the plan changes (not a rewrite of the product)

| Layer | Role | Interview proof |
| --- | --- | --- |
| **Canvas EPG** (keep) | Fastest path to virtualization + D-pad | Algorithm + FPS |
| **WebGL Lab** (**new MVP**) | Same Visible Window / tile ideas on GPU | Buffers, textures, shaders, draw-call count, Canvas vs WebGL note |
| **Blits Home** (keep) | Production-shaped WebGL scene graph + focus | Texture lifecycle, focus rails |
| **Solid Live** (keep) | Reactivity story JD names | Signals without VDOM |
| **Soak** (keep) | Memory discipline | Heap over 30 min |

**TypeScript** remains the language of the repo (WebGL is a browser API used *from* TS/JS — not a separate language). Interview “WebGL focus” means **API + pipeline + measurement**, not switching to C++/GLSL-only careers.

## Learning order (invest more calendar time here)

1. Canvas EPG Visible Window (1–1.5 weeks)  
2. **WebGL Lab — textured grid / EPG window port (1.5–2 weeks)** ← increased investment  
3. Blits Home (1 week) — now “I know what the renderer is doing”  
4. Solid Live + soak (remainder)

## What we explicitly will not do

- Replace Blits with hand-rolled WebGL UI for the whole app (too slow; JD also wants Lightning/Blits).  
- Claim WebGL expert depth from a single lab.  
- Skip Canvas — virtualization math still comes first.

## Artifacts updated

PRD (FR-15–17), architecture (AD-9 + `webgl-lab` package), epics (new Epic 3), sprint status, forged idea, README, this note.
