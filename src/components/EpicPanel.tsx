// A Grande Crônica (tecla O): história principal, facções, contratos dos moradores e memórias.
import { useMemo, useState } from "react";
import { Modal, Section, Meter } from "@/components/GameModal";
import { Button } from "@/components/ui/button";
import type { Game } from "@/odyssey/engine";
import { FACTIONS, FACTION_BY_ID, MAIN_COUNT, getMain, mission, sideStory, resident, objectiveText, SIDE_STORY_COUNT, MISSION_COUNT, RESIDENT_COUNT, SCENE_COUNT, ENDINGS, REP_MIN, REP_MAX, factionScene, endingScene, type FactionId } from "@/odyssey/epic";
import { epic, progress, chooseMain, acceptMission, turnIn, abandon, storyUnlocked, nextMissionOf, playScene, MAX_CONTRACTS } from "@/odyssey/epic-play";
import { BIOME_NAMES } from "@/odyssey/data";

export function EpicPanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [tab, setTab] = useState<"main" | "factions" | "board" | "memories">("main");
  const [fac, setFac] = useState<FactionId | "all">("all");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(30);
  const [msg, setMsg] = useState("");
  const [, force] = useState(0);
  const s = epic(g);
  const done = () => force((x) => x + 1);
  const cur = s.main < MAIN_COUNT ? getMain(s.main) : null;
  const pr = cur ? progress(g, cur.obj, s.mainBase) : null;
  const board = useMemo(() => {
    const out: number[] = []; const t = q.trim().toLowerCase();
    for (let i = 0; i < SIDE_STORY_COUNT && out.length < limit; i++) {
      if (!storyUnlocked(g, i)) break;
      const st = sideStory(i);
      if (fac !== "all" && st.faction !== fac) continue;
      if (nextMissionOf(g, i) === null) continue;
      if (t && !(st.title + " " + resident(st.resident).name).toLowerCase().includes(t)) continue;
      out.push(i);
    }
    return out;
  }, [g, fac, q, limit, s.done.length, s.main]);
  const unlockedStories = Math.min(SIDE_STORY_COUNT, 40 + s.main * 45 + s.done.length * 2);
  return (
    <Modal title={`A Grande Crônica · Capítulo ${Math.min(s.main + 1, MAIN_COUNT)}/${MAIN_COUNT}`} onClose={onClose}>
      <div className="quest-tabs">{([["main", "História principal"], ["factions", "Facções"], ["board", `Contratos (${s.contracts.length}/${MAX_CONTRACTS})`], ["memories", "Memórias"]] as const).map(([id, l]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{l}</button>)}</div>
      {msg && <div className="modal-hint">{msg}</div>}
      {tab === "main" && (cur && pr ? (
        <Section title={cur.title} aside={FACTION_BY_ID[cur.giver].name}>
          <p className="font-body text-lg leading-5">{cur.desc}</p>
          <div className="mt-2"><Meter value={pr.cur} max={pr.max} /> <small>{objectiveText(cur.obj)} — {pr.cur}/{pr.max}</small></div>
          {s.mainState === "choose" ? <div className="flex flex-wrap gap-2 mt-3">{cur.choices.map((c, i) => <Button key={i} onClick={() => { setMsg(chooseMain(g, i as 0 | 1) ?? c.result); onClose(); }}>{c.label}</Button>)}</div>
            : <div className="modal-hint">Termine o objetivo para escolher o destino desta missão.</div>}
          <div className="text-[11px] opacity-70 mt-3">Escolhas feitas: {s.choices.length} · Os 3 finais dependem delas.</div>
        </Section>
      ) : <Section title="A história terminou">{s.endingSeen && <p>{ENDINGS[s.endingSeen].title}</p>}</Section>)}
      {tab === "factions" && <div className="grim-list">{FACTIONS.map((f) => (
        <div key={f.id} className="grim-card"><span className="grim-dot" style={{ background: f.color }} />
          <div className="flex-1"><b style={{ color: f.color }}>{f.name}</b> <small className="opacity-70">· {f.leader}</small><div className="text-[11px] opacity-80">{f.desc} “{f.motto}”</div>
            <Meter value={s.rep[f.id] - REP_MIN} max={REP_MAX - REP_MIN} /><small>Reputação {s.rep[f.id]} {f.id === "mare" ? "· muda os preços das lojas" : ""}</small></div></div>))}</div>}
      {tab === "board" && <>
        {s.contracts.length > 0 && <Section title="Contratos ativos">{s.contracts.map((c) => { const m = mission(c.m), p = progress(g, m.obj, c.base); return (
          <div key={c.m} className="quest-entry"><div className="quest-entry-title">{m.title}<span>{resident(sideStory(m.story).resident).name}</span></div>
            <div className="quest-entry-desc">{objectiveText(m.obj)} — {p.cur}/{p.max} · {m.reward.gold} ouro, {m.reward.xp} XP</div>
            <div className="flex gap-2 mt-1"><Button size="sm" disabled={!p.ok} onClick={() => { setMsg(turnIn(g, c.m) ?? "Contrato entregue!"); done(); }}>Entregar</Button><Button size="sm" variant="outline" onClick={() => { abandon(g, c.m); done(); }}>Desistir</Button></div></div>); })}</Section>}
        <div className="quest-filters">{(["all", ...FACTIONS.map((f) => f.id)] as const).map((f) => <button key={f} className={fac === f ? "on" : ""} onClick={() => setFac(f)}>{f === "all" ? "Todas" : FACTION_BY_ID[f].name}</button>)}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar história ou morador…" /></div>
        <div className="quest-count">{unlockedStories} de {SIDE_STORY_COUNT} histórias liberadas · {s.done.length}/{MISSION_COUNT} missões feitas · {RESIDENT_COUNT} moradores</div>
        {board.map((i) => { const st = sideStory(i), r = resident(st.resident), m = mission(nextMissionOf(g, i)!); const active = s.contracts.some((c) => c.m === m.idx); return (
          <div key={i} className="quest-entry"><div className="quest-entry-title">{st.title}<span style={{ color: FACTION_BY_ID[st.faction].color }}>{FACTION_BY_ID[st.faction].name}</span></div>
            <div className="quest-entry-desc">{r.name}, {r.job} de {BIOME_NAMES[r.biome as keyof typeof BIOME_NAMES] ?? r.biome}: “{r.line}”</div>
            <div className="quest-entry-prog">Parte {m.step + 1}/{st.missions.length}: {objectiveText(m.obj)}</div>
            {!active && <Button size="sm" className="mt-1" onClick={() => { setMsg(acceptMission(g, m.idx) ?? "Contrato aceito."); done(); }}>Aceitar</Button>}</div>); })}
        {board.length >= limit && <button className="quest-more" onClick={() => setLimit(limit + 30)}>Mostrar mais</button>}
      </>}
      {tab === "memories" && <>
        <div className="quest-count">{g.seenBeats.size} cenas vistas · {SCENE_COUNT} cenas da Grande Crônica</div>
        <div className="flex flex-wrap gap-1">
          {FACTIONS.filter((f) => g.seenBeats.has(`epic_f_${f.id}`)).map((f) => <Button key={f.id} size="sm" variant="outline" onClick={() => { onClose(); playScene(g, factionScene(f), true); }}>{f.name}</Button>)}
          {Array.from({ length: s.main + (s.mainState === "done" ? 0 : 1) }, (_, i) => getMain(Math.min(i, MAIN_COUNT - 1))).filter((m) => g.seenBeats.has(m.intro.id)).map((m) => <Button key={m.id} size="sm" variant="outline" onClick={() => { onClose(); playScene(g, m.intro, true); }}>{m.title}</Button>)}
          {s.endingSeen && <Button size="sm" onClick={() => { onClose(); playScene(g, endingScene(s.endingSeen!), true); }}>{ENDINGS[s.endingSeen].title}</Button>}
        </div>
      </>}
    </Modal>
  );
}
