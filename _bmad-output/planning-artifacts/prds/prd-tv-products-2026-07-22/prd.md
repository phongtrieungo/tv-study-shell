---
title: TV Study Shell
status: final
created: 2026-07-22
updated: 2026-07-22
changeSignal: Elevate raw WebGL to MVP Lab (FR-15–17); see docs/webgl-investment.md
---

# PRD: TV Study Shell

## 0. Document Purpose

This PRD defines **TV Study Shell**, a portfolio learning product for Ngotrieuphong to gain hands-on Smart TV frontend experience (Canvas/WebGL concepts, Lightning 3 / Blits, SolidJS, Home / Live / EPG patterns). It is for the builder and for downstream architecture/epics/dev workflows. It builds on:

- `interview-study-plan.html`
- `_bmad-output/forge/tv-study-shell/forged-idea.md`
- Technical + domain research under `_bmad-output/planning-artifacts/research/`

No separate UX spec exists; TV UX constraints are taken from domain research and inlined in journeys / NFRs. `[ASSUMPTION]` tags mark Fast-path inferences from the approved plan.

## 1. Vision

TV Study Shell is a **single runnable monorepo** that feels like a miniature TV app: a learner navigates with a D-pad (keyboard proxy) across **Home**, **Live**, **EPG**, and **WebGL Lab** surfaces. Each surface uses a different rendering/reactivity approach that maps to the target interview stack — so study time produces **evidence** (code + FPS/heap notes), not only notes.

The product exists to close the gap between strong TypeScript / large-app experience and the JD gaps: **WebGL pipeline literacy**, canvas virtualization, Lightning/Blits, SolidJS, and Smart TV constraints. Success is an interview-ready GitHub story: honest about desktop proxies, rigorous about virtualization, **GPU draw-path vocabulary**, focus, and memory. Canvas alone is not enough for this JD; raw WebGL is an MVP lab, not a postscript.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** Practice virtualized EPG, focusable Home rails, and signal-driven Live updates under TV-like constraints.
- **Career:** Produce a portfolio artifact that supports Senior FE WebGL / TV Performance interviews without overclaiming.
- **Learning:** Build transferable mental models (DOM vs Canvas vs WebGL; VDOM vs signals; texture lifecycle).
- **Emotional:** Replace “I only read the docs” anxiety with “I can demo and explain what I measured.”

### 2.2 Non-Users (v1)

- End consumers looking for a real streaming service.
- Teams needing store-certified Tizen/webOS packages.
- Learners wanting a React TV tutorial.

### 2.3 Key User Journeys

- **UJ-1. Phong ships and demos a virtualized EPG.**
  - **Persona + context:** Phong, senior TS engineer new to TV stacks, preparing for consultancy interviews.
  - **Entry state:** Shell running in desktop Chromium; keyboard mapped as D-pad.
  - **Path:** Open EPG → move focus across channels/time with arrows → scroll large grid → open README metrics section.
  - **Climax:** He can state how many cells exist vs how many are drawn, and show FPS/heap notes.
  - **Resolution:** Confidence to answer “How would you optimize an EPG?” with a live demo.
  - **Edge case:** Fast held-key navigation does not freeze the UI or unbounded-grow memory.

- **UJ-2. Phong demos Home rails on Blits/Lightning.**
  - **Entry state:** From shell, enter Home.
  - **Path:** Focus moves along a horizontal poster rail → adjacent posters lazy-load → leave Home.
  - **Climax:** Focus feels immediate; textures unload/cleanup on leave (documented).
  - **Resolution:** Can explain scene graph + focus vs DOM SPA.

- **UJ-3. Phong demos raw WebGL after Canvas EPG.**
  - **Persona + context:** Same learner; interviewers probe GPU vs Canvas and draw calls.
  - **Entry state:** Canvas EPG Visible Window math exists and is understood.
  - **Path:** Open WebGL Lab → same Visible Window / tile idea rendered via WebGL textures → toggle or compare with Canvas Perf Note.
  - **Climax:** Explains buffers, textures, simple shader path, and draw-call batching with measured numbers.
  - **Resolution:** Can answer “Do you know WebGL or only frameworks?” without overclaiming expert depth.
  - **Edge case:** Context loss / cleanup on leave does not leak GPU resources.

- **UJ-4. Phong shows Solid Live strip updates without full rerender.**
  - **Path:** Open Live surface → “now playing” / clock badge updates every second.
  - **Climax:** Explains signals vs React VDOM using the running strip.
  - **Resolution:** JD SolidJS line covered honestly.

- **UJ-5. Phong runs a memory soak and records the result.**
  - **Path:** Navigate between surfaces for 30 minutes → heap snapshot diff → fix any leak → re-measure.
  - **Climax:** Written soak report in repo.
  - **Resolution:** MVP complete.

## 3. Glossary

- **TV Study Shell (Shell)** — The overall monorepo app that routes between Surfaces.
- **Surface** — A primary full-screen experience: Home, Live, or EPG.
- **Home** — Horizontal rails of focusable poster tiles (catalog browsing pattern).
- **Live** — Surface featuring a Live Strip of frequently updating “now” metadata (video playback mocked).
- **Live Strip** — Signal-driven UI strip showing now-playing / clock-like updates.
- **EPG** — Electronic Program Guide: 2D channel × time Program Grid.
- **Program Grid** — Virtualized EPG cells for channels and time slots.
- **Visible Window** — Subset of channels and time range currently drawn.
- **D-pad** — Directional navigation input (arrow keys as proxy).
- **Focus** — The single primary interactive element receiving remote/keyboard input.
- **Safe Zone** — Margin inset simulating TV overscan (visual guide in shell chrome).
- **Texture** — GPU/image resource for posters in Home (Blits/Lightning) or WebGL Lab.
- **WebGL Lab** — MVP Surface that renders a Visible Window (or poster/tile grid) with raw WebGL (buffers, textures, shaders, draw calls) for GPU literacy.
- **Draw Call** — A single GPU submit of geometry; batching reduces overhead.
- **D-pad Smoke** — Automated Playwright E2E that drives Surfaces with keyboard arrows as a remote proxy.
- **TV Emulator** — Vendor QEMU/VM-style environment closer to a TV software stack (e.g. Tizen TV Emulator).
- **TV Simulator** — Lighter vendor tool that simulates TV Web APIs without a full platform image (e.g. Tizen TV Web Simulator, webOS TV Simulator).
- **Memory Soak** — Extended session test comparing heap before/after navigation.
- **Mock Data** — Synthetic JSON channels, programs, and rails (no production backend).
- **Perf Note** — Documented FPS, draw counts, or heap measurements labeled with environment.

## 4. Features

### 4.1 App Shell & Navigation

**Description:** Thin Shell chrome with Safe Zone guide, Surface switcher, and shared D-pad help. Realizes UJ-1–UJ-4. `[ASSUMPTION: desktop-first; no platform launcher integration]`

**Functional Requirements:**

#### FR-1: Launch Shell

Learner can open the Shell in a browser and see a navigable entry screen listing Surfaces.

**Consequences (testable):**

- `npm`/`pnpm` install + documented start command launches without manual build ritual beyond README.
- Entry UI shows Home, Live, and EPG as destinations.

#### FR-2: Switch Surfaces

Learner can move between Home, Live, and EPG via D-pad/keyboard and return with Back.

**Consequences (testable):**

- Focus restores to a predictable place when re-entering a Surface.
- Leaving a Surface triggers documented cleanup hooks (listeners/textures).

#### FR-3: Safe Zone & 10-foot chrome

Shell displays a Safe Zone inset and large-enough chrome typography for lean-back readability on a desktop mock.

### 4.2 EPG (Canvas) Surface

**Description:** Canvas 2D Program Grid with Visible Window virtualization and D-pad Focus. Realizes UJ-1.

#### FR-4: Virtualized Program Grid

Learner can browse ≥50 channels × ≥24h of Mock Data while only Visible Window cells are drawn each frame.

**Consequences (testable):**

- Draw/cell accounting is exposed in a debug overlay or Perf Note.
- Scrolling changes the Visible Window without instantiating full DOM cell forests.

#### FR-5: EPG D-pad Focus

Learner can move Focus across channels (vertical) and time (horizontal) with arrow keys; Enter selects a program detail (minimal panel OK).

#### FR-6: Now-line

Program Grid shows a distinct now-line indicator updated independently from full grid rebuilds.

#### FR-7: EPG Perf Note

Repo includes a Perf Note for EPG (FPS and/or draw counts) measured on a named browser/OS.

### 4.3 WebGL Lab Surface

**Description:** Raw WebGL lab that reuses Visible Window / tile ideas from EPG to teach GPU pipeline vocabulary. Realizes UJ-3. See `docs/webgl-investment.md`. This is **not** a full Blits replacement; it is deliberate metal practice before/alongside Lightning Home.

#### FR-15: WebGL Visible Window / tile grid

Learner can open WebGL Lab and see a navigable (D-pad) textured tile or EPG-window grid rendered with WebGL (not Canvas 2D, not DOM cells).

**Consequences (testable):**

- Uses `WebGLRenderingContext` or `WebGL2RenderingContext`.
- Uploads at least one texture atlas or per-tile textures and draws the Visible Window only.
- Shares Visible Window math with EPG via `packages/shared` where practical (or documents intentional duplication).

#### FR-16: Canvas vs WebGL Perf Note

Repo includes a Perf Note comparing Canvas EPG vs WebGL Lab on the same machine (FPS and/or draw-call / CPU-time framing), with environment labeled.

#### FR-17: WebGL vocabulary in README

README (or linked note) explains buffers, textures, shaders, and draw calls using this lab as the concrete example — honest about learning depth.

**Feature-specific NFRs:**

- Unmount deletes buffers/textures/programs created by the lab (AD-6).

### 4.4 Home (Blits / Lightning) Surface

**Description:** At least one horizontal Home rail of focusable posters using Blits on Lightning 3 Renderer (applied WebGL scene graph). Realizes UJ-2.

#### FR-8: Focusable Home Rail

Learner can move Focus left/right along a rail of ≥12 poster tiles with visible focus affordance.

#### FR-9: Lazy Texture Loading

Off-screen or far tiles do not keep full-resolution Textures loaded indefinitely; leaving Home releases resources (documented approach).

#### FR-10: Home Perf Note

Repo includes a short Perf Note covering focus scroll smoothness and cleanup behavior.

### 4.5 Live (SolidJS) Surface

**Description:** SolidJS Live Strip demonstrating fine-grained updates. Realizes UJ-4. Video is mocked (poster/color field).

#### FR-11: Live Strip Signal Updates

Learner sees now-playing text and/or clock update at least once per second without remounting the whole Surface tree.

#### FR-12: Solid vs VDOM talking point

README explains how the Live Strip update model differs from React-style rerender (learner-authored, accurate).

### 4.6 Memory Soak & Portfolio Packaging

**Description:** Lab D + portfolio README. Realizes UJ-5.

#### FR-13: Memory Soak Procedure

Repo documents a 30-minute soak procedure and records at least one before/after heap comparison (or explicit “no growth” result) for Shell navigation across Surfaces.

#### FR-14: Portfolio README

Root README states stack map, how to run, honesty about desktop proxy, and links to Perf Notes.

**Feature-specific NFRs:**

- Perf Notes must label environment (browser, machine class).

### 4.7 Quality gates — UT, E2E, Emulator

**Description:** TV-aware test ladder so regressions are caught before any “release” claim. Full strategy: `docs/testing-strategy.md`. Emulators/simulators are specialized OEM tools; they do not replace a physical TV for memory/DRM.

#### FR-18: Unit tests for shared logic

Learner (and CI) can run Vitest covering Visible Window math, D-pad key map, and other pure helpers in `packages/shared`.

**Consequences (testable):**

- `pnpm test` (or documented equivalent) exits 0 with failing tests on broken window math.
- Surface packages are not required to hit vanity UI coverage percentages.

#### FR-19: Playwright D-pad smoke E2E

Learner (and CI) can run a Playwright suite that opens Shell, navigates into each Surface with Arrow keys, and returns with Back — asserting app-owned outcomes (not DOM-only focus for Canvas/WebGL/Blits).

**Consequences (testable):**

- Suite runs against desktop Chromium.
- At least one smoke path per Surface exists by portfolio MVP polish.
- Focus assertions for non-DOM Surfaces use debug HUD / test hooks / `data-focus-id` (or equivalent).

#### FR-20: Emulator / Simulator dry-run notes

Before claiming packaging readiness, learner documents at least one run on a **TV Simulator or TV Emulator** (prefer Samsung Tizen path first) with limitations called out (no DRM, memory ≠ device).

**Consequences (testable):**

- `docs/perf-notes/emulator-tizen.md` (or webOS equivalent) exists with tool name, version, what passed/failed, and honesty that device testing remains the gate for real release.
- Chrome CPU throttle checklist is documented even if OEM tools are delayed.

**Feature-specific NFRs:**

- CI requires FR-18 + FR-19; FR-20 is manual/dev-machine (heavy VMs).
- Physical TV soak remains separate from FR-20.

## 5. Non-Goals (Explicit)

- Real streaming playback, DRM, CAS, or tuner integration.
- Store packaging for Tizen / webOS / Android TV.
- React (or React Native) implementation path.
- Full multi-day EPG editor / CMS.
- Pixel-perfect clone of Samsung/LG launcher.
- Claiming production Lightning employment history via this repo alone.
- Accessibility certification for TV platforms (basic focus visibility is required; full a11y suite is not).

## 6. MVP Scope

### 6.1 In Scope

- Shell with four Surfaces including WebGL Lab (FR-1–FR-3, FR-15).
- Canvas EPG virtualization + D-pad + now-line + Perf Note (FR-4–FR-7).
- **WebGL Lab + Canvas vs WebGL Perf Note + vocabulary (FR-15–FR-17).**
- Blits Home rail + lazy textures + Perf Note (FR-8–FR-10).
- Solid Live Strip + README explanation (FR-11–FR-12).
- Memory Soak doc + portfolio README (FR-13–FR-14).
- **Vitest UT + Playwright D-pad smoke (FR-18–FR-19); emulator/simulator dry-run notes (FR-20).**

### 6.2 Out of Scope for MVP

- Second Home rail / personalization. `[NOTE FOR PM: nice interview polish later]`
- Full custom WebGL UI framework replacing Blits for Home.
- Advanced WebGL2 features (MRT, complex lighting) beyond textured 2D UI tiles.
- SolidTV migration.
- On-device CI farms / automated emulator farms in CI.
- Backend APIs.
- Claiming store certification from Simulator/Emulator alone.

## 7. Success Metrics

| Metric | Target |
| --- | --- |
| Surfaces runnable | 4/4 from README scripts (Home, Live, EPG, WebGL Lab) |
| WebGL literacy | Can whiteboard pipeline + demo FR-15–16 in ≤5 minutes |
| EPG virtualization evidence | Visible Window draw count ≪ total logical cells |
| Memory Soak | No unbounded heap growth over 30 min (or leak fixed + retested) |
| Interview readiness | Builder can demo UJ-1–UJ-4 in ≤12 minutes |
| UT + E2E | `pnpm test` + Playwright D-pad smoke green on CI |
| Emulator honesty | FR-20 notes exist before any packaging “ready” claim |
| Honesty | README states desktop proxy + learning purpose |

**Counter-metrics (avoid gaming):**

- Lines of code / number of frameworks without demos.
- “60 FPS” claims without measurement environment.

## 8. Assumptions Index

- `[ASSUMPTION]` Desktop Chromium + keyboard is the primary runtime for v1.
- `[ASSUMPTION]` One Home rail is enough for Lightning/Blits learning proof.
- `[ASSUMPTION]` Mock video (static) is acceptable for Live.
- `[ASSUMPTION]` pnpm or npm workspaces + Vite is the bundling approach (architecture may pin).
- `[ASSUMPTION]` No UX designer artifact required beyond domain research glossary.

## 9. Open Questions

- Prefer pnpm vs npm workspaces? → defer to architecture with Vite monorepo default.
- Exact Blits package version pin at scaffold time.
- Whether Shell chrome is DOM or also Blits — prefer thin DOM shell hosting iframes/packages unless architecture chooses otherwise.

## 10. Risks

| Risk | Mitigation |
| --- | --- |
| Framework sprawl | Hard package boundaries; thin Shell |
| Blits ramp delay | Official `npm create @lightningjs/app` starter |
| Incomplete soak | MVP gate includes FR-13 |
| Overclaiming | FR-14 honesty section |
| Emulator ≠ device | FR-20 + testing-strategy honesty; physical TV remains L4 |

---

**Status:** final (Fast path; plan-approved scope)  
**Next:** Architecture spine → Epics & Stories
