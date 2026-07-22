---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md
  - _bmad-output/forge/tv-study-shell/forged-idea.md
status: final
created: 2026-07-22
updated: 2026-07-22
changeSignal: Insert Epic 3 WebGL Lab (FR-15–17); renumber Home/Live/Soak to Epics 4–6
---

# tv-products - Epic Breakdown

## Overview

Epic and story breakdown for **TV Study Shell**, decomposing the PRD (FR-1–FR-17) and architecture spine (AD-1–AD-9) into implementable stories for interview-ready hands-on learning — with **raw WebGL as an MVP epic**, not a deferred note.

## Requirements Inventory

### Functional Requirements

- FR-1: Launch Shell
- FR-2: Switch Surfaces
- FR-3: Safe Zone & 10-foot chrome
- FR-4: Virtualized Program Grid
- FR-5: EPG D-pad Focus
- FR-6: Now-line
- FR-7: EPG Perf Note
- FR-8: Focusable Home Rail
- FR-9: Lazy Texture Loading
- FR-10: Home Perf Note
- FR-11: Live Strip Signal Updates
- FR-12: Solid vs VDOM talking point
- FR-13: Memory Soak Procedure
- FR-14: Portfolio README
- FR-15: WebGL Visible Window / tile grid
- FR-16: Canvas vs WebGL Perf Note
- FR-17: WebGL vocabulary in README
- FR-18: Unit tests for shared logic
- FR-19: Playwright D-pad smoke E2E
- FR-20: Emulator / Simulator dry-run notes

### NonFunctional Requirements

- Label Perf Notes with environment
- Resource cleanup on Surface leave (AD-6), including GPU resources (AD-9)
- No React (AD-7)
- Desktop Chromium + keyboard D-pad proxy acceptable
- CI runs Vitest + Playwright; OEM emulators are manual (AD-10)

### Additional Requirements

- Mock Data only (AD-3)
- Shared D-pad key map (AD-4)
- Monorepo package boundaries (AD-1)
- WebGL investment rationale: `docs/webgl-investment.md`

### UX Design Requirements

- No separate UX spec; follow domain research: Safe Zone, visible Focus, 10-foot typography density in Shell chrome

### FR Coverage Map

| FR | Epic | Stories |
| --- | --- | --- |
| FR-1, FR-3, FR-14 (scaffold) | Epic 1 | 1.1–1.3 |
| FR-2, shared input, fixtures | Epic 1 | 1.2–1.4 |
| FR-4–FR-7 | Epic 2 | 2.1–2.4 |
| FR-15–FR-17 | Epic 3 | 3.1–3.3 |
| FR-8–FR-10 | Epic 4 | 4.1–4.4 |
| FR-11–FR-12 | Epic 5 | 5.1–5.2 |
| FR-2 cleanup, FR-13, FR-14 complete | Epic 6 | 6.1–6.3 |
| FR-18–FR-20 | Epic 7 | 7.1–7.3 |

## Epic List

1. **Epic 1 — Monorepo Shell Foundation** — Runnable Shell, shared fixtures/input, Safe Zone, README skeleton
2. **Epic 2 — Canvas EPG Surface** — Virtualized Program Grid, D-pad, now-line, EPG Perf Note
3. **Epic 3 — WebGL Lab Surface** — Raw WebGL textured Visible Window / tiles, Canvas vs WebGL Perf Note, vocabulary
4. **Epic 4 — Blits Home Surface** — Focusable rail, lazy textures, Home Perf Note (applied WebGL)
5. **Epic 5 — Solid Live Surface** — Live Strip signals + README talking point
6. **Epic 6 — Soak, Integration & Portfolio Polish** — Cross-surface navigation hardening, Memory Soak, final README
7. **Epic 7 — Quality Gates (UT / E2E / Emulator)** — Vitest, Playwright D-pad smoke, emulator/simulator dry-run notes

---

## Epic 1: Monorepo Shell Foundation

Establish the Vite/pnpm monorepo, thin DOM Shell, shared Mock Data and D-pad map, and Safe Zone chrome so Surfaces can mount cleanly.

### Story 1.1: Scaffold monorepo and Shell app

As a learner,
I want a Vite TypeScript monorepo with `apps/shell` and `packages/shared`,
So that I can run a single entrypoint for all Surfaces.

**Acceptance Criteria:**

**Given** a clean checkout  
**When** I follow README install/start  
**Then** the Shell app serves locally without errors  
**And** workspace packages resolve (`shared` importable from shell)

### Story 1.2: Shared fixtures and D-pad key map

As a learner,
I want Mock Data fixtures and a shared input key map,
So that every Surface uses the same channels/rails vocabulary and keys (AD-3, AD-4).

**Acceptance Criteria:**

**Given** `packages/shared`  
**When** I import fixtures  
**Then** I get ≥50 channels and ≥24h synthetic programs plus ≥1 Home rail of ≥12 items  
**And** key constants exist for arrows, Enter, Back

### Story 1.3: Safe Zone shell chrome and surface menu

As a learner,
I want a Safe Zone inset and a Surface menu,
So that the app feels TV-shaped and I can choose Home / Live / EPG / WebGL Lab (FR-1, FR-3).

**Acceptance Criteria:**

**Given** Shell is running  
**When** I view the entry screen  
**Then** Safe Zone margins are visible  
**And** Home, Live, EPG, and WebGL Lab destinations are listed and focusable via keyboard

### Story 1.4: Surface host mount/unmount contract

As a learner,
I want a documented mount/unmount host API,
So that Surfaces clean up on leave (FR-2, AD-2, AD-6).

**Acceptance Criteria:**

**Given** a stub Surface package  
**When** I enter and leave it from the menu  
**Then** `mount` and `unmount` are invoked  
**And** unmount clears a test listener/timer registered by the stub

---

## Epic 2: Canvas EPG Surface

Deliver Lab A: virtualized Canvas Program Grid with D-pad Focus, now-line, and Perf Note (FR-4–FR-7).

### Story 2.1: EPG canvas package with Visible Window math

As a learner,
I want `packages/epg-canvas` that computes and draws only the Visible Window,
So that large grids stay responsive (FR-4, AD-5).

**Acceptance Criteria:**

**Given** fixtures with ≥50×24h logical cells  
**When** the EPG renders  
**Then** a debug overlay or log shows drawn cell count ≪ logical cell count  
**And** scrolling/focus changes update the Visible Window

### Story 2.2: EPG D-pad focus and program select

As a learner,
I want arrow-key Focus across channels and time with Enter detail,
So that I can demo remote-style navigation (FR-5).

**Acceptance Criteria:**

**Given** EPG is focused  
**When** I press arrows  
**Then** Focus moves within the grid with a visible focus indicator  
**And** Enter opens a minimal program detail (title/time)

### Story 2.3: Now-line indicator

As a learner,
I want a now-line that updates without full grid rebuilds,
So that I can explain separated animation vs grid draw (FR-6).

**Acceptance Criteria:**

**Given** EPG is visible  
**When** time advances  
**Then** the now-line position updates  
**And** the logical program model is not fully reconstructed each tick

### Story 2.4: EPG Perf Note

As a learner,
I want a documented Perf Note for EPG,
So that interview claims are measured (FR-7, AD-8).

**Acceptance Criteria:**

**Given** EPG running in a named browser  
**When** I capture FPS and/or draw counts while scrolling  
**Then** `docs/perf-notes/epg.md` exists with environment labeled  
**And** README links to it

---

## Epic 3: WebGL Lab Surface

Deliver Lab W: raw WebGL textured Visible Window / tile grid, Canvas vs WebGL comparison note, and vocabulary write-up (FR-15–FR-17, AD-9). See `docs/webgl-investment.md`.

### Story 3.1: WebGL lab package with textured Visible Window

As a learner,
I want `packages/webgl-lab` that draws a D-pad-navigable textured tile or EPG-window grid with WebGL,
So that I practice buffers, textures, shaders, and draw calls (FR-15).

**Acceptance Criteria:**

**Given** shared Visible Window math (or documented equivalent)  
**When** WebGL Lab mounts  
**Then** rendering uses `WebGLRenderingContext` or `WebGL2RenderingContext` (not Canvas 2D)  
**And** only the Visible Window is drawn  
**And** unmount deletes buffers/textures/programs created by the lab

### Story 3.2: Canvas vs WebGL Perf Note

As a learner,
I want a side-by-side Perf Note for Canvas EPG vs WebGL Lab,
So that I can defend GPU vs CPU trade-offs in interviews (FR-16).

**Acceptance Criteria:**

**Given** both EPG Canvas and WebGL Lab run on the same machine  
**When** I capture FPS and/or CPU/draw framing while scrolling  
**Then** `docs/perf-notes/canvas-vs-webgl.md` exists with environment labeled  
**And** README links to it

### Story 3.3: WebGL vocabulary README section

As a learner,
I want a clear README (or linked) explanation of the WebGL pipeline using this lab,
So that I can whiteboard buffers/textures/shaders/draw calls honestly (FR-17).

**Acceptance Criteria:**

**Given** WebGL Lab works  
**When** I open README or `docs/webgl-investment.md` companion section  
**Then** buffers, textures, shaders, and draw calls are explained with this lab as example  
**And** depth is labeled as learning lab, not expert claim

---

## Epic 4: Blits Home Surface

Deliver Lab B: Blits/Lightning Home rail with focus scroll, texture lifecycle, and Perf Note (FR-8–FR-10) — applied WebGL after raw WebGL literacy.

### Story 4.1: Spike Blits mount strategy in monorepo

As a learner,
I want a decided mount approach (embed vs iframe) for Blits inside Shell,
So that Home integrates without violating AD-1.

**Acceptance Criteria:**

**Given** official Blits/Lightning starter constraints  
**When** the spike completes  
**Then** a short ADR note in `packages/home-blits/README.md` states the chosen mount strategy  
**And** a hello-world Blits view renders from Shell navigation

### Story 4.2: Focusable horizontal Home rail

As a learner,
I want a horizontal rail of ≥12 posters with D-pad Focus,
So that I can demo TV Home navigation (FR-8).

**Acceptance Criteria:**

**Given** Home Surface is active  
**When** I press Left/Right  
**Then** Focus moves along tiles with a clear focus affordance  
**And** rail uses shared Mock Data rail fixtures

### Story 4.3: Lazy texture load and unload

As a learner,
I want textures for far/off tiles managed and released on leave,
So that I practice TV memory discipline (FR-9, AD-6).

**Acceptance Criteria:**

**Given** Home rail with many posters  
**When** I scroll Focus across the rail and then leave Home  
**Then** load strategy avoids keeping all full-res images forever (documented)  
**And** unmount disposes textures/images created by Home

### Story 4.4: Home Perf Note

As a learner,
I want a Home Perf Note,
So that focus scroll and cleanup are evidenced (FR-10).

**Acceptance Criteria:**

**Given** Home Surface  
**When** I record qualitative/quantitative notes  
**Then** `docs/perf-notes/home-blits.md` exists with environment labeled  
**And** README links to it

---

## Epic 5: Solid Live Surface

Deliver Lab C: SolidJS Live Strip and README talking point (FR-11–FR-12).

### Story 5.1: Live Strip with signals

As a learner,
I want a SolidJS Live Strip updating at least once per second,
So that I can demo fine-grained reactivity (FR-11).

**Acceptance Criteria:**

**Given** Live Surface mounted  
**When** one second elapses  
**Then** strip text/clock updates  
**And** implementation uses Solid signals/effects (no React)

### Story 5.2: Solid vs VDOM README section

As a learner,
I want an accurate README explanation of the update model,
So that I can answer JD SolidJS questions (FR-12).

**Acceptance Criteria:**

**Given** Live Strip works  
**When** I open README  
**Then** a section explains signals vs VDOM rerender using this Surface as example  
**And** it does not claim SolidTV/Lightning production years

---

## Epic 6: Soak, Integration & Portfolio Polish

Harden cross-surface navigation, run Memory Soak, finalize portfolio README (FR-2, FR-13, FR-14).

### Story 6.1: Cross-surface navigation hardening

As a learner,
I want reliable Back/Focus restore across all Surfaces,
So that demos don’t strand Focus (FR-2).

**Acceptance Criteria:**

**Given** all four Surfaces implemented (EPG, WebGL Lab, Home, Live)  
**When** I navigate menu → each Surface → Back repeatedly  
**Then** Focus returns to a predictable menu item  
**And** no orphan RAF/timers/WebGL resources remain (spot-check via debug or soak prep)

### Story 6.2: Memory Soak procedure and report

As a learner,
I want a 30-minute soak with heap comparison,
So that MVP memory discipline is proven (FR-13).

**Acceptance Criteria:**

**Given** documented soak steps  
**When** I navigate across Surfaces for ~30 minutes  
**Then** `docs/perf-notes/memory-soak.md` records before/after heap (or fixed leak + retest)  
**And** environment is labeled

### Story 6.3: Portfolio README finalization

As a learner,
I want a polished root README,
So that interviewers understand stack map (including WebGL Lab), how to run, and honesty bounds (FR-14, FR-17).

**Acceptance Criteria:**

**Given** Surfaces and Perf Notes exist  
**When** I open README  
**Then** it maps EPG / WebGL Lab / Home / Live to stacks, links Perf Notes, states desktop proxy + learning purpose  
**And** start commands work as written

---

## Epic 7: Quality Gates (UT / E2E / Emulator)

Automate what CI can prove, then use OEM TV Simulator/Emulator before any packaging “release” claim (FR-18–FR-20, AD-10). See `docs/testing-strategy.md`.

### Story 7.1: Vitest for shared Visible Window and input

As a learner,
I want Vitest covering shared math and D-pad key map,
So that EPG/WebGL cannot silently drift (FR-18).

**Acceptance Criteria:**

**Given** `packages/shared` helpers  
**When** I run the unit test script  
**Then** failing Visible Window or key-map logic fails the suite  
**And** README documents how to run tests

### Story 7.2: Playwright D-pad smoke suite

As a learner,
I want Playwright Chromium smokes for Shell → each Surface → Back,
So that D-pad regressions are caught in CI (FR-19).

**Acceptance Criteria:**

**Given** Shell and all Surfaces are runnable  
**When** I run the e2e suite  
**Then** Arrow-key navigation enters each Surface and Back returns to menu  
**And** non-DOM Surfaces assert via app-owned focus/test hooks (not DOM-only `activeElement`)

### Story 7.3: Tizen Simulator/Emulator dry-run notes

As a learner,
I want documented OEM emulator/simulator runs before packaging claims,
So that I practice the specialized TV tooling path and stay honest about limits (FR-20).

**Acceptance Criteria:**

**Given** a packaged or hostable build (or documented blocker)  
**When** I attempt Tizen TV Simulator and/or TV Emulator (prefer Simulator first)  
**Then** `docs/perf-notes/emulator-tizen.md` records tool, version, pass/fail, and limits (no DRM, memory ≠ device)  
**And** Chrome CPU-throttle checklist is listed as the always-on proxy if OEM tools are blocked
