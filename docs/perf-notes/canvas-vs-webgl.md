# Canvas vs WebGL Perf Note

**Measured:** 2026-07-24  
**Surfaces:** `packages/epg-canvas` (Stories 2.1–2.4) vs `packages/webgl-lab` (Story 3.1)  
**Requirement:** FR-16 / AD-8

## Environment

| Field | Value |
| --- | --- |
| Browser | Google Chrome **150.0.7871.129** (HeadlessChrome 150) — same-machine dual-Surface session |
| Also available | Cursor embedded Chromium / interactive Chrome on this laptop (interviewer reruns) |
| OS | macOS **26.5.2** (Darwin 25.5.0, arm64) |
| Machine class | MacBook Pro (Mac15,7) · **Apple M3 Pro** · 36 GB RAM · ProMotion display |
| Viewport | Shell window **1280×713** CSS px; stage ~**1100×540** CSS px; `devicePixelRatio` = 1 (this headless run) |
| Scenario | Same session: Menu → **EPG** → HUD + ↑↓/←→; Back → Menu → **WebGL Lab** → HUD + ↑↓/←→ |
| Honesty | **Desktop Chromium proxy** (keyboard-as-D-pad / CDP key events). Not Tizen/webOS device FPS, not OEM certification. |

## Method

1. `pnpm --filter shell exec vite --port 5180` → open Shell.
2. **EPG:** Menu → **EPG** → read teaching HUD `drawn N ≪ logical 600` (and optional `[epg] visible window` logs). Arrow-scroll channels/time; record drawn band. Note now-line ticks stay `model stable`.
3. **WebGL Lab (same machine/session):** Back → Menu → **WebGL Lab** → read HUD `drawn N ≪ logical 600 · context webgl2|webgl`. Arrow-scroll; record drawn band. Note draw-call framing from code: one batched `drawArrays(TRIANGLES, …)` per coalesced Visible Window paint (`packages/webgl-lab/src/render.ts`).
4. Sample idle `requestAnimationFrame` for ~1s as **display refresh** reference only (not grid paint rate).
5. Optional interviewer path: Chrome DevTools → Command Menu → **Show Rendering** → **Frame rendering stats** while holding arrows; optional CPU throttle **4×–6×** per [testing-strategy.md](../testing-strategy.md).

Do **not** invent a continuous full-grid RAF loop “for FPS” on either Surface — both coalesce paints on interaction.

## Results

| Metric | Canvas EPG | WebGL Lab |
| --- | --- | --- |
| Logical program cells | **600** (50 × 12) | **600** (same fixtures) |
| Drawn cells (observed) | **60** ≪ 600 | **60** ≪ 600 |
| Example (near start) | `drawn 60 ≪ logical 600 · ch 1–15 / 50 · time ~6h window` | `drawn 60 ≪ logical 600 · ch 1–15 / 50 · context webgl2` |
| Example (after ↑↓/←→) | Still **60** while channel/time window slides (e.g. ch 4–18) | Still **60** while channel/time window slides (e.g. ch 6–20) |
| Context / API | Canvas 2D (`CanvasRenderingContext2D`) | **webgl2** (WebGL1 fallback exists in lab) |
| Draw-call / CPU framing | Many Canvas 2D ops per Visible Window paint (`fillRect` / text / strokes) | **1×** batched `drawArrays` for all visible quads per paint |
| Idle compositor rAF | ~**121–122**/s (ProMotion ceiling — **display cadence**, not grid paint rate) | same machine sample ~**122**/s |
| Grid paint model | Coalesced `requestAnimationFrame` on focus / resize / detail | Coalesced `requestAnimationFrame` on focus / resize |
| Subjective scroll | Arrow focus / window changes felt smooth on this laptop proxy | Same — no obvious long freezes on this proxy |

**FR-16 coverage:** Same-machine draw accounting + WebGL draw-call framing are the primary measured evidence. Idle rAF is reported only as display cadence honesty. Optional DevTools FPS overlay was not required for this run.

**Stage-size note:** Story 2.4’s EPG-only note recorded **20–30** drawn on a smaller Shell stage (~745×360). This compare used a larger stage (~1100×540) → **60** drawn on **both** paths. Drawn count tracks Visible Window size, not “which renderer is faster.”

## Interpretation

- **Same Visible Window math** (`@tvshell/shared`) on both Surfaces — windowing is a **data** problem; Canvas vs WebGL is a **renderer** choice.
- **Drawn ≪ logical** on both paths is the interview proof for virtualization (AD-5): ~600 logical cells exist; tens are drawn for the current stage.
- **GPU vs CPU framing:** Canvas stays on the CPU 2D path (simpler, more per-cell work). WebGL pays pipeline setup (buffers / textures / shaders) and then batches Visible Window quads into **one** draw call per paint.
- Numbers defend **trade-offs**, not “WebGL always faster on this laptop.” At this stage size both HUDs show the same drawn band because both virtualize the same window.
- Domain research aims for a **~30 FPS UI floor** on constrained TV hardware and treats **60 FPS** as aspirational. This laptop’s idle compositor hits the display ceiling; that is **not** a living-room SoC claim.

## Honesty bounds

- Numbers are **learning / portfolio evidence**, not store certification.
- Headless or interactive Chrome on a MacBook ≠ OEM TV Chromium year / GPU / memory ceiling.
- Do not quote unlabeled “60 FPS forever.” Always name browser, OS, and machine class (AD-8).
- Nav/chrome differences remain: EPG has program-boundary ←→ + now-line DOM ticks; WebGL Lab uses fixed 2h time steps + focus cursor quad + atlas colors (no Canvas `fillText`).
- CPU throttle and physical TV remain follow-on checks (testing ladder / later emulator & soak stories).

## Follow-ons

| Story | Artifact |
| --- | --- |
| 3.3 | [README WebGL vocabulary](../../README.md#webgl-vocabulary-this-lab) — buffers / textures / shaders / draw calls (**shipped**) |
| 4.4 | [`home-blits.md`](home-blits.md) — Home focus scroll + texture cleanup (**Measured** 2026-07-24) |
| 6.2 | `docs/perf-notes/memory-soak.md` — heap across Surfaces |
| 7.3 | Emulator dry-run notes |

## Reproduce

```bash
pnpm install
pnpm dev   # or: pnpm --filter shell exec vite --port 5180
# Menu → EPG → read HUD → arrow around → note drawn ≪ 600
# Back → Menu → WebGL Lab → read HUD (context …) → arrow around → compare
```
