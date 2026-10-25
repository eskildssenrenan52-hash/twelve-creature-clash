// Palco animado das cutscenes: céu, chão, personagens do próprio jogo, câmera e efeitos.
import { useEffect, useRef } from "react";
import { drawChar } from "@/odyssey/gfx";
import type { EpicScene } from "@/odyssey/epic";
import { NPCS } from "@/odyssey/data";

const HERO = { name: "Você", pal: { skin: "#f0c8a0", hair: "#f0d040", body: "#3070c0", legs: "#2a3050" } };
const GORM = NPCS[0]!;
/** Cenas antigas (só texto) ganham um palco padrão com o herói e o Ancião Gorm. */
export function stageFor(id: string, stage?: EpicScene): EpicScene {
  if (stage) return stage;
  let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const fx = (["stars", "petals", "embers", "rain", "none"] as const)[h % 5]!;
  return { id, title: "", lines: [], actors: [HERO, { name: GORM.name, pal: GORM.pal }], fx, sky: ["#1a2440", "#3a2050", "#103040", "#402818"][h % 4]!, ground: ["#3a6a30", "#305a70", "#5a4a3a"][h % 3]! };
}

export function CinemaStage({ scene, line }: { scene: EpicScene; line: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef(line); lineRef.current = line;
  useEffect(() => {
    const cv = ref.current; const c = cv?.getContext("2d"); if (!cv || !c) return;
    const W = 320, H = 180; c.imageSmoothingEnabled = false;
    const parts = Array.from({ length: 60 }, (_, i) => ({ x: (i * 53) % W, y: (i * 97) % H, v: 10 + (i % 7) * 6 }));
    let raf = 0; const t0 = performance.now(); let flash = 1;
    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const quake = scene.fx === "quake" ? Math.sin(t * 40) * 1.5 : 0;
      c.setTransform(1, 0, 0, 1, 0, 0);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, scene.sky); g.addColorStop(1, "#000"); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // montanhas distantes (parallax)
      const pan = Math.sin(t * 0.15) * 20;
      c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.moveTo(0, 120);
      for (let x = 0; x <= W; x += 20) c.lineTo(x, 100 + Math.sin((x + pan * 0.5) * 0.04) * 14); c.lineTo(W, H); c.lineTo(0, H); c.fill();
      c.fillStyle = scene.ground; c.fillRect(0, 128, W, H - 128);
      c.fillStyle = "rgba(255,255,255,.06)"; for (let x = 0; x < W; x += 8) c.fillRect((x + Math.floor(pan)) % W, 130 + (x % 3), 4, 1);
      // atores
      const n = scene.actors.length, speaker = lineRef.current % Math.max(1, n);
      c.save(); c.translate(quake + pan * 0.3, 0);
      scene.actors.forEach((a, i) => {
        const x = W / 2 + (i - (n - 1) / 2) * 70, talking = i === speaker;
        const bob = talking ? Math.abs(Math.sin(t * 6)) * 1.5 : 0;
        c.save(); c.translate(x, 150 - bob); c.scale(3, 3);
        c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(0, 0, 6, 2, 0, 0, Math.PI * 2); c.fill();
        drawChar(c, 0, 0, a.pal, i < n / 2 ? 3 : 2, talking ? Math.floor(t * 4) % 4 : 0);
        c.restore();
        if (talking) { c.fillStyle = "rgba(255,230,140,.9)"; c.font = "8px monospace"; c.textAlign = "center"; c.fillText(a.name, x, 88); }
      });
      c.restore();
      // efeitos
      for (const p of parts) {
        if (scene.fx === "rain") { p.y = (p.y + p.v * 0.25) % H; c.fillStyle = "rgba(160,190,255,.5)"; c.fillRect(p.x, p.y, 1, 4); }
        else if (scene.fx === "embers") { p.y = (p.y - p.v * 0.05 + H) % H; c.fillStyle = "rgba(255,140,60,.8)"; c.fillRect(p.x + Math.sin(t + p.v) * 3, p.y, 1, 1); }
        else if (scene.fx === "petals") { p.y = (p.y + p.v * 0.04) % H; p.x = (p.x + 0.2) % W; c.fillStyle = "rgba(255,170,200,.8)"; c.fillRect(p.x, p.y, 2, 1); }
        else if (scene.fx === "stars" && p.y < 100) { c.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * Math.abs(Math.sin(t * 2 + p.v))})`; c.fillRect(p.x, p.y, 1, 1); }
      }
      if (scene.fx === "flash" && flash > 0) { flash -= 0.02; c.fillStyle = `rgba(255,255,255,${flash})`; c.fillRect(0, 0, W, H); }
      // vinheta
      const v = c.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 200); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.7)"); c.fillStyle = v; c.fillRect(0, 0, W, H);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [scene]);
  return <canvas ref={ref} width={320} height={180} className="cinema-stage" aria-hidden />;
}
