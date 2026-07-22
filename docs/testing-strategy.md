# Testing Strategy — TV Study Shell

**Date:** 2026-07-22  
**Goal:** Catch regressions early with automated UT/E2E, then use **vendor TV emulators/simulators** before claiming any release readiness. Emulators are proxies — they do **not** replace a physical TV for memory, DRM, or store rules.

## Why TV testing is different

| Desktop web habit | TV reality |
| --- | --- |
| Mouse + Tab focus | D-pad / spatial focus (Arrow keys) |
| Lots of RAM | App budgets often hundreds of MB |
| Evergreen Chromium | Older embedded Chromium per OEM year |
| Playwright `toBeFocused()` on DOM | Canvas/WebGL/Lightning often own focus **outside** DOM |

So we test **three layers of truth**, not one:

```text
L1 Unit (fast, CI)     → math, pools, key maps, pure helpers
L2 E2E desktop (CI)    → D-pad flows in Chromium via Playwright
L3 Emulator / Simulator → OEM packaging + remote UX (manual + smoke)
L4 Physical TV (gate)  → memory soak, real remote, store permissions
```

Interview / portfolio **MVP release** = L1 + L2 green + documented L3 attempt.  
**“Ready for real TV work”** = L4 on at least one device when available.

---

## L1 — Unit tests (UT)

| Tool | Use for |
| --- | --- |
| **Vitest** | `packages/shared` Visible Window math, object pools, D-pad key map, fixture generators |
| **Vitest** | Pure Canvas/WebGL helpers that don’t need a GPU (clipping, atlas UV math) |

**Rules**

- Prefer testing pure functions extracted from Surfaces (AD-5 math lives in `shared`).
- Do **not** unit-test full Lightning scene graphs in Vitest as the primary strategy (brittle / slow).
- CI must run `pnpm test` (or equivalent) on every PR.

**Coverage target (pragmatic):** shared math + input map ≥ sensible happy/edge cases; no vanity 100% UI coverage.

---

## L2 — E2E (desktop Chromium proxy)

| Tool | Use for |
| --- | --- |
| **Playwright** | Shell menu → enter each Surface → Back; EPG arrow navigation smoke; WebGL Lab mounts; Live strip text changes |
| Keyboard API | `page.keyboard.press('ArrowDown')` etc. as **D-pad proxy** (same as study runtime) |

**Rules**

- Assert **observable outcomes**: debug overlay text, `data-testid` on Shell chrome, Live strip string, screenshot optional.
- For Canvas/WebGL/Blits: do **not** rely solely on DOM `document.activeElement` for focus — assert app-owned focus state (debug HUD / `data-focus-id` / exported test hooks).
- Keep suite **smoke-sized** (minutes, not hours). Memory soak stays a **manual/scripted Perf Note**, not a CI E2E by default.
- Optional later: **BackstopJS** visual regression for Blits (Lightning example apps use this pattern).

**CI:** Playwright Chromium only for MVP; Firefox/WebKit optional.

---

## L3 — TV emulators & simulators (specialized tools)

These are the “try to emulate before releasing” tools. Install on the **dev machine**, not required in CI for MVP (heavy VMs).

### Samsung Tizen

| Tool | What it is | Good for | Weak at |
| --- | --- | --- | --- |
| **TV Web Simulator** | Lightweight WebKit-based simulation of TV Web APIs | Fast UI / basic API prototyping | Not a real Tizen stack; hardware APIs, DRM, strict security rules |
| **TV Emulator** (Tizen Studio / VS Code Tizen extension, QEMU-based) | Closer to TV software stack + virtual remote | Packaging, install/launch, remote UX, Web Inspector | AVPlay/DRM often missing; memory ≠ real device; permissions less strict than device |

Docs: [TV Emulator](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode/tv-emulator-overview.html) · [TV Simulator](https://developer.samsung.com/smarttv/develop/tools/additional-tools/vscode/tv-simulator.html)

**Portfolio path:** when packaging exists, run Shell (or a Tizen wrap) on **Simulator first**, then **Emulator**, document results in `docs/perf-notes/emulator-tizen.md`.

### LG webOS

| Tool | What it is | Good for | Weak at |
| --- | --- | --- | --- |
| **webOS TV Simulator** (current for webOS TV 22+) | Dev convenience simulator | Launch/debug web apps, remote-like input | Not full hardware fidelity |
| **webOS TV Emulator** (older, ≤6.0 via VirtualBox) | VM-style older platform | Legacy targets if needed | Superseded for modern webOS by Simulator |

Docs: [Emulator introduction](https://webostv.developer.lge.com/develop/tools/emulator-introduction) · [Simulator / tooling](https://webostv.developer.lge.com/develop/tools/emulator-installation)

**Portfolio path:** optional second OEM after Tizen; document in `docs/perf-notes/emulator-webos.md`.

### Chrome “poor man’s TV” (always on, free)

Before OEM tools:

- CPU throttling 4×–6×  
- Memory pressure / disable cache  
- Fixed 1920×1080 viewport + Safe Zone overlay  
- Prefer older Chromium if available for realism  

This is **not** an emulator, but it catches jank early and stays in CI-adjacent workflows.

---

## L4 — Physical TV (honesty gate)

Industry consensus (Samsung docs, THEOplayer/Tizen guides, practitioner blogs): **final testing on a real TV**. Emulators lie about:

- Memory ceilings and GC pauses  
- DRM / media pipelines  
- Store permission enforcement  
- Real remote latency and chipset GPU quirks  

For this portfolio: L4 is **aspirational** until a device is available; README must not claim device certification.

---

## Recommended MVP test matrix

| Layer | When in sprint | Required for “planning MVP done”? |
| --- | --- | --- |
| Vitest on `shared` | Epic 1 onward | Yes |
| Playwright D-pad smoke | After Shell + ≥1 Surface | Yes (by Epic 6) |
| Chrome throttle checklist | With Perf Notes | Yes (documented) |
| Tizen Simulator/Emulator | After packaging spike | Documented attempt preferred; full packaging may trail feature MVP |
| webOS Simulator | Optional | No |
| Physical TV | When hardware available | No for portfolio MVP |

---

## Repo layout (target)

```text
packages/shared/          # unit-tested math
apps/shell-e2e/           # or tests/e2e at root — Playwright
docs/
  testing-strategy.md     # this file
  perf-notes/
    emulator-tizen.md     # L3 notes when run
    emulator-webos.md
```

## Interview talking points

1. “I automate D-pad flows in Playwright on Chromium as a proxy.”  
2. “Shared Visible Window math is unit-tested so EPG/WebGL can’t drift.”  
3. “I know Tizen Simulator ≠ Emulator ≠ device; I use them in that order.”  
4. “Memory soak and DRM still need a physical TV.”

## Sources

- Samsung Developer — TV Emulator / TV Simulator  
- LG webOS TV Developer — Emulator / Simulator docs  
- Dolby OptiView — Tizen emulator limitations (no AVPlay/DRM)  
- Lightning Blits example app — BackstopJS visual regression pattern  
