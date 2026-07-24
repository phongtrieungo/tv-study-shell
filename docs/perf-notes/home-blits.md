# Home Perf Note (Blits Featured rail)

**Measured:** 2026-07-24  
**Surface:** `packages/home-blits` (Stories 4.1–4.3)  
**Requirement:** FR-10 / AD-8

## Environment

| Field | Value |
| --- | --- |
| Browser | Cursor embedded Chromium **144.0.7559.236** (Electron 40.10.3) — desktop proxy used for this run |
| Also installed | Google Chrome **150.0.7871.129** (for interviewer reruns on the same machine) |
| OS | macOS **26.5.2** (Darwin 25.5.0, arm64) |
| Machine class | MacBook Pro (Mac15,7) · **Apple M3 Pro** · 36 GB RAM · ProMotion display |
| Viewport | Shell window ~**850×958** CSS px; `devicePixelRatio` = **2** |
| Scenario | Menu → **Home** mount; Left/Right scrub Featured rail; read HUD `FULL n (peak m)`; Back → leave |
| Honesty | **Desktop Chromium proxy** (keyboard-as-D-pad). Not Tizen/webOS device FPS, not OEM certification. |

Env shape matches peer notes ([epg.md](epg.md), [canvas-vs-webgl.md](canvas-vs-webgl.md)) on the same machine; viewport differs because this run used the Cursor embedded browser window.

## Method

1. `pnpm --filter shell exec vite --port 5180` → open Shell → focus **Home** → Enter.
2. Read teaching HUD: `Focus i/12 · … · FULL n (peak m) · ±2` (and optional `[home] textures` console logs).
3. Hold/press ArrowRight across the rail; note subjective scroll feel + that `n` stays within the texture window.
4. Escape / Backspace → leave; confirm status “Side effects cleared” / cleanup probe false; optional `[home] dispose { disposedTextures, peakLoaded }`.
5. Remount ≥1×; confirm focus resets to index 0 and FULL window rebuilds without growing peak unboundedly.
6. Optional interviewer path: Chrome DevTools → **Show Rendering** → **Frame rendering stats** while holding arrows (not required for this run).

Do **not** invent a continuous full-rail RAF “FPS mill” — Home coalesces Blits scene updates on input; idle display cadence ≠ rail paint rate.

## Results

| Metric | Value |
| --- | --- |
| Rail items | **12** (`rail-featured` from `@tvshell/shared` `homeRails`) |
| Texture policy | **placeholder→upgrade**, `TEXTURE_WINDOW = 2` (focus ± 2) |
| FULL loaded at focus 0 | **3** (indices 0–2) |
| FULL loaded mid-rail (e.g. focus 2–4) | **4–5** (≤ window max **5**) |
| Peak FULL observed while scrubbing | **5** (never all 12) |
| Subjective focus-scroll | Smooth Left/Right on this laptop proxy; amber ring + rail offset kept focus on-stage; no obvious long freezes |
| Leave / cleanup | Back returns to menu; `hasActiveSideEffects()` false after dispose (app quit + texture registry clear); remount OK |
| Idle compositor rAF | Not treated as Home paint FPS — ProMotion display cadence only (same honesty as EPG / Lab notes) |

**FR-10 coverage:** Focus-scroll feel + bounded FULL-tile counts + dispose/probe evidence are the measured signals. Optional DevTools frame overlay was not required for this run.

## Interpretation

- **Applied WebGL via Blits:** Home is scene-graph DX on Lightning 3 — same GPU class of problems as Lab W, without hand-authored `texImage2D` / `drawArrays` for the rail.
- **Texture window:** FR-9 practice shows up as `FULL n ≤ 5` while scrubbing 12 tiles — far tiles stay cheap color (see `packages/home-blits/README.md` Texture lifecycle).
- **Contrast peers without rewriting them:** Canvas EPG proves **drawn ≪ logical**; WebGL Lab proves **batched drawArrays** + disposeGpu literacy; Home proves **focus scroll + upgrade window + leave dispose**.
- Domain research aims for a **~30 FPS UI floor** on constrained TV hardware. This laptop proxy felt smooth; that is **not** a living-room SoC claim.

## Honesty bounds

- Numbers are **learning / portfolio evidence**, not store certification.
- Cursor/Electron Chromium ≠ OEM TV Chromium year / GPU / memory ceiling.
- SVG data-URL “FULL” posters stand in for production CDN tiles at rail size — not 4K decode.
- Do not quote unlabeled “60 FPS forever.” Always name browser, OS, and machine class (AD-8).

## Follow-ons

| Story | Artifact |
| --- | --- |
| 6.2 | `docs/perf-notes/memory-soak.md` — heap across Surfaces |
| 7.2 | Playwright D-pad smoke |
| 7.3 | Emulator dry-run notes |

## Reproduce

```bash
pnpm install
pnpm dev   # or: pnpm --filter shell exec vite --port 5180
# Menu → Home → read HUD FULL n (peak m) → hold ←/→ → Back → probe cleared
```
