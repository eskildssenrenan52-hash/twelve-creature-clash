import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { BEASTS, CHRONICLES, EPILOGUE, beastKey, beastsFound, chaptersUnlocked, type Beast } from "@/odyssey/bestiary";
import { THEMES } from "@/odyssey/dungeon";
import { drawBeast } from "@/odyssey/beast-art";

function Portrait({ beast, known, size = 64 }: { beast: Beast; known: boolean; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const c = cv.getContext("2d"); if (!c) return;
    let raf = 0; const t0 = performance.now() / 1000 + beast.id;
    const frame = () => {
      c.clearRect(0, 0, size, size);
      c.save();
      if (!known) c.filter = "brightness(0) opacity(0.55)";
      drawBeast(c, beast, size / 2, size * 0.82, performance.now() / 1000 - t0, 0, false, size / 34);
      c.restore();
      if (known) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [beast, known, size]);
  return <canvas ref={ref} width={size} height={size} className="block" style={{ imageRendering: "auto" }} />;
}

export function BestiaryPanel({ found }: { found: Set<string> }) {
  const [tab, setTab] = useState<"beasts" | "tales">("beasts");
  const [stratum, setStratum] = useState(0);
  const [sel, setSel] = useState<Beast | null>(null);
  const total = beastsFound(found);
  const list = BEASTS.filter((b) => b.stratum === stratum);
  const tale = CHRONICLES[stratum]!, open = chaptersUnlocked(found, stratum);
  return (
    <div>
      <div className="flex gap-2 mb-3 items-center">
        <Button variant={tab === "beasts" ? "secondary" : "outline"} size="sm" onClick={() => setTab("beasts")}>Bestiário</Button>
        <Button variant={tab === "tales" ? "secondary" : "outline"} size="sm" onClick={() => setTab("tales")}>Crônicas das Profundezas</Button>
        <span className="ml-auto text-primary">{total}/100 criaturas</span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {THEMES.map((th, i) => <Button key={th.name} size="sm" variant={stratum === i ? "secondary" : "ghost"} onClick={() => { setStratum(i); setSel(null); }} style={{ color: th.color }}>{["I","II","III","IV","V","VI","VII","VIII","IX","X"][i]}</Button>)}
      </div>
      <div className="text-xs mb-2" style={{ color: THEMES[stratum]!.color }}>{THEMES[stratum]!.name} · andares {stratum * 10 + 1}–{stratum * 10 + 10}</div>
      {tab === "beasts" ? (
        <>
          <div className="grid grid-cols-5 gap-2">
            {list.map((b) => {
              const known = found.has(beastKey(b.id));
              return (
                <button key={b.id} type="button" onClick={() => setSel(b)} className={`flex flex-col items-center rounded-md border p-1 transition-colors ${sel?.id === b.id ? "border-primary bg-secondary" : "border-border/40 hover:bg-secondary/60"}`}>
                  <Portrait beast={b} known={known} />
                  <span className="text-[9px] leading-tight text-center">{known ? b.name : `Andar ${b.floor}`}</span>
                </button>
              );
            })}
          </div>
          {sel && (
            <div className="mt-3 flex gap-3 items-center border-t border-border/30 pt-3">
              <Portrait beast={sel} known={found.has(beastKey(sel.id))} size={110} />
              <div className="flex-1">
                <div className="text-primary text-sm">{found.has(beastKey(sel.id)) ? sel.name : "??? — ainda não registrada"}</div>
                <div className="text-muted-foreground text-[11px] mb-1">Surge pela primeira vez no andar {sel.floor} do Abismo</div>
                <p className="font-body text-lg leading-snug">{found.has(beastKey(sel.id)) ? sel.lore : "Derrote esta criatura para registrá-la e revelar sua história."}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3">
          <div className="text-primary text-sm">{tale.title}</div>
          <div className="text-muted-foreground text-[11px]">{tale.hero} · capítulos abrem a cada 2 criaturas deste estrato registradas</div>
          {tale.chapters.map((ch, i) => (
            <div key={i} className="border-l-2 pl-3" style={{ borderColor: i < open ? THEMES[stratum]!.color : "transparent" }}>
              <div className="text-[11px] text-accent">Capítulo {i + 1}</div>
              <p className="font-body text-lg leading-snug">{i < open ? ch : "· · · página selada · · ·"}</p>
            </div>
          ))}
          {total === 100 && <div className="border-t border-border/30 pt-3"><div className="text-primary">Epílogo — A Canção Inteira</div>{EPILOGUE.map((l) => <p key={l} className="font-body text-lg">{l}</p>)}</div>}
        </div>
      )}
    </div>
  );
}
