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
