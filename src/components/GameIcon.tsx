// Ícones de botões em pixel art gerados por IA (src/assets/ui/icons).
const files = import.meta.glob("@/assets/ui/icons/*.png", { eager: true, import: "default" }) as Record<string, string>;
const ICONS: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) ICONS[path.split("/").pop()!.replace(".png", "")] = url;

export function GameIcon({ name, size = 28 }: { name: string; size?: number }) {
  const src = ICONS[name];
  if (!src) return null;
  return <img src={src} alt="" aria-hidden width={size} height={size} className="game-icon" draggable={false} />;
}
