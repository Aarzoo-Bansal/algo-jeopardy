import { useMemo } from 'react';

export default function ParticlesBg() {
  const particles = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      dur: Math.random() * 20 + 15,
      delay: Math.random() * -20,
      char: [
        "0", "1", "<", ">", "{}", "[]", "()", "=>", "fn", "if",
        "?", "!", "★", "✦", "◆", "∞"
      ][Math.floor(Math.random() * 16)],
      color: ["#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"][Math.floor(Math.random() * 5)],
      opacity: Math.random() * 0.12 + 0.04,
    }))
  , []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: p.x + "%",
          top: p.y + "%",
          fontSize: p.size * 6,
          color: p.color,          // ← was hardcoded #06b6d4, now uses p.color
          opacity: p.opacity,
          fontFamily: "monospace",
          fontWeight: 700,
          animation: "floatUp " + p.dur + "s linear " + p.delay + "s infinite",
        }}>{p.char}</div>
      ))}
    </div>
  );
}