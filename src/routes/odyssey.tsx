import { FRONTIER_GATES } from "@/odyssey/frontier";
import worldArt from "@/assets/mana-world.jpg";
import { CROPS, STRUCTURES, isPlayerHome, upgradeHome, type Tool, type CropKind, type StructureKind } from "@/odyssey/settlement";
import { FURNITURE, HOME_LEVELS, type FurnitureKind } from "@/odyssey/home";
import { Pickaxe, Axe, Shovel, Sprout, Droplets, Hammer, House, Anvil, ChevronRight, Leaf, Sun, Swords, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { BIOME_LIST } from "@/odyssey/world";
import { BIOME_NAMES } from "@/odyssey/data";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Compass, Backpack, ScrollText, Map, UserRound,  Sparkles, Play, BookOpen, Skull } from "lucide-react";
import { BestiaryPanel } from "@/components/BestiaryPanel";
import { GameIcon } from "@/components/GameIcon";
import { ACTS, BEATS, ECOS } from "@/odyssey/story";
import { Modal, Section, Meter } from "@/components/GameModal";
import { Button } from "@/components/ui/button";
import { BUILDINGS, TREASURES } from "@/odyssey/exploration";
import { W, H } from "@/odyssey/world";
import { Game, VW, VH } from "@/odyssey/engine";
import { ITEMS, NPCS, QUESTS, SPIRITS, STATUES, SHOP, type Slot, type Stats } from "@/odyssey/data";
import { drawChar, drawItemIcon } from "@/odyssey/gfx";
import { loadout, knows } from "@/odyssey/skill-play";
import { SKILL_BY_ID } from "@/odyssey/skills";
import { GrimoirePanel } from "@/components/GrimoirePanel";
import { EpicPanel } from "@/components/EpicPanel";
import { CinemaStage, stageFor } from "@/components/CinemaStage";
import { Joystick } from "@/components/Joystick";
import { epicTick, epicNewGame } from "@/odyssey/epic-play";

export const Route = createFileRoute("/odyssey")({
  head: () => ({
    meta: [
      { title: "Jogar Golden Arrow Odyssey — A Crônica do Cântico Partido" },
      { name: "description", content: "Explore Mana Quest: um mundo 16-bit com casas acessíveis, santuários secretos, tesouros, chefes e espíritos de mana." },
      { property: "og:title", content: "Jogar Golden Arrow Odyssey" },
      { property: "og:description", content: "Explore um mundo 100 vezes maior com 30 biomas, cultive e construa seu lar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  ssr: false,
  component: Index,
});

type Panel = null | "inv" | "char" | "quest" | "map" | "secrets" | "workshop" | "build" | "farm" | "home" | "chronicle" | "bestiary" | "grimoire" | "epic";

function Icon({ id, size = 32 }: { id: string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d"); if (!c) return;
    c.clearRect(0, 0, 32, 32); c.imageSmoothingEnabled = false;
    const it = ITEMS[id]; if (it) drawItemIcon(c, id, it.color, it.type, 0, 0, 2);
  }, [id]);
  return <canvas ref={ref} width={32} height={32} style={{ width: size, height: size, imageRendering: "pixelated" }} />;
}
function Portrait({ pal }: { pal: Parameters<typeof drawChar>[3] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current?.getContext("2d"); if (!c) return;
    c.imageSmoothingEnabled = false; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 64, 64);
    c.setTransform(4, 0, 0, 4, 0, 0); drawChar(c, 8, 20, pal, 0, 0);
  }, [pal]);
  return <canvas ref={ref} width={64} height={64} className="game-frame bg-secondary" style={{ width: 80, height: 80, imageRendering: "pixelated" }} />;
}
function Bar({ v, max, cls, label }: { v: number; max: number; cls: string; label: string }) {
  return (
    <div className="status-bar">
      <div className="flex justify-between text-[11px]"><span>{label}</span><span>{Math.ceil(v)}/{max}</span></div>
      <div className="h-2 bg-background/80 border border-border"><div className={`h-full ${cls}`} style={{ width: `${Math.max(0, (v / max) * 100)}%` }} /></div>
    </div>
  );
}

function Index() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [, setTick] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [title, setTitle] = useState(true);
  const [hasSave, setHasSave] = useState(false);
  const [mapUrl, setMapUrl] = useState("");
  const [fullscreen,setFullscreen]=useState(false);
  const panelRef = useRef<Panel>(null);
  panelRef.current = panel;

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = new Game(cv);
    gameRef.current = g;
    const resize=()=>{
      const r=cv.getBoundingClientRect(),ratio=r.width/Math.max(1,r.height);
      const width=ratio>=16/9?Math.round(270*ratio):480;
      const height=ratio>=16/9?270:Math.round(480/ratio);
      g.resize(width,height);
    };
    const observer=new ResizeObserver(resize);observer.observe(cv);resize();
    const fullChange=()=>setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange',fullChange);
    setHasSave(Game.hasSave());
    setMapUrl(g.mapDataUrl());
    g.onMapClick = () => setPanel("map");
    let raf = 0, last = performance.now();
    // Laço protegido: um erro isolado num quadro nunca derruba o jogo, e o governador
    // de qualidade mede o intervalo real entre quadros (inclui GPU — o gargalo no celular).
    let errors = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const raw = t - last; last = t;
      if (document.hidden) return;
      const dt = Math.min(0.05, Math.max(0, raw) / 1000);
      try {
        g.paused = panelRef.current !== null;
        g.update(dt);
        if (g.quality.shouldRender()) g.render();
        if (raw < 250) g.quality.sample(raw);
        errors = 0;
      } catch (err) {
        if (++errors <= 3) console.error(err);
      }
    };
    const onVis = () => { last = performance.now(); };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(loop);
    if (import.meta.env.DEV) (window as unknown as { __game?: unknown }).__game = g;
    // O painel do jogo atualiza menos vezes em aparelhos fracos (a tela do jogo segue fluida).
    let hud = 0; const iv = setInterval(() => { if (document.hidden) return; hud++; if (g.started && hud % 4 === 0) epicTick(g); if (hud % g.quality.hudEvery() === 0) setTick((x) => x + 1); }, 120);
    const down = (e: KeyboardEvent) => {
      if (!g.started) return;
      g.audio.init();
      if (g.cutscene) {
        if (e.code === "Enter" || e.code === "Space" || e.code === "KeyE") { e.preventDefault(); g.advanceCutscene(); }
        else if (e.code === "Escape") g.advanceCutscene(true);
        return;
      }
      const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));
      if (e.code === "Escape") { setPanel(null); g.dialog = null; g.openStation = null; return; }
      if (e.code === "KeyI") return toggle("inv");
      if (e.code === "KeyC") return toggle("char");
      if (e.code === "KeyQ" || e.code === "KeyL") return toggle("quest");
      if (e.code === "KeyM") return toggle("map");
      if (e.code === "KeyJ") return toggle("chronicle");
      if (e.code === "KeyB") return toggle("bestiary");
      if (e.code === "KeyV") return toggle("grimoire");
      if (e.code === "KeyO") return toggle("epic");
      if (g.dialog || g.openStation || panelRef.current) return;
      if (e.code.startsWith("Digit")) { const i = Number(e.code.slice(5)) - 1; const id = loadout(g)[i]; if (id) g.cast(id); }
      if (e.code === "KeyE" || e.code === "Enter") g.interact();
      if (e.code === "KeyR" || e.code === "KeyK") g.cast(g.p.spell);
      if (e.code === "KeyH") g.quickPotion();
      if (e.code === "KeyG") g.quickPotion(true);
      if (e.code === "KeyN") g.audio.toggleMute();
      if (e.code === "Space" || e.code.startsWith("Arrow")) e.preventDefault();
      g.keys.add(e.code);
    };
    const up = (e: KeyboardEvent) => g.keys.delete(e.code);
    const vis = () => { if (document.hidden) { g.keys.clear(); g.save(); } }; document.addEventListener("visibilitychange", vis); window.addEventListener("pointerup", () => { for (const k of ["KeyW","KeyA","KeyS","KeyD"]) g.keys.delete(k); });
    const blur = () => g.keys.clear(); window.addEventListener("blur",blur);
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { observer.disconnect();document.removeEventListener('fullscreenchange',fullChange);cancelAnimationFrame(raf); clearInterval(iv); window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); g.audio.destroy(); window.removeEventListener("blur",blur); };
  }, []);

  const g = gameRef.current;
  const start = (load: boolean) => {
    if (!g) return;
    if (load) g.load();
    g.started = true; g.audio.init(); setTitle(false);
    if (!load) { g.toast("Fale com Gorm na vila ou comece seu lar na clareira a leste.", "#ffd040"); g.fireBeats("new"); epicNewGame(g); }
  };
  const onMouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!g || !g.started) return;
    e.preventDefault();
    const r = e.currentTarget.getBoundingClientRect();
    g.click(((e.clientX - r.left) / r.width) * g.viewWidth, ((e.clientY - r.top) / r.height) * g.viewHeight, e.button === 2);
  };

  const p = g?.p;
  const stats = g?.stats();

  return (
    <main className="game-shell min-h-screen bg-background text-foreground select-none">
      <div className={`game-layout ${title ? "at-title" : "playing"}`}>
        <div className="game-location"><span className="flex items-center gap-2"><Compass size={15} className="text-primary"/>{title ? 'Vila de Potos' : g?.areaName}<ChevronRight size={12}/><span className="text-muted-foreground">{title ? 'O início de tudo' : 'Terras de Mana'}</span></span><span className="flex items-center gap-2 text-muted-foreground"><Sun size={15}/>{title ? 'Primavera · Dia 1' : `${g?.timeLabel()} · ${g?.raining ? 'Chuva' : 'Céu aberto'}`}</span></div>
      <div className="relative w-full aspect-video game-viewport overflow-hidden">
        <canvas ref={canvasRef} aria-label="Mundo de Mana" onMouseMove={(e)=>{if(!g)return;const r=e.currentTarget.getBoundingClientRect();g.cursor={x:Math.floor(((e.clientX-r.left)/r.width*g.viewWidth+g.cam.x)/16),y:Math.floor(((e.clientY-r.top)/r.height*g.viewHeight+g.cam.y)/16)};}} onMouseDown={onMouse} onContextMenu={(e) => e.preventDefault()} className="w-full h-full block" style={{ imageRendering: "pixelated" }} />

        {g && p && stats && !title && (
          <>
            {/* HUD */}
            <div className="hud-plate absolute top-2 left-2 game-panel p-2 space-y-1 text-[12px]">
              <div className="flex gap-3 text-primary"><span>Nv {p.level}</span><span className="hud-gold"><GameIcon name="gold" size={14}/>{p.gold}</span><span>{g.timeLabel()}</span>{p.points > 0 && <span className="text-accent animate-pulse">+{p.points} pts</span>}</div>
              <Bar v={p.hp} max={g.maxHp()} cls="bg-destructive" label="HP" />
              <Bar v={p.mp} max={g.maxMp()} cls="bg-mana" label="MP" />
              <Bar v={p.xp} max={g.xpNeed()} cls="bg-primary" label="XP" />
            </div>
            <div className="quest-tracker absolute top-[24%] right-2 game-panel p-2 w-48 text-[11px] space-y-1">
              <div className="text-primary">SUA JORNADA</div>
              {QUESTS.filter((q) => g.questStatus[q.id] === "active").slice(0, 4).map((q) => (
                <div key={q.id}><span className={q.main ? "text-primary" : "text-accent"}>{q.main ? "★" : "!"} {q.title}</span><div className="opacity-80">{g.questReady(q) ? "✔ Retorne ao NPC" : g.questProgressText(q)}</div></div>
              ))}
              {!QUESTS.some((q) => g.questStatus[q.id] === "active") && <div className="opacity-70">Procure NPCs com "!"</div>}
            </div>
            <div className="spell-dock absolute left-1/2 -translate-x-1/2 flex gap-1">
              {loadout(g).map((id, i) => {
                const s = SKILL_BY_ID[id] ?? { id: `empty${i}`, name: "—", mp: 0, color: "#555", desc: "Espaço vazio", spell: "" } as unknown as { id: string; name: string; mp: number; color: string; desc: string; spell: string };
                const has = !!id && knows(g, id);
                return (
                  <Button variant="game" key={s.id} onClick={() => has && g.cast(s.id)} title={`${s.name} (${s.mp} MP) — ${s.desc}`}
                    className={`game-panel w-14 h-14 text-[10px] flex flex-col items-center justify-center ${p.spell === s.id ? "ring-2 ring-primary" : ""} ${has ? "" : "opacity-30"}`}>
                    <span className="w-4 h-4 rounded-full" style={{ background: s.color }} />
                    <span>{i + 1}</span><span className="truncate w-full text-center">{has ? s.name : "???"}</span>
                  </Button>
                );
              })}
              <Button variant="game" className="game-panel potion-button" aria-label="Usar poção" title="Usar poção" onClick={()=>g.quickPotion()}><GameIcon name="potion" size={26}/><span>{g.count("potion")+g.count("hi_potion")}</span></Button>
              <Button variant="game" className="game-panel potion-button" aria-label="Usar éter" title="Usar éter" onClick={()=>g.quickPotion(true)}><GameIcon name="ether" size={26}/><span>{g.count("ether")}</span></Button>
            </div>
            <div className="hidden">WASD/clique mover · Espaço/clique atacar<br />1-5/R/botão dir. magia · E interagir<br />I inv · C atributos · Q missões · M mapa · N som</div>
            <div className="game-toasts absolute top-32 left-2 space-y-1">
              {g.toasts.map((t, i) => <div key={i} className="game-panel px-2 py-1 text-[11px]" style={{ color: t.color, opacity: Math.min(1, t.t) }}>{t.text}</div>)}
            </div>
            {g.biomeBanner.t > 0 && <div className="absolute top-[18%] left-1/2 -translate-x-1/2 text-primary text-lg biome-banner text-center" style={{ opacity: Math.min(1, g.biomeBanner.t) }}>{g.biomeBanner.name}</div>}
            {g.activeBoss && g.activeBoss.alive && g.activeBoss.boss && (
              <div className="boss-plate absolute top-16 left-1/2 -translate-x-1/2 w-1/2 p-2 text-[12px]">
                <div className="flex justify-between"><span className="text-destructive">{g.activeBoss.boss.def.name}</span><span>Fase {g.activeBoss.boss.phase}</span></div>
                <div className="h-3 bg-background border border-border"><div className="h-full bg-destructive" style={{ width: `${(g.activeBoss.hp / g.activeBoss.maxhp) * 100}%` }} /></div>
              </div>
            )}

            {/* Dialog */}
            {g.dialog && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[80%] game-panel p-3 flex gap-3">
                <Portrait pal={g.dialog.npc.pal} />
                {g.dialog.choices.length <= 1 && <div className="tap-to-continue tap-small" aria-hidden>Toque para continuar</div>}
                <div className="flex-1 text-[12px] space-y-2">
                  <div className="text-primary">{g.dialog.npc.name} <span className="opacity-60">— {g.dialog.npc.title}</span></div>
                  <p className="font-body text-lg leading-5">{g.dialog.text}</p>
                  <div className="flex flex-wrap gap-1">{g.dialog.choices.map((c, i) => <Button variant="game" key={i} onClick={() => { g.audio.sfx("ui"); c.act(); }} className="game-btn">{c.label}</Button>)}</div>
                </div>
              </div>
            )}

            {/* Stations */}
            {g.openStation && (
              <Modal title={g.openStation === "smith" ? "⚒ Forja de Brunhild" : g.openStation === "alchemist" ? "Alquimia de Lira" : g.openStation === "carpenter" ? "Carpintaria" : "Mercado"} onClose={() => (g.openStation = null)}>
                {g.openStation === "shop" ? (
                  <div className="modal-cols">
                    <Section title="Comprar" aside={`${p.gold}g`}><div className="row-list">{SHOP.map((id) => <Row key={id} id={id} right={`${ITEMS[id].price}g`} onClick={() => g.buy(id)} />)}</div></Section>
                    <Section title="Vender" aside={`${g.inventory.length} itens`}><div className="row-list">{g.inventory.length ? g.inventory.map((s, i) => <Row key={i} id={s.id} qty={s.qty} right={`+${Math.max(1, Math.floor(ITEMS[s.id].price / 2))}g`} onClick={() => g.sell(i)} />) : <div className="modal-empty">Sua mochila está vazia.</div>}</div></Section>
                  </div>
                ) : (
                  <Section title="Receitas" aside="Itens em vermelho ainda faltam"><div className="row-list">{g.recipes(g.openStation).map((r, i) => {
                    const ok = g.canCraft(r);
                    return (
                      <Button variant="game" key={i} onClick={() => g.craft(r)} className={`recipe-row ${ok ? "is-ready" : "is-locked"}`}>
                        <Icon id={r.out} /><div className="flex-1"><div>{ITEMS[r.out].name}{r.qty > 1 ? ` ×${r.qty}` : ""}</div><div className="text-[10px] opacity-70">{ITEMS[r.out].desc}</div></div>
                        <div className="text-[10px] text-right">{Object.entries(r.cost).map(([id, n]) => <div key={id} className={g.count(id) >= n ? "" : "text-destructive"}>{ITEMS[id].name} {g.count(id)}/{n}</div>)}{r.gold > 0 && <div>{r.gold}g</div>}</div>
                      </Button>
                    );
                  })}</div></Section>
                )}
              </Modal>
            )}

            {panel === "inv" && (
              <Modal title={`Inventário · ${g.inventory.length}/${g.INV_MAX} espaços`} onClose={() => setPanel(null)}>
                <div className="inv-layout">
                  <Section title="Equipamento" aside={`ATQ ${g.attackPower()} · DEF ${g.defense()}`}>
                    <div className="equip-list">{(["weapon", "armor", "ring", "amulet"] as Slot[]).map((s) => {
                      const id = p.equip[s];
                      return <Button variant="game" key={s} onClick={() => g.unequip(s)} className="equip-slot equip-row">{id ? <Icon id={id} /> : <div className="w-8 h-8 equip-empty" />}<div><div className="row-label">{{ weapon: "Arma", armor: "Armadura", ring: "Anel", amulet: "Amuleto" }[s]}</div><div className="row-name">{id ? ITEMS[id].name : "Vazio"}</div></div></Button>;
                    })}</div>
                  </Section>
                  <Section title="Mochila" aside={<Meter value={g.inventory.length} max={g.INV_MAX} />}>
                    <div className="inv-grid">
                      {Array.from({ length: g.INV_MAX }).map((_, i) => {
                        const s = g.inventory[i];
                        return <Button variant="game" key={i} onClick={() => s && g.equip(i)} title={s ? `${ITEMS[s.id].name} — ${ITEMS[s.id].desc}` : ""} className="inv-slot relative aspect-square flex items-center justify-center">{s && <><Icon id={s.id} />{s.qty > 1 && <span className="slot-qty">{s.qty}</span>}</>}</Button>;
                      })}
                    </div>
                  </Section>
                </div>
                <div className="modal-hint">Clique num item para equipar ou usar · clique no equipamento para remover · Esc fecha</div>
              </Modal>
            )}
            {panel === "char" && (
              <Modal title={`Herói · Nível ${p.level}`} onClose={() => setPanel(null)}>
                <div className="modal-cols">
                  <Section title="Atributos" aside={p.points > 0 ? `${p.points} pontos livres` : "Sem pontos livres"}>
                    <div className="stat-list">{([["str", "Força", "Dano corpo-a-corpo"], ["dex", "Destreza", "Arco, crítico, velocidade"], ["vit", "Vitalidade", "HP e defesa"], ["int", "Inteligência", "Magias e cajado"], ["wis", "Sabedoria", "MP, cura, regeneração"]] as [keyof Stats, string, string][]).map(([k, n, d]) => (
                      <div key={k} className="stat-row"><div className="stat-head"><span>{n}</span><b>{stats[k]}</b></div><Meter value={stats[k]} max={Math.max(20, ...Object.values(stats))} /><small>{d}</small><Button variant="game" disabled={p.points <= 0} onClick={() => g.allocate(k)} className="game-btn stat-plus" aria-label={`Aumentar ${n}`}>+</Button></div>
                    ))}</div>
                  </Section>
                  <Section title="Espíritos de Mana" aside={`${p.spirits.length}/${SPIRITS.length}`}>
                    <div className="spirit-grid">{SPIRITS.map((s) => { const on = p.spirits.includes(s.id); return <div key={s.id} className={`spirit-card ${on ? "" : "is-locked"}`} style={{ ["--spirit" as string]: s.color }}><span className="spirit-dot" /><div><b>{on ? s.name : "???"}</b><small>{s.elem} · {s.spell} · {s.mp} MP</small></div></div>; })}</div>
                  </Section>
                </div>
              </Modal>
            )}
            {panel === "chronicle" && (
              <Modal title={`A Crônica do Cântico Partido — Ciclo ${g.cycle + 1}`} onClose={() => setPanel(null)}>
                <div className="chronicle-top"><span>Ecos restaurados <b>{g.ecosRestored()}/{ECOS.length}</b></span><span>Nível dos inimigos do ciclo <b>+{g.cycle * 20}</b></span></div>
                {(() => { const o = g.currentObjective(); return o ? <div className="chronicle-next"><div className="text-primary">{o.state === "active" ? "Objetivo atual" : "Próximo passo"}</div><div>{o.q.title}</div><div className="font-body text-base opacity-80">{o.state === "active" ? g.questProgressText(o.q) : `Fale com ${NPCS.find((n) => n.id === o.q.giver)?.name ?? "alguém"} — ${o.q.desc}`}</div></div> : <div className="chronicle-next"><div className="text-primary">Objetivo atual</div><div className="font-body text-base opacity-80">Explore, fortaleça-se e, se quiser, comece um novo Ciclo.</div></div>; })()}
                <div className="modal-section-title mt-3"><span>Atos</span></div>
                {ACTS.map((a) => { const pr = g.actProgress(a.id), pct = pr.total ? (pr.done / pr.total) * 100 : a.id === 6 ? Math.min(100, g.cycle * 100) : 0; return (
                  <div key={a.id} className="act-card"><div className="flex justify-between"><span>{pr.total && pr.done === pr.total ? "✔ " : ""}{a.name}</span><span className="opacity-70">{pr.total ? `${pr.done}/${pr.total}` : a.id === 6 ? `Ciclo ${g.cycle + 1}` : ""}</span></div>
                    <div className="font-body text-base opacity-70">{a.subtitle}</div><div className="h-1.5 bg-background/80 border border-border mt-1"><div className="h-full bg-primary" style={{ width: `${pct}%` }} /></div>
                    {a.id === 6 && <Button variant="secondary" className="mt-2" disabled={!g.canStartCycle()} onClick={() => { g.startCycle(); setPanel(null); }}>{g.canStartCycle() ? `Iniciar o Ciclo ${g.cycle + 2}` : "Conclua o Ato V para liberar"}</Button>}
                  </div>); })}
                <div className="modal-section-title mt-3"><span>Os 17 Ecos</span></div>
                <div className="eco-grid">{ECOS.map((e) => { const ok = g.bossesDone.has(`${e.biome}_boss`); return <div key={e.biome} className={ok ? "eco-chip eco-done" : "eco-chip"} title={e.lore}>{ok ? "♪ " : "· "}{e.eco}</div>; })}</div>
                <div className="modal-section-title mt-3"><span>Memórias (reveja as cenas)</span></div>
                <div className="flex flex-wrap gap-1">{BEATS.filter((b) => g.seenBeats.has(b.id)).map((b) => <Button key={b.id} variant="outline" size="sm" onClick={() => { setPanel(null); g.cutscene = { beat: b, i: 0 }; }}>{b.title}</Button>)}</div>
              </Modal>
            )}
            {panel === "bestiary" && <Modal title="Bestiário do Abismo do Cântico" onClose={() => setPanel(null)}><BestiaryPanel found={g.discoveries} /></Modal>}
            {panel === "grimoire" && <GrimoirePanel g={g} onClose={() => setPanel(null)} />}
            {panel === "epic" && <EpicPanel g={g} onClose={() => setPanel(null)} />}
            {panel === "quest" && <QuestBook g={g} onClose={() => setPanel(null)} />}
            {panel === "map" && (
              <Modal title="Atlas de Mana — 30 biomas" onClose={() => setPanel(null)}>
                <div className="atlas-map relative w-full" style={{ aspectRatio: `${W}/${H}` }}>
                  <img src={mapUrl} alt="Mapa do mundo" className="w-full h-full" style={{ imageRendering: "pixelated" }} />
                  <div className="absolute w-2 h-2 bg-destructive animate-pulse" style={{ left: `${(p.x / 16 / W) * 100}%`, top: `${(p.y / 16 / H) * 100}%` }} />
                  {STATUES.map((s) => {
                    const on = g.statues.has(s.id);
                    return <Button variant="game" key={s.id} disabled={!on} onClick={() => { g.travel(s.id); setPanel(null); }} title={s.name} aria-label={s.name} className="atlas-marker absolute -translate-x-1/2 -translate-y-1/2 disabled:opacity-40" style={{ left: `${(s.tx / W) * 100}%`, top: `${(s.ty / H) * 100}%` }}>{on ? "◆" : "◇"}</Button>;
                  })}
                </div>
                <div className="atlas-destinations">
                  <Button variant="outline" onClick={()=>{g.travel('village');setPanel(null);}}>Vila de Potos</Button>
                  {FRONTIER_GATES.map(gate=><Button variant="outline" key={gate.id} onClick={()=>{g.travelFrontier(gate.id);setPanel(null);}}><Compass size={14}/>{gate.name}</Button>)}
                </div>
              </Modal>
            )}
          </>
        )}

        {panel === 'secrets' && g && <Modal title="Diário de Descobertas" onClose={()=>setPanel(null)}>
          <div className="stat-tiles"><div className="stat-tile">{g.discoveries.size}/{BUILDINGS.length}<small>Lugares visitados</small></div><div className="stat-tile">{g.openedChests.size}/{TREASURES.length+BUILDINGS.length}<small>Tesouros encontrados</small></div></div>
          <Section title="Lugares"><div className="row-list">{BUILDINGS.map(b=><div key={b.id} className="place-row"><span className={g.discoveries.has(b.id)?'text-accent':'text-muted-foreground'}>{g.discoveries.has(b.id)?b.name:b.secret?'??? — Lugar esquecido':b.name}</span><span>{g.discoveries.has(b.id)?'◆':'◇'}</span></div>)}</div></Section>
        </Modal>}
        {g && !title && g.cutscene && (
          <div className="cutscene absolute inset-0" onClick={() => g.advanceCutscene()} role="dialog" aria-label={g.cutscene.beat.title}>
            <div className="cutscene-bar cutscene-top"><span>{g.cutscene.beat.title}</span></div>
            <CinemaStage key={g.cutscene.beat.id} scene={stageFor(g.cutscene.beat.id, g.cutscene.beat.stage)} line={g.cutscene.i} />
            <div className="tap-to-continue" aria-hidden>Toque para continuar</div>
            <div className="cutscene-body"><p key={`${g.cutscene.beat.id}-${g.cutscene.i}`} className="cutscene-line">{g.cutscene.beat.lines[g.cutscene.i]}</p></div>
            <div className="cutscene-bar cutscene-bottom"><span className="opacity-70">{g.cutscene.i + 1}/{g.cutscene.beat.lines.length}</span>
              <span className="flex gap-2"><Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); g.advanceCutscene(true); }}>Pular</Button><Button size="sm" onClick={(e) => { e.stopPropagation(); g.advanceCutscene(); }}>{g.cutscene.i + 1 < g.cutscene.beat.lines.length ? "Continuar" : "Fechar"}<ChevronRight size={14}/></Button></span></div>
          </div>
        )}
        {title && (
          <div className="title-screen absolute inset-0">
            <img src={worldArt} width={1536} height={864} alt="A Árvore de Mana, a vila e seus jardins" className="title-art"/>
            <div className="title-content">
              <div className="title-eyebrow"><span/> UM NOVO CAPÍTULO DA SUA HISTÓRIA <span/></div>
              <h1 className="game-title">Golden Arrow <em>Odyssey</em></h1>
              <div className="title-subtitle">CRÔNICAS DE UM MUNDO VIVO</div>
              <p className="title-story">Dezessete notas sustentavam o mundo. O Silêncio as apagou, uma a uma.<br/>Ouça a Canção. Reacenda os Ecos.</p>
              <div className="title-actions"><Button onClick={() => start(false)} className="start-button"><Play size={16} fill="currentColor"/>Nova jornada<ChevronRight size={16}/></Button>{hasSave && <Button variant="outline" onClick={()=>start(true)} className="continue-button">Continuar</Button>}</div>
              <span className="title-chapter"><Sparkles size={12}/> O mundo floresce com cada escolha.</span>
            </div>
            <span className="scene-label"><span className="world-status"/> ÁRVORE DE MANA · POTOS</span>
          </div>
        )}
        {g && !title && (panel === 'farm' || panel === 'build' || panel === 'workshop') && <Modal title={panel === 'farm' ? 'Jardim & colheita' : panel === 'build' ? 'Construir um lar' : 'Oficinas de Potos'} onClose={()=>setPanel(null)}>
          {panel === 'farm' ? <><div className="choice-grid">{(Object.entries(CROPS) as [CropKind,typeof CROPS.carrot][]).map(([id,crop])=><Button variant="outline" key={id} className="choice-item" onClick={()=>{g.crop=id;g.tool='seed';setPanel(null);}}><Sprout/><span>{crop.name}<small>{g.count(crop.seed)} sementes · {crop.seconds}s</small></span></Button>)}</div><div className="flex gap-2 mt-4"><Button variant="secondary" onClick={()=>{g.tool='till';setPanel(null);}}><Shovel/>Preparar terra</Button><Button variant="secondary" onClick={()=>{g.tool='water';setPanel(null);}}><Droplets/>Regar</Button></div><div className="progress-line mt-5">{g.settlement.plots.length} canteiros · {g.settlement.harvests} colheitas</div></> : panel === 'build' ? <div className="choice-grid">{(Object.entries(STRUCTURES) as [StructureKind,typeof STRUCTURES.home][]).map(([id,def])=><Button variant="outline" className="choice-item" key={id} onClick={()=>{g.structure=id;g.tool='build';setPanel(null);}}><House/><span>{def.name}<small>{Object.entries(def.cost).map(([key,n])=>`${ITEMS[key].name} ${g.count(key)}/${n}`).join(' · ')}</small></span></Button>)}</div> : <div className="choice-grid"><Button variant="outline" className="choice-item" onClick={()=>{g.openStation='carpenter';setPanel(null);}}><Hammer/><span>Carpintaria<small>Tábuas e materiais</small></span></Button><Button variant="outline" className="choice-item" onClick={()=>{g.openStation='smith';setPanel(null);}}><Anvil/><span>Forja<small>Lingotes, armas e armaduras</small></span></Button><Button variant="outline" className="choice-item" onClick={()=>{g.openStation='alchemist';setPanel(null);}}><Sparkles/><span>Alquimia<small>Poções e amuletos</small></span></Button><Button variant="outline" className="choice-item" onClick={()=>{g.openStation='shop';setPanel(null);}}><Backpack/><span>Mercado<small>Sementes e suprimentos</small></span></Button></div>}
        </Modal>}
      </div>
      <footer className="game-toolbar">
        <div className="toolbar-actions">{([{p:'inv',icon:Backpack,label:'Inventário'},{p:'char',icon:UserRound,label:'Herói'},{p:'quest',icon:ScrollText,label:'Missões'},{p:'chronicle',icon:BookOpen,label:'Crônica (J)'},{p:'map',icon:Map,label:'Mapa'},{p:'secrets',icon:Compass,label:'Descobertas'},{p:'bestiary',icon:Skull,label:'Bestiário (B)'},{p:'grimoire',icon:Sparkles,label:'Grimório (V)'},{p:'epic',icon:ScrollText,label:'Grande Crônica (O)'}] as const).map(({p:tab,icon:ToolIcon,label})=><Button key={tab} variant="ghost" size="icon" disabled={title} title={label} aria-label={label} onClick={()=>setPanel(panel===tab?null:tab)} className={panel===tab?'text-primary':'text-muted-foreground'}><GameIcon name={tab}/><ToolIcon size={18}/></Button>)}<span className="toolbar-divider"/>{([{id:'explore',icon:Swords,label:'Explorar'},{id:'mine',icon:Pickaxe,label:'Minerar'},{id:'axe',icon:Axe,label:'Cortar madeira'},{id:'till',icon:Shovel,label:'Preparar terra'},{id:'water',icon:Droplets,label:'Regar'}] as const).map(({id,icon:ToolIcon,label})=><Button key={id} variant="ghost" size="icon" aria-label={label} title={label} disabled={title} onClick={()=>{if(g)g.tool=id;}} className={g?.tool===id&&!title?'tool-active':'text-muted-foreground'}><GameIcon name={id}/><ToolIcon size={18}/></Button>)}</div>
        {g && !title && panel === 'home' && <Modal title={`Minha casa · ${HOME_LEVELS[g.settlement.home.level - 1].name}`} onClose={()=>setPanel(null)}>
          {g.settlement.home.level < HOME_LEVELS.length ? <Button variant="secondary" className="mb-4" onClick={()=>{upgradeHome(g);setPanel(null);}}><Hammer/>Reformar para {HOME_LEVELS[g.settlement.home.level].name}<small className="ml-2 opacity-80">{Object.entries(HOME_LEVELS[g.settlement.home.level].cost).map(([key,n])=>`${ITEMS[key].name} ${g.count(key)}/${n}`).join(' · ')}</small></Button> : <div className="progress-line mb-4">Sua mansão está completa.</div>}
          <div className="choice-grid">{(Object.entries(FURNITURE) as [FurnitureKind,typeof FURNITURE.bed][]).map(([id,def])=><Button variant="outline" className="choice-item" key={id} disabled={g.settlement.home.level < def.minLevel} onClick={()=>{g.furniture=id;g.tool='furnish';setPanel(null);}}><House/><span>{def.name}<small>{g.settlement.home.level < def.minLevel ? `Requer ${HOME_LEVELS[def.minLevel-1].name}` : Object.entries(def.cost).map(([key,n])=>`${ITEMS[key].name} ${g.count(key)}/${n}`).join(' · ')}</small></span></Button>)}</div>
          <div className="flex gap-2 mt-4"><Button variant="secondary" onClick={()=>{g.tool='unfurnish';setPanel(null);}}><Axe/>Remover móvel</Button><Button variant="secondary" onClick={()=>{g.tool='explore';setPanel(null);}}><Swords/>Terminar decoração</Button></div>
          <div className="progress-line mt-4">{g.settlement.home.furniture.length} móveis · Clique no chão para posicionar. Durma na cama para recuperar HP e MP.</div>
        </Modal>}
        <div className="settlement-dock">{g && isPlayerHome(g.interior) && <Button variant="game" size="icon" disabled={title} aria-label="Minha casa" title="Minha casa: reformar e mobiliar" onClick={()=>setPanel('home')}><GameIcon name="home"/></Button>}{([{tab:'farm',name:'Cultivar',sprite:'farm'},{tab:'build',name:'Construir',sprite:'build'},{tab:'workshop',name:'Oficinas',sprite:'workshop'}] as const).map(a=><Button variant="game" size="icon" key={a.tab} disabled={title} aria-label={a.name} title={a.name} onClick={()=>setPanel(a.tab)}><GameIcon name={a.sprite}/></Button>)}</div>
        <span className="footer-chapter">{title ? 'SUA HISTÓRIA. SEU MUNDO.' : g?.tool === 'explore' ? `${g?.settlement.structures.length} CONSTRUÇÕES · ${g?.settlement.harvests} COLHEITAS` : ({mine:'MINERAÇÃO',axe:'LENHADOR',till:'PREPARAR TERRA',seed:'PLANTAÇÃO',water:'IRRIGAÇÃO',build:'CONSTRUÇÃO',furnish:'DECORAÇÃO',unfurnish:'REMOVER MÓVEL'} as Record<string,string>)[g?.tool ?? '']}</span>
        <div className="system-dock flex gap-1"><Button variant="ghost" size="icon" aria-label={fullscreen?'Sair da tela cheia':'Tela cheia'} title="Tela cheia" onClick={async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{g?.toast('A tela cheia não está disponível neste navegador.');}}}><GameIcon name="fullscreen"/></Button><Button variant="ghost" size="icon" disabled={title} title="Salvar jornada" aria-label="Salvar jornada" onClick={()=>{g?.save();g?.toast('Jornada salva.');}}><GameIcon name="save"/></Button><Button variant="ghost" size="icon" title="Alternar áudio" aria-label="Alternar áudio" onClick={()=>g?.audio.toggleMute()}><GameIcon name={g?.audio.muted?"mute":"sound"}/></Button></div>
      </footer>
      {!title && <div className="mobile-controls"><Joystick keys={g?.keys} /><Button variant="secondary" size="icon" aria-label="Atacar" onClick={()=>g?.attack()}><GameIcon name="explore"/></Button><Button variant="secondary" size="icon" aria-label="Interagir" onClick={()=>g?.interact()}><Sparkles/></Button><Button variant="secondary" size="icon" aria-label="Magia" onClick={()=>g&&g.cast(g.p.spell)}><GameIcon name="ether"/></Button><Button variant="secondary" size="icon" aria-label="Grimório" onClick={()=>setPanel(panel==='grimoire'?null:'grimoire')}><BookOpen/></Button></div>}
      {title && <a className="game-credits" href="/game-credits.txt" target="_blank" rel="noreferrer">Créditos · Source of Mana</a>}
      </div>
    </main>
  );
}

function Row({ id, qty, right, onClick }: { id: string; qty?: number; right: string; onClick: () => void }) {
  return <Button variant="game" onClick={onClick} title={ITEMS[id].desc} className="item-row"><Icon id={id} size={24} /><span className="flex-1">{ITEMS[id].name}{qty && qty > 1 ? ` ×${qty}` : ""}</span><span className="item-price">{right}</span></Button>;
}

function QuestBook({ g, onClose }: { g: Game; onClose: () => void }) {
  const [tab, setTab] = useState<"active" | "available" | "done">("active");
  const [cat, setCat] = useState<"all" | "main" | "folk" | "seal">("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(40);
  const npcName = (id: string) => NPCS.find((n) => n.id === id)?.name ?? "";
  const list = QUESTS.filter((x) => {
    const st = g.questStatus[x.id];
    if (tab === "active" ? st !== "active" : tab === "done" ? st !== "done" : st || !g.questUnlocked(x)) return false;
    const folk = x.giver.startsWith("folk_"), seal = x.id.endsWith("_seal") || x.id === "folk_choir_1";
    if (cat === "main" && !x.main) return false;
    if (cat === "folk" && (!folk || seal)) return false;
    if (cat === "seal" && !seal) return false;
    const t = q.trim().toLowerCase();
    return !t || (x.title + " " + x.desc + " " + npcName(x.giver)).toLowerCase().includes(t);
  });
  return (
    <Modal title={`Livro de Missões · ${Object.values(g.questStatus).filter((v) => v === "done").length}/${QUESTS.length} concluídas`} onClose={onClose}>
      <div className="quest-book">
        <div className="quest-tabs">{([["active", "Ativas"], ["available", "Disponíveis"], ["done", "Concluídas"]] as const).map(([id, l]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => { setTab(id); setLimit(40); }}>{l}</button>)}</div>
        <div className="quest-filters">{([["all", "Todas"], ["main", "Principais"], ["folk", "Moradores"], ["seal", "Selos e Coro"]] as const).map(([id, l]) => <button key={id} className={cat === id ? "on" : ""} onClick={() => setCat(id)}>{l}</button>)}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar missão ou morador…" /></div>
        <div className="quest-count">{list.length} missões</div>
        {list.slice(0, limit).map((x) => (
          <div key={x.id} className="quest-entry"><div className="quest-entry-title">{x.main ? "★ " : ""}{x.title}<span>{npcName(x.giver)}</span></div>
            <div className="quest-entry-desc">{x.desc}</div>{g.questStatus[x.id] === "active" && <div className="quest-entry-prog">{g.questReady(x) ? "✔ Retorne a quem pediu" : g.questProgressText(x)}</div>}</div>
        ))}
        {list.length > limit && <button className="quest-more" onClick={() => setLimit(limit + 40)}>Mostrar mais</button>}
      </div>
    </Modal>
  );
}
