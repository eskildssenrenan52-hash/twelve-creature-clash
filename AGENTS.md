<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Game architecture
- Preserve the imported browser Canvas RPG engine and original catalog; settlement mechanics live in a separate module so combat and quests remain compatible.
- Keep the original browser save key with backward-compatible settlement and terrain fields.
- Use deterministic world generation for the expanded biome network so saved terrain coordinates remain stable.
- Match the source game's indexed-access compiler behavior while keeping strict typing enabled; its fixed sprite palettes and tile arrays assume indexed values exist.
- Render world objects through the browser-only WorldArt module from bundled 8-sprite sheets (128px cells, bottom-aligned) in src/assets/art; tiles drawn as sprites get their biome ground underneath.
- Dungeon furniture, lore pages and secrets are derived deterministically per floor in src/odyssey/depth-props.ts; read pages and used secrets persist through the existing discoveries/openedChests save sets.
- Keep legacy generation and treasure coordinates in the original region; generate frontier terrain in lightweight sectors from a separate browser-safe catalog so larger worlds retain save compatibility and fast startup.
- Size the Canvas camera from its screen bounds and keep controls as accessible overlays; this fills different screen proportions without stretching pixel-art geometry.
- Generate frontier enemies near exploration rather than allocating a world-wide population; this preserves original quest enemies and bounds combat workload.
- Two games coexist: Golden Arrow Odyssey lives in `src/odyssey/` (route /odyssey, own save key) and Mana Echoes in `src/game/` (route /mana); `/` is the shared intro/title with accounts. Keeps both games' saves and engines independent.
- Accounts only store a player profile (username); game progress stays in browser storage, as the user chose.
- Secret chains and hidden realms are pure deterministic data in src/odyssey/secrets.ts; runtime hooks live in src/odyssey/secret-play.ts and persist only through existing discoveries/openedChests save sets, keeping old saves compatible.
- Hidden realms reuse the temple depth state with `realm_`-prefixed pseudo-temples so the engine needs no new depth kind.
- Lighting uses pre-rendered gradient discs (src/odyssey/perf.ts) and a Quality governor that spaces out heavy full-screen effects on slow devices instead of removing them.
- Abyss creatures and the Depth Chronicles are pure data in src/odyssey/bestiary.ts and drawn procedurally in src/odyssey/beast-art.ts; abyss enemies carry an optional `species` and progress persists as `beast:<id>` in the discoveries save set, keeping old saves compatible.
- The Eight Skies saga is pure data in src/odyssey/saga.ts and wired through src/odyssey/saga-play.ts; zones reuse the temple depth state with `saga_<realm>_<zone>` pseudo-temples, progress persists via bossesDone and `side:`/`sagakills:` keys in discoveries, keeping old saves compatible.
- Ground/wall tiles get a detail repaint in src/odyssey/tile-art.ts (periodic noise so 16px tiles stay seamless), shared by both games; world sprites are pre-scaled and cached via scaledSprite in src/odyssey/world-art.ts instead of nearest-neighbour downscaling.
- UI chrome uses AI-generated pixel-art pieces in src/assets/ui (ai-frame, ai-button, ai-slot, ai-banner via CSS border-image, per-button icons in src/assets/ui/icons loaded by GameIcon); keeps one consistent look across both games without per-component art.
- The title-screen intro cutscene is rendered live on a canvas from in-game sprites, tiles and characters (src/components/IntroCutscene.tsx) instead of static images, so it stays faithful to the game's art.
- Both games share window chrome from src/components/GameModal.tsx (Modal/Section/Meter); tile variants come from TILE_VARIANTS/pickVariant in src/odyssey/tile-art.ts so both engines stay in sync.
- The archipelago lives in src/odyssey/archipelago.ts (pure data + boat physics) and src/odyssey/sailing.ts (runtime); the sea has its own coordinate space and islands are generated into a fresh World far from legacy coordinates, so the old map is untouched. Boats/islands persist only as `boat:`/`isle:` keys in discoveries (additive saves).
- Every biome has its own ground/water tileset painted on demand in src/odyssey/biome-tiles.ts (palette tint, texture pattern, biome-specific pixel motifs, cached per biome/tile/variant) layered over the shared tile art, so biomes stop looking alike without changing saved terrain.
- The Grand Chronicle (factions, main quests, residents, side stories, missions, scenes) is generated by index on demand in src/odyssey/epic.ts; runtime state lives in src/odyssey/epic-play.ts under its own `golden-arrow-epic` browser key so old saves stay untouched.
- Cutscenes render on a live canvas stage (src/components/CinemaStage.tsx); beats may carry an optional `stage`, and older text-only beats get a default stage.
- Mobile performance: the Quality governor samples the real rAF interval (GPU included) and starts touch devices at level 1; level ≥2 alone enables canvas-filter bloom and film grain, and expensive layers (bloom, lens glow, rays, motes, tone) are cached and refreshed only on heavyFx frames. Canvas filters and per-frame gradients are the main mobile bottleneck.
- Internal canvas resolution keeps the short side at 270 px with a capped long side, so portrait phones draw ~3× fewer pixels; the minimap is half resolution on mobile and the atlas image is a ≤960 px downscale to avoid memory crashes.
- The game loop wraps update/render in try/catch so a single bad frame never stops the game.
- New world creatures live in src/odyssey/foes.ts (pure data, no value imports, merged into ENEMIES/BIOME_ENEMIES/MONSTER_LEVEL), drawn by foe-art.ts via drawEnemy's default branch and driven by traits in foe-play.ts; original enemy pools stay untouched.
- The downloadable Android prototype is an online, HTTPS-origin-restricted WebView wrapper opening guest gameplay directly; keep browser saves inside its app storage and do not promise native OAuth, offline play, or Play Store release signing.
