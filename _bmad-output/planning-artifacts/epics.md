---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-tv-products-2026-07-22/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-tv-products-2026-07-22/ARCHITECTURE-SPINE.md
  - _bmad-output/forge/tv-study-shell/forged-idea.md
status: final
created: 2026-07-22
updated: 2026-07-22
---

# tv-products - Epic Breakdown

## Overview

Epic and story breakdown for **TV Study Shell**, decomposing the PRD (FR-1–FR-14) and architecture spine (AD-1–AD-8) into implementable stories for interview-ready hands-on learning.

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

### NonFunctional Requirements

- Label Perf Notes with environment
- Resource cleanup on Surface leave (AD-6)
- No React (AD-7)
- Desktop Chromium + keyboard D-pad proxy acceptable

### Additional Requirements

- Mock Data only (AD-3)
- Shared D-pad key map (AD-4)
- Monorepo package boundaries (AD-1)

### UX Design Requirements

- No separate UX spec; follow domain research: Safe Zone, visible Focus, 10-foot typography density in Shell chrome

### FR Coverage Map

| FR | Epic | Stories |
| --- | --- | --- |
| FR-1, FR-3, FR-14 (scaffold) | Epic 1 | 1.1–1.3 |
| FR-2, shared input, fixtures | Epic 1 | 1.2–1.4 |
| FR-4–FR-7 | Epic 2 | 2.1–2.4 |
| FR-8–FR-10 | Epic 3 | 3.1–3.4 |
| FR-11–FR-12 | Epic 4 | 4.1–4.2 |
| FR-2 cleanup, FR-13, FR-14 complete | Epic 5 | 5.1–5.3 |

## Epic List

1. **Epic 1 — Monorepo Shell Foundation** — Runnable Shell, shared fixtures/input, Safe Zone, README skeleton
2. **Epic 2 — Canvas EPG Surface** — Virtualized Program Grid, D-pad, now-line, EPG Perf Note
3. **Epic 3 — Blits Home Surface** — Focusable rail, lazy textures, Home Perf Note
4. **Epic 4 — Solid Live Surface** — Live Strip signals + README talking point
5. **Epic 5 — Soak, Integration & Portfolio Polish** — Cross-surface navigation hardening, Memory Soak, final README

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
So that the app feels TV-shaped and I can choose Home / Live / EPG (FR-1, FR-3).

**Acceptance Criteria:**

**Given** Shell is running  
**When** I view the entry screen  
**Then** Safe Zone margins are visible  
**And** Home, Live, and EPG destinations are listed and focusable via keyboard

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

## Epic 3: Blits Home Surface

Deliver Lab B: Blits/Lightning Home rail with focus scroll, texture lifecycle, and Perf Note (FR-8–FR-10).

### Story 3.1: Spike Blits mount strategy in monorepo

As a learner,
I want a decided mount approach (embed vs iframe) for Blits inside Shell,
So that Home integrates without violating AD-1.

**Acceptance Criteria:**

**Given** official Blits/Lightning starter constraints  
**When** the spike completes  
**Then** a short ADR note in `packages/home-blits/README.md` states the chosen mount strategy  
**And** a hello-world Blits view renders from Shell navigation

### Story 3.2: Focusable horizontal Home rail

As a learner,
I want a horizontal rail of ≥12 posters with D-pad Focus,
So that I can demo TV Home navigation (FR-8).

**Acceptance Criteria:**

**Given** Home Surface is active  
**When** I press Left/Right  
**Then** Focus moves along tiles with a clear focus affordance  
**And** rail uses shared Mock Data rail fixtures

### Story 3.3: Lazy texture load and unload

As a learner,
I want textures for far/off tiles managed and released on leave,
So that I practice TV memory discipline (FR-9, AD-6).

**Acceptance Criteria:**

**Given** Home rail with many posters  
**When** I scroll Focus across the rail and then leave Home  
**Then** load strategy avoids keeping all full-res images forever (documented)  
**And** unmount disposes textures/images created by Home

### Story 3.4: Home Perf Note

As a learner,
I want a Home Perf Note,
So that focus scroll and cleanup are evidenced (FR-10).

**Acceptance Criteria:**

**Given** Home Surface  
**When** I record qualitative/quantitative notes  
**Then** `docs/perf-notes/home-blits.md` exists with environment labeled  
**And** README links to it

---

## Epic 4: Solid Live Surface

Deliver Lab C: SolidJS Live Strip and README talking point (FR-11–FR-12).

### Story 4.1: Live Strip with signals

As a learner,
I want a SolidJS Live Strip updating at least once per second,
So that I can demo fine-grained reactivity (FR-11).

**Acceptance Criteria:**

**Given** Live Surface mounted  
**When** one second elapses  
**Then** strip text/clock updates  
**And** implementation uses Solid signals/effects (no React)

### Story 4.2: Solid vs VDOM README section

As a learner,
I want an accurate README explanation of the update model,
So that I can answer JD SolidJS questions (FR-12).

**Acceptance Criteria:**

**Given** Live Strip works  
**When** I open README  
**Then** a section explains signals vs VDOM rerender using this Surface as example  
**And** it does not claim SolidTV/Lightning production years

---

## Epic 5: Soak, Integration & Portfolio Polish

Harden cross-surface navigation, run Memory Soak, finalize portfolio README (FR-2, FR-13, FR-14).

### Story 5.1: Cross-surface navigation hardening

As a learner,
I want reliable Back/Focus restore across all Surfaces,
So that demos don’t strand Focus (FR-2).

**Acceptance Criteria:**

**Given** all three Surfaces implemented  
**When** I navigate menu → each Surface → Back repeatedly  
**Then** Focus returns to a predictable menu item  
**And** no orphan RAF/timers remain (spot-check via debug or soak prep)

### Story 5.2: Memory Soak procedure and report

As a learner,
I want a 30-minute soak with heap comparison,
So that MVP memory discipline is proven (FR-13).

**Acceptance Criteria:**

**Given** documented soak steps  
**When** I navigate across Surfaces for ~30 minutes  
**Then** `docs/perf-notes/memory-soak.md` records before/after heap (or fixed leak + retest)  
**And** environment is labeled

### Story 5.3: Portfolio README finalization

As a learner,
I want a polished root README,
So that interviewers understand stack map, how to run, and honesty bounds (FR-14).

**Acceptance Criteria:**

**Given** Surfaces and Perf Notes exist  
**When** I open README  
**Then** it maps EPG/Home/Live to stacks, links Perf Notes, states desktop proxy + learning purpose  
**And** start commands work as written
