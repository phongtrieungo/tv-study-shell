---
stepsCompleted: [1, 2, 3, 4, 5, 6]
workflowType: research
research_type: domain
research_topic: Smart TV Home Live TV EPG UX and constraints
research_goals: Ground TV Study Shell product in real TV domain language and UX constraints for interview-ready hands-on learning
user_name: Ngotrieuphong
date: 2026-07-22
web_research_enabled: true
source_verification: true
---

# Domain Research: Smart TV Home, Live TV & EPG for TV Study Shell

**Date:** 2026-07-22  
**Author:** Ngotrieuphong  
**Research type:** Domain  
**Product context:** Portfolio learning shell focused on Home / Live / EPG UX under real TV constraints

---

## Executive Summary

Smart TV UX is not “mobile UI scaled up.” It is a **10-foot, focus-first, memory-constrained** interaction model: one focused element at a time, D-pad spatial navigation, safe zones against overscan, and UI that stays responsive while video or large catalogs compete for RAM/CPU.

For a learning product like **TV Study Shell**, interview credibility comes from demonstrating the *right* hard problems: focus memory across rails, lazy poster loading, Live TV metadata overlays that don’t fight the video surface, and an EPG 2D grid with time windowing / virtualization / a now-line — not from shipping a real tuner, DRM, or store-certified binary on day one.

**Key takeaways for the portfolio:**

1. Speak and implement **focus, rails, safe zone, and EPG virtualization** as first-class concepts.
2. Target **30 FPS UI** as a realistic floor on constrained hardware; treat **60 FPS** as an aspirational budget for interactions.
3. **Mock** streams, DRM, and platform cert; **implement for real** navigation, list virtualization, image budgets, and EPG scrolling math.

---

## Table of Contents

1. [Domain Research Scope](#1-domain-research-scope)
2. [Smart TV Terminology](#2-smart-tv-terminology)
3. [Home Screen Patterns](#3-home-screen-patterns)
4. [Live TV Patterns](#4-live-tv-patterns)
5. [EPG Patterns](#5-epg-patterns)
6. [Hardware Reality](#6-hardware-reality)
7. [Platform Landscape (Interview Literacy)](#7-platform-landscape-interview-literacy)
8. [Implications for TV Study Shell](#8-implications-for-tv-study-shell)
9. [Sources & Confidence Notes](#9-sources--confidence-notes)

---

## 1. Domain Research Scope

**Research topic:** Smart TV Home / Live TV / EPG UX and constraints  
**Research goals:** Ground TV Study Shell in real TV domain language and UX constraints for interview-ready hands-on learning

**In scope**

- Living-room UX language (10-foot UI, D-pad, focus, overscan)
- Home catalog patterns (rails, grids, lazy images)
- Live TV overlay / now-playing interaction patterns
- EPG grid architecture (2D navigation, time windows, virtualization)
- Hardware budgets (RAM, FPS, cold start)
- Brief platform literacy (Tizen, webOS, Android TV / Google TV)

**Out of scope (intentionally mocked for a portfolio shell)**

- Broadcast tuners, CAS/DRM license servers, store certification packages
- Full OTT backend / personalization ML / ad decisioning
- Pixel-perfect recreation of Samsung Smart Hub or LG Launcher UX

**Methodology:** Vendor design docs + platform developer guides + practitioner articles (2024–2026). Claims that are industry-practice but not formally standardized are marked with confidence notes.

**Scope confirmed:** 2026-07-22

---

## 2. Smart TV Terminology

### 10-foot UI

Users typically watch from about **3 meters / 10 feet**. UI must prioritize large type, high contrast, sparse density, and unmistakable focus states. Samsung’s design principles emphasize lean-back use, legibility at distance, and avoiding mobile-like complexity. ([Samsung Developer – Design Principles](https://developer.samsung.com/smarttv/design/design-principles.html); [Android TV adaptive apps guide](https://developer.android.com/develop/adaptive-apps/guides/tv/build-adaptive-apps-for-tv))

**Interview phrasing:** “10-foot UI means the focus indicator and hierarchy must read from across the room, not from arm’s length.”

### D-pad / four-directional navigation

Primary input is **Up / Down / Left / Right + Select + Back/Return (+ Exit)**. Every actionable control must be reachable; navigation must be **predictable** (grid/rail layouts beat diagonal freeform). Pointer remotes (e.g. LG Magic Remote) exist, but D-pad remains the common baseline. ([Samsung Design Principles](https://developer.samsung.com/smarttv/design/design-principles.html); [Amazon Fire TV UX guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html))

### Spatial navigation

Spatial navigation maps key events to the **nearest focusable neighbor** in a direction. Ambiguous layouts create “focus traps” or unexpected jumps. Good TV apps:

- Keep focusable targets on a logical **2D lattice**
- Define explicit next-focus edges at screen boundaries
- Never leave the user with no visible focus

### Overscan & safe zones

Some TVs (especially older / lower-tier) crop edges of the framebuffer (**overscan**). Critical UI must sit inside a **safe zone** — commonly the inner ~90% (about **5% margin** per edge). On 1920×1080 that is roughly **~48 px** horizontal and **~27 px** vertical insets. Decorative backgrounds may extend into the crop; focused items and text should not. ([Android TV overscan guidance](https://developer.android.com/develop/adaptive-apps/guides/tv/build-adaptive-apps-for-tv); [Fire TV overscan / safe zone](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html); practitioner CTV write-ups such as [Robosoft CTV UX](https://www.robosoftin.com/blog/ctv-experience))

### STB (Set-Top Box)

An external device (cable/satellite/IPTV box, Chromecast with Google TV, streaming stick, etc.) that runs a TV OS and/or apps, often separate from the panel’s built-in Smart TV OS. Interview useful because many “TV apps” ship for both **embedded Smart TVs** and **STBs**, with similar UX but different hardware tiers.

### Launcher / Home shell

The system **launcher** (Samsung Smart Hub, LG webOS launcher bar, Google TV / Android TV home) owns app icons, recommendations, and often Live / On Now rows. An app’s **in-app Home** is a separate product surface: content rails inside your app after launch. Portfolio shells usually simulate **in-app Home**, not the OEM launcher.

### Focus memory

When the user leaves a row/screen and returns, the UI should restore **last focused item / row / scroll offset** rather than resetting to index 0. Leanback-era Android TV grid views explicitly remember last focused position when focus returns. ([Leanback `BaseGridView` focus restore behavior](https://android.googlesource.com/platform/frameworks/support/+/a9ac247af2afd4115c3eb6d16c05bc92737d6305/leanback/src/main/java/androidx/leanback/widget/BaseGridView.java))

**Why it matters:** Without focus memory, Home feels broken after every Back press; interviews often probe this as a “did you actually ship TV UI?” signal.

---

## 3. Home Screen Patterns

### Horizontal rails (rows)

Canonical catalog pattern: **vertical stack of horizontal rails** (Continue Watching, Popular, Live Now, genres). D-pad: Left/Right moves within a rail; Up/Down changes rails. Focus should keep the active item near a consistent **pivot** (e.g. left-aligned or ~30% from edge). Android’s modern guidance uses Compose `LazyRow` / `LazyColumn` with focus bring-into-view / `BringIntoViewSpec`. ([Android TV scrollable layouts](https://developer.android.com/training/tv/playback/compose/lists); legacy [Leanback browse](https://developer.android.com/training/tv/playback/leanback/browse))

### Poster grids

Secondary pattern for library/category views: **2D poster grid** (title art with aspect ratios like 2:3 portrait or 16:9 landscape). Same focus rules: clear focused scale/border, predictable neighbor moves, margins so focus never hugs the overscan edge.

### Lazy image load

TV Home can bind dozens of posters per viewport and hundreds off-screen. Production practice:

- **Virtualize** list items (recycle views / DOM nodes)
- Load images **only for near-viewport** tiles; cancel on scroll-away
- Prefer appropriately sized assets (don’t decode 4K posters for 200 px tiles)
- Debounce background hero updates until focus **settles** (avoid thrashing while scrubbing a rail)

Android docs call out limited memory and recommend image libraries (e.g. Glide) for decode/cache discipline. ([Leanback layouts / large bitmaps](https://developer.android.com/training/tv/playback/leanback/layouts); [Android TV memory](https://developer.android.com/training/tv/playback/memory))

### Incremental catalog updates

When Live status or rows change, prefer **diff-based** updates over full adapter resets to avoid blink and focus loss. ([ProAndroidDev Leanback DiffUtil pattern](https://proandroiddev.com/android-tv-leanback-updating-rows-in-rowssupportfragment-b407dff3be4d) — pattern still relevant conceptually for any rail UI)

---

## 4. Live TV Patterns

Live TV UX is a **video-first** surface with **transient chrome**.

### Metadata overlays / channel banner

On tune or channel change, show a short-lived **banner / info bar**: channel logo/number, now-title, time slot, rating, maybe next program. Android’s Live TV stack uses channel banner views and overlay sessions so metadata does not permanently obscure the program. ([Android TV Input Framework UI](https://developer.android.com/training/tv/tif/ui); AOSP [`ChannelBannerView`](https://android.googlesource.com/platform/packages/apps/TV/+/ca3c841e7e2c8f6a84e860000ded65fbf84b45d0/src/com/android/tv/ui/ChannelBannerView.java))

**Pattern rules**

- Auto-dismiss after a few seconds; re-show on Info / OK / channel change
- Keep overlays in the safe zone; never cover critical faces if avoidable
- Separate **persistent** overlays (CC, parental messages) from **transient** now-playing chrome

### Now-playing / On Now

Home or Live tabs often expose an **On Now** rail: currently airing linear/FAST channels with live preview or static art + live badge. Fire TV Live guidance emphasizes rich schedule metadata and clear provider attribution when integrating linear channels. ([Fire TV Input Framework / Live metadata](https://developer.amazon.com/docs/fire-tv/tv-input-framework-on-fire-tv.html))

### Low-latency UI updates

Channel zap UX is judged by **key-to-feedback** speed more than perfect video start:

1. Immediate focus / number / banner update on keypress  
2. Optional black/tuning state to hide decoder artifacts  
3. Video available callback → hide tuning state  
4. Schedule metadata refresh without blocking the key handler  

**Portfolio implication:** Simulate zap with keyed channel index + banner animation even if “video” is a placeholder surface. Do **not** do heavy JSON parsing or image decode on the key path.

### Channel zapping mental model

Users expect cable-like behavior: number entry, CH+/CH−, last-channel toggle, Back dismisses overlay not the whole app. Keep key handling **idempotent** and rate-limit rapid zaps so you don’t queue N stream switches.

---

## 5. EPG Patterns

An **Electronic Program Guide (EPG)** — also called IPG when interactive — is the on-screen schedule of channels × time. Classic layout is a **2D grid**: channels as rows, time as the horizontal axis, program cells spanning durations. ([Wikipedia – Electronic program guide](https://en.wikipedia.org/wiki/Electronic_program_guide); [Wurl EPG glossary](https://www.wurl.com/glossary/electronic-programming-guide-epg/))

### 2D grid navigation

- **Vertical:** change channel row  
- **Horizontal:** move across time / program cells (often jump by program boundary or by fixed time step)  
- **Select:** tune to channel (and optionally seek to program if timeshift/catch-up exists)  
- Optional: day strip, genre filters, search — secondary to the grid

### Time windowing

EPGs may cover many hours or multiple days, but the client should fetch and hold a **window** (e.g. “now − 2h” to “now + 12h”) and page additional slices as the user scrolls. This keeps memory and network bounded while the conceptual guide remains large.

### Virtualization & object pooling

A naïve EPG (every channel × every program as a live node) dies on TV hardware. Production approaches:

- Render **only visible rows/columns** (+ small overscan buffer)
- **Pool** program cell views; rebind data on scroll
- Compute cell **x = (start − windowStart) × pxPerMinute**, **width = duration × pxPerMinute**
- Keep channel sidebar sticky; scroll program canvas independently or in sync

React EPG libraries (e.g. Planby) advertise custom virtualized views for large schedules — useful mental model even if you build a simpler custom canvas. ([Planby / BrightCoding overview](https://blog.brightcoding.dev/2025/07/23/react-component-for-building-epgs-schedules-timelines-and-event-planners))

### Now-line

A vertical **now-line** (and often auto-scroll-to-now) marks current time. It should update on a timer (e.g. every 30–60s, or every minute aligned to clock) without rebuilding the whole grid. “Jump to now” is a standard affordance.

### EPG data quality (domain note)

Schedule accuracy is a product trust issue: wrong titles or times feel like a broken tuner. For Study Shell, mock schedules with consistent `start`/`end`/`channelId` and a clock-driven now-line are enough; live schedule sync APIs are optional stretch goals.

---

## 6. Hardware Reality

TV silicon is closer to a mid/low Android phone from several years ago than to a laptop. Design budgets accordingly.

| Constraint | Practical guidance | Confidence |
| --- | --- | --- |
| **RAM** | Device total often ~0.5–3 GB shared with OS; web runtimes may see on the order of **~200–300 MB** usable for the app (varies wildly by OEM/year). A decoded large poster can cost tens of MB. | Medium–High (practitioner + vendor memory docs) |
| **Low-RAM Android TV** | Official guidance for buffer sizes by RAM tier; avoid blocking network at cold start; release media aggressively. | High ([Android TV memory](https://developer.android.com/training/tv/playback/memory)) |
| **FPS** | Aim for **stable 30 FPS** UI on entry hardware; budget **~16 ms** for 60 FPS interaction work / **~33 ms** for 30 FPS. Prefer `requestAnimationFrame`; avoid layout thrashing. | High as engineering practice ([Tizen performance notes](https://floatleftinteractive.com/guides/samsung-tizen-tv-development-new-features-and-best-practices/)) |
| **Cold start** | User-perceived time-to-first-interactive often targeted **under ~3s** on mid-range TVs; naïve apps hit 5–10s. Parallelize APIs; defer analytics; shrink JS parse cost. | Medium ([startup optimization guide](https://floatleftinteractive.com/guides/optimizing-startup-time-on-smart-tvs/)) |
| **Long sessions** | TV apps may run for hours; leaks (listeners, intervals, image caches) matter more than on mobile. | High (practitioner consensus) |
| **Emulators** | Fine for iteration; **lie** about RAM pressure, GC, remote latency, and sometimes media. Profile on real or farm devices for claims. | High |

**Portfolio demo tip:** Add a “performance HUD” toggle (FPS, approx. bound image count, EPG visible cell count) so interviewers see you measure constraints.

---

## 7. Platform Landscape (Interview Literacy)

You do not need to ship all platforms for a learning shell, but you should name them correctly.

### Samsung Tizen

- Proprietary Smart TV OS on Samsung panels  
- Apps commonly **web** (HTML/CSS/JS) in a Chromium-based engine that **lags** desktop Chrome by model year  
- Tooling: Tizen Studio / SDB; design principles stress 10-foot + 4-way focus  
- Docs: [Samsung Smart TV design](https://developer.samsung.com/smarttv/design/design-principles.html), [Tizen Web Device APIs](https://developer.samsung.com/smarttv/develop/api-references/tizen-web-device-api-references.html)

### LG webOS

- Proprietary LG OS; distinctive **launcher bar** over video  
- Web apps + Enact (React-oriented); Magic Remote adds pointer alongside D-pad  
- Web engine Chromium version advances by year (e.g. webOS TV 24 → Chromium 108; webOS TV 26 → Chromium 132 per LG charts)  
- Docs: [webOS TV Web API / Web Engine](https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine)

### Android TV / Google TV

- Android-based; Google TV is the newer **content-forward launcher UX** on the same family  
- Broad OEM reach (TCL, Hisense, Sony, etc.) + STBs  
- Modern UI: Jetpack Compose for TV; Leanback is legacy/deprecated path  
- Docs: [Build adaptive apps for TV](https://developer.android.com/develop/adaptive-apps/guides/tv/build-adaptive-apps-for-tv), [TV memory](https://developer.android.com/training/tv/playback/memory)

### Adjacent names (bonus literacy)

- **Fire TV** — Amazon fork of Android; strong Live/TIF docs  
- **Roku** — BrightScript / SceneGraph; TimeGrid-style EPG nodes in firmware UI toolkit  
- **tvOS** — Apple TV; Swift/SwiftUI; different input (Siri Remote) but same 10-foot principles  

**Cross-platform reality:** Fragmentation (engine age, cert cycles, remotes) is why many teams pick a **web/Lightning-style** shared UI or a **native-per-platform** strategy for flagship apps. ([2026 platform playbook overview](https://www.forasoft.com/blog/article/smart-tv-app-development))

---

## 8. Implications for TV Study Shell

### Must be real (implements learning value)

| Capability | Why interviewers care |
| --- | --- |
| D-pad spatial focus with visible focus ring | Proves TV interaction literacy |
| Focus memory across Home rails / Back stack | Separates demos from shipped UX |
| Horizontal rails + optional poster grid | Matches industry Home IA |
| Lazy / virtualized lists + image budget | Shows hardware empathy |
| Safe-zone layout constants | Shows overscan awareness |
| Live overlay: tune → banner → auto-hide | Matches Live mental model |
| EPG 2D grid with px-per-minute layout, now-line, virtualization or pooling | Highest-signal “TV engineer” artifact |
| FPS / memory-conscious update paths (no work on every key thrash) | Ties UX to constraints |

### Should be mocked (or stubbed)

| Capability | Mock approach |
| --- | --- |
| Real HLS/DASH live streams | Color video surface / looping sample / fake progress |
| DRM / license servers | Stub “entitled” flags |
| Broadcast tuner / TIF | Channel list + simulated tune delay |
| OEM launcher integration | In-app Home only |
| Store certification, ANR SLOs | Documented as non-goals |
| Full 14-day EPG backend | Generated schedule JSON windows |
| Voice / Magic Remote pointer | Optional later; D-pad first |

### Suggested Study Shell module map

1. **Shell chrome** — safe zone, global Back, focus debugger  
2. **Home** — rails, focus memory, lazy posters  
3. **Live** — channel list, zap, now-playing overlay, low-latency key path  
4. **EPG** — windowed data, virtualized grid, now-line, jump-to-now  
5. **Perf lab** — FPS meter, artificial low-RAM mode (smaller caches), cold-start checklist  

### Narrative you can use in interviews

> “TV Study Shell is a constrained living-room UI lab. It doesn’t pretend to be a certified Tizen package; it practices the parts that fail first on real TVs: focus, rails, Live chrome, and EPG virtualization under a memory/FPS budget.”

---

## 9. Sources & Confidence Notes

### Primary / vendor sources

- Samsung Developer — [Design Principles](https://developer.samsung.com/smarttv/design/design-principles.html)  
- Android Developers — [Build adaptive apps for TV](https://developer.android.com/develop/adaptive-apps/guides/tv/build-adaptive-apps-for-tv)  
- Android Developers — [Create scrollable layouts for TV](https://developer.android.com/training/tv/playback/compose/lists)  
- Android Developers — [Optimize memory usage (TV)](https://developer.android.com/training/tv/playback/memory)  
- Android Developers — [Manage TV user interaction (TIF overlays)](https://developer.android.com/training/tv/tif/ui)  
- Amazon Developer — [Fire TV Design and UX Guidelines](https://developer.amazon.com/docs/fire-tv/design-and-user-experience-guidelines.html)  
- Amazon Developer — [TV Input Framework on Fire TV](https://developer.amazon.com/docs/fire-tv/tv-input-framework-on-fire-tv.html)  
- LG webOS TV Developer — [Web API and Web Engine](https://webostv.developer.lge.com/develop/specifications/web-api-and-web-engine)  
- Wikipedia — [Electronic program guide](https://en.wikipedia.org/wiki/Electronic_program_guide)

### Practitioner / secondary (useful, verify on devices)

- Spyrosoft — [Smart TV UX best practices (2025)](https://spyro-soft.com/blog/media-and-entertainment/8-ux-ui-best-practices-for-designing-user-friendly-tv-apps)  
- Robosoft — [Designing UX for Connected TV](https://www.robosoftin.com/blog/ctv-experience)  
- SunDr — [Smart TV development challenges](https://www.sundr.dev/blog/smart-tv-development-challenges) (RAM anecdotes; treat numbers as directional)  
- Float Left Interactive — [Tizen best practices](https://floatleftinteractive.com/guides/samsung-tizen-tv-development-new-features-and-best-practices/), [Startup time](https://floatleftinteractive.com/guides/optimizing-startup-time-on-smart-tvs/)  
- Fora Soft — [Smart TV app development 2026 playbook](https://www.forasoft.com/blog/article/smart-tv-app-development)  
- Wurl — [EPG glossary](https://www.wurl.com/glossary/electronic-programming-guide-epg/)

### Confidence legend

| Level | Meaning |
| --- | --- |
| **High** | Repeated across vendor docs or widely standardized UX |
| **Medium** | Strong practitioner consensus; exact numbers vary by OEM/year |
| **Directional** | Anecdotal RAM/FPS figures; validate on target hardware |

### Research limitations

- Exact RAM ceilings and Chromium versions are **model-year specific**; cite ranges, not single absolutes.  
- Market-share figures in secondary blogs change quickly; use them only for literacy, not for product betting, unless refreshed.  
- No fake URLs invented; secondary blogs are labeled as such.

---

## Closing

TV Study Shell wins as a portfolio piece when it **feels like a TV product under stress**: one focus, remembered positions, cheap scrolls, honest Live overlays, and an EPG that survives hundreds of cells without melting the main thread. Platforms and DRM can stay mocked; the living-room interaction model cannot.

**Document status:** Complete domain research for planning artifact use (2026-07-22).
