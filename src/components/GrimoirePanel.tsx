// Grimório (tecla V): ver as 30 habilidades, montar os 6 espaços e comprar livros da loja.
import { useState } from "react";
import { Modal, Section } from "@/components/GameModal";
import { Button } from "@/components/ui/button";
import type { Game } from "@/odyssey/engine";
import { SKILLS, FAMILY_NAMES, RARITY_COLOR, LOADOUT_SIZE, sourceLabel, type SkillFamily } from "@/odyssey/skills";
import { loadout, knows, setSlot, buyBook } from "@/odyssey/skill-play";

export function GrimoirePanel({ g, onClose }: { g: Game; onClose: () => void }) {
  const [tab, setTab] = useState<"books" | "shop">("books");
  const [fam, setFam] = useState<SkillFamily | "all">("all");
  const [picked, setPicked] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [, force] = useState(0);
  const lo = loadout(g);
  const known = SKILLS.filter((s) => knows(g, s.id)).length;
  const say = (m: string | null, ok: string) => { setMsg(m ?? ok); force((x) => x + 1); };
  const list = SKILLS.filter((s) => (tab === "shop" ? s.source.kind === "shop" : fam === "all" || s.family === fam));
  return (
    <Modal title={`Grimório · ${known}/${SKILLS.length} livros lidos`} onClose={onClose}>
      <Section title="Seus 6 espaços" aside={picked ? "Toque num espaço para colocar" : "Teclas 1 a 6"}>
        <div className="grim-slots">{Array.from({ length: LOADOUT_SIZE }).map((_, i) => {
          const s = SKILLS.find((x) => x.id === lo[i]);
          return <button key={i} className={`grim-slot ${picked ? "is-target" : ""}`} onClick={() => { if (picked) { say(setSlot(g, i, picked), "Habilidade colocada."); setPicked(null); } else if (s) { say(setSlot(g, i, ""), "Espaço esvaziado."); } }}
            draggable={!!s} onDragStart={(e) => e.dataTransfer.setData("text/plain", s?.id ?? "")} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = e.dataTransfer.getData("text/plain"); if (id) say(setSlot(g, i, id), "Habilidade colocada."); }}>
            <span className="grim-key">{i + 1}</span><span className="grim-dot" style={{ background: s?.color ?? "transparent" }} /><span className="grim-name">{s?.name ?? "vazio"}</span>
          </button>;
        })}</div>
      </Section>
      <div className="quest-tabs">{([["books", "Habilidades"], ["shop", "Loja de livros"]] as const).map(([id, l]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{l}</button>)}</div>
      {tab === "books" && <div className="quest-filters">{(["all", ...Object.keys(FAMILY_NAMES)] as const).map((f) => <button key={f} className={fam === f ? "on" : ""} onClick={() => setFam(f as SkillFamily | "all")}>{f === "all" ? "Todas" : FAMILY_NAMES[f as SkillFamily]}</button>)}</div>}
      {msg && <div className="modal-hint">{msg}</div>}
      <div className="grim-list">{list.map((s) => {
        const has = knows(g, s.id);
        const price = s.source.kind === "shop" ? Math.round(s.source.price * g.priceMult()) : 0;
        return (
          <div key={s.id} className={`grim-card ${has ? "" : "is-locked"} ${picked === s.id ? "is-picked" : ""}`} draggable={has} onDragStart={(e) => e.dataTransfer.setData("text/plain", s.id)}>
            <span className="grim-dot" style={{ background: has ? s.color : "#444" }} />
            <div className="flex-1">
              <div><b style={{ color: RARITY_COLOR[s.rarity] }}>{has ? s.name : "???"}</b> <small className="opacity-70">· {FAMILY_NAMES[s.family]} · {s.mp} MP · {s.cd}s</small></div>
              <div className="text-[11px] opacity-80">{has ? s.desc : `Livro: ${s.book}`}</div>
              <div className="text-[10px] opacity-60">{has ? s.lore : `Onde achar: ${sourceLabel(s)}`}</div>
            </div>
            {has ? <Button variant="secondary" size="sm" onClick={() => setPicked(picked === s.id ? null : s.id)}>{picked === s.id ? "Cancelar" : "Equipar"}</Button>
              : s.source.kind === "shop" ? <Button size="sm" disabled={g.p.gold < price} onClick={() => say(buyBook(g, s.id), `Você leu ${s.book}!`)}>{price} ouro</Button> : null}
          </div>
        );
      })}</div>
      <div className="modal-hint">Ouro: {g.p.gold} · Arraste ou toque em Equipar e depois num espaço · Não dá para trocar em combate</div>
    </Modal>
  );
}
