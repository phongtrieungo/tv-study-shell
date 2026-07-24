# EPG Perf Note (Canvas Visible Window)

**Measured:** 2026-07-23  
**Surface:** `packages/epg-canvas` (Stories 2.1–2.3)  
**Requirement:** FR-7 / AD-8

## Environment

| Field | Value |
| --- | --- |
| Browser | Cursor embedded Chromium **144.0.7559.236** (Electron 40.10.3) — desktop proxy used for this run |
| Also installed | Google Chrome **150.0.7871.129** (for interviewer reruns on the same machine) |
| OS | macOS **26.5.2** (Darwin 25.5.0, arm64) |
| Machine class | MacBook Pro (Mac15,7) · **Apple M3 Pro** · 36 GB RAM · ProMotion display |
| Viewport | Shell window ~893×707 CSS px; EPG stage ~745×360 CSS px; `devicePixelRatio` = 2 |
| Scenario | Menu → EPG mount; read HUD draw counts; ↑↓/←→ change Visible Window; watch now-line ticks |
| Honesty | **Desktop Chromium proxy** (keyboard-as-D-pad). Not Tizen/webOS device FPS, not OEM certification. |

## Method

1. `pnpm --filter shell exec vite --port 5181` → open Shell → focus **EPG** → mount.
2. Read teaching HUD: `drawn N ≪ logical 600` (and optional `[epg] visible window` console logs).
3. Navigate with arrow keys; record drawn count as the Visible Window moves across channels/time.
4. Observe now-line HUD cues (`ticks N · model stable`) across ≥1s teaching ticks — confirm drawn/logical stay consistent with chrome-only updates.
5. Sample idle `requestAnimationFrame` cadence for ~1–2s as a **display refresh** reference (not grid paint rate).
6. Optional interviewer path (same machine): Chrome DevTools → Command Menu → **Show Rendering** → **Frame rendering stats** while holding arrows; optional CPU throttle **4×–6×** per [testing-strategy.md](../testing-strategy.md).

## Results

| Metric | Value |
| --- | --- |
| Logical program cells | **600** (50 channels × 12 programs / 2h blocks over 24h) |
| Drawn cells (observed) | **20–30** ≪ 600 |
| Example (near day start) | `drawn 30 ≪ logical 600 · ch 1–10 / 50 · time ~4h window` |
| Example (near day end) | `drawn 20 ≪ logical 600 · ch 15–24 / 50 · time ~4h window` |
| Idle compositor rAF | ~**120–122**/s (ProMotion ceiling — **display cadence**, not EPG paint rate) |
| Grid paint model | Coalesced `requestAnimationFrame` on focus / resize / detail only — **not** a continuous full-grid render loop |
| Now-line ticks | Tick counter advanced while HUD kept **`model stable`**; drawn count did not spike on ticks |
| Subjective scroll | Arrow focus / window changes felt smooth on this laptop proxy; no obvious long freezes |

**FR-7 coverage:** Draw accounting is the primary measured evidence. Idle rAF is reported only as display cadence honesty — EPG does not paint every frame when idle.

## Interpretation

- **Drawn ≪ logical** is the interview proof for Visible Window virtualization (FR-4 / AD-5): ~600 logical cells exist; tens are drawn for the current stage.
- **Paints coalesce** on focus/resize/detail; inventing a continuous RAF paint loop “for FPS” would invent work the Surface does not do and corrupt the story.
- **Now-line chrome** (FR-6) updates on a timer without reconstructing the fixture model — ticks + `model stable` while drawn stays in the same band.
- Domain research aims for a **~30 FPS UI floor** on constrained TV hardware and treats **60 FPS** as aspirational. This laptop hit the display ceiling at idle; that is **not** a claim that a 2018 living-room SoC will match it.

## Honesty bounds

- Numbers are **learning / portfolio evidence**, not store certification.
- Cursor/Electron Chromium ≠ OEM TV Chromium year / GPU / memory ceiling.
- Do not quote unlabeled “60 FPS forever.” Always name browser, OS, and machine class (AD-8).
- CPU throttle and physical TV remain follow-on checks (testing ladder / later emulator & soak stories).

## Follow-ons

| Story | Artifact |
| --- | --- |
| 3.2 | [`docs/perf-notes/canvas-vs-webgl.md`](canvas-vs-webgl.md) — same env-label shape (**Measured** 2026-07-24) |
| 4.4 | [`docs/perf-notes/home-blits.md`](home-blits.md) — Home focus scroll + texture cleanup (**Measured** 2026-07-24) |
| 6.2 | `docs/perf-notes/memory-soak.md` — heap across Surfaces |
| 7.3 | Emulator dry-run notes |

## Reproduce

```bash
pnpm install
pnpm dev   # or: pnpm --filter shell exec vite --port 5181
# Menu → EPG → read HUD → arrow around → note drawn ≪ 600
```
