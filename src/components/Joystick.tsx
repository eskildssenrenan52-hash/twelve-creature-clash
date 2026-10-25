// Joystick de toque: aparece onde o dedo encosta, vira as teclas W/A/S/D e some ao soltar.
import { useRef, useState } from "react";

export function dirKeys(dx: number, dy: number, dead = 0.35): string[] {
  const len = Math.hypot(dx, dy); if (len < dead) return [];
  const nx = dx / len, ny = dy / len, k: string[] = [];
  if (ny < -0.38) k.push("KeyW"); if (ny > 0.38) k.push("KeyS");
  if (nx < -0.38) k.push("KeyA"); if (nx > 0.38) k.push("KeyD");
  return k;
}

export function Joystick({ keys }: { keys: Set<string> | undefined }) {
  const [pos, setPos] = useState<{ x: number; y: number; kx: number; ky: number } | null>(null);
  const id = useRef<number | null>(null);
  const R = 46;
  const release = () => { id.current = null; setPos(null); for (const k of ["KeyW", "KeyA", "KeyS", "KeyD"]) keys?.delete(k); };
  const apply = (dx: number, dy: number) => {
    for (const k of ["KeyW", "KeyA", "KeyS", "KeyD"]) keys?.delete(k);
    for (const k of dirKeys(dx / R, dy / R)) keys?.add(k);
  };
  return (
    <div className="joystick-zone" aria-label="Joystick: arraste para andar"
      onPointerDown={(e) => { if (id.current !== null) return; id.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top, kx: 0, ky: 0 }); }}
      onPointerMove={(e) => { if (e.pointerId !== id.current || !pos) return; const r = e.currentTarget.getBoundingClientRect(); let dx = e.clientX - r.left - pos.x, dy = e.clientY - r.top - pos.y; const l = Math.hypot(dx, dy); if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; } setPos({ ...pos, kx: dx, ky: dy }); apply(dx, dy); }}
      onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>
      {pos ? <div className="joystick-base" style={{ left: pos.x, top: pos.y }}><div className="joystick-knob" style={{ transform: `translate(${pos.kx}px, ${pos.ky}px)` }} /></div>
        : <div className="joystick-hint">Arraste aqui para andar</div>}
    </div>
  );
}
