# `@tvshell/home-blits` — Lab B (Home)

Blits / Lightning 3 Home Surface for TV Study Shell.

**Pinned:** `@lightningjs/blits@2.8.4` (pulls `@lightningjs/renderer@^3.1.3`, resolved **3.1.4** at install).

## ADR — Mount strategy (Story 4.1)

### Context

Shell is a thin DOM Vite host (`AD-2`) that mounts Surfaces via `mount(host)` / `unmount()`. Home must run Blits without violating package boundaries (`AD-1`), must destroy GPU/runtime on leave (`AD-6`), and must keep Shell **Back** → menu working (`AD-4`). Architecture deferred **iframe vs in-page embed** to this spike.

Lab W (`packages/webgl-lab`) already taught buffers / textures / shaders / draw calls by hand. Home is **applied** WebGL: Blits scene graph on Lightning 3 — same GPU class of problems, framework DX.

### Options

| Option | Idea | Pros | Cons |
| --- | --- | --- | --- |
| **A. In-page embed** | `Blits.Launch(App, hostElement, settings)` into Shell’s surface host child | One Vite process; shared Back/focus ownership is simpler; AD-2 stays literal | Blits singleton Launch/Settings; must `quit()`/`destroy()` carefully on remount; optional Vite precompile plugin later |
| **B. iframe** | Separate Blits Vite app; Shell mounts `<iframe>` | Strong runtime isolation | Second server/build; D-pad/Back postMessage; harder cleanup proof; worse everyday DX |

### Decision

**Choose A — in-page embed.**

Hello-world proves Launch into a stage `HTMLElement` inside the Shell host, sized to the stage box, with `multithreaded: false` (no COOP/COEP headers required). Unmount calls `app.quit()` (falls back to `destroy`) after awaiting Launch’s microtask so the quit handle exists.

### Consequences

- Shell registry-swaps only `home` → `@tvshell/home-blits`; Live stays stub.
- Do **not** rewrite Shell in Blits.
- Blits Vite precompile plugin is **optional** for MVP — runtime template compile works; add `@lightningjs/blits/vite` later if HMR/build cost hurts.
- Stories **4.2–4.4** add rail focus, lazy textures, and Perf Note on this embed path.
- Rejected iframe remains available if embed cleanup proves unsafe on a target device (document a follow-up ADR if flipped).

### Honesty

Learning lab / portfolio evidence — not a claim of production Lightning employment years.

## Featured rail (Story 4.2)

- Data: `@tvshell/shared` `homeRails` → `rail-featured` (≥12 items). Empty `posterUrl` filled with **hashed color tiles** in `packages/home-blits` (no local fixture duplicate, no fetch).
- Focus: Blits `input` `left`/`right` (default keymap = ArrowLeft/Right / AD-4). **Clamp** at ends (no wrap). Up/Down no-op on single-rail MVP.
- Affordance: amber ring + scale + label color — readable at 10-foot / Safe Zone.
- Scroll: rail `x` offset keeps the focused tile on-stage.
- Back: **not** handled in Blits — Shell `main.ts` owns Escape/Backspace → `host.leave()`. Remount resets focus to index 0.

## Texture lifecycle (Story 4.3)

### Policy shipped: **placeholder → upgrade** (focus ± 2)

| Tier | When | What |
| --- | --- | --- |
| **Cheap** | Outside focus±2 | Hashed color Element only — no Image `src`, no GPU poster bitmap |
| **FULL** | Focus index ± `TEXTURE_WINDOW` (2) | Tile-sized SVG data-URL (`~200×260`) via Blits/Lightning Image — practices “full” posters without 4K decode |

**Unload triggers**

1. **Focus move** — leaving the window drops that item’s `src` (registry delete → Image node hidden).
2. **Surface leave** — `disposeAllTextures()` clears the registry, then `app.quit()` / `destroy` tears down Lightning (AD-6). Logs `[home] dispose { disposedTextures, peakLoaded, policy, window }`.

**Engine vs us**

- Lightning/Blits creates ImageTextures when `src` is set; quitting the Application releases renderer resources.
- We still track upgrades explicitly so far tiles never hold a “full” src, and leave always clears the JS registry (don’t rely on DOM `replaceChildren` alone for GPU honesty).

**Proof**

- HUD: `FULL n (peak m)` while scrubbing — `n` stays ≤ 5 (window of 5).
- After Back: `hasActiveSideEffects()` false (no app, no pending launch, no loaded textures).
- Console: `[home] textures` on focus change; `[home] dispose` on leave.

**Honesty**

Desktop Chromium proxy ≠ OEM TV RAM. SVG data-URLs are stand-ins for production CDN tiles at rail size. Numbers / FPS → Home Perf Note (**4.4**) — see [`docs/perf-notes/home-blits.md`](../../docs/perf-notes/home-blits.md). Cousin literacy: Lab W `disposeGpu` / `deleteTexture` ≈ Home quit + registry clear.
