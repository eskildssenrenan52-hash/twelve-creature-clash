import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { GameIcon } from "@/components/GameIcon";

/** Janela padrão dos dois jogos: cabeçalho fixo, corpo com rolagem e fecha com Esc. */
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const m = title.match(/^(.*?)\s+[—·]\s+(.*)$/);
  const main = m ? m[1] : title, sub = m ? m[2] : "";
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", k, true);
    return () => window.removeEventListener("keydown", k, true);
  }, [onClose]);
  return (
    <div className="modal-overlay absolute inset-0 flex items-center justify-center p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`game-panel modal-content modal-shell w-full ${wide ? "max-w-4xl" : "max-w-3xl"} text-[12px]`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <span className="modal-gem" aria-hidden="true" />
          <div className="modal-titles"><span className="modal-title">{main}</span>{sub && <span className="modal-sub">{sub}</span>}</div>
          <Button variant="game" onClick={onClose} className="modal-close" aria-label="Fechar"><GameIcon name="close" size={26} /></Button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

/** Seção com título ornamentado dentro de uma janela. */
export function Section({ title, aside, children, className = "" }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`modal-section ${className}`}>
      <h3 className="modal-section-title"><span>{title}</span>{aside !== undefined && <small>{aside}</small>}</h3>
      {children}
    </section>
  );
}

/** Barra de progresso no estilo do jogo. */
export function Meter({ value, max, tone = "gold" }: { value: number; max: number; tone?: "gold" | "mana" | "life" }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return <div className={`modal-meter meter-${tone}`}><div style={{ width: `${pct}%` }} /></div>;
}
