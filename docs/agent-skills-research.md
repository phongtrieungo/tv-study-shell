# Agent Skills Research — TV Study Shell Stack

**Date:** 2026-07-22  
**Source:** [skills.sh](https://skills.sh/) via `npx skills find <query>`  
**Stack context:** TypeScript, Vite, pnpm monorepo, Canvas 2D, raw WebGL, Lightning 3 / Blits, SolidJS, Vitest, Playwright, Tizen/webOS emulators

## Summary

| Stack area | Ecosystem coverage | Recommendation |
| --- | --- | --- |
| Playwright E2E | Strong (high installs) | Install |
| Vitest | Strong | Install |
| pnpm / Vite | Good | Install |
| TypeScript / monorepo | Good | Install selectively |
| SolidJS | Thin (few real SolidJS skills) | Install `solidjs-patterns` carefully |
| WebGL | Mostly **Three.js / 3D** skills | Install for GPU literacy; not TV-UI specific |
| Canvas 2D EPG | None useful (`canvas` hits design canvases) | **Create project skill** |
| Lightning / Blits | **No skills found** | **Create project skill** |
| Tizen / webOS / Smart TV | **No skills found** | **Create project skill** (use `docs/testing-strategy.md`) |
| React / Next | Abundant | **Skip** (JD / AD-7 forbid React) |

---

## Installed in this project (local only)

Installed **without `-g`** into `.agents/skills/` on 2026-07-22. Locked in `skills-lock.json`.

| Skill | Source |
| --- | --- |
| `playwright-best-practices` | currents-dev/playwright-best-practices-skill |
| `playwright-cli` | microsoft/playwright-cli |
| `vitest` | antfu/skills |
| `pnpm` | antfu/skills |
| `vite` | uni-helper/skills |
| `monorepo-management` | wshobson/agents |
| `threejs-fundamentals` | cloudai-x/threejs-skills |
| `solidjs` | suryavirkapur/skills |

**Not installed:** `different-ai/openwork@solidjs-patterns` — skill no longer present in that repo (registry stale); used `suryavirkapur/skills@solidjs` instead.

Restore later with: `npx skills experimental_install`

---

## Recommended installs (high value for this repo)

### Testing (Epic 7)

```bash
npx skills add currents-dev/playwright-best-practices-skill@playwright-best-practices -g -y
npx skills add microsoft/playwright-cli@playwright-cli -g -y
npx skills add antfu/skills@vitest -g -y
```

| Skill | Installs | Why |
| --- | --- | --- |
| [playwright-best-practices](https://skills.sh/currents-dev/playwright-best-practices-skill/playwright-best-practices) | ~63K | E2E patterns, flaky tests, fixtures — maps to FR-19 D-pad smoke |
| [playwright-cli](https://skills.sh/microsoft/playwright-cli/playwright-cli) | ~94K | Official Microsoft CLI skill for live browser automation |
| [vitest](https://skills.sh/antfu/skills/vitest) | ~28K | Vite-native UT — maps to FR-18 shared math tests |

### Tooling / language

```bash
npx skills add antfu/skills@pnpm -g -y
npx skills add uni-helper/skills@vite -g -y
npx skills add wshobson/agents@monorepo-management -g -y
npx skills add wshobson/agents@typescript-advanced-types -g -y
```

| Skill | Installs | Why |
| --- | --- | --- |
| [pnpm](https://skills.sh/antfu/skills/pnpm) | ~18K | Matches preferred workspaces |
| [vite](https://skills.sh/uni-helper/skills/vite) | ~606 | Shell + Surface bundling (lower installs; optional) |
| [monorepo-management](https://skills.sh/wshobson/agents/monorepo-management) | ~11K | Multi-package layout |
| [typescript-advanced-types](https://skills.sh/wshobson/agents/typescript-advanced-types) | ~55K | TS depth for shared types |

### SolidJS (Live strip)

```bash
npx skills add different-ai/openwork@solidjs-patterns -g -y
```

| Skill | Installs | Why |
| --- | --- | --- |
| [solidjs-patterns](https://skills.sh/different-ai/openwork/solidjs-patterns) | ~572 | Real SolidJS signals / `createMemo` patterns for Live strip |

**Do not confuse with** `ramziddin/solid-skills@solid` — that is **SOLID principles**, not SolidJS.

### WebGL literacy (Lab W) — with caveats

```bash
npx skills add cloudai-x/threejs-skills@threejs-fundamentals -g -y
npx skills add cloudai-x/threejs-skills@threejs-shaders -g -y
```

| Skill | Installs | Why / caveat |
| --- | --- | --- |
| [threejs-fundamentals](https://skills.sh/cloudai-x/threejs-skills/threejs-fundamentals) | ~7.5K | Scene/GPU concepts transferable; **Three.js API ≠ raw WebGL 2D UI** |
| [threejs-shaders](https://skills.sh/cloudai-x/threejs-skills/threejs-shaders) | ~6.5K | Shader vocabulary for interviews |
| [threejs-webgl](https://skills.sh/freshtechbro/claudedesignskills/threejs-webgl) | ~2.2K | Broader WebGL/WebGPU via Three.js |
| [webgl](https://skills.sh/martinholovsky/claude-skills-generator/webgl) | ~498 | Raw-er WebGL; low stars/installs — use cautiously |

For TV Study Shell, treat Three.js skills as **interview vocabulary helpers**, not as the Home/EPG implementation path (we use Canvas / raw WebGL / Blits).

---

## Explicitly skip for this project

| Skill pattern | Reason |
| --- | --- |
| `vercel-labs/agent-skills` React skills | AD-7 / JD: no React |
| `anthropics/skills@canvas-design` | Visual/design canvas, not Canvas 2D API |
| `different-ai/openwork@tauri-solidjs` | Desktop Tauri, not Smart TV |
| `ramziddin/solid-skills@solid` | SOLID principles ≠ SolidJS |

---

## Gaps — no public skills found (create locally)

These are core to the product but missing from skills.sh:

1. **Lightning 3 + Blits** — scene graph, focus, textures, Vite Blits app  
2. **Smart TV platforms** — Tizen Simulator/Emulator, webOS Simulator, D-pad, Safe Zone, memory budgets  
3. **Canvas 2D virtualized EPG** — Visible Window, pooling, now-line  
4. **Raw WebGL 2D UI tiles** — buffers/textures/draw calls for TV UI (not Three.js 3D)

**Suggested project skills** (via `npx skills init` or BMad `bmad-customize` / create-skill):

| Proposed skill | Seed from |
| --- | --- |
| `tv-study-webgl-2d` | `docs/webgl-investment.md` + tech research |
| `tv-study-lightning-blits` | Lightning/Blits getting-started + architecture AD-1/AD-9 |
| `tv-study-smart-tv-test` | `docs/testing-strategy.md` |
| `tv-study-epg-canvas` | PRD FR-4–7 + domain research EPG section |

Also keep using installed **BMad** skills (`bmad-dev-story`, `bmad-create-story`, etc.) for the delivery spine.

---

## Minimal install set (if you want only the best ROI)

```bash
npx skills add currents-dev/playwright-best-practices-skill@playwright-best-practices -g -y
npx skills add antfu/skills@vitest -g -y
npx skills add antfu/skills@pnpm -g -y
npx skills add different-ai/openwork@solidjs-patterns -g -y
npx skills add cloudai-x/threejs-skills@threejs-fundamentals -g -y
npx skills add wshobson/agents@monorepo-management -g -y
```

Then author the three **project-local** TV skills for Lightning/Blits, Smart TV testing, and Canvas/WebGL 2D UI.
