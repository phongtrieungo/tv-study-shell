---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - interview-study-plan.html
workflowType: research
lastStep: 6
research_type: technical
research_topic: TV UI stack — Lightning 3 / Blits, SolidJS, Canvas 2D, WebGL for constrained Smart TV
research_goals: Inform a portfolio product (TV Study Shell) covering Canvas EPG, Lightning/Blits Home rail, and SolidJS Live strip for interview-ready hands-on learning
user_name: Ngotrieuphong
date: 2026-07-22
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-07-22  
**Author:** Ngotrieuphong  
**Research Type:** technical  

---

## Research Overview

This research evaluates the current Smart-TV web UI stack relevant to a Senior FE WebGL / TV Performance interview path: **Lightning 3 Renderer + Blits**, **SolidJS fine-grained reactivity** (including SolidTV as an adjacent option), **Canvas 2D**, and **WebGL**, under real device constraints (old Chromium, tight RAM, D-pad focus).

Key finding: Lightning 3 splits into a **WebGL/Canvas renderer** and **Blits** (the app framework). JD language that says “Lightning V3 / SolidJS / Blits” maps cleanly onto this split — Blits is not a third unrelated toolkit; it is the Lightning 3 app layer. For a learning portfolio, one monorepo with three surfaces (Canvas EPG → Blits Home → Solid Live strip) teaches the right mental models without shipping three disconnected demos.

Scope was confirmed via the approved BMad plan for TV Study Products (2026-07-22). Companion domain research: `domain-smart-tv-home-live-epg-research-2026-07-22.md`.

---

## Technical Research Scope Confirmation

**Research Topic:** TV UI stack — Lightning 3 / Blits, SolidJS, Canvas 2D, WebGL for constrained Smart TV  
**Research Goals:** Feasibility, scaffolds, integration patterns, and architecture recommendations for TV Study Shell (portfolio product for interview readiness)

**Technical Research Scope:**

- Architecture Analysis — design patterns, frameworks, system architecture
- Implementation Approaches — development methodologies, coding patterns
- Technology Stack — languages, frameworks, tools, platforms
- Integration Patterns — APIs, protocols, interoperability
- Performance Considerations — scalability, optimization, patterns

**Research Methodology:** Current public docs and practitioner sources with citations; multi-source validation for critical claims; confidence notes where industry figures vary by OEM.

**Scope Confirmed:** 2026-07-22 (via plan approval)

---

## Technology Stack Analysis

### Programming Languages

_Popular Languages:_ **JavaScript / TypeScript** dominate web-based TV apps (Lightning/Blits, SolidJS, Canvas/WebGL). TypeScript is preferred for portfolio clarity and interview storytelling; Blits examples are often plain JS — either works if types are added at the app boundary.  
_Emerging Languages:_ Rust/WASM appears in EPG **parsing** pipelines (large XMLTV) to keep the main thread free — useful knowledge, not required for v1 of TV Study Shell.  
_Language Evolution:_ TV browsers lag desktop evergreen; target ES features carefully and verify on older Chromium (Lightning renderer documents support back toward Chrome ~38-era constraints).  
_Performance Characteristics:_ Main-thread JS is the bottleneck for navigation latency; GPU draw cost matters for large animated surfaces.  
_Source:_ https://github.com/lightning-js/renderer · https://lightningjs.io/

### Development Frameworks and Libraries

_Major Frameworks:_

| Layer | Technology | Role for TV Study Shell |
| --- | --- | --- |
| Renderer | **Lightning 3 Renderer** (`@lightningjs/renderer`) | WebGL (primary) + Canvas 2D fallback; scene graph, textures, bounds culling |
| App framework | **Blits** (`@lightningjs/blits`) | Components, reactivity, input, focus, routing — the Lightning 3 “app” story |
| Reactive DOM UI | **SolidJS** | Fine-grained signals; no VDOM — good for Live strip / metadata overlays in a browser shell |
| Adjacent TV | **SolidTV** (`@solidtv/solid`) | Solid primitives over WebGL TV rendering — optional later comparison, not MVP |
| Learning bridge | **Canvas 2D** | EPG virtualization lab without Lightning bootstrap cost |

_Micro-frameworks:_ Avoid React for this portfolio — JD explicitly prefers non-React-centric profiles; React teaches the wrong performance story for TV.  
_Evolution Trends:_ Lightning 2 → Lightning 3 split (renderer vs Blits); Blits actively releasing (e.g. v2.1.x in 2026).  
_Ecosystem Maturity:_ Lightning/Blits is niche but production-proven on millions of embedded devices (Sky/Comcast/NBCU lineage per Lightning renderer README). SolidJS is mature for web; SolidTV is newer/niche.  
_Source:_ https://www.lightningjs.io/ · https://github.com/lightning-js/blits · https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity · https://solidtv.dev/

### Database and Storage Technologies

_Relational / NoSQL:_ Not primary for this portfolio. Mock EPG/Home data as static JSON (or generated fixtures).  
_In-Memory:_ Client-side caches for visible EPG windows and poster textures; object pools for cells/tiles.  
_Data Warehousing:_ N/A.  
_Source:_ Practitioner TV memory guidance — https://www.sundr.dev/blog/smart-tv-development-challenges

### Development Tools and Platforms

_IDE and Editors:_ VS Code + Blits VS Code extension (syntax for templates).  
_Version Control:_ Git + GitHub README with FPS/memory notes.  
_Build Systems:_ **Vite** is the Blits getting-started path (`npm create @lightningjs/app`, `npm run dev`).  
_Testing Frameworks:_ Vitest/Jest for pure virtualization math; manual keyboard D-pad simulation; Chrome Performance + Memory panels; optional Playwright for smoke. On-device Tizen/webOS deferred.  
_Source:_ https://www.lightningjs.io/v3-docs/blits/getting_started/getting_started.html

### Cloud Infrastructure and Deployment

_Major Cloud Providers:_ Static hosting (GitHub Pages / any CDN) is enough for portfolio demos.  
_Container Technologies:_ Optional Docker for consistent Node toolchain — not required.  
_Serverless / CDN:_ CDN for poster assets; keep assets TV-resolution sized.  
_Source:_ General static SPA deployment practice (high confidence).

### Technology Adoption Trends

_Migration Patterns:_ Teams move from DOM-heavy HTML5 TV UIs toward WebGL scene graphs (Lightning) or custom canvas/native renderers when EPG/Home jank appears. LG’s public Flutter EPG rewrite narrative shows the industry pain with DOM EPG.  
_Emerging Technologies:_ SolidTV competing for “Solid + WebGL TV”; WebGPU not relevant for old TV browsers.  
_Legacy Technology:_ Lightning 2 still supported; prefer Lightning 3 + Blits for new learning.  
_Community Trends:_ JD stack naming (Lightning V3 / SolidJS / Blits) matches Lightning 3’s public split.  
_Source:_ https://lightningjs.io/blogs/roadToPerformance.html · https://lightningjs.io/blogs/lightning3Release.html · Medium LG EPG Flutter narrative (confidence: medium — secondary journalism)

---

## Integration Patterns Analysis

### API Design Patterns

_RESTful APIs:_ Typical for catalog / EPG schedule fetch in production; TV Study Shell mocks JSON fixtures.  
_GraphQL APIs:_ Used by some OTT backends; out of scope for learning MVP.  
_RPC and gRPC:_ Rare in TV browser clients.  
_Webhook Patterns:_ N/A client-side.  
_Source:_ Domain practice + interview study plan Labs A–C.

### Communication Protocols

_HTTP/HTTPS:_ Asset and schedule loading.  
_WebSocket Protocols:_ Live metadata / “now playing” updates — Solid Live strip can simulate with `setInterval` or a mock WS later.  
_Message Queue Protocols:_ Backend concern.  
_Source:_ https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity (resources/async patterns)

### Data Formats and Standards

_JSON:_ Primary for mock channels, programs, rails.  
_XMLTV:_ Common EPG interchange; parsing can be heavy — generate synthetic JSON instead of full XMLTV in v1.  
_Images:_ Prefer appropriately sized posters; revoke URLs; avoid 4K assets on “TV memory” demos.  
_Source:_ https://www.sundr.dev/blog/smart-tv-development-challenges · Espial HTML5 EPG patent discussion (historical memory blow-up of HTML EPG) https://www.freepatentsonline.com/y2016/0360260.html

### System Interoperability Approaches

_Point-to-Point:_ Shell router → surface modules (EPG / Home / Live).  
_API Gateway / Service Mesh:_ N/A for portfolio.  
_Platform bridges:_ Tizen/webOS APIs deferred; develop in desktop Chromium with keyboard as D-pad.  
_Source:_ Lightning multiplatform browser claim — https://www.lightningjs.io/

### Microservices Integration Patterns

Not applicable to TV Study Shell client scope. Treat **surfaces as modules** with shared `shared/` types and focus/input utilities — not microservices.

### Event-Driven Integration

_Publish-Subscribe:_ Useful inside the shell for “now” clock ticks and focus changes.  
_Focus events:_ Blits `input` handlers; Canvas EPG custom key map (Arrow keys / Enter / Back).  
_Source:_ https://www.lightningjs.io/v3-docs/blits/essentials/components.html

### Integration Security Patterns

Portfolio demos: no auth required. Document that production TV apps use platform DRM/auth separately — out of learning scope.

---

## Architectural Patterns and Design

### System Architecture Patterns

**Recommended paradigm for TV Study Shell:** **Modular monorepo with surface packages** — one app shell, three rendering strategies coexisting for learning, not a single framework monoculture.

```text
tv-study-shell/
  apps/shell/          # route between surfaces, shared chrome
  packages/epg-canvas/ # Lab A — Canvas 2D virtualized EPG
  packages/home-blits/ # Lab B — Blits/Lightning Home rails
  packages/live-solid/ # Lab C — SolidJS live strip
  packages/shared/     # types, mock data, focus key codes, perf helpers
  docs/perf-notes/     # FPS / heap soak writeups
```

_Source:_ Plan default + Lightning 3 split architecture https://lightningjs.io/blogs/roadToPerformance.html

### Design Principles and Best Practices

1. **Render only the visible window** (EPG rows/columns; Home rail tiles).  
2. **Dispose textures/listeners on route leave** (memory soak Lab D).  
3. **Separate animated chrome** (now-line) from static grid redraw.  
4. **Measure → fix → verify** with Performance + Memory panels.  
5. **Honest stack boundaries** — do not claim production Lightning experience beyond the lab.

_Source:_ Interview study plan §§5–9 · Sundr TV challenges · Lightning bounds-margin / image worker features (Lightning 3.0 release notes)

### Scalability and Performance Patterns

| Pattern | Where |
| --- | --- |
| Virtualization | EPG Canvas |
| Object pooling | EPG cells / Home tile nodes |
| Texture lazy-load + unload | Home Blits |
| Fine-grained signal updates | Solid Live strip |
| Canvas fallback | Lightning renderer on weak GPUs |
| FPS budget | Aim ≥30 FPS on mid hardware; document desktop measurements honestly |

_Source:_ https://lightningjs.io/blogs/roadToPerformance.html · Vita_plex EPG custom-drawn grid commit (single draw pass vs view forest) https://github.com/Breezyslasher/Vita_plex/commit/1e50d0904252a44ded798ed5e8942393411803db

### Integration and Communication Patterns

Shell owns routing and shared clock; surfaces own rendering. No shared React-style global store across Blits and Solid — prefer explicit props/events at the shell boundary.

### Security Architecture Patterns

Static demo only; no secrets in repo; mock data only.

### Data Architecture Patterns

Immutable fixture JSON + derived visible windows; optional incremental “now” pointer. No persistence beyond `localStorage` for last-focused rail (optional).

### Deployment and Operations Architecture

Static build artifacts; document “how to run” and “how I profiled” in README. CI: lint + unit tests for virtualization math.

---

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies

**Phased learning adoption (maps to 6-week roadmap):**

1. Canvas EPG first (fastest path to virtualization + D-pad stories).  
2. Blits Home rail (`npm create @lightningjs/app` starter).  
3. Solid Live strip (signals demo without claiming full TV framework).  
4. Memory soak across shell navigation.  
5. Optional: skim SolidTV / Blits comparison table for interviews.

_Source:_ interview-study-plan.html Labs A–D · Blits getting started

### Development Workflows and Tooling

- Vite monorepo (pnpm or npm workspaces).  
- Keyboard D-pad map documented.  
- Perf notes folder with before/after screenshots or numbers.

### Testing and Quality Assurance

- Unit: window math, pool recycle counts.  
- Manual: 30-minute soak + heap snapshot diff.  
- Device: deferred (document as known gap).

### Deployment and Operations Practices

GitHub Pages or `vite preview`; no backend.

### Team Organization and Skills

Solo learner portfolio; skills to demonstrate: TS, profiling, TV constraints literacy, Lightning/Blits basics, Solid signals, Canvas virtualization.

### Cost Optimization and Resource Management

Prefer free tooling; small poster assets; avoid large video playback in MVP.

### Risk Assessment and Mitigation

| Risk | Mitigation |
| --- | --- |
| Blits/Lightning learning curve | Start with official create scaffold; keep Home rail minimal |
| Mixing three frameworks poorly | Clear package boundaries; shell is thin |
| Overclaiming in interviews | README honesty section + study plan positioning phrase |
| Desktop-only metrics | Label measurements “desktop Chromium proxy” |

## Technical Research Recommendations

### Implementation Roadmap

1. Scaffold monorepo + shared mock data.  
2. Ship Lab A EPG with README metrics.  
3. Add Blits Home package.  
4. Add Solid Live strip.  
5. Shell navigation + memory soak doc.  
6. Polish portfolio README.

### Technology Stack Recommendations

| Choice | Recommendation |
| --- | --- |
| Home surface | **Blits + Lightning 3 Renderer** |
| EPG surface | **Canvas 2D** (optional later WebGL note) |
| Live strip | **SolidJS** |
| Language | **TypeScript** where practical |
| Bundler | **Vite** |
| Avoid for v1 | React, full Tizen packaging, real video DRM |

### Skill Development Requirements

- Browser rendering pipeline (reflow/paint/composite)  
- Canvas virtualization  
- Lightning scene graph + focus  
- Solid signals vs React VDOM talking points  
- TV memory/FPS constraints vocabulary  

### Success Metrics and KPIs

- EPG: only visible cells drawn; stable FPS while scrolling (document number).  
- Home: focus moves without texture thrash; cleanup on leave.  
- Live: signal updates without full tree rerender (prove via Solid debug / simple counter).  
- Soak: no monotonic heap growth over 30 minutes.  
- Interview: can whiteboard DOM vs Canvas vs WebGL and walk the repo.

---

# TV UI Stack for Constrained Devices: Comprehensive Technical Research

## Executive Summary

Smart TV web UIs fail when they treat the TV like a desktop SPA: too many DOM nodes, oversized images, and uncontrolled rerenders under weak CPUs and few hundred MB of app RAM. Lightning 3 addresses this with a **WebGL-first renderer** and **Blits** app framework; SolidJS addresses update cost via **fine-grained signals**; Canvas 2D remains the fastest way to learn **EPG virtualization** before adopting a full scene graph.

For interview readiness, the highest-leverage product is a single **TV Study Shell** that implements three surfaces with honest metrics — not five half-finished demos.

**Key Technical Findings:**

- Lightning 3 = Renderer + Blits (JD’s “Lightning V3 / Blits” is one stack story).  
- SolidJS belongs as a Live/metadata reactivity lesson (and SolidTV as optional advanced reading).  
- EPG performance lore consistently points to **virtualize / custom-draw / pool**, not DOM cell forests.  
- Memory discipline and long-session soak tests matter more than micro-benchmarks.

**Technical Recommendations:**

1. Build **one monorepo**, three surfaces.  
2. Lead portfolio with **Canvas EPG** or **Blits Home**.  
3. Document measurements as desktop proxies until on-device is available.  
4. Keep Blits Home rail thin; depth beats breadth.  
5. Use research + domain docs as interview crib sheets.

## Table of Contents

1. Technical Research Introduction and Methodology  
2. Technical Landscape and Architecture Analysis  
3. Implementation Approaches and Best Practices  
4. Technology Stack Evolution and Current Trends  
5. Integration and Interoperability Patterns  
6. Performance and Scalability Analysis  
7. Security and Compliance Considerations  
8. Strategic Technical Recommendations  
9. Implementation Roadmap and Risk Assessment  
10. Future Technical Outlook  
11. Methodology and Source Verification  
12. Appendices  

## 1. Technical Research Introduction and Methodology

### Technical Research Significance

TV-centric FE roles hire for **render-cost intuition**. Desktop React experience does not transfer automatically; candidates who have shipped a virtualized EPG and a Lightning/Blits focus rail can speak to JD requirements without overclaiming production TV years.

_Technical Importance:_ Matches consultancy JD gaps in the study plan (WebGL, Lightning, SolidJS, Smart TV).  
_Business Impact:_ Portfolio evidence shortens the “can they learn this stack?” risk for hiring managers.  
_Source:_ interview-study-plan.html · https://lightningjs.io/

### Technical Research Methodology

- **Technical Scope:** Stack, integration, architecture, implementation, performance for TV Study Shell.  
- **Data Sources:** LightningJS official site/docs/GitHub, SolidJS docs, practitioner TV blogs, EPG optimization case discussions.  
- **Analysis Framework:** Map each tech to Labs A–C and interview talking points.  
- **Time Period:** Sources checked 2026-07-22.  
- **Technical Depth:** Implementation-ready recommendations; not a full OEM certification guide.

### Technical Research Goals and Objectives

**Original Technical Goals:** Portfolio product covering Canvas EPG, Lightning Home, SolidJS Live strip for interview readiness.

**Achieved Technical Objectives:**

- Clarified Lightning 3 / Blits relationship.  
- Positioned SolidJS vs SolidTV.  
- Recommended monorepo architecture and phased build order.  
- Captured performance/memory constraints with citations.

## 2. Technical Landscape and Architecture Analysis

### Current Technical Architecture Patterns

Dominant pattern for high-performance TV web UI: **immediate-mode / scene-graph GPU rendering** (Lightning) rather than large DOM trees. Blits provides component DX on top of the renderer. Canvas 2D remains valid for custom grids.

_Dominant Patterns:_ Scene graph + focus management; virtualized large grids.  
_Architectural Evolution:_ Lightning 2 monolith → Lightning 3 renderer/framework split.  
_Architectural Trade-offs:_ Learning two (or three) runtimes vs single-framework purity — accepted for interview coverage.  
_Source:_ https://lightningjs.io/blogs/roadToPerformance.html

## 3. Implementation Approaches and Best Practices

### Current Implementation Methodologies

Official Blits path: `npm create @lightningjs/app` → Vite → component templates with `state` / `input` / `hooks`. Canvas EPG: single canvas, `requestAnimationFrame`, key handlers, windowed data. Solid: `createSignal` / `createEffect` for Live strip.

_Source:_ https://www.lightningjs.io/v3-docs/blits/getting_started/getting_started.html · https://docs.solidjs.com/

## 4. Technology Stack Evolution and Current Trends

Lightning 3.0 released with Canvas2D fallback, image workers, texture compression, bounds margin (render visible). Blits continues frequent releases. SolidTV markets Solid+WebGL for TV as alternative to Blits — useful comparison topic, not required for MVP.

## 5. Integration and Interoperability Patterns

Thin shell + package surfaces; mock JSON; keyboard as D-pad; optional future platform bridges.

## 6. Performance and Scalability Analysis

### Performance Characteristics and Optimization

- Target frame budgets: ~33ms (30fps) / ~16ms (60fps). Lightning literature cites staying above ~24fps as a practical floor for complex animation on weak devices.  
- EPG: custom single-pass drawing beats thousands of layout nodes.  
- Images: decoded full-res posters can exhaust TV memory quickly.

_Source:_ https://lightningjs.io/blogs/roadToPerformance.html · https://www.sundr.dev/blog/smart-tv-development-challenges

### Scalability Patterns

Virtualization, pooling, lazy textures, route-level disposal, separate now-line animation.

## 7. Security and Compliance Considerations

Portfolio: no PII, no DRM. Production TV apps add store certification, DRM, and platform security — out of scope, mention in interviews as awareness.

## 8. Strategic Technical Recommendations

1. **Adopt TV Study Shell monorepo** as the product.  
2. **Bind Home to Blits+Lightning 3**, EPG to Canvas 2D, Live to SolidJS.  
3. **Lead README with metrics and honesty**.  
4. **Defer on-device packaging** until desktop labs are solid.  
5. **Use domain research glossary** for interview language.

## 9. Implementation Roadmap and Risk Assessment

Phases match study plan Weeks 2–6. Risks: framework sprawl, overscope Home, fake metrics — mitigate with MVP FR list in PRD and Lab D soak gate.

## 10. Future Technical Outlook

Near-term: deepen Blits Home (shaders, RTT), optional WebGL EPG migration note, SolidTV spike. Medium-term: Tizen/webOS packaging. Long-term: real stream + overlay compositing (still optional for interview).

## 11. Technical Research Methodology and Source Verification

### Primary Technical Sources

- https://www.lightningjs.io/  
- https://github.com/lightning-js/renderer  
- https://github.com/lightning-js/blits  
- https://www.lightningjs.io/v3-docs/blits/getting_started/getting_started.html  
- https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity  
- https://solidtv.dev/ / https://github.com/solid-tv/solid  
- https://www.sundr.dev/blog/smart-tv-development-challenges  
- https://lightningjs.io/blogs/roadToPerformance.html  
- https://lightningjs.io/blogs/lightning3Release.html  

### Technical Web Search Queries Used

- LightningJS Lightning V3 framework Smart TV WebGL 2025 2026  
- SolidJS signals fine-grained reactivity TV apps vs React 2025  
- Blits framework Metrological Lightning TV app development  
- Tizen webOS Smart TV web app memory constraints Canvas WebGL performance  
- EPG electronic program guide virtualization canvas rendering optimization TV  

### Confidence Levels

| Claim | Confidence |
| --- | --- |
| Lightning 3 = renderer + Blits | High |
| WebGL primary / Canvas fallback in Lightning 3 | High |
| TV apps often have ~hundreds of MB practical budget | Medium (OEM-dependent; practitioner ranges 200MB–1.5GB device RAM) |
| SolidTV production maturity vs Blits | Medium-low (marketing vs Lightning’s long embedded footprint) |
| Exact FPS gains from any single rewrite | Low without local measurement |

## 12. Technical Appendices and Reference Materials

### Stack Decision Table for TV Study Shell

| Surface | Stack | Interview proof |
| --- | --- | --- |
| EPG | Canvas 2D + virtualization | “I virtualized N×M and measured FPS/heap” |
| Home | Blits + Lightning 3 | “I built focusable rails with texture lifecycle” |
| Live | SolidJS signals | “Updates without VDOM rerender” |
| Shell | Thin TS router | “Multi-surface memory discipline” |

### Open Source Starters

- `npm create @lightningjs/app`  
- Blits example app: https://github.com/lightning-js/blits-example-app  
- SolidJS playground / Vite solid template  

---

## Technical Research Conclusion

### Summary of Key Technical Findings

Lightning 3 + Blits is the authentic “Lightning V3” learning path; Canvas EPG teaches the hardest algorithmic TV UI problem quickly; SolidJS teaches the reactivity story JD names. One product beats many demos.

### Next Steps Technical Recommendations

Proceed to **Forge Idea → PRD → Architecture → Epics** for TV Study Shell, grounded in this document and the domain research companion.

---

**Technical Research Completion Date:** 2026-07-22  
**Source Verification:** Claims cited to public sources checked on research date  
**Technical Confidence Level:** High on stack structure; Medium on OEM-specific memory numbers  

_This document is the technical reference for TV Study Shell planning in `tv-products`._
